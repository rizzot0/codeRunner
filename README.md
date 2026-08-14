# Online Compiler - Vercel Edition

A free, cloud-native online code compiler/judge running on Vercel. Execute Python, C++, and JavaScript without Docker or setup.

## Features

✨ **Zero-cost deployment** - Free Vercel tier  
🚀 **Serverless backend** - Auto-scaling Node.js functions  
💻 **Multi-language** - Python, C++, JavaScript support  
🎨 **Modern UI** - Angular + Monaco Editor  
📦 **Stateless** - No database, perfect for portfolio  

## Quick Deploy (5 minutes)

See `QUICK_START.md` for step-by-step instructions.

**TL;DR:**
1. Deploy `Backend/` to Vercel
2. Deploy `Frontend/` to Vercel
3. Update frontend config with backend URL
4. Done! Share your URL

## Technology Stack

- **Frontend:** Angular 17, TypeScript, Monaco Editor, PrimeNG
- **Backend:** Node.js 18+, Vercel Functions, child_process
- **Runtimes:** Python 3.9+, G++, Node.js (pre-installed on Vercel)
- **Deployment:** Vercel (free tier)

## Project Structure

```
.
├── Frontend/              # Angular SPA
│   ├── src/
│   ├── package.json
│   └── angular.json
├── Backend/               # Node.js Serverless
│   ├── api/execution.js  # Main endpoint
│   ├── runners/          # Language-specific runners
│   ├── package.json
│   └── vercel.json       # Vercel routing config
├── QUICK_START.md        # ⭐ Start here
├── DEPLOYMENT.md         # Detailed deployment guide
└── MIGRATION_GUIDE.md    # How we migrated from Go
```

## Local Development

### Backend
```bash
cd Backend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Frontend
```bash
cd Frontend
npm install
npm run start
# Runs on http://localhost:4200
```

Then update `environment.ts` to point to `http://localhost:3000`.

## API

### POST /execution

Execute code in a sandbox.

**Request:**
```json
{
  "programming_language": "python|javascript|c++|cpp|c",
  "entrypoint": "main.py",
  "input": "optional stdin",
  "files": [
    {"path": "main.py", "content": "print('hello')"}
  ]
}
```

**Response:**
```json
{
  "stdout": "hello\n",
  "stderr": ""
}
```

## Demo

The public demo runs **in the browser** so it can live on GitHub Pages with no extra paid services:

- JavaScript: Web Worker with timeout
- Python: [Pyodide](https://pyodide.org) (CPython in WebAssembly, first run downloads the runtime)
- C++: [Compiler Explorer](https://godbolt.org) (g++ 13, con CORS; el intérprete JSCPP se rompía al parsear)

Vercel/Netlify **do not** ship `python3` or `g++`. The Node backend can still use local compilers (`EXECUTOR=local`) or Paiza as a remote runner if you deploy it later.

## What to Highlight in Your Portfolio

This project demonstrates:
- ✅ **Full-stack cloud deployment** - Frontend + Backend on Vercel
- ✅ **Serverless architecture** - Auto-scaling, zero maintenance
- ✅ **Multi-language runtime management** - Support for Python, C++, JavaScript
- ✅ **API design** - Clean, RESTful endpoint
- ✅ **Sandbox execution** - Safe code isolation using OS processes
- ✅ **DevOps mindset** - Cost optimization (free tier), performance tuning

## Next Steps

- [ ] Follow `QUICK_START.md` to deploy
- [ ] Add to your portfolio website
- [ ] Write case study explaining architecture decisions
- [ ] Consider adding features (localStorage history, more languages)

## Need Help?

- `QUICK_START.md` - 5-minute deployment guide
- `DEPLOYMENT.md` - Detailed deployment & troubleshooting
- `MIGRATION_GUIDE.md` - How we migrated from Go
- `Backend/README.md` - Backend-specific docs
- `Frontend/README.md` - Frontend-specific docs

---

**Built with:** Angular, Node.js, Vercel  
**Inspired by:** CodePen, Replit, Judge Online  
**License:** MIT
