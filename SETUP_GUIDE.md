# 🔑 Freiwilliger — Complete Setup Guide
### Every API key, where to get it, what to click, and where to paste it

---

## 📋 Quick Overview — What You Need

| Service | Free? | Required? | What It Does |
|---------|-------|-----------|--------------|
| MongoDB Atlas | ✅ Free (M0) | **YES** | Database — stores all app data |
| Firebase | ✅ Free (Spark) | **YES** | Phone OTP verification + push notifications |
| Cloudinary | ✅ Free (25GB) | **YES** | Image uploads (profile photos, logos) |
| Gmail SMTP | ✅ Free | **YES** | Sends email OTPs for verification |
| Sentry | ✅ Free (5K events/mo) | No (optional) | Error monitoring |
| Mixpanel | ✅ Free (20M events/mo) | No (optional) | User analytics |
| DigiLocker | ✅ Free (dev) | No (optional) | Aadhaar e-KYC (Indian ID verification) |
| Razorpay | ✅ Free (test mode) | No (optional) | Payment gateway for paid events |
| Render.com | ✅ Free (750h/mo) | For deployment | Backend hosting |
| Vercel | ✅ Free (100GB/mo) | For deployment | Frontend hosting |

---

## 🗂️ Files You'll Create

```
server/.env               ← Server environment variables (SECRET — never commit)
server/firebase-admin-key.json  ← Firebase Admin SDK key (SECRET — never commit)
client/.env               ← Client environment variables (safe — no real secrets)
```

Both `.env` files and `firebase-admin-key.json` are already in `.gitignore`.

---

## Step-by-Step Setup

---

## 1️⃣ MongoDB Atlas (Database) — REQUIRED

### What you get: `MONGODB_URI`

### Steps:

1. Go to **https://www.mongodb.com/atlas** → Click "Try Free"
2. Create account with Google/Email
3. Choose **FREE M0 cluster** → Select region **Mumbai (ap-south-1)** for India
4. Click **"Create Cluster"** (takes 1-3 minutes)
5. **Create Database User:**
   - Left sidebar → Database Access → "Add New Database User"
   - Username: `freiwilligerUser`
   - Password: Click "Autogenerate Secure Password" → **COPY THIS PASSWORD**
   - Role: "Read and write to any database"
   - Click "Add User"
6. **Allow Network Access:**
   - Left sidebar → Network Access → "Add IP Address"
   - Click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
   - Click "Confirm"
7. **Get Connection String:**
   - Left sidebar → Database → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5+
   - **Copy the connection string**
   - Replace `<password>` with the password you copied in step 5
   - Replace `<dbname>` with `freiwilliger`

### Paste in: `server/.env`
```
MONGODB_URI=mongodb+srv://freiwilligerUser:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/freiwilliger?retryWrites=true&w=majority
```

---

## 2️⃣ Firebase (Phone Auth + Push Notifications) — REQUIRED

### What you get: 
- Client: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_VAPID_KEY`
- Server: `FIREBASE_PROJECT_ID` + `firebase-admin-key.json` file

### Steps:

1. Go to **https://console.firebase.google.com** → "Add project"
2. Project name: `freiwilliger` → Continue
3. Disable Google Analytics (not needed) → "Create Project"
4. Wait for project creation → Click "Continue"

### Enable Phone Authentication:
5. Left sidebar → **Build → Authentication**
6. Click "Get started"
7. Tab: **Sign-in method** → Click **"Phone"** → Toggle ON → Save

### Get Client SDK Config (for `client/.env`):
8. Go to **Project Settings** (gear icon top-left) → **General** tab
9. Scroll down to "Your apps" → Click **Web icon `</>`**
10. App nickname: `freiwilliger-web` → Click "Register app"
11. You'll see a `firebaseConfig` object. **Copy these 4 values:**

### Paste in: `client/.env`
```
VITE_FIREBASE_API_KEY=AIzaSyA...........
VITE_FIREBASE_AUTH_DOMAIN=freiwilliger-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=freiwilliger-xxxxx
VITE_FIREBASE_APP_ID=1:485492825034:web:ffbd194f31d1de8e4c8d33
```

### Get VAPID Key (for Push Notifications):
12. Project Settings → **Cloud Messaging** tab
13. Scroll to "Web configuration" → Under "Web Push certificates"
14. Click **"Generate key pair"**
15. **Copy the long public key** that appears

### Paste in: `client/.env`
```
VITE_FIREBASE_VAPID_KEY=BLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Get Admin SDK Key (for server):
16. Project Settings → **Service Accounts** tab
17. Make sure "Node.js" is selected
18. Click **"Generate new private key"** → "Generate key"
19. A JSON file downloads automatically
20. **Rename it** to `firebase-admin-key.json`
21. **Move it** to `server/firebase-admin-key.json`

### Paste in: `server/.env`
```
FIREBASE_PROJECT_ID=freiwilliger-xxxxx
```
(Copy from the JSON file field `"project_id"`)

⚠️ **NEVER commit firebase-admin-key.json to git!** (already in .gitignore)

---

## 3️⃣ Cloudinary (Image Uploads) — REQUIRED

### What you get: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Steps:

1. Go to **https://cloudinary.com** → "Sign Up Free"
2. Create account (Google/Email)
3. After login, you land on the **Dashboard**
4. You'll see a "Product Environment Credentials" card showing:
   - **Cloud Name**: `dxxxxxxx`
   - **API Key**: `263817612753487`
   - **API Secret**: Click "eye" icon to reveal

### Paste in: `server/.env`
```
CLOUDINARY_CLOUD_NAME=dxxxxxxx
CLOUDINARY_API_KEY=263817612753487
CLOUDINARY_API_SECRET=QnxzYYk20RbrgeEj1aO3waC2cfM
```

---

## 4️⃣ Gmail SMTP (Email OTPs) — REQUIRED

### What you get: `EMAIL_USER`, `EMAIL_PASSWORD`

### Steps:

1. Use any Gmail account (or create a new one for the app)
2. Go to **https://myaccount.google.com/security**
3. **Enable 2-Step Verification** (required for App Passwords):
   - Security → 2-Step Verification → Get Started → Follow prompts
4. After 2FA is enabled, go to **https://myaccount.google.com/apppasswords**
   - If you can't find it: Search "App Passwords" in your Google Account settings
5. Select app: "Mail" → Select device: "Other" → Type: "Freiwilliger"
6. Click **"Generate"**
7. You'll see a **16-character password** like `wmcd qwoe vvfp hcwm`
8. **Copy it** (remove spaces or keep as-is, both work)

### Paste in: `server/.env`
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=wmcdqwoevvfphcwm
```

---

## 5️⃣ JWT Secrets — REQUIRED

### What you get: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

### Steps:

These are random strings you generate yourself. Run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run it **twice** — once for access, once for refresh.

### Paste in: `server/.env`
```
JWT_ACCESS_SECRET=<first-64-char-hex-string>
JWT_REFRESH_SECRET=<second-64-char-hex-string>
```

---

## 6️⃣ Sentry (Error Monitoring) — OPTIONAL

### What you get: `SENTRY_DSN` (server) + `VITE_SENTRY_DSN` (client)

### Steps:

1. Go to **https://sentry.io** → "Start for Free"
2. Create account → Create Organization
3. Click "Create Project"
4. Platform: **Express** (for server) → Give it a name → "Create Project"
5. You'll see a DSN string like: `https://xxxxx@o4508.ingest.sentry.io/4508xxxxx`
6. **Copy the DSN**
7. Create another project: Platform: **React** → Same DSN or separate project

### Paste in: `server/.env`
```
SENTRY_DSN=https://xxxxx@o4508.ingest.sentry.io/4508xxxxx
```

### Paste in: `client/.env`
```
VITE_SENTRY_DSN=https://xxxxx@o4508.ingest.sentry.io/4508xxxxx
```

(Both can use same DSN, or create separate projects for better separation)

---

## 7️⃣ Mixpanel (Analytics) — OPTIONAL

### What you get: `VITE_MIXPANEL_TOKEN`

### Steps:

1. Go to **https://mixpanel.com** → "Get Started Free"
2. Create account → Create project: `Freiwilliger`
3. After creation, go to **Settings** (gear icon) → **Project Settings**
4. You'll see **"Project Token"** — a 32-char hex string
5. **Copy it**

### Paste in: `client/.env`
```
VITE_MIXPANEL_TOKEN=a1b2c3d4e5f6789012345678abcdef00
```

---

## 8️⃣ DigiLocker (Aadhaar e-KYC) — OPTIONAL

### What you get: `DIGILOCKER_CLIENT_ID`, `DIGILOCKER_CLIENT_SECRET`, `DIGILOCKER_REDIRECT_URI`

### Steps:

1. Go to **https://developers.digilocker.gov.in**
2. Register as a developer (requires Indian org/individual registration)
3. Create an application → Get Client ID and Client Secret
4. Set redirect URI to your backend callback URL

### Paste in: `server/.env`
```
DIGILOCKER_CLIENT_ID=your-client-id
DIGILOCKER_CLIENT_SECRET=your-client-secret
DIGILOCKER_REDIRECT_URI=http://localhost:5000/api/v1/auth/digilocker/callback
```

⚠️ Note: DigiLocker developer registration may take a few days for approval.

---

## 9️⃣ Razorpay (Payments) — OPTIONAL

### What you get: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

### Steps:

1. Go to **https://razorpay.com** → "Sign Up"
2. Create account (requires Indian PAN/business details)
3. Dashboard → Settings → API Keys → "Generate Test Key"
4. You'll get:
   - **Key ID**: `rzp_test_xxxxxxxxxxxxx`
   - **Key Secret**: shown once — **copy immediately!**

### Paste in: `server/.env`
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Final Checklist — Your Complete `server/.env`

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Step 1)
MONGODB_URI=mongodb+srv://freiwilligerUser:PASSWORD@cluster0.xxxxx.mongodb.net/freiwilliger?retryWrites=true&w=majority

# Firebase (Step 2)
FIREBASE_PROJECT_ID=freiwilliger-xxxxx

# JWT (Step 5)
JWT_ACCESS_SECRET=<64-char-hex>
JWT_REFRESH_SECRET=<64-char-hex>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary (Step 3)
CLOUDINARY_CLOUD_NAME=dxxxxxxx
CLOUDINARY_API_KEY=263817612753487
CLOUDINARY_API_SECRET=QnxzYYk20RbrgeEj1aO3waC2cfM

# Email (Step 4)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173

# Optional Services
SENTRY_DSN=
DIGILOCKER_CLIENT_ID=
DIGILOCKER_CLIENT_SECRET=
DIGILOCKER_REDIRECT_URI=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## ✅ Final Checklist — Your Complete `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=freiwilliger-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=freiwilliger-xxxxx
VITE_FIREBASE_APP_ID=1:xxxxxxxxx:web:xxxxxxxxxxxxxxxxx
VITE_FIREBASE_VAPID_KEY=BLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_SENTRY_DSN=
VITE_MIXPANEL_TOKEN=
```

---

## 🚀 Run the Project

After filling in both `.env` files:

```bash
# Terminal 1 — Start backend
cd server
npm install
npm run dev
# Should see: "Server listening on port 5000" + "✅ MongoDB connected"

# Terminal 2 — Start frontend
cd client
npm install
npm run dev
# Should see: Vite dev server on http://localhost:5173
```

Open **http://localhost:5173** in your browser. The app should load!

---

## 🔐 Security Reminders

1. **NEVER commit `.env` files** — they contain real API keys
2. **NEVER commit `firebase-admin-key.json`** — it has full Firebase admin access
3. Both are already in `.gitignore` ✅
4. If you accidentally committed them, rotate ALL keys immediately
5. For production, use different API keys than development

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "JWT secrets must be defined" | You forgot to create `server/.env` or JWT secrets are empty |
| "Firebase Admin initialised" not showing | Check `firebase-admin-key.json` exists in server/ root |
| MongoDB connection error | Check your MONGODB_URI, ensure IP is whitelisted (0.0.0.0/0) |
| Cloudinary upload fails | Verify cloud name, API key, and API secret are correct |
| OTP email not sending | Ensure Gmail 2FA is ON and you're using an App Password (not your regular password) |
| CORS errors in browser | Make sure CLIENT_URL matches your frontend URL exactly |
| Firebase phone auth fails | Ensure Phone auth is enabled in Firebase console |

---

*Last updated: June 2026*
