#!/bin/bash
# Local test script for backend

# Test 1: Simple Python execution
echo "Test 1: Python Hello World"
curl -X POST http://localhost:3000/execution \
  -H "Content-Type: application/json" \
  -d '{
    "programming_language": "python",
    "entrypoint": "main.py",
    "input": "",
    "files": [{"path": "main.py", "content": "print(\"Hello from Python\")"}]
  }'
echo ""

# Test 2: JavaScript execution
echo "Test 2: JavaScript Hello World"
curl -X POST http://localhost:3000/execution \
  -H "Content-Type: application/json" \
  -d '{
    "programming_language": "javascript",
    "entrypoint": "main.js",
    "input": "",
    "files": [{"path": "main.js", "content": "console.log(\"Hello from JavaScript\")"}]
  }'
echo ""

# Test 3: Python with input
echo "Test 3: Python with stdin"
curl -X POST http://localhost:3000/execution \
  -H "Content-Type: application/json" \
  -d '{
    "programming_language": "python",
    "entrypoint": "main.py",
    "input": "test input",
    "files": [{"path": "main.py", "content": "import sys\ndata = sys.stdin.read()\nprint(\"Input:\", data)"}]
  }'
echo ""

echo "All tests completed!"
