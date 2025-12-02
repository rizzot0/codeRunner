import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const EXECUTION_TIMEOUT = 30000; // 30 seconds

export class CppRunner {
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

      // Find all .cpp files and compile
      const compileResult = spawnSync('g++', ['-o', 'output', ...files.filter(f => f.path.endsWith('.cpp')).map(f => f.path)], {
        cwd: workdir,
        timeout: EXECUTION_TIMEOUT,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });

      if (compileResult.error || compileResult.stderr) {
        return {
          stdout: compileResult.stdout || '',
          stderr: compileResult.stderr || compileResult.error?.message || 'Compilation failed',
        };
      }

      // Execute compiled binary
      const runResult = spawnSync(join(workdir, 'output'), [], {
        cwd: workdir,
        input: input,
        timeout: EXECUTION_TIMEOUT,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });

      return {
        stdout: runResult.stdout || '',
        stderr: runResult.stderr || '',
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
