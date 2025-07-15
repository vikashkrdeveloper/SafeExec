import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
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
    this.docker = new Docker();
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

    // TODO: Initialize executor images for local development
    // this.initializeExecutorImages();
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
      throw new Error(`Unsupported language: ${language}`);
    }

    const timeout = timeLimit || config.timeout;
    const memory = memoryLimit || config.memory;
    const containerId = `rce-exec-${uuidv4()}`;

    let container: Docker.Container | null = null;
    const startTime = Date.now();

    try {
      // Create container with security constraints
      container = await this.docker.createContainer({
        Image: config.image,
        name: containerId,
        Cmd: [
          '/bin/sh',
          '-c',
          `echo '${code}' > /app/solution && echo '${input}' | timeout ${Math.floor(timeout / 1000)} /app/run.sh`,
        ],
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
        Env: [
          `TIME_LIMIT_MS=${timeout}`,
          `MEMORY_LIMIT_MB=${Math.floor(memory / (1024 * 1024))}`,
        ],
      });

      // Start container
      if (!container) {
        throw new Error('Failed to create container');
      }

      await container.start();

      // Wait for execution with timeout
      const result = await Promise.race([
        this.collectContainerOutput(container),
        this.createTimeoutPromise(timeout),
      ]);

      const executionTime = Date.now() - startTime;

      // Get container stats for memory usage
      const stats = (await container.stats({ stream: false })) as {
        memory_stats?: { usage?: number };
      };
      const memoryUsed = stats.memory_stats?.usage || 0;

      return {
        ...result,
        executionTime,
        memoryUsed,
        containerId,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown execution error';
      logger.error(
        `Execution error for container ${containerId}:`,
        errorMessage
      );

      return {
        success: false,
        output: '',
        error: errorMessage,
        executionTime: Date.now() - startTime,
        memoryUsed: 0,
        containerId,
      };
    } finally {
      // Cleanup container
      if (container) {
        try {
          await container.kill();
          await container.remove();
        } catch (cleanupError: unknown) {
          const cleanupErrorMessage =
            cleanupError instanceof Error
              ? cleanupError.message
              : 'Unknown cleanup error';
          logger.error(
            `Failed to cleanup container ${containerId}:`,
            cleanupErrorMessage
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

      const stream = container.attach({
        stream: true,
        stdout: true,
        stderr: true,
      });

      stream.then((stream) => {
        container.modem.demuxStream(
          stream,
          {
            write: (chunk: Buffer) => {
              output += chunk.toString();
            },
          },
          {
            write: (chunk: Buffer) => {
              error += chunk.toString();
            },
          }
        );

        stream.on('end', async () => {
          const data = await container.wait();

          // Try to parse as JSON first (for structured output)
          try {
            const result = JSON.parse(output);
            resolve({
              success: result.success,
              output: result.output || '',
              error: result.error || '',
            });
          } catch {
            // If not JSON, treat as plain output
            resolve({
              success: data?.StatusCode === 0,
              output: output.trim(),
              error:
                error.trim() ||
                (data?.StatusCode !== 0
                  ? `Process exited with code ${data?.StatusCode}`
                  : ''),
            });
          }
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
