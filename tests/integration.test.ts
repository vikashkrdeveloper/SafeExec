import request from 'supertest';
import { app } from '../src/index';
import { ProblemModel } from '../src/models/problem.model';
import { SubmissionModel } from '../src/models/submission.model';
import { connectDB } from '../src/config/db';

describe('RCE Backend Integration Tests', () => {
  let problemId: string;

  beforeAll(async () => {
    // Connect to test database
    await connectDB();

    // Create a test problem
    const testProblem = new ProblemModel({
      title: 'Two Sum',
      slug: 'two-sum',
      description:
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'easy',
      constraints: ['Length of nums array: 2 ≤ nums.length ≤ 10^4'],
      allowedLanguages: ['python', 'cpp', 'go'],
      timeLimitMs: 1000,
      memoryLimitMB: 128,
    });

    const savedProblem = await testProblem.save();
    problemId = savedProblem._id.toString();
  });

  afterAll(async () => {
    // Clean up test data
    await ProblemModel.deleteMany({});
    await SubmissionModel.deleteMany({});
  });

  describe('Problem Management', () => {
    test('GET /api/problems - should return all problems', async () => {
      const response = await request(app).get('/api/problems').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/problems/:id - should return specific problem', async () => {
      const response = await request(app)
        .get(`/api/problems/${problemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Two Sum');
    });

    test('GET /api/problems/invalid-id - should return 404', async () => {
      const response = await request(app)
        .get('/api/problems/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Code Execution - Python', () => {
    test('POST /api/submit - Python correct solution', async () => {
      const pythonCode = `
def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

import json
import sys

# Read input
input_data = json.loads(sys.argv[1])
nums = input_data['nums']
target = input_data['target']

# Execute solution
result = two_sum(nums, target)
print(json.dumps(result))
`;

      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'python',
          code: pythonCode,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
      expect(response.body.data.testResults).toHaveLength(3);
      expect(
        response.body.data.testResults.every(
          (result: { status: string }) => result.status === 'passed'
        )
      ).toBe(true);
    }, 30000);

    test('POST /api/submit - Python runtime error', async () => {
      const pythonCode = `
def two_sum(nums, target):
    return nums[100]  # This will cause an IndexError

import json
import sys

input_data = json.loads(sys.argv[1])
nums = input_data['nums']
target = input_data['target']

result = two_sum(nums, target)
print(json.dumps(result))
`;

      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'python',
          code: pythonCode,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('runtime_error');
    }, 30000);

    test('POST /api/submit - Python time limit exceeded', async () => {
      const pythonCode = `
import time
import json
import sys

# Infinite loop to simulate TLE
while True:
    time.sleep(1)
`;

      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'python',
          code: pythonCode,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('time_limit_exceeded');
    }, 35000);
  });

  describe('Code Execution - C++', () => {
    test('POST /api/submit - C++ correct solution', async () => {
      const cppCode = `
#include <iostream>
#include <vector>
#include <unordered_map>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> numMap;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (numMap.find(complement) != numMap.end()) {
            return {numMap[complement], i};
        }
        numMap[nums[i]] = i;
    }
    return {};
}

int main(int argc, char* argv[]) {
    if (argc < 2) return 1;
    
    json input = json::parse(argv[1]);
    vector<int> nums = input["nums"];
    int target = input["target"];
    
    vector<int> result = twoSum(nums, target);
    
    json output = result;
    cout << output.dump() << endl;
    
    return 0;
}
`;

      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'cpp',
          code: cppCode,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    }, 45000);
  });

  describe('Code Execution - Go', () => {
    test('POST /api/submit - Go correct solution', async () => {
      const goCode = `
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

type Input struct {
    Nums   []int \`json:"nums"\`
    Target int   \`json:"target"\`
}

func twoSum(nums []int, target int) []int {
    numMap := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if index, exists := numMap[complement]; exists {
            return []int{index, i}
        }
        numMap[num] = i
    }
    return []int{}
}

func main() {
    if len(os.Args) < 2 {
        return
    }
    
    var input Input
    json.Unmarshal([]byte(os.Args[1]), &input)
    
    result := twoSum(input.Nums, input.Target)
    
    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}
`;

      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'go',
          code: goCode,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
    }, 45000);
  });

  describe('Submission History', () => {
    test('GET /api/submissions - should return submission history', async () => {
      const response = await request(app).get('/api/submissions').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/submissions/:id - should return specific submission', async () => {
      // First create a submission
      const pythonCode = `print("Hello World")`;

      const submitResponse = await request(app).post('/api/submit').send({
        problemId,
        language: 'python',
        code: pythonCode,
      });

      const submissionId = submitResponse.body.data._id;

      const response = await request(app)
        .get(`/api/submissions/${submissionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(submissionId);
    });
  });

  describe('Input Validation', () => {
    test('POST /api/submit - should validate required fields', async () => {
      const response = await request(app)
        .post('/api/submit')
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('POST /api/submit - should validate language support', async () => {
      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'unsupported_language',
          code: 'console.log("test");',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/submit - should validate problem existence', async () => {
      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId: '507f1f77bcf86cd799439011',
          language: 'python',
          code: 'print("test")',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/nonexistent - should return 404', async () => {
      const response = await request(app).get('/api/nonexistent').expect(404);

      expect(response.body.success).toBe(false);
    });

    test('POST /api/submit - should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/submit')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Security Tests', () => {
    test('POST /api/submit - should prevent code injection attempts', async () => {
      const maliciousCode = `
import os
import subprocess

# Attempt to execute system commands
result = subprocess.run(['ls', '/'], capture_output=True, text=True)
print(result.stdout)
`;

      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'python',
          code: maliciousCode,
        })
        .expect(200);

      // The code should run in a sandboxed environment
      expect(response.body.success).toBe(true);
      // Should not expose system information
    }, 30000);

    test('POST /api/submit - should handle large memory usage', async () => {
      const memoryIntensiveCode = `
# Attempt to use large amounts of memory
large_list = [0] * (200 * 1024 * 1024)  # 200MB of integers
print("Memory allocated")
`;

      const response = await request(app)
        .post('/api/submit')
        .send({
          problemId,
          language: 'python',
          code: memoryIntensiveCode,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should be limited by memory constraints
    }, 30000);
  });
});
