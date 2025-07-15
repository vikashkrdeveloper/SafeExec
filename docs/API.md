# API Documentation

## Overview

The RCE Backend provides a secure remote code execution system with support for multiple programming languages.

## Authentication

All API endpoints (except health check) require authentication using JWT tokens.

### Register User

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Login

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "username": "testuser",
  "password": "password123"
}
```

## Code Execution

### Submit Code

```http
POST /api/submissions
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "input": "optional input",
  "timeLimit": 5000,
  "memoryLimit": 128
}
```

**Supported Languages:**

- `python` - Python 3.11
- `javascript` / `nodejs` - Node.js 18
- `java` - Java 17
- `cpp` - C++17
- `c` - C (uses C++ compiler)
- `go` / `golang` - Go 1.21

**Response:**

```json
{
  "success": true,
  "output": "Hello, World!",
  "error": "",
  "executionTime": 234,
  "memoryUsed": 12
}
```

### Get Submission

```http
GET /api/submissions/:id
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "id": "submission_id",
  "code": "print('Hello, World!')",
  "language": "python",
  "status": "completed",
  "output": "Hello, World!",
  "executionTime": 234,
  "memoryUsed": 12,
  "createdAt": "2025-07-13T10:00:00Z"
}
```

## Problems

### Create Problem

```http
POST /api/problems
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "title": "Two Sum",
  "description": "Find two numbers that add up to target",
  "difficulty": "easy",
  "testCases": [
    {
      "input": "[2,7,11,15]\n9",
      "expectedOutput": "[0,1]"
    }
  ],
  "timeLimit": 5000,
  "memoryLimit": 128,
  "supportedLanguages": ["python", "java", "cpp"]
}
```

### Get All Problems

```http
GET /api/problems
Authorization: Bearer <jwt_token>
```

### Submit Solution

```http
POST /api/submissions/problem/:problemId
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "code": "def solution(nums, target): return [0, 1]",
  "language": "python"
}
```

## Rate Limits

- General API: 100 requests per 15 minutes per IP
- Authentication: 5 requests per 15 minutes per IP
- Code execution: 10 submissions per minute per user

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (rate limit exceeded)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
