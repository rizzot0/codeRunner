# Quick Start: Deploy to Vercel in 5 Minutes

This is the fastest way to get your Online Compiler running on Vercel for free.

## Prerequisites
- GitHub account (repo must be pushed)
- Vercel account (sign up at https://vercel.com)

## Step 1: Deploy Backend (2 minutes)

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository
4. **Important:** Set **Root Directory** to `Backend`
5. Click **Deploy**
6. Wait for deployment to complete
7. Copy your backend URL (e.g., `https://coderunner-backend-xyz.vercel.app`)

## Step 2: Update Frontend Configuration (1 minute)

1. Edit `Frontend/src/environments/environment.ts` and replace:
   ```typescript
   apiUrl: 'https://your-backend-url-from-step-1.vercel.app'
   ```

2. Edit `Frontend/src/environments/environment.prod.ts` with the same URL

3. Commit and push to GitHub:
   ```bash
   git add Frontend/src/environments/
   git commit -m "Update backend URL for Vercel"
   git push
   ```

## Step 3: Deploy Frontend (2 minutes)

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub repository
4. **Important:** Set **Root Directory** to `Frontend`
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist/` or `dist/code-runner/` (check your Angular config)
7. Click **Deploy**
8. Wait for deployment to complete
9. Your frontend URL is now ready (e.g., `https://coderunner-frontend-xyz.vercel.app`)

## Step 4: Test It Works (Bonus!)

1. Open your frontend URL in a browser
2. Write some code (Python, JavaScript, or C++)
3. Click "Run"
4. You should see output in the terminal

## Troubleshooting

### Backend returns 500 error
- Check Vercel dashboard → Deployments → Logs
- Ensure Python/Node/G++ are available (they should be pre-installed on Vercel)

### Frontend can't reach backend
- Verify `environment.ts` has the correct backend URL
- Check browser console (F12) for CORS errors
- Ensure backend URL ends without a trailing slash

### Code execution times out
- You're on Vercel free tier (10-second timeout)
- Upgrade to Vercel Pro for longer timeouts
- Keep code execution < 10 seconds

## Next: Show Your Portfolio! 🎉

Now you can:
- Share your live frontend URL with others
- Add to your portfolio website
- Highlight the architecture in your resume

**What to mention in interviews:**
"I built an Online Compiler that runs on Vercel's serverless platform. The frontend is a React/Angular SPA, and the backend executes Python, C++, and JavaScript code safely without Docker, scaling automatically with traffic. It's completely free and demonstrates cloud-native architecture."

---

Need help? See `DEPLOYMENT.md` for detailed instructions.
