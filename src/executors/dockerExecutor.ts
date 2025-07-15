// src/executors/dockerExecutor.ts
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ISubmission {
  _id: string;
  code: string;
  language: string;
  timeLimitMs?: number;
  save?: () => Promise<void>;
  [key: string]: unknown;
}

export const executeInDocker = async (submission: ISubmission) => {
  const tempDir = path.join('/tmp', `submission-${submission._id}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const codePath = path.join(tempDir, 'Main.py');
  fs.writeFileSync(codePath, submission.code);

  const command = `docker run --rm -v ${tempDir}:/code rce-python-runner`;

  return new Promise<void>((resolve) => {
    exec(
      command,
      { timeout: submission.timeLimitMs },
      async (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          console.error(error);
          submission.status = 'runtime_error';
          submission.testResults = [
            { output: stderr || 'Runtime error', passed: false },
          ];
        } else {
          submission.status = 'success';
          submission.testResults = [{ output: stdout.trim(), passed: true }];
        }

        submission.totalTime = 50; // mock
        submission.totalMemory = 64; // mock

        if (submission.save) {
          await submission.save();
        }
        fs.rmSync(tempDir, { recursive: true, force: true });

        resolve();
      }
    );
  });
};
