#!/usr/bin/env node
/**
 * Secure Node.js Code Executor
 * Executes user-submitted JavaScript code in a sandboxed environment
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class NodeCodeExecutor {
    constructor() {
        this.timeout = parseInt(process.env.EXECUTION_TIMEOUT || '5') * 1000;
        this.memoryLimit = parseInt(process.env.MEMORY_LIMIT_MB || '128');
    }

    async executeCode(code, inputData = '') {
        const result = {
            success: false,
            output: '',
            error: '',
            execution_time: 0,
            memory_used: 0
        };

        let tempFile = null;

        try {
            // Create temporary file
            tempFile = path.join(os.tmpdir(), `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.js`);

            // Wrap user code in a safe execution context
            const wrappedCode = `
const process = undefined;
const require = undefined;
const module = undefined;
const exports = undefined;
const global = undefined;
const Buffer = undefined;

// User code starts here
${code}
            `;

            fs.writeFileSync(tempFile, wrappedCode);

            const startTime = Date.now();

            // Execute the code in a separate process
            const child = spawn('node', [
                '--max-old-space-size=' + this.memoryLimit,
                '--no-warnings',
                tempFile
            ], {
                stdio: ['pipe', 'pipe', 'pipe'],
                timeout: this.timeout,
                env: {
                    NODE_ENV: 'sandbox',
                    PATH: '/usr/local/bin:/usr/bin:/bin'
                }
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            // Send input data if provided
            if (inputData) {
                child.stdin.write(inputData);
            }
            child.stdin.end();

            return new Promise((resolve) => {
                const timer = setTimeout(() => {
                    child.kill('SIGKILL');
                    result.error = `Code execution timed out after ${this.timeout / 1000} seconds`;
                    resolve(result);
                }, this.timeout);

                child.on('close', (code, signal) => {
                    clearTimeout(timer);

                    const executionTime = Date.now() - startTime;
                    result.execution_time = executionTime;

                    if (signal === 'SIGKILL') {
                        result.error = `Code execution timed out after ${this.timeout / 1000} seconds`;
                    } else if (code === 0) {
                        result.success = true;
                        result.output = stdout.trim();
                    } else {
                        result.error = stderr.trim() || `Process exited with code ${code}`;
                    }

                    resolve(result);
                });

                child.on('error', (err) => {
                    clearTimeout(timer);
                    result.error = `Execution error: ${err.message}`;
                    resolve(result);
                });
            });

        } catch (error) {
            result.error = `System error: ${error.message}`;
            return result;
        } finally {
            // Clean up temporary file
            if (tempFile && fs.existsSync(tempFile)) {
                try {
                    fs.unlinkSync(tempFile);
                } catch (err) {
                    // Ignore cleanup errors
                }
            }
        }
    }
}

async function main() {
    try {
        let inputData = '';

        // Read from stdin
        for await (const chunk of process.stdin) {
            inputData += chunk;
        }

        const data = JSON.parse(inputData);
        const code = data.code || '';
        const testInput = data.input || '';

        if (!code) {
            const result = {
                success: false,
                error: 'No code provided',
                output: '',
                execution_time: 0,
                memory_used: 0
            };
            console.log(JSON.stringify(result));
            return;
        }

        const executor = new NodeCodeExecutor();
        const result = await executor.executeCode(code, testInput);

        console.log(JSON.stringify(result));

    } catch (error) {
        const errorResult = {
            success: false,
            error: error.message.includes('JSON') ? 'Invalid JSON input' : `System error: ${error.message}`,
            output: '',
            execution_time: 0,
            memory_used: 0
        };
        console.log(JSON.stringify(errorResult));
    }
}

if (require.main === module) {
    main();
}
