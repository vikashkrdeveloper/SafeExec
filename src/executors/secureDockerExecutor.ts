import Docker = require('dockerode');
import { logger } from '../utils/logger';

export interface ExecutorConfig {
  image: string;
  dockerfile: string;
  timeout: number;
  memory: number;
}

export interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  executionTime?: number;
  memoryUsed?: number;
  containerId?: string;
}

export class SecureDockerExecutor {
  private docker: Docker;
  private readonly languageConfigs: Record<string, ExecutorConfig>;

  constructor() {
    // Initialize Docker with better error handling
    try {
      this.docker = new Docker({
        socketPath: '/var/run/docker.sock',
        version: 'v1.41',
      });
    } catch (error) {
      logger.error('Failed to initialize Docker client:', error);
      // Fallback to default initialization
      this.docker = new Docker();
    }

    this.languageConfigs = {
      python: {
        image: 'rce-executor-python:latest',
        dockerfile: 'Dockerfile.python',
        timeout: 10000,
        memory: 128 * 1024 * 1024, // 128MB
      },
      cpp: {
        image: 'rce-executor-cpp:latest',
        dockerfile: 'Dockerfile.cpp',
        timeout: 15000,
        memory: 256 * 1024 * 1024, // 256MB
      },
      go: {
        image: 'rce-executor-go:latest',
        dockerfile: 'Dockerfile.go',
        timeout: 10000,
        memory: 128 * 1024 * 1024, // 128MB
      },
      java: {
        image: 'rce-executor-java:latest',
        dockerfile: 'Dockerfile.java',
        timeout: 20000,
        memory: 512 * 1024 * 1024, // 512MB
      },
      nodejs: {
        image: 'rce-executor-nodejs:latest',
        dockerfile: 'Dockerfile.nodejs',
        timeout: 10000,
        memory: 128 * 1024 * 1024, // 128MB
      },
      javascript: {
        image: 'rce-executor-nodejs:latest',
        dockerfile: 'Dockerfile.nodejs',
        timeout: 10000,
        memory: 128 * 1024 * 1024, // 128MB
      },
      rust: {
        image: 'rce-executor-rust:latest',
        dockerfile: 'Dockerfile.rust',
        timeout: 15000,
        memory: 256 * 1024 * 1024, // 256MB
      },
    };

    // Test Docker connectivity on initialization
    this.testDockerConnection();
  }

  private async testDockerConnection(): Promise<void> {
    try {
      await this.docker.ping();
      logger.info('Docker connection successful');
    } catch (error) {
      logger.error('Docker connection failed:', error);
    }
  }

  private async initializeExecutorImages(): Promise<void> {
    logger.info('Initializing executor images...');

    for (const [language, config] of Object.entries(this.languageConfigs)) {
      try {
        await this.docker.getImage(config.image).inspect();
        logger.info(`Image ${config.image} already exists`);
      } catch {
        logger.info(`Building image ${config.image} for ${language}`);
        await this.buildExecutorImage(language, config);
      }
    }
  }

  private async buildExecutorImage(
    language: string,
    config: ExecutorConfig
  ): Promise<void> {
    const buildContext = process.cwd() + '/docker/executors';

    const stream = await this.docker.buildImage(
      {
        context: buildContext,
        src: ['Dockerfile.' + language, 'run_' + language + '.*'],
      },
      {
        t: config.image,
        dockerfile: config.dockerfile,
      }
    );

    return new Promise<void>((resolve, reject) => {
      this.docker.modem.followProgress(
        stream,
        (err: Error | null) => {
          if (err) {
            logger.error(`Failed to build image ${config.image}:`, err);
            reject(err);
          } else {
            logger.info(`Successfully built image ${config.image}`);
            resolve();
          }
        },
        (event: { stream?: string }) => {
          if (event.stream) {
            logger.debug(`Build ${config.image}: ${event.stream.trim()}`);
          }
        }
      );
    });
  }

  async executeCode(request: ExecutionRequest): Promise<ExecutionResult> {
    const { code, language, input = '', timeLimit, memoryLimit } = request;

    const config = this.languageConfigs[language.toLowerCase()];
    if (!config) {
      return {
        success: false,
        output: '',
        error: `Unsupported language: ${language}. Supported languages: ${Object.keys(this.languageConfigs).join(', ')}`,
        executionTime: 0,
        memoryUsed: 0,
      };
    }

    const timeout = Math.min(timeLimit || config.timeout, 30000); // Max 30 seconds
    const memoryInMB = Math.min(memoryLimit || 128, 512); // Max 512MB
    const memory = memoryInMB * 1024 * 1024; // Convert MB to bytes
    const containerId = `rce-exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let container: Docker.Container | null = null;
    const startTime = Date.now();

    try {
      logger.info(
        `Starting code execution: language=${language}, timeout=${timeout}ms, memoryLimit=${memoryInMB}MB (${memory}bytes)`
      );

      // Escape code and input for safe shell execution
      const escapedCode = code.replace(/'/g, "'\"'\"'");
      const escapedInput = input.replace(/'/g, "'\"'\"'");

      // Build the execution command based on language
      let cmd: string[];
      switch (language.toLowerCase()) {
        case 'python':
          cmd = [
            '/bin/sh',
            '-c',
            `echo '${escapedCode}' > /app/solution.py && echo '${escapedInput}' | python3 /app/solution.py`,
          ];
          break;
        case 'javascript':
        case 'nodejs':
          cmd = [
            '/bin/sh',
            '-c',
            `echo '${escapedCode}' > /app/solution.js && echo '${escapedInput}' | node /app/solution.js`,
          ];
          break;
        case 'java':
          cmd = [
            '/bin/sh',
            '-c',
            `echo '${escapedCode}' > /app/Solution.java && echo '${escapedInput}' | java Solution.java`,
          ];
          break;
        case 'cpp':
          cmd = [
            '/bin/sh',
            '-c',
            `echo '${escapedCode}' > /app/solution.cpp && echo '${escapedInput}' | timeout ${Math.floor(timeout / 1000)} /app/run.sh`,
          ];
          break;
        case 'go':
          cmd = [
            '/bin/sh',
            '-c',
            `echo '${escapedCode}' > /app/solution.go && echo '${escapedInput}' | timeout ${Math.floor(timeout / 1000)} go run solution.go`,
          ];
          break;
        default:
          cmd = [
            '/bin/sh',
            '-c',
            `echo '${escapedCode}' > /app/solution && echo '${escapedInput}' | timeout ${Math.floor(timeout / 1000)} /app/run.sh`,
          ];
      }

      // Create container with security constraints
      logger.debug(`Creating container with image: ${config.image}`);
      container = await this.docker.createContainer({
        Image: config.image,
        name: containerId,
        Cmd: cmd,
        WorkingDir: '/app',
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: false,
        StdinOnce: false,
        Tty: false,
        HostConfig: {
          NetworkMode: 'none', // No network access
          Memory: memory,
          CpuQuota: 50000, // 50% CPU limit
          CpuPeriod: 100000,
          KernelMemory: memory,
          PidsLimit: 50, // Process limit
          ReadonlyRootfs: false,
          AutoRemove: true,
          Ulimits: [
            {
              Name: 'nproc',
              Soft: 20,
              Hard: 20,
            },
            {
              Name: 'fsize',
              Soft: 1024 * 1024, // 1MB file size limit
              Hard: 1024 * 1024,
            },
          ],
          Tmpfs: {
            '/tmp': 'rw,size=50m',
          },
          SecurityOpt: ['no-new-privileges:true'],
        },
        Env: [`TIME_LIMIT_MS=${timeout}`, `MEMORY_LIMIT_MB=${memoryInMB}`],
      });

      if (!container) {
        throw new Error('Failed to create container');
      }

      logger.debug(`Starting container: ${containerId}`);
      await container.start();
      logger.info(`Container ${containerId} started successfully`);

      // Wait for execution with timeout
      const result = await Promise.race([
        this.collectContainerOutput(container),
        this.createTimeoutPromise(timeout),
      ]);

      const executionTime = Date.now() - startTime;

      // Get container stats for memory usage
      let memoryUsed = 0;
      try {
        const stats = (await container.stats({ stream: false })) as {
          memory_stats?: { usage?: number };
        };
        memoryUsed = stats.memory_stats?.usage || 0;
      } catch (statsError) {
        logger.warn('Failed to get container stats:', statsError);
      }

      logger.info(
        `Code execution completed: time=${executionTime}ms, memory=${memoryUsed}bytes, success=${result.success}`
      );

      return {
        ...result,
        executionTime,
        memoryUsed: Math.round((memoryUsed / (1024 * 1024)) * 100) / 100, // Convert to MB with 2 decimal places
        containerId,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown execution error';
      const executionTime = Date.now() - startTime;

      logger.error(
        `Execution error for container ${containerId}: ${errorMessage}`,
        {
          language,
          timeout,
          memoryInMB,
          memoryBytes: memory,
          error: error instanceof Error ? error.stack : error,
        }
      );

      return {
        success: false,
        output: '',
        error: errorMessage,
        executionTime,
        memoryUsed: 0,
        containerId,
      };
    } finally {
      // Cleanup container
      if (container) {
        try {
          await container.kill().catch(() => {}); // Ignore if already stopped
          await container.remove().catch(() => {}); // Ignore if already removed
          logger.debug(`Container ${containerId} cleaned up successfully`);
        } catch (cleanupError: unknown) {
          const cleanupErrorMessage =
            cleanupError instanceof Error
              ? cleanupError.message
              : 'Unknown cleanup error';
          logger.error(
            `Failed to cleanup container ${containerId}: ${cleanupErrorMessage}`
          );
        }
      }
    }
  }

  private async collectContainerOutput(
    container: Docker.Container
  ): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      let output = '';
      let error = '';

      container
        .attach({
          stream: true,
          stdout: true,
          stderr: true,
        })
        .then((stream) => {
          // Set up demux streams
          const stdout = {
            write: (chunk: Buffer) => {
              output += chunk.toString();
            },
          };

          const stderr = {
            write: (chunk: Buffer) => {
              error += chunk.toString();
            },
          };

          container.modem.demuxStream(stream, stdout, stderr);

          stream.on('end', async () => {
            try {
              const data = await container.wait();
              const exitCode = data.StatusCode;

              // Clean up output strings
              output = output.trim();
              error = error.trim();

              // Determine success based on exit code and presence of errors
              const success = exitCode === 0 && !error;

              resolve({
                success,
                output,
                error:
                  error ||
                  (exitCode !== 0
                    ? `Process exited with code ${exitCode}`
                    : ''),
              });
            } catch (waitError) {
              logger.error('Container wait error:', waitError);
              resolve({
                success: false,
                output: output.trim(),
                error: `Container wait failed: ${waitError instanceof Error ? waitError.message : 'Unknown error'}`,
              });
            }
          });

          stream.on('error', (streamError) => {
            logger.error('Container stream error:', streamError);
            resolve({
              success: false,
              output: output.trim(),
              error: `Stream error: ${streamError.message}`,
            });
          });
        })
        .catch((attachError) => {
          logger.error('Container attach error:', attachError);
          resolve({
            success: false,
            output: '',
            error: `Failed to attach to container: ${attachError.message}`,
          });
        });
    });
  }

  private createTimeoutPromise(timeout: number): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          output: '',
          error: `Execution timed out after ${timeout}ms`,
        });
      }, timeout);
    });
  }

  async getExecutorStats(): Promise<{
    totalImages: number;
    totalContainers: number;
    runningContainers: number;
    supportedLanguages: string[];
  }> {
    const images = await this.docker.listImages();
    const containers = await this.docker.listContainers({ all: true });

    return {
      totalImages: images.length,
      totalContainers: containers.length,
      runningContainers: containers.filter((container) =>
        container.Names?.some((name) => name.includes('rce-exec-'))
      ).length,
      supportedLanguages: Object.keys(this.languageConfigs),
    };
  }

  async cleanup(): Promise<void> {
    logger.info('Cleaning up executor resources...');

    // Find all RCE containers
    const containers = await this.docker.listContainers({ all: true });
    const rceContainers = containers.filter((container) =>
      container.Names?.some((name) => name.includes('rce-exec-'))
    );

    // Clean up orphaned containers
    for (const containerInfo of rceContainers) {
      try {
        const container = this.docker.getContainer(containerInfo.Id);
        await container.kill();
        await container.remove();
        logger.info(`Cleaned up orphaned container ${containerInfo.Id}`);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error(
          `Failed to cleanup container ${containerInfo.Id}:`,
          errorMessage
        );
      }
    }
  }
}
