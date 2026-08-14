import { PythonRunner } from './python.js';
import { JavaScriptRunner } from './javascript.js';
import { CppRunner } from './cpp.js';
import { runOnPaiza } from './paiza.js';

function localRunner(language) {
  switch (language.toLowerCase()) {
    case 'python':
      return new PythonRunner();
    case 'javascript':
      return new JavaScriptRunner();
    case 'c++':
    case 'cpp':
    case 'c':
      return new CppRunner();
    default:
      throw new Error(`Language ${language} not supported`);
  }
}

export async function executeCode(language, entrypoint, input, files) {
  if (process.env.EXECUTOR === 'local') {
    const runner = localRunner(language);
    return runner.run(files, entrypoint, input);
  }

  // Vercel no trae python3 ni g++. Paiza (API guest) sí ejecuta esos lenguajes.
  return runOnPaiza(language, entrypoint, input, files);
}
