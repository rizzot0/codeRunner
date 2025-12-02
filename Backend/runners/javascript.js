import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const EXECUTION_TIMEOUT = 30000; // 30 seconds

export class JavaScriptRunner {
  async run(files, entrypoint, input) {
    const sessionId = randomUUID();
    const workdir = join(tmpdir(), 'sandboxes', sessionId);
    
    try {
      mkdirSync(workdir, { recursive: true });

      // Write files to temp directory
      for (const file of files) {
        const filePath = join(workdir, file.path);
        mkdirSync(join(workdir, file.path.split('/').slice(0, -1).join('/')), { recursive: true });
        writeFileSync(filePath, file.content);
      }

      // Write input file
      writeFileSync(join(workdir, 'input.txt'), input);

      // Execute Node.js script
      const result = spawnSync('node', [entrypoint], {
        cwd: workdir,
        input: input,
        timeout: EXECUTION_TIMEOUT,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
      };
    } catch (error) {
      return {
        stdout: '',
        stderr: error.message,
      };
    } finally {
      // Cleanup
      try {
        rmSync(workdir, { recursive: true, force: true });
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  }
}
