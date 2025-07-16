// src/controllers/execute.controller.ts
import { Request, Response } from 'express';
import { SecureDockerExecutor } from '../executors/secureDockerExecutor';
import { logger } from '../utils/logger';

const dockerExecutor = new SecureDockerExecutor();

/**
 * Execute code directly without problem context
 */
export const executeCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { language, code, input, timeLimit, memoryLimit } = req.body;
    const userId = req.user?.id;

    // Validate authentication
    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    // Validate required fields
    if (!language || !code) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: language, code',
        code: 'VALIDATION_ERROR'
      });
      return;
    }

    // Validate code length
    if (code.length > 10000) {
      res.status(400).json({
        success: false,
        error: 'Code too long. Maximum 10,000 characters allowed.',
        code: 'CODE_TOO_LONG'
      });
      return;
    }

    // Validate language
    const supportedLanguages = ['python', 'javascript', 'java', 'cpp', 'go'];
    if (!supportedLanguages.includes(language)) {
      res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`,
        code: 'INVALID_LANGUAGE'
      });
      return;
    }

    // Validate limits
    const finalTimeLimit = Math.min(timeLimit || 5000, 30000); // Max 30 seconds
    const finalMemoryLimit = Math.min(memoryLimit || 128, 512); // Max 512MB

    logger.info(
      `Direct code execution: user=${userId}, language=${language}, timeLimit=${finalTimeLimit}ms, memoryLimit=${finalMemoryLimit}MB`
    );

    // Generate execution ID
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Execute the code
    const result = await dockerExecutor.executeCode({
      code,
      language,
      input: input || '',
      timeLimit: finalTimeLimit,
      memoryLimit: finalMemoryLimit
    });

    // Structure response
    const response = {
      success: result.success,
      data: {
        executionId,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsed,
        status: result.success ? 'success' : 'error',
        language
      }
    };

    res.json(response);
  } catch (error: unknown) {
    logger.error('Execute code error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during code execution',
      code: 'EXECUTION_ERROR'
    });
  }
};

/**
 * Get execution result by ID
 */
export const getExecutionResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { executionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    // Log the execution ID for future implementation
    logger.info(`Fetching execution result: ${executionId} for user: ${userId}`);

    // In a real implementation, you'd fetch from database
    // For now, return a not found response
    res.status(404).json({
      success: false,
      error: 'Execution result not found or expired',
      code: 'EXECUTION_NOT_FOUND'
    });
  } catch (error: unknown) {
    logger.error('Get execution result error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve execution result',
      code: 'RETRIEVAL_ERROR'
    });
  }
};

/**
 * Get supported programming languages
 */
export const getSupportedLanguages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const languages = [
      {
        id: 'python',
        name: 'Python',
        version: '3.11.0',
        extension: '.py',
        example: 'print("Hello, World!")',
        limits: {
          timeoutMs: 5000,
          memoryMB: 128
        }
      },
      {
        id: 'javascript',
        name: 'Node.js',
        version: '20.0.0',
        extension: '.js',
        example: 'console.log("Hello, World!");',
        limits: {
          timeoutMs: 5000,
          memoryMB: 128
        }
      },
      {
        id: 'java',
        name: 'Java',
        version: '17.0.0',
        extension: '.java',
        example: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`,
        limits: {
          timeoutMs: 10000,
          memoryMB: 256
        }
      },
      {
        id: 'cpp',
        name: 'C++',
        version: 'g++ 11.0.0',
        extension: '.cpp',
        example: `#include <iostream>

int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}`,
        limits: {
          timeoutMs: 10000,
          memoryMB: 128
        }
      },
      {
        id: 'go',
        name: 'Go',
        version: '1.20.0',
        extension: '.go',
        example: `package main

import "fmt"

func main() {
  fmt.Println("Hello, World!")
}`,
        limits: {
          timeoutMs: 5000,
          memoryMB: 128
        }
      }
    ];

    res.json({
      success: true,
      data: { languages }
    });
  } catch (error: unknown) {
    logger.error('Get supported languages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported languages',
      code: 'LANGUAGES_ERROR'
    });
  }
};
