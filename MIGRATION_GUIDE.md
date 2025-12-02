# Migration Guide: Go Backend → Node.js Serverless

This guide explains the changes made to migrate from a Docker-based Go backend to a Node.js Serverless backend compatible with Vercel.

## What Changed

### Before (Go + Docker)
- Backend: Go (`cmd/api/main.go`)
- Execution: Docker containers orchestrated by Go Docker client
- Deployment: Azure VM or self-hosted Docker
- Dependency: Required Docker daemon running

### After (Node.js + Vercel Functions)
- Backend: Node.js 18+ (`api/execution.js`)
- Execution: Direct process spawning with `child_process`
- Deployment: Vercel Functions (serverless, free tier)
- Dependency: Python, Node.js, G++ pre-installed on Vercel

## File Structure

```
Backend/
├── api/
│   └── execution.js          # Vercel Function endpoint
├── runners/
│   ├── factory.js            # Runtime factory
│   ├── python.js             # Python runner
│   ├── javascript.js         # Node.js runner
│   └── cpp.js                # C++ runner
├── utils/
│   └── multipart.js          # Placeholder for future multipart parsing
├── package.json              # Node dependencies
├── vercel.json               # Vercel routing config
└── README.md                 # Updated documentation
```

## API Compatibility

The API endpoint remains **exactly the same**:

### Request
```json
{
  "programming_language": "python|javascript|c++|cpp|c",
  "entrypoint": "main.py",
  "input": "optional input",
  "files": [{"path": "main.py", "content": "print('hello')"}]
}
```

### Response
```json
{
  "stdout": "hello\n",
  "stderr": ""
}
```

**No changes needed in frontend code!** The execution service continues working as-is.

## Execution Flow

### Before (Docker)
1. Request received in Go handler
2. Create sandbox directory (`/tmp/sandboxes/{sessionId}`)
3. Write files to host filesystem
4. Create Docker container with mounted volume
5. Execute code inside container
6. Capture stdout/stderr
7. Clean up container and files

### After (Process Spawning)
1. Request received in Node.js handler
2. Create sandbox directory (`/tmp/sandboxes/{sessionId}`)
3. Write files to filesystem
4. Spawn process (`python`, `node`, `g++`)
5. Capture stdout/stderr
6. Clean up files

Both approaches are equivalent from a user perspective. The Node.js version is simpler and doesn't require Docker.

## Deployment

### Previous (Go → Azure/Fly.io)
```bash
docker build -t coderunner-backend .
docker push <registry>
# Deploy Docker image to VM/Fly.io
```

### Current (Node.js → Vercel)
```bash
git push  # Push to GitHub
# Vercel auto-deploys from GitHub
# No Docker or build config needed (Vercel handles it)
```

## Limitations & Considerations

### Advantages
✅ **Free deployment** - Vercel free tier includes generous execution limits
✅ **Simpler** - No Docker daemon, fewer dependencies
✅ **Scalable** - Vercel Functions auto-scale
✅ **CORS handled** - No manual CORS configuration needed
✅ **Cold start** - Near-instant (Node.js vs Go startup time is negligible)

### Limitations
⚠️ **Timeout** - Vercel free tier: 10 seconds (Pro tier: 300 seconds)
⚠️ **Memory** - Limited to Vercel's function memory (default 3GB, shared with system)
⚠️ **Compilers** - Dependent on Vercel's base images (Python, Node, GCC included)
⚠️ **No Docker** - Cannot use advanced isolation (gVisor, seccomp)

### Solutions for Limitations
- **Long-running code**: Upgrade to Vercel Pro (~$20/month) for 300-second timeout
- **Complex compilations**: Optimize C++ code, split into smaller functions
- **Resource limits**: Monitor function logs in Vercel dashboard

## Migration Checklist

- [x] Rewrite backend in Node.js
- [x] Create runners for Python, JavaScript, C++
- [x] Create Vercel Functions endpoint
- [x] Create `vercel.json` routing config
- [x] Create `package.json` with dependencies
- [x] Update `DEPLOYMENT.md` with Vercel instructions
- [x] Maintain API compatibility (no frontend changes needed)
- [x] Test locally with `npm run dev`
- [x] Deploy to Vercel
- [x] Test deployed endpoints

## Testing

### Local Development
```bash
cd Backend
npm install
npm run dev
# Server starts at http://localhost:3000
```

### Run Test Script
```bash
bash test-local.sh
# Requires: python, node, g++ installed locally
```

### Vercel Deployment Test
```bash
# After deploying to Vercel
curl -X POST https://<project>.vercel.app/execution \
  -H "Content-Type: application/json" \
  -d '{"programming_language":"python","entrypoint":"main.py","input":"","files":[{"path":"main.py","content":"print(\"test\")"}]}'
```

## Questions?

Refer to:
- `DEPLOYMENT.md` - Complete deployment instructions
- `Backend/README.md` - Backend-specific documentation
- `api/execution.js` - Entry point handler
- `runners/*.js` - Language-specific runners

