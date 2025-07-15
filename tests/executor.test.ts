import { SecureDockerExecutor } from '../src/executors/secureDockerExecutor';

describe('SecureDockerExecutor', () => {
  let executor: SecureDockerExecutor;

  beforeAll(() => {
    executor = new SecureDockerExecutor();
  });

  afterAll(async () => {
    await executor.cleanup();
  });

  describe('Python Execution', () => {
    it('should execute simple Python code', async () => {
      const result = await executor.executeCode({
        code: 'print("Hello, World!")',
        language: 'python',
      });

      expect(result.success).toBe(true);
      expect(result.output.trim()).toBe('Hello, World!');
      expect(result.error).toBe('');
    });

    it('should handle Python syntax errors', async () => {
      const result = await executor.executeCode({
        code: 'print("Hello World"',
        language: 'python',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('syntax');
    });

    it('should enforce time limits', async () => {
      const result = await executor.executeCode({
        code: 'import time; time.sleep(10)',
        language: 'python',
        timeLimit: 2000,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });

  describe('JavaScript Execution', () => {
    it('should execute simple JavaScript code', async () => {
      const result = await executor.executeCode({
        code: 'console.log("Hello, JavaScript!");',
        language: 'javascript',
      });

      expect(result.success).toBe(true);
      expect(result.output.trim()).toBe('Hello, JavaScript!');
    });
  });

  describe('Java Execution', () => {
    it('should execute simple Java code', async () => {
      const result = await executor.executeCode({
        code: `
          public class Main {
            public static void main(String[] args) {
              System.out.println("Hello, Java!");
            }
          }
        `,
        language: 'java',
      });

      expect(result.success).toBe(true);
      expect(result.output.trim()).toBe('Hello, Java!');
    });
  });

  describe('C++ Execution', () => {
    it('should execute simple C++ code', async () => {
      const result = await executor.executeCode({
        code: `
          #include <iostream>
          int main() {
            std::cout << "Hello, C++!" << std::endl;
            return 0;
          }
        `,
        language: 'cpp',
      });

      expect(result.success).toBe(true);
      expect(result.output.trim()).toBe('Hello, C++!');
    });
  });

  describe('Go Execution', () => {
    it('should execute simple Go code', async () => {
      const result = await executor.executeCode({
        code: `
          package main
          import "fmt"
          func main() {
            fmt.Println("Hello, Go!")
          }
        `,
        language: 'go',
      });

      expect(result.success).toBe(true);
      expect(result.output.trim()).toBe('Hello, Go!');
    });
  });
});
