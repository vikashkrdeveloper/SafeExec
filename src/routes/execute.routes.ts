// src/routes/execute.routes.ts
import { Router } from 'express';
import {
  executeCode,
  getExecutionResult,
  getSupportedLanguages,
} from '../controllers/execute.controller';
import {
  authenticateToken,
  checkExecutionLimits,
} from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/execute:
 *   post:
 *     summary: Execute code directly without problems
 *     description: |
 *       Execute arbitrary code in a secure, isolated Docker environment.
 *       This endpoint allows direct code execution without requiring a specific problem context.
 *       Perfect for testing code snippets, debugging, or educational purposes.
 *
 *       **Security Features:**
 *       - Isolated Docker containers
 *       - Time and memory limits
 *       - Resource monitoring
 *       - Safe execution environment
 *
 *       **Supported Languages:**
 *       - Python 3.x
 *       - Node.js/JavaScript
 *       - Java 17+
 *       - C++ (g++)
 *       - Go
 *
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CodeExecutionRequest'
 *           examples:
 *             python_hello:
 *               summary: Python Hello World
 *               value:
 *                 language: "python"
 *                 code: |
 *                   print("Hello, SafeExec!")
 *                   print("Python version:", __import__('sys').version)
 *
 *                   # Simple calculation
 *                   result = 10 + 20
 *                   print(f"Result: {result}")
 *             javascript_example:
 *               summary: JavaScript Example
 *               value:
 *                 language: "javascript"
 *                 code: |
 *                   console.log("Hello from Node.js!");
 *                   console.log("Version:", process.version);
 *
 *                   // Simple function
 *                   function fibonacci(n) {
 *                     if (n <= 1) return n;
 *                     return fibonacci(n-1) + fibonacci(n-2);
 *                   }
 *
 *                   console.log("Fibonacci(10):", fibonacci(10));
 *                 input: ""
 *                 timeLimit: 5000
 *             java_example:
 *               summary: Java Example
 *               value:
 *                 language: "java"
 *                 code: |
 *                   public class Main {
 *                     public static void main(String[] args) {
 *                       System.out.println("Hello from Java!");
 *                       System.out.println("Java version: " + System.getProperty("java.version"));
 *
 *                       // Simple array manipulation
 *                       int[] numbers = {1, 2, 3, 4, 5};
 *                       int sum = 0;
 *                       for (int num : numbers) {
 *                         sum += num;
 *                       }
 *                       System.out.println("Sum: " + sum);
 *                     }
 *                   }
 *             cpp_example:
 *               summary: C++ Example
 *               value:
 *                 language: "cpp"
 *                 code: |
 *                   #include <iostream>
 *                   #include <vector>
 *                   #include <algorithm>
 *
 *                   int main() {
 *                     std::cout << "Hello from C++!" << std::endl;
 *
 *                     std::vector<int> numbers = {5, 2, 8, 1, 9};
 *                     std::sort(numbers.begin(), numbers.end());
 *
 *                     std::cout << "Sorted numbers: ";
 *                     for (int num : numbers) {
 *                       std::cout << num << " ";
 *                     }
 *                     std::cout << std::endl;
 *
 *                     return 0;
 *                   }
 *             with_input:
 *               summary: Program with Input
 *               value:
 *                 language: "python"
 *                 code: |
 *                   # Read input from stdin
 *                   name = input("Enter your name: ")
 *                   age = int(input("Enter your age: "))
 *
 *                   print(f"Hello {name}!")
 *                   print(f"You are {age} years old.")
 *
 *                   if age >= 18:
 *                     print("You are an adult.")
 *                   else:
 *                     print("You are a minor.")
 *                 input: |
 *                   John Doe
 *                   25
 *     responses:
 *       200:
 *         description: Code executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CodeExecutionResponse'
 *             examples:
 *               success:
 *                 summary: Successful execution
 *                 value:
 *                   success: true
 *                   data:
 *                     executionId: "exec_507f1f77bcf86cd799439011"
 *                     output: "Hello, SafeExec!\nPython version: 3.11.0\nResult: 30"
 *                     error: null
 *                     executionTime: 145
 *                     memoryUsage: 15.2
 *                     status: "success"
 *                     language: "python"
 *               error:
 *                 summary: Runtime error
 *                 value:
 *                   success: false
 *                   data:
 *                     executionId: "exec_507f1f77bcf86cd799439012"
 *                     output: ""
 *                     error: "NameError: name 'undefined_variable' is not defined"
 *                     executionTime: 89
 *                     memoryUsage: 12.1
 *                     status: "error"
 *                     language: "python"
 *               timeout:
 *                 summary: Execution timeout
 *                 value:
 *                   success: false
 *                   data:
 *                     executionId: "exec_507f1f77bcf86cd799439013"
 *                     output: "Starting infinite loop..."
 *                     error: "Execution timed out after 5000ms"
 *                     executionTime: 5000
 *                     memoryUsage: 45.3
 *                     status: "timeout"
 *                     language: "python"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   error: "Missing required fields: language, code"
 *                   code: "VALIDATION_ERROR"
 *               invalid_language:
 *                 summary: Unsupported language
 *                 value:
 *                   success: false
 *                   error: "Unsupported language: ruby. Supported: python, javascript, java, cpp, go"
 *                   code: "INVALID_LANGUAGE"
 *               code_too_long:
 *                 summary: Code too long
 *                 value:
 *                   success: false
 *                   error: "Code too long. Maximum 10,000 characters allowed."
 *                   code: "CODE_TOO_LONG"
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               rate_limit:
 *                 summary: Too many executions
 *                 value:
 *                   success: false
 *                   error: "Too many code executions. Please wait before trying again."
 *                   code: "RATE_LIMIT_EXCEEDED"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, checkExecutionLimits, executeCode);

/**
 * @swagger
 * /api/execute/languages:
 *   get:
 *     summary: Get supported programming languages
 *     description: |
 *       Retrieve a list of all programming languages supported by the execution system,
 *       including their versions, file extensions, and example code snippets.
 *     tags: [Code Execution]
 *     responses:
 *       200:
 *         description: Successfully retrieved supported languages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     languages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Language identifier
 *                             example: "python"
 *                           name:
 *                             type: string
 *                             description: Human-readable language name
 *                             example: "Python"
 *                           version:
 *                             type: string
 *                             description: Language/runtime version
 *                             example: "3.11.0"
 *                           extension:
 *                             type: string
 *                             description: File extension
 *                             example: ".py"
 *                           example:
 *                             type: string
 *                             description: Hello world example
 *                             example: 'print("Hello, World!")'
 *                           limits:
 *                             type: object
 *                             properties:
 *                               timeoutMs:
 *                                 type: integer
 *                                 description: Default timeout in milliseconds
 *                                 example: 5000
 *                               memoryMB:
 *                                 type: integer
 *                                 description: Default memory limit in MB
 *                                 example: 128
 *             examples:
 *               languages_list:
 *                 summary: Supported languages
 *                 value:
 *                   success: true
 *                   data:
 *                     languages:
 *                       - id: "python"
 *                         name: "Python"
 *                         version: "3.11.0"
 *                         extension: ".py"
 *                         example: 'print("Hello, World!")'
 *                         limits:
 *                           timeoutMs: 5000
 *                           memoryMB: 128
 *                       - id: "javascript"
 *                         name: "Node.js"
 *                         version: "20.0.0"
 *                         extension: ".js"
 *                         example: 'console.log("Hello, World!");'
 *                         limits:
 *                           timeoutMs: 5000
 *                           memoryMB: 128
 *                       - id: "java"
 *                         name: "Java"
 *                         version: "17.0.0"
 *                         extension: ".java"
 *                         example: |
 *                           public class Main {
 *                             public static void main(String[] args) {
 *                               System.out.println("Hello, World!");
 *                             }
 *                           }
 *                         limits:
 *                           timeoutMs: 10000
 *                           memoryMB: 256
 *       500:
 *         description: Failed to retrieve languages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/languages', getSupportedLanguages);

/**
 * @swagger
 * /api/execute/{executionId}:
 *   get:
 *     summary: Get execution result
 *     description: |
 *       Retrieve the result of a code execution by its unique execution ID.
 *       This endpoint allows you to check the status and results of asynchronous code executions.
 *     tags: [Code Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^exec_[a-f0-9]{24}$'
 *         description: Unique execution identifier
 *         example: "exec_507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Execution result retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CodeExecutionResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Access denied - can only view own executions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Execution not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:executionId', authenticateToken, getExecutionResult);

export default router;
