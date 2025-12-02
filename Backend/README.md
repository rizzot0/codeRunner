# Backend - Node.js Serverless (Vercel Functions)

This backend is a Node.js application that runs as Vercel Functions. It compiles and executes code in Python, C++, C, and JavaScript.

## Architecture

- **Runtime:** Node.js 18+ (Vercel)
- **Execution:** Direct process spawning via `child_process` (no Docker needed)
- **Timeout:** 30 seconds per execution
- **API:** Single endpoint `/execution` (POST)

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- G++ compiler (for C++ support)

### Setup
```bash
cd Backend
npm install
```

### Run Locally
```bash
npm run dev
```
Vercel dev server starts at `http://localhost:3000`.

### Test the API
```bash
curl -X POST http://localhost:3000/execution \
  -H "Content-Type: application/json" \
  -d '{
    "programming_language": "python",
    "entrypoint": "main.py",
    "input": "test input",
    "files": [{"path": "main.py", "content": "print(\"Hello World\")"}]
  }'
```

Expected response:
```json
{
  "stdout": "Hello World\n",
  "stderr": ""
}
```

## API Endpoint

### POST /execution

**Request Body:**
```json
{
  "programming_language": "python|javascript|c++|cpp|c",
  "entrypoint": "main.py",
  "input": "input data",
  "files": [
    {
      "path": "main.py",
      "content": "print('Hello')"
    }
  ]
}
```

**Response:**
```json
{
  "stdout": "execution output",
  "stderr": "error output"
}
```

## Deployment to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import repository
4. Set **Root Directory:** `Backend`
5. Deploy

See `DEPLOYMENT.md` for detailed instructions.

## Supported Languages

- **Python** - Requires Python 3.9+
- **JavaScript/Node.js** - Native Node.js runtime
- **C/C++** - Requires G++ compiler

## Limitations

- Vercel free tier: 10-second timeout (upgrade to Pro for 300+ seconds)
- No persistent storage (files cleaned up after execution)
- Limited to available system compilers/runtimes on Vercel
