# 🚢 Deployment Guide

Step-by-step instructions to deploy Freiwilliger to production using Render.com (backend) and Vercel (frontend).

---

## Prerequisites

Before deploying, ensure you have:
- A GitHub repository with the project code
- MongoDB Atlas cluster (M0 free tier is fine for start)
- Firebase project with phone auth enabled
- Cloudinary account
- Render.com account (free tier available)
- Vercel account (free tier available)

---

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free M0 cluster (choose a region close to your users — Mumbai for India)
3. Create a database user with read/write access
4. Under Network Access, add `0.0.0.0/0` to allow connections from Render
5. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/freiwilliger?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render.com)

### Step 1: Create Web Service

1. Log in to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `freiwilliger-api`
   - **Region:** Singapore or closest to India
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free (or Starter for production)

### Step 2: Environment Variables

Add all environment variables in the Render dashboard:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<random-64-char-hex>
JWT_REFRESH_SECRET=<random-64-char-hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
FIREBASE_PROJECT_ID=<your-project-id>
CLIENT_URL=https://freiwilliger.vercel.app
EMAIL_USER=<gmail-address>
EMAIL_PASSWORD=<gmail-app-password>
SENTRY_DSN=<optional-sentry-dsn>
```

### Step 3: Firebase Admin Key

For Render, encode your `firebase-admin-key.json` as a base64 environment variable:

```bash
# Locally:
base64 -i server/firebase-admin-key.json | tr -d '\n'
```

Add as env var `FIREBASE_ADMIN_KEY_BASE64`, then in your firebase config, decode it at runtime.

Alternatively, use Render's Secret Files feature to upload the JSON directly.

### Step 4: Deploy

Click "Create Web Service". Render will build and deploy automatically.

Your API will be available at: `https://freiwilliger-api.onrender.com`

### Notes on Free Tier
- Free instances spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Upgrade to Starter ($7/mo) for always-on

---

## 3. Frontend Deployment (Vercel)

### Step 1: Import Project

1. Log in to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)

### Step 2: Environment Variables

Add client environment variables:

```
VITE_API_BASE_URL=https://freiwilliger-api.onrender.com/api/v1
VITE_SOCKET_URL=https://freiwilliger-api.onrender.com
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
VITE_FIREBASE_VAPID_KEY=<vapid-key>
VITE_SENTRY_DSN=<optional-sentry-dsn>
VITE_MIXPANEL_TOKEN=<optional-mixpanel-token>
```

### Step 3: Deploy

Click "Deploy". Vercel will build and deploy automatically.

Your app will be available at: `https://freiwilliger.vercel.app`

### Step 4: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `freiwilliger.in`)
3. Update DNS records as instructed by Vercel
4. Update `CLIENT_URL` env var on Render to match

---

## 4. Post-Deployment Checklist

### Backend
- [ ] Verify health endpoint: `GET /api/v1/health`
- [ ] Test phone auth flow end-to-end
- [ ] Verify MongoDB connection (check Render logs)
- [ ] Confirm Cloudinary uploads work
- [ ] Test Socket.io connection from frontend
- [ ] Verify cron jobs are running (check logs for scoring job)

### Frontend
- [ ] Verify app loads without console errors
- [ ] Test login/register flow
- [ ] Verify API calls hit production backend
- [ ] Test PWA install prompt (HTTPS required)
- [ ] Verify push notifications (FCM)
- [ ] Check Sentry is capturing errors
- [ ] Test on mobile devices

### Security
- [ ] Ensure CORS only allows your frontend domain
- [ ] Verify rate limiting is active
- [ ] Confirm JWT secrets are unique and strong
- [ ] Check that `firebase-admin-key.json` is NOT in the repo
- [ ] Verify HTTPS is enforced on both services

---

## 5. CI/CD with GitHub Actions

The project includes GitHub Actions workflows in `.github/workflows/`:

- `deploy-backend.yml` — Triggers on push to `main`, deploys to Render via deploy hook
- `deploy-frontend.yml` — Vercel auto-deploys on push (no manual workflow needed)
- `lint.yml` — Runs ESLint on PRs

### Setting up Render Deploy Hook

1. In Render dashboard → your service → Settings → Deploy Hook
2. Copy the hook URL
3. Add it as a GitHub secret: `RENDER_DEPLOY_HOOK_URL`
4. The workflow will trigger the hook on push to main

---

## 6. Monitoring

### Sentry (Error Tracking)
1. Create a project at [sentry.io](https://sentry.io)
2. Add DSN to both server and client env vars
3. Errors are captured automatically via the SDK

### Logs
- **Render:** Dashboard → your service → Logs (real-time)
- **Vercel:** Dashboard → your project → Functions → Logs

### Uptime
- Use [UptimeRobot](https://uptimerobot.com) (free) to ping your health endpoint every 5 minutes
- This also prevents Render free-tier spin-down

---

## 7. Scaling Considerations

When you outgrow the free tiers:

| Component | Free Tier Limit | Upgrade Path |
|-----------|----------------|--------------|
| Render | 750 hours/month, spin-down | Starter $7/mo (always-on) |
| Vercel | 100GB bandwidth/month | Pro $20/mo |
| MongoDB Atlas | 512MB storage | M10 $57/mo (dedicated) |
| Cloudinary | 25GB storage, 25GB bandwidth | Plus $89/mo |
| Firebase Auth | 10K verifications/month | Pay-as-you-go |

### When to Scale
- > 100 concurrent users → Upgrade Render to Starter
- > 1000 users total → Upgrade MongoDB to M10
- > 10K images → Monitor Cloudinary bandwidth
- Response times > 2s → Consider adding Redis for caching
