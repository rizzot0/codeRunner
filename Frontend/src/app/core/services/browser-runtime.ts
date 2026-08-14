type RunResult = { stdout: string; stderr: string };

const JS_WORKER = `
self.onmessage = (event) => {
  const { code, stdin } = event.data;
  let stdout = '';
  const lines = String(stdin ?? '').split(/\\r?\\n/);
  let lineIndex = 0;
  const log = (...args) => {
    stdout += args.map((value) => String(value)).join(' ') + '\\n';
  };
  console.log = log;
  console.info = log;
  console.warn = log;
  try {
    const fn = new Function('stdin', 'readline', code);
    const result = fn(stdin, () => (lineIndex < lines.length ? lines[lineIndex++] : ''));
    if (result !== undefined) {
      stdout += String(result) + '\\n';
    }
    self.postMessage({ stdout, stderr: '' });
  } catch (error) {
    self.postMessage({ stdout, stderr: String(error && error.stack ? error.stack : error) });
  }
};
`;

export function runJavaScript(code: string, stdin: string, timeoutMs = 8000): Promise<RunResult> {
  return new Promise((resolve) => {
    const blob = new Blob([JS_WORKER], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = window.setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: '', stderr: 'Timeout: la ejecución superó 8s' });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<RunResult>) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(event.data);
    };
    worker.onerror = (event) => {
      window.clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: '', stderr: event.message || 'Worker error' });
    };
    worker.postMessage({ code, stdin });
  });
}

let pyodideReady: Promise<any> | null = null;

async function loadPyodideRuntime() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      const existing = (window as any).loadPyodide;
      if (!existing) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('No se pudo cargar Pyodide'));
          document.head.appendChild(script);
        });
      }
      return (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
      });
    })();
  }
  return pyodideReady;
}

export async function runPython(code: string, stdin: string): Promise<RunResult> {
  const pyodide = await loadPyodideRuntime();
  let stdout = '';
  let stderr = '';
  pyodide.setStdout({
    batched: (text: string) => {
      stdout += text.endsWith('\n') ? text : `${text}\n`;
    },
  });
  pyodide.setStderr({
    batched: (text: string) => {
      stderr += text.endsWith('\n') ? text : `${text}\n`;
    },
  });
  pyodide.setStdin({
    stdin: () => stdin,
  });
  try {
    await pyodide.runPythonAsync(code);
    return { stdout, stderr };
  } catch (error) {
    return { stdout, stderr: stderr || String(error) };
  }
}

async function loadJscpp(): Promise<any> {
  const existing = (window as any).JSCPP;
  if (existing) return existing;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/JSCPP@2.0.6/dist/JSCPP.es5.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el runtime de C++'));
    document.head.appendChild(script);
  });
  return (window as any).JSCPP;
}

export async function runCpp(code: string, stdin: string): Promise<RunResult> {
  const JSCPP = await loadJscpp();
  let stdout = '';
  try {
    JSCPP.run(code, stdin ?? '', {
      maxTimeout: 8000,
      stdio: {
        write: (s: string) => {
          stdout += s;
        },
      },
    });
    return { stdout, stderr: '' };
  } catch (error) {
    return {
      stdout,
      stderr: String(error),
    };
  }
}

export async function runInBrowser(
  language: string,
  code: string,
  stdin: string
): Promise<RunResult> {
  switch (language.toLowerCase()) {
    case 'javascript':
      return runJavaScript(code, stdin);
    case 'python':
      return runPython(code, stdin);
    case 'cpp':
    case 'c++':
    case 'c':
      return runCpp(code, stdin);
    default:
      throw new Error(`Language ${language} not supported`);
  }
}
