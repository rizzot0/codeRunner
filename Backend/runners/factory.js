import { PythonRunner } from './python.js';
import { JavaScriptRunner } from './javascript.js';
import { CppRunner } from './cpp.js';

export async function executeCode(language, entrypoint, input, files) {
  let runner;

  switch (language.toLowerCase()) {
    case 'python':
      runner = new PythonRunner();
      break;
    case 'javascript':
      runner = new JavaScriptRunner();
      break;
    case 'c++':
    case 'cpp':
    case 'c':
      runner = new CppRunner();
      break;
    default:
      throw new Error(`Language ${language} not supported`);
  }

  return await runner.run(files, entrypoint, input);
}
