const PAIZA_CREATE = 'https://api.paiza.io/runners/create';
const PAIZA_DETAILS = 'https://api.paiza.io/runners/get_details';

const LANGUAGE_MAP = {
  javascript: 'javascript',
  python: 'python3',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mapLanguage(language) {
  const mapped = LANGUAGE_MAP[String(language || '').toLowerCase()];
  if (!mapped) {
    throw new Error(`Language ${language} not supported`);
  }
  return mapped;
}

export async function runOnPaiza(language, entrypoint, input, files) {
  const main = files.find((file) => file.path === entrypoint) || files[0];
  if (!main) {
    throw new Error('No source file to execute');
  }

  const created = await fetch(PAIZA_CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: main.content ?? '',
      language: mapLanguage(language),
      input: input ?? '',
      longpoll: true,
      longpoll_timeout: 10,
      api_key: 'guest',
    }),
  });

  if (!created.ok) {
    throw new Error(`Paiza create failed (${created.status})`);
  }

  let data = await created.json();
  const started = Date.now();

  while (data.status !== 'completed' && Date.now() - started < 20000) {
    await sleep(600);
    const details = await fetch(
      `${PAIZA_DETAILS}?id=${encodeURIComponent(data.id)}&api_key=guest`
    );
    if (!details.ok) {
      throw new Error(`Paiza poll failed (${details.status})`);
    }
    data = await details.json();
  }

  if (data.status !== 'completed') {
    return { stdout: data.stdout || '', stderr: 'Timeout esperando el resultado' };
  }

  return {
    stdout: data.stdout || '',
    stderr: [data.build_stderr, data.stderr].filter(Boolean).join('\n'),
  };
}
