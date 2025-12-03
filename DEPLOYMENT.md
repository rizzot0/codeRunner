# Deployment on Vercel

This document describes how to deploy both Frontend and Backend to Vercel (completely free tier compatible).

## Architecture
- **Frontend (Angular + Monaco Editor)** → Vercel (CDN + Static Hosting)
- **Backend (Node.js Sandbox Orchestrator)** → Vercel Functions (Serverless)
- **Execution:** Direct process spawning (Python, C++, Node.js) using `child_process`
- **Database:** None (stateless design; code is export-only)

## Key Features
- **Execution Timeout:** 30 seconds per execution
- **Multi-language support:** Python, C++, C, JavaScript via native runtimes
- **Stateless:** No persistence. Users compile, see results, and export.
- **Free tier:** Both frontend and backend deploy free on Vercel's free plan

---

## Deployment Steps

### 1. Backend Deployment (Vercel Functions)

#### Prerequisites
- GitHub account with your repo pushed
- Vercel account (connect via GitHub)

#### Steps
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Important:** Set the Root Directory to `Backend`
   - Vercel dashboard → Project Settings → Root Directory → `Backend`
4. Environment Variables (if needed):
   - Leave empty for now (stateless, no env vars required)
5. Click Deploy
6. Once deployed, note your backend URL (e.g., `https://coderunner-backend.vercel.app`)

#### Verify Backend
Test the endpoint using curl or Postman:
```bash
curl -X POST https://coderunner-backend.vercel.app/execution \
  -H "Content-Type: application/json" \
  -d '{
    "programming_language": "python",
    "entrypoint": "main.py",
    "input": "test",
    "files": [{"path": "main.py", "content": "print(\"Hello\")"}]
  }'
```

Expected response:
```json
{
  "stdout": "Hello\n",
  "stderr": ""
}
```

---

### 2. Frontend Deployment (Vercel Static)

#### Prerequisites
- Updated `environment.ts` with backend URL

#### Update Frontend Config
Edit `Frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://coderunner-backend.vercel.app'  // <- Backend URL from step 1
};
```

#### Deploy Frontend
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Important:** Set the Root Directory to `Frontend`
   - Vercel dashboard → Project Settings → Root Directory → `Frontend`
4. Build Command: `npm run build` (or `ng build`)
5. Output Directory: `dist/`
6. Click Deploy
7. Vercel generates a public URL (e.g., `https://coderunner-frontend.vercel.app`)

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.9+
- G++ (for C++ compilation)

### Backend Local Testing
```bash
cd Backend
npm install
npm run dev
```
Runs Vercel dev server at `http://localhost:3000`.

### Frontend Local Testing
```bash
cd Frontend
npm install
npm run start
```
Runs Angular dev server at `http://localhost:4200`.

**Update `environment.ts` locally to point to:**
```typescript
export const environment = {
  apiUrl: 'http://localhost:3000'  // Local backend
};
```

---

## Important Notes

### Vercel Limitations & Workarounds
1. **Function Timeout:** Vercel free tier has 10-second timeout. Upgraded plans support up to 300 seconds.
   - Our code sets a 30-second execution timeout (may hit Vercel limit on free tier).
   - For production, upgrade to Vercel Pro (~$20/month) for extended timeouts.
   
2. **File System:** Temporary files are created in `/tmp` (available in Vercel Functions).

3. **Compilers:** Python, Node.js, and G++ are pre-installed in Vercel's Node.js environment.

### CORS
Vercel Functions automatically handle CORS headers. Backend includes:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

---

## Troubleshooting

### Backend Returns 500 Error
- Check Vercel Functions logs: Dashboard → Project → Deployments → Logs
- Ensure Python, Node, and G++ are available in runtime

### Frontend Cannot Reach Backend
- Verify `environment.ts` has correct backend URL
- Check browser console (F12) for network errors
- Ensure CORS headers are set (they should be automatically)

### Frontend 404 / "No Output Directory" (Vercel)

This repository's Angular build outputs files to `Frontend/dist/Frontend`. If Vercel finishes the build but returns a 404 (or shows "No Output Directory named '<name>' found"), fix it one of two ways:

- Quick (dashboard): In the Vercel project settings for the Frontend project set:
  - **Root Directory**: `Frontend`
  - **Output Directory**: `dist/Frontend`

- Repo-based (recommended for reproducibility): keep the Project Root set to `Frontend` in Vercel and add a `vercel.json` in the `Frontend` folder (already added):
  - `Frontend/vercel.json` contains `{ "outputDirectory": "dist/Frontend" }`
  - This instructs Vercel to use the `dist/Frontend` folder produced by `ng build` as the static output.

After changing either setting, trigger a redeploy. In the build logs you should see a line like:
```
Output location: /vercel/path0/Frontend/dist/Frontend
```
When that appears and the deployment completes, opening the project URL should serve the app instead of returning 404.

If you prefer, I can update the Vercel Project settings for you — or guide you through the dashboard steps and verify a redeploy.

### Code Execution Times Out
- Vercel free tier: 10-second timeout
- Upgrade to Vercel Pro for longer timeouts
- Complex C++ compilations may hit the limit

---

## What to Highlight in Your Portfolio

✅ **Full-Stack Deployment:** Both frontend and backend on the same platform (Vercel)  
✅ **Serverless Architecture:** API endpoints as Vercel Functions (no server management)  
✅ **Multi-Language Support:** Execute Python, C++, JavaScript safely  
✅ **Stateless Design:** Clean architecture without database dependencies  
✅ **Free & Scalable:** Deploy at zero cost, scales with traffic  

---

## Next Steps (Optional Enhancements)
- Add execution history in browser LocalStorage (client-side only)
- Implement code syntax highlighting improvements
- Add more language support (Java, Rust, Go)
