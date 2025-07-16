# 📚 SafeExec API Documentation

![SafeExec Banner](https://img.shields.io/badge/SafeExec-API%20Documentation-blue?style=for-the-badge&logo=swagger)

Welcome to the **SafeExec API Documentation**! This comprehensive guide will help you integrate with our secure code execution platform.

## 🌟 Overview

SafeExec is an enterprise-grade, secure code execution platform that allows you to:

- Execute code in **5 programming languages** (Python, JavaScript, Java, C++, Go)
- Submit solutions to **coding problems** with automated testing
- Track **performance metrics** and submission history
- Monitor **system health** and execution statistics

## 🚀 Quick Start

### 1. Access the Interactive Documentation

Visit the interactive API documentation at:
```
http://localhost:5000/api-docs
```

### 2. Authentication Flow

```bash
# Step 1: Register a new account
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username", 
    "email": "your@email.com",
    "password": "securePassword123"
  }'

# Step 2: Login to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "securePassword123"
  }'

# Response will include your JWT token
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 3. Execute Your First Code

```bash
# Use your JWT token for authenticated requests
curl -X POST http://localhost:5000/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "language": "python",
    "code": "print(\"Hello, SafeExec!\")\nprint(f\"Sum of 1-10: {sum(range(1, 11))}\")",
    "timeLimit": 5000,
    "memoryLimit": 128
  }'
```

## 📊 API Endpoints Overview

| Category | Endpoint | Method | Description |
|----------|----------|---------|-------------|
| **🔐 Authentication** | `/api/auth/register` | POST | Register new user account |
| | `/api/auth/login` | POST | User login and token generation |
| | `/api/auth/profile` | GET | Get user profile information |
| | `/api/auth/refresh` | POST | Refresh JWT access token |
| | `/api/auth/logout` | POST | User logout |
| **⚡ Code Execution** | `/api/execute` | POST | Direct code execution |
| | `/api/execute/languages` | GET | Get supported languages |
| | `/api/execute/result/{id}` | GET | Get execution result |
| **📋 Problem Submission** | `/api/submit` | POST | Submit solution to problem |
| | `/api/submit/{id}` | GET | Get submission details |
| | `/api/submit/user/{userId}` | GET | Get user's submissions |
| | `/api/submit/stats` | GET | Get executor statistics |
| **🧩 Problems** | `/api/problems` | GET | List all available problems |
| **🔧 System** | `/api/health` | GET | System health check |

## 🛡️ Security & Rate Limits

### Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|--------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Code Execution | 50 requests | 1 hour |

### Security Headers

All API responses include security headers:
- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`

## 💻 Supported Languages

| Language | Version | Extensions | Time Limit | Memory Limit |
|----------|---------|------------|------------|--------------|
| **Python** | 3.x | Standard Library | 30s | 512MB |
| **JavaScript** | Node.js LTS | Built-in modules | 30s | 512MB |
| **Java** | OpenJDK 17+ | Standard Library | 30s | 512MB |
| **C++** | g++ (C++17) | STL | 30s | 512MB |
| **Go** | Latest stable | Standard Library | 30s | 512MB |

## 📈 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "executionId": "exec_1710412800_abc123",
    "output": "Hello, SafeExec!\nSum of 1-10: 55",
    "executionTime": 125,
    "memoryUsage": 8388608,
    "status": "success",
    "language": "python"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Code too long. Maximum 10,000 characters allowed.",
  "code": "CODE_TOO_LONG"
}
```

## 🔧 Code Examples

### Python Example
```python
import requests

# Authentication
auth_response = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'your@email.com',
    'password': 'your_password'
})
token = auth_response.json()['token']

# Code execution
headers = {'Authorization': f'Bearer {token}'}
execution_response = requests.post(
    'http://localhost:5000/api/execute',
    headers=headers,
    json={
        'language': 'python',
        'code': 'print("Hello from Python!")',
        'timeLimit': 5000
    }
)
print(execution_response.json())
```

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

async function executeCode() {
  // Authentication
  const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'your@email.com',
    password: 'your_password'
  });
  
  const token = authResponse.data.token;
  
  // Code execution
  const executionResponse = await axios.post(
    'http://localhost:5000/api/execute',
    {
      language: 'javascript',
      code: 'console.log("Hello from Node.js!");',
      timeLimit: 5000
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  console.log(executionResponse.data);
}

executeCode();
```

### cURL Examples
```bash
# Get all problems
curl -X GET http://localhost:5000/api/problems

# Submit solution to a problem
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "problemId": "65f21b4667d0d8992e610c85",
    "language": "python",
    "code": "def solution(nums, target):\n    # Your solution here\n    return []"
  }'

# Check system health
curl -X GET http://localhost:5000/api/health
```

## 🚨 Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `AUTH_REQUIRED` | Missing or invalid authentication | Include valid JWT token |
| `VALIDATION_ERROR` | Invalid request parameters | Check request format |
| `CODE_TOO_LONG` | Code exceeds length limit | Reduce code length |
| `INVALID_LANGUAGE` | Unsupported language | Use supported language |
| `EXECUTION_ERROR` | Code execution failed | Check code for errors |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait before retrying |

## 📊 Performance Guidelines

### Optimal Code Practices
- **Keep code concise**: Avoid unnecessary complexity
- **Handle edge cases**: Include proper error handling
- **Use efficient algorithms**: Consider time complexity
- **Manage memory**: Avoid memory leaks in long-running code

### Execution Limits
- **Time Limit**: Maximum 30 seconds per execution
- **Memory Limit**: Maximum 512MB per execution
- **Code Length**: Maximum 50,000 characters for submissions, 10,000 for direct execution
- **Input Size**: Maximum 1MB input data

## 🔍 Debugging Tips

### Common Issues

1. **Authentication Errors**
   ```bash
   # Ensure token is properly formatted
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Timeout Errors**
   ```python
   # Optimize your algorithm
   # Use more efficient data structures
   # Avoid infinite loops
   ```

3. **Memory Errors**
   ```python
   # Avoid creating large data structures
   # Use generators for large datasets
   # Clear unused variables
   ```

## 📞 Support & Resources

- **📚 Interactive Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **🔧 Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **📋 OpenAPI Spec**: [http://localhost:5000/api-docs.json](http://localhost:5000/api-docs.json)
- **🎯 GitHub Repository**: [https://github.com/vikashkrdeveloper/SafeExec](https://github.com/vikashkrdeveloper/SafeExec)
- **📧 Developer Contact**: vikashkrdeveloper@gmail.com

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details on:
- Setting up the development environment
- Running tests
- Submitting pull requests
- Code style guidelines

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ by [Vikash Kumar](https://github.com/vikashkrdeveloper) and the SafeExec community**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue)
![Express](https://img.shields.io/badge/express-4.17.1-blue)
![MongoDB](https://img.shields.io/badge/mongodb-4.4+-green)
![Docker](https://img.shields.io/badge/docker-20.10+-blue)
![OpenAPI](https://img.shields.io/badge/openapi-3.0.0-blue)
![Swagger](https://img.shields.io/badge/swagger-3.0+-blue)
![Redis](https://img.shields.io/badge/redis-6.0+-red)
