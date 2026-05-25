# 🏗️ FREIWILLIGER — Complete Day-by-Day Build Plan
### For Vibe Coders | Free AI Tiers Only | 5 Days/Week

---

## 🤖 AI TOOLKIT — Quick Reference

| AI | Free Limit | Best Used For |
|----|-----------|---------------|
| **Claude Sonnet 4.6** (claude.ai) | ~15 msgs/day | Complex backend logic, auth, Socket.io, cron jobs, security, debugging hard bugs |
| **v0.dev** (Vercel) | ~200 credits/month | ALL React UI components — dashboards, forms, cards, modals |
| **Bolt.new** (StackBlitz) | ~1M tokens/month | Full project scaffolding, boilerplate, simple CRUD pages |
| **Manus** | ~10 agent tasks/month | Autonomous multi-file generation, config files, documentation |
| **GitHub Copilot** (free) | 2000 completions/month | In-editor autocomplete while typing code |
| **ChatGPT free** (GPT-4o mini) | Generous daily limit | Simple utility functions, regex, quick fixes, package lookups |
| **Perplexity free** | Unlimited | Research: finding docs, npm packages, error solutions |

### 💡 Golden Rule
> Use **Claude** as your last resort for hard problems — save credits.
> Use **v0.dev** for every single UI component first.
> Use **Bolt.new** for all boilerplate and file generation.
> Use **ChatGPT free** for anything quick and repetitive.

---

## 🧰 MASTER PROMPTS LIBRARY
*(Copy-paste these directly into each AI — fill in `[PLACEHOLDERS]`)*

---

### PROMPT 1 — Claude: Generate a Full Mongoose Model
```
You are building "Freiwilliger", a MERN stack volunteer event platform for India.

Generate a complete Mongoose model file for the `[COLLECTION_NAME]` collection.

Schema requirements:
[PASTE THE SCHEMA FROM THE PROJECT REPORT]

Include:
- All fields with correct types, enums, defaults, required flags
- All indexes mentioned (2dsphere, TTL, compound)
- Pre-save middleware if needed (e.g., password hashing)
- Export as: module.exports = mongoose.model('[ModelName]', schema)
- Use mongoose.Schema with { timestamps: true } where appropriate

File path: server/src/models/[Name].model.js
```

---

### PROMPT 2 — Claude: Generate a Full Express Controller
```
You are building "Freiwilliger", a MERN volunteer platform (Node.js/Express/MongoDB).

Generate a complete Express controller for [FEATURE NAME].

Endpoints needed:
[LIST THE ENDPOINTS FROM THE API SECTION]

Rules:
- Use async/await with try/catch
- Use the apiResponse utility: { success: true/false, data: {}, message: '' }
- Authenticate with req.user (set by verifyToken middleware)
- Use express-validator for input validation (list the validators too)
- Check role with req.user.role where needed
- Use mongoose populate() where needed
- File path: server/src/controllers/[name].controller.js

Also generate the matching router file at: server/src/routes/[name].routes.js
```

---

### PROMPT 3 — v0.dev: Generate a Dashboard UI Component
```
Build a React component for Freiwilliger (volunteer event platform, India-focused).

Component: [COMPONENT NAME]
Description: [WHAT IT DOES]

Tech: React 18, Tailwind CSS, shadcn/ui components, lucide-react icons
Style: Mobile-first, clean and modern, card-based layout
Color scheme: Use indigo/violet as primary, white background, gray-100 for cards

Requirements:
[LIST SPECIFIC UI REQUIREMENTS FROM SECTION 6 OF THE REPORT]

Props the component should accept:
[LIST PROPS]

Include loading skeleton state and empty state.
Export as default. No dummy data hardcoded — accept via props.
```

---

### PROMPT 4 — Bolt.new: Scaffold the Full Project
```
Create a MERN stack monorepo project called "freiwilliger" with this structure:

freiwilliger/
├── client/   (React 18 + Vite + Tailwind CSS v3 + shadcn/ui)
├── server/   (Node.js 20 + Express.js 4 + Mongoose 8)
└── README.md

For CLIENT:
- Vite config with proxy to http://localhost:5000
- Tailwind configured
- React Router v6 setup with placeholder routes: /, /login, /register, /dashboard, /settings
- Redux Toolkit store with an empty authSlice
- Axios instance at client/src/lib/axios.js with baseURL from env + interceptors for token refresh
- Socket.io client setup at client/src/lib/socket.js

For SERVER:
- Express app at server/src/app.js with: helmet, cors, express-rate-limit, morgan, express.json()
- MongoDB connection at server/src/config/db.js using MONGODB_URI env var
- server/server.js that boots HTTP + Socket.io
- server/.env.example with all variables from the environment checklist
- Placeholder router files for: auth, users, events, reviews, messages, network

Install all dependencies. Generate package.json for both client and server.
```

---

### PROMPT 5 — Claude: JWT Auth Middleware + Firebase Integration
```
Build the complete JWT authentication system for "Freiwilliger" (Express.js backend).
Phone OTP is handled entirely by Firebase on the client side — the backend only verifies
the Firebase ID Token that the client sends after successful phone verification.

Requirements:
- Access Token: JWT, 15-min expiry, payload: { _id, role, username }
  Stored: in-memory on client (Redux), sent via Authorization: Bearer header
- Refresh Token: JWT, 7-day expiry
  Stored: httpOnly, Secure, SameSite=Strict cookie named 'refreshToken'
- Token rotation: on refresh, old token invalidated, new one issued
  Store used refresh token hashes in DB (add refreshTokens: [String] to User model)

Firebase Admin SDK setup (server/src/config/firebase.admin.js):
  const admin = require('firebase-admin');
  const serviceAccount = require('../../firebase-admin-key.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  module.exports = admin;

Phone Auth Flow (replace all MSG91/OTP logic with this):
  Client sends Firebase ID Token (received after user verifies OTP in Firebase on the frontend)
  Backend verifies with: admin.auth().verifyIdToken(firebaseIdToken)
  Extract phone: decodedToken.phone_number → normalize to Indian format (strip +91)
  If phone not in DB → this is registration → return { isNewUser: true }
  If phone in DB → issue our own JWT pair → return { accessToken, user }

Generate these files:
1. server/src/utils/jwt.utils.js — signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken
2. server/src/config/firebase.admin.js — Firebase Admin SDK initialisation
3. server/src/middleware/auth.middleware.js — verifyToken middleware that reads Bearer token, attaches req.user
4. server/src/middleware/role.middleware.js — requireVolunteer, requireOrganiser
5. server/src/controllers/auth.controller.js with functions:
   - verifyFirebaseToken(req) — shared helper: calls admin.auth().verifyIdToken, returns phone
   - loginOrRegisterWithPhone — POST /auth/phone: verifies Firebase token, returns JWT or isNewUser flag
   - completeRegistration — POST /auth/register: called after isNewUser, accepts username + password + role, issues JWT
   - login — POST /auth/login: username + password login (alternative to phone)
   - refreshToken, logout
   - forgotPassword — POST /auth/forgot-password: client does Firebase phone verify again,
     sends new Firebase ID token + newPassword to this endpoint. Backend verifies token → resets password.
6. server/src/routes/auth.routes.js

Use bcrypt (cost 12) for passwords.
Do NOT store OTPs in DB — Firebase manages that entirely.
No otpTokens collection needed for phone auth.
Rate limit: 10 requests per IP per 15 minutes on /auth/phone (express-rate-limit).
```

---

### PROMPT 6 — Claude: Socket.io Real-Time Setup
```
Build the complete Socket.io real-time system for "Freiwilliger".

Server-side (server/src/config/socket.js):
- Authenticate socket connections using JWT (read from socket.handshake.auth.token)
- On connect: socket joins personal room user:{userId}
- Events to handle:
  join:conversation → joins conv:{conversationId} room
  send:message → saves to DB, emits new:message to room, updates conversation lastMessage
  typing → emits user:typing to others in conversation
- Use two namespaces: /chat and /notify

Client-side (client/src/lib/socket.js):
- Creates socket with auth token from Redux store
- Exports: connectSocket(token), disconnectSocket(), getSocket()
- Auto-reconnects on token refresh

Client hook (client/src/hooks/useSocket.js):
- useSocket(conversationId) — joins room on mount, leaves on unmount
- Returns: { messages, sendMessage, isTyping, onlineUsers }

Also generate the notification service (server/src/services/notification.service.js):
- emitToUser(userId, eventName, data) — emits to user:{userId}
- List all notification events from the spec and when they fire
```

---

### PROMPT 7 — Claude: Scoring System Cron Job
```
Build the complete scoring system for "Freiwilliger".

File 1: server/src/services/score.service.js
- applyScoreDelta(userId, scoreField, delta, reason)
  Caps score between 0–100. Logs to a scoreHistory array on user.
- Formula: (stars / 5) * 10 = score change (MAX_CHANGE = 10)
- No-show penalty: flat -10

File 2: server/src/jobs/scoreUpdater.job.js
- node-cron schedule: '30 20 * * *' (02:00 IST)
- Logic: Find completed events where scoreProcessed = false AND end time > 24h ago
- For each event: process no-shows (attended === false → -10 to helpScore)
- Process reviews: organiser reviews affect helpScore, volunteer reviews affect hireScore
- Set event.scoreProcessed = true after processing

File 3: server/src/utils/scoreTier.utils.js
- getTierLabel(score, role) → returns emoji + label string
  Tiers: 80-100 (Top/Trusted), 60-79 (Reliable/Good), 40-59 (Building/New),
         20-39 (Needs Improvement/Review Carefully), 0-19 (Low Trust/Caution)
```

---

### PROMPT 8 — v0.dev: Event Card Component
```
Build an EventCard React component for Freiwilliger (Indian volunteer event platform).

Shows a single event posting. Mobile-first design.

Props:
- event: { eventName, description, category, location: {city}, dateTime: {start,end},
  requirements: {genderPreference, requiredSkills, minHelpScore},
  compensation: {paymentType, amount, currency},
  roles: [], organiser: {name, logo, hireScore} }
- onApply: fn, onFavourite: fn, onMessage: fn, onExpand: fn

UI Requirements:
- Organiser logo (avatar) + name + Hire Score badge (coloured by tier)
- Event name (bold), category chip
- Location + date with icons (lucide-react: MapPin, Calendar)
- Role tags (pill badges)
- Compensation: green badge if paid (show ₹ amount), gray if unpaid
- Gender preference icon
- "Apply Now" button (primary), heart icon for favourite, message icon
- Expandable: clicking card shows full detail (inline accordion, not modal)
- Skeleton loading state variant (prop: isLoading)
- Mobile-first, max-width 480px, rounded-2xl card, subtle shadow

Style: Clean, modern, indigo primary colour, white cards on gray-50 background
```

---

### PROMPT 9 — ChatGPT free: Geolocation Utility
```
Write a JavaScript utility file for a React app called 'useGeolocation.js' (custom hook).

It should:
1. Get browser lat/lng using navigator.geolocation.getCurrentPosition
2. Call Nominatim API: GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json
   Add header: User-Agent: Freiwilliger/1.0
3. Extract city, state from response.address
4. Return: { lat, lng, city, state, loading, error }
5. Handle permission denied gracefully
6. Cache result in localStorage for 30 minutes (don't call API again if recent)
7. Works with React 18 (useEffect, useState, useRef)
```

---

### PROMPT 10 — Claude: Profile Visibility Filter Middleware
```
Build the profile visibility system for "Freiwilliger".

File: server/src/middleware/profileFilter.middleware.js

Function: filterProfileForViewer(targetUser, viewerRole, isApplicantView = false)

Rules (from spec):
- Volunteer viewing volunteer: username, name, photo, gender, city*, helpScore*, skills, languages, pastExperience*, reviews
- Volunteer viewing organiser: username, companyName/name, logo, hireScore, city, pastEvents, volunteerCount, reviews
- Organiser viewing volunteer: all volunteer fields + ageRange (not exact age), qualification
  Phone/email NEVER returned — only via contactRequest flow
- Apply visibilityPrefs from targetUser.visibilityPrefs:
  showHelpScore, showWorkHistory, showCity toggle respective fields
- If isApplicantView: also include applicationDate, skillsMatchPercent, isReturningVolunteer

Helper: getAgeRange(age) → "20–25" style string (floor to 5-year bracket)
Helper: calcSkillsMatch(volunteerSkills, requiredSkills) → percentage

Export: { filterProfileForViewer }
```

---

### PROMPT 11 — Manus: Generate All Config & Utility Files
```
Generate the following utility/config files for a MERN project called Freiwilliger:

1. server/src/utils/apiResponse.utils.js
   - successResponse(res, data, message, statusCode=200)
   - errorResponse(res, message, statusCode=400, errors=[])

2. server/src/utils/hash.utils.js
   - hashOtp(otp) — bcrypt hash
   - verifyOtp(otp, hash) — bcrypt compare
   - hashPassword(password) — bcrypt cost 12
   - verifyPassword(password, hash)

3. server/src/services/phone.service.js
   - verifyFirebaseIdToken(idToken) — calls admin.auth().verifyIdToken(idToken),
     returns { phone_number, uid } or throws error
   - normalizeIndianPhone(rawPhone) — strips '+91' prefix, returns 10-digit string
   (No OTP sending here — Firebase client SDK handles that entirely)
   - sendEmailOtp(email, purpose) — uses Nodemailer Gmail SMTP (still needed for email verify)
   - verifyEmailOtp(email, otp, purpose) — finds in DB, checks hash, checks expiry

4. server/src/services/geo.service.js
   - reverseGeocode(lat, lng) — calls Nominatim, returns {city, state, country}
   - Must respect 1 req/second rate limit (add delay if needed)

5. server/src/config/cloudinary.js
   - Configure cloudinary with env vars
   - uploadToCloudinary(filePath, folder) — returns secure_url
   - deleteFromCloudinary(publicId)

6. client/src/lib/axios.js
   - Axios instance with baseURL from VITE_API_BASE_URL
   - Request interceptor: adds Authorization: Bearer {accessToken from Redux store}
   - Response interceptor: on 401, calls /auth/refresh-token, retries original request
   - On refresh fail: dispatch logout action, redirect to /login

All files in ES modules style for client, CommonJS for server.
```

---

### PROMPT 12 — v0.dev: Settings Page Layout
```
Build the Settings page layout for Freiwilliger (React + Tailwind + shadcn/ui).

Route: /settings
Mobile-first design. WhatsApp/Instagram style settings UI.

Sections and items (render as grouped list with section headers):
ACCOUNT: Account Preferences | Sign In & Security | Manage Account
PRIVACY: Visibility | Data Privacy | Blocked Users
NOTIFICATIONS: Notification Preferences
SUPPORT: Help Centre | Report a Problem | Contact Freiwilliger Support
LEGAL: Terms & Conditions | Privacy Policy | Community Guidelines
Bottom: Sign Out (red text)

At the top: user avatar + username + edit profile link.

Each setting item: left icon (lucide-react) + label + right chevron arrow.
Clicking any item navigates to that sub-route (accept onNavigate prop).
Sign Out: shows a confirmation bottom sheet before logging out.

Style: Clean iOS-settings style, white background, grouped gray sections.
```

---

## 📅 DAY-BY-DAY BUILD PLAN

---

## 📦 WEEK 1 — Project Foundation (Days 1–5)

---

### DAY 1 — Scaffolding the Monorepo
**AI: Bolt.new**
**Task:** Full project skeleton

1. Open bolt.new
2. Paste **PROMPT 4** exactly
3. Let Bolt generate the full monorepo
4. Download the project ZIP
5. Extract to your local machine
6. Run `cd client && npm install && cd ../server && npm install`
7. Test: `cd server && npm run dev` → Express server on :5000
   `cd client && npm run dev` → Vite on :5173

**Verify checklist:**
- [ ] `client/src/lib/axios.js` exists with interceptors
- [ ] `client/src/lib/socket.js` exists
- [ ] `server/src/app.js` has helmet, cors, rate-limit, morgan
- [ ] `server/server.js` boots without errors
- [ ] `.env.example` has all variable names

**End of day:** Push to GitHub. Create repo `freiwilliger` (private).

---

### DAY 2 — External Services Setup
**AI: Perplexity (research) + ChatGPT free (config questions)**
**Task:** Set up all free-tier external accounts

Step-by-step:
1. **MongoDB Atlas** — create free M0 cluster at mongodb.com/atlas
   - Create DB user, whitelist IP 0.0.0.0/0 (for dev)
   - Copy connection string → paste in `server/.env` as MONGODB_URI

2. **Cloudinary** — create free account at cloudinary.com
   - Go to Dashboard → copy Cloud Name, API Key, API Secret → paste in `.env`

3. **Firebase** — create project at console.firebase.google.com
   - New Project → name it `freiwilliger` → disable Google Analytics (not needed)
   - **Enable Phone Authentication:**
     Build → Authentication → Sign-in method → Phone → Enable
   - **Get Frontend config (client SDK):**
     Project Settings → General → Your apps → Add app → Web (</>) → register app
     Copy the `firebaseConfig` object → save it (you'll paste it on Day 7)
   - **Get Backend config (Admin SDK):**
     Project Settings → Service Accounts → Generate new private key
     Download the JSON file → save as `server/firebase-admin-key.json`
     ⚠️ Add `firebase-admin-key.json` to `.gitignore` immediately — NEVER push this file
   - In `server/.env` add:
     `FIREBASE_PROJECT_ID=freiwilliger` (copy from the JSON file)
   - In `client/.env` add all 6 values from the `firebaseConfig` object:
     `VITE_FIREBASE_API_KEY=...`
     `VITE_FIREBASE_AUTH_DOMAIN=...`
     `VITE_FIREBASE_PROJECT_ID=...`
     `VITE_FIREBASE_APP_ID=...`

4. **Gmail SMTP** — enable 2FA on Gmail, create App Password
   - Google Account → Security → App Passwords → generate one → paste in `.env`

5. **Render.com** — create free account, note it for later (deploy in Day 3)

6. **Vercel** — connect GitHub account at vercel.com

**Fill your `server/.env` completely today.**

Test MongoDB connection:
```js
// Add temporarily to server.js
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));
```

---

### DAY 3 — Database Models (Part 1)
**AI: Claude Sonnet 4.6**
**Task:** Generate User + Event models

**Claude conversation 1** (saves credits — do both in one message):
Use **PROMPT 1** for the `users` collection.
Paste the full users schema from Section 4 of the report.

**Claude conversation 2:**
Use **PROMPT 1** for the `events` collection.
Paste the events schema from Section 4.

After Claude gives you the files:
1. Create `server/src/models/User.model.js` — paste Claude's output
2. Create `server/src/models/Event.model.js` — paste Claude's output
3. Add the 2dsphere index setup:
```js
userSchema.index({ "location": "2dsphere" });
eventSchema.index({ "location": "2dsphere" });
```
4. Test: import both models in server.js and run — no errors = good.

---

### DAY 4 — Database Models (Part 2)
**AI: ChatGPT free (simpler models)**
**Task:** Remaining 4 models

Prompt to ChatGPT for each model (one at a time):
```
Write a Mongoose model for [collection name] for a MERN project.
Schema: [paste schema from report Section 4]
Use CommonJS (module.exports). Add timestamps where appropriate.
```

Create these files:
- `server/src/models/Conversation.model.js`
- `server/src/models/Message.model.js` (add index: `{ conversationId: 1, sentAt: -1 }`)
- `server/src/models/Review.model.js`
- `server/src/models/OtpToken.model.js` (TTL index: `{ expiresAt: 1 }` with `expireAfterSeconds: 0`)

**OtpToken TTL index (important — do this in your model):**
```js
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

### DAY 5 — Utility Files & Config
**AI: Manus**
**Task:** All utility and service files

Use **PROMPT 11** in Manus as an agent task.
Let Manus generate all 6 files autonomously.

Download/copy the files to their correct paths.

Then manually verify:
- `apiResponse.utils.js` — test that successResponse and errorResponse work
- `hash.utils.js` — quick bcrypt test in Node REPL:
```js
const { hashPassword, verifyPassword } = require('./hash.utils');
const h = await hashPassword('test123');
console.log(await verifyPassword('test123', h)); // true
```

**End of Week 1:** You have → full project structure, all DB models, all utils, external services connected.

---

## 🔐 WEEK 2 — Authentication System (Days 6–10)

---

### DAY 6 — JWT Auth Backend (Core)
**AI: Claude Sonnet 4.6**
**Task:** Complete auth system — most complex day

Use **PROMPT 5** in Claude.
This generates 6 files in one Claude conversation (be efficient — one big prompt).

After receiving output:
1. Install Firebase Admin SDK: `cd server && npm install firebase-admin`
2. Place all 6 files in their correct paths
3. Add `refreshTokens: [String]` and `firebaseUid: String` fields to User model
4. Add `firebase-admin-key.json` to `.gitignore` immediately — **NEVER push this file**
5. Register auth routes in `server/src/app.js`:
```js
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);
```

Test with Postman/Thunder Client (VS Code extension — free):
- Can’t easily fake a Firebase ID Token at this stage, so just verify:
  - Server starts without errors
  - Firebase Admin initialises: check logs for `✅ Firebase Admin initialised`
  - POST `/api/v1/auth/login` with wrong body returns structured error (not a crash)
- Full phone auth end-to-end test happens on Day 8 once the frontend Firebase SDK is wired up

---

### DAY 7 — Auth Frontend (Firebase SDK + Redux + Axios)
**AI: Bolt.new**
**Task:** Firebase client setup + Redux auth slice + Axios interceptors

First, install Firebase in client:
```bash
cd client && npm install firebase
```

Prompt to Bolt.new:
```
For a React app using Redux Toolkit + RTK Query + Firebase, create:

1. client/src/lib/firebase.js
   Initialise Firebase using these env vars:
   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
   VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID
   Export: app, auth (getAuth(app))
   Import from 'firebase/app' and 'firebase/auth'

2. client/src/features/auth/authSlice.js
   State: { user: null, accessToken: null, isAuthenticated: false, loading: false }
   Actions: setCredentials(user, token), logout, setLoading
   Use createSlice from @reduxjs/toolkit

3. client/src/api/authApi.js using RTK Query createApi:
   baseQuery with JWT Bearer token from Redux store
   Endpoints:
   - phoneAuth(firebaseIdToken) → POST /auth/phone
     Sends the Firebase ID token to backend, gets our JWT back
   - completeRegistration(body) → POST /auth/register
   - login(body) → POST /auth/login (username + password)
   - refreshToken() → POST /auth/refresh-token
   - logout() → POST /auth/logout

4. client/src/app/store.js
   Redux store with authSlice + authApi reducer + middleware

5. client/src/lib/axios.js
   Axios instance, request interceptor adds Bearer token,
   response interceptor handles 401 → refresh → retry
```

Place all files. Update `client/src/main.jsx` to wrap app with `<Provider store={store}>`.

---

### DAY 8 — Login & Register UI Pages (with Firebase OTP)
**AI: v0.dev (UI) + Claude (Firebase wiring logic)**
**Task:** Auth page UIs wired to Firebase Phone Auth

**v0.dev prompt for Login page:**
```
Build a Login page for Freiwilliger (Indian volunteer platform).
Mobile-first, max-width 400px centered.
Two login modes toggled by a pill toggle at the top:
  Mode 1 — "Phone OTP": phone number input (+91) + "Send OTP" button
  Mode 2 — "Username": username + password fields + Login button
Buttons: Login (primary indigo), Forgot Password (link), Go to Register (link)
Brand: show "Freiwilliger" wordmark at top with subtitle "Find volunteer work near you"
Use Tailwind + shadcn/ui Input, Button, Label.
Loading spinner on active button.
Accept props: onPhoneSubmit(phone), onOtpSubmit(otp), onUsernameLogin(data),
              step ('phone'|'otp'), isLoading, error
```

**v0.dev prompt for Register page:**
```
Build a multi-step OTP registration page for Freiwilliger.
Step 1: Enter phone number (Indian +91 prefix shown) + "Send OTP" button
  Show reCAPTCHA notice: "Protected by reCAPTCHA" (small gray text — Firebase requirement)
Step 2: 6-digit OTP input (6 individual boxes, auto-focus next on input)
  Resend OTP link (enabled after 30s countdown)
Step 3: Choose username + set password + confirm password
Progress indicator at top (3 steps).
Mobile-first, indigo primary colour.
Accept props: step, onSendOtp(phone), onVerifyOtp(otp), onRegister(data), isLoading, error
```

**Now wire Firebase into LoginPage.jsx — use Claude for this logic:**
```
Wire Firebase Phone Authentication into a React Login/Register page for Freiwilliger.

In client/src/features/auth/LoginPage.jsx and RegisterPage.jsx:

Step 1 — Send OTP:
  import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
  import { auth } from '../../lib/firebase';

  Setup invisible reCAPTCHA (do this ONCE on component mount):
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });

  On "Send OTP" click:
    const formattedPhone = '+91' + phone.trim();
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult; // save for step 2

Step 2 — Verify OTP:
  const result = await window.confirmationResult.confirm(otp);
  const firebaseIdToken = await result.user.getIdToken();

Step 3 — Send token to our backend:
  const response = await dispatch(phoneAuth(firebaseIdToken)).unwrap();
  if (response.isNewUser) → navigate to Step 3 (set username/password)
  if (response.accessToken) → dispatch(setCredentials(response)) → navigate to /dashboard

Step 4 (Register only) — Complete registration:
  dispatch(completeRegistration({ username, password, role, firebaseIdToken })).unwrap()
  → dispatch(setCredentials(response)) → navigate to /dashboard

Forgot Password flow:
  Re-run Steps 1-2 (Firebase phone verify)
  On success, send firebaseIdToken + newPassword to POST /auth/forgot-password
  Backend verifies token, resets password

Add a hidden <div id="recaptcha-container"></div> in the JSX.
Handle Firebase errors: auth/invalid-verification-code, auth/too-many-requests, auth/code-expired
```

Wire these pages to Redux in `client/src/features/auth/LoginPage.jsx` and `RegisterPage.jsx`.

---

### DAY 9 — Forgot Password + Protected Routes
**AI: ChatGPT free**
**Task:** Forgot password flow + route guards

**ChatGPT prompt:**
```
Write a React component ForgotPassword.jsx for a MERN app.
Steps: 1) Enter phone → 2) Enter OTP → 3) Set new password
Use React Hook Form + Zod validation.
Tailwind CSS. Mobile-first.
Calls API endpoints: POST /auth/forgot-password/send-otp, POST /auth/forgot-password/reset
```

**ChatGPT prompt for ProtectedRoute:**
```
Write a ProtectedRoute wrapper component for React Router v6.
Reads isAuthenticated from Redux store.
If not authenticated: redirect to /login, save the original path in state.
Also write: RoleRoute(requiredRole) — checks user.role matches.
```

Add routes to `App.jsx`:
```jsx
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardRouter />} />
  <Route path="/settings/*" element={<SettingsPage />} />
</Route>
```

---

### DAY 10 — Auth Testing & Bug Fixes
**AI: Claude Sonnet 4.6 (for bugs)**
**Task:** End-to-end auth testing

Test every auth flow:
1. Register: send OTP → verify → set username/password → get tokens
2. Login: username + password → get tokens → access token in Redux, refresh in cookie
3. Page reload: silent refresh using cookie → session restored
4. Logout: token invalidated, Redux cleared, redirect to login
5. Forgot password: OTP → reset → login with new password

**When you hit a bug:**
Paste the error + relevant code to Claude: *"I'm building Freiwilliger. Getting this error: [error]. Here's my code: [code]. Fix it."*

**End of Week 2:** Full authentication system working — register, login, logout, forgot password, protected routes.

---

## 👤 WEEK 3 — Profile System (Days 11–15)

---

### DAY 11 — Profile Setup UI (Volunteer — Steps 1–3)
**AI: v0.dev**
**Task:** Volunteer profile multi-step form (first half)

```
Build a multi-step profile setup form for Freiwilliger volunteer users.

Steps 1–3 of 5.
Show step progress bar at top.

Step 1 — Personal Details:
Fields: Full Name, Email (+ verify OTP button), Age (18+ enforced), Gender (select),
Qualification (select: 10th/12th/Diploma/Graduate/PG/Other), Occupation (text),
Address: Street, City, State, Pincode

Step 2 — Skills:
Tag-based multi-select. Preset options: Ushering, Crowd Management, Registration Desk,
Security, Hospitality, Event Setup, MC/Hosting, Photography, First Aid, Catering.
Plus free-text add. Min 1 required.

Step 3 — Languages:
Multi-select checkboxes. Options: Hindi, English, Tamil, Telugu, Kannada, Bengali,
Marathi, Gujarati, Malayalam, Punjabi, Odia. Min 1 required.

Navigation: Previous / Next buttons. Disable Next if required fields empty.
Mobile-first, Tailwind, shadcn/ui components.
Accept: onComplete(formData), onBack
```

---

### DAY 12 — Profile Setup UI (Volunteer — Steps 4–5 + Organiser)
**AI: v0.dev (2 prompts)**
**Task:** Complete profile setup UI

**Prompt 1 — Volunteer Steps 4-5:**
```
Build steps 4-5 of the Freiwilliger volunteer profile setup.

Step 4 — Past Experience:
Accordion list. "Add Experience" button opens a sub-form:
Fields: Organisation name, Role, Duration (e.g., "6 months")
Multiple entries allowed. Show each as a card with delete button.

Step 5 — ID Verification:
Profile photo upload (drag-and-drop + preview, circular crop indicator)
Aadhaar upload (show disclaimer: "Only last 4 digits visible to others")
File size limit notice: 5MB max
Upload button → shows upload progress bar

"Complete Profile" submit button.
```

**Prompt 2 — Organiser Profile:**
```
Build organiser profile setup for Freiwilliger (2 steps).

Step 1: Choose entity type — Company or Individual (two large cards to click)

Step 2A (Company): Company Name*, Company Email*, Company Phone*,
GST Number (optional), Company Logo upload, Website URL (optional)

Step 2B (Individual): Full Name*, Email*, Profile Photo upload

*mandatory fields

Submit → "Start Posting Events"
Mobile-first, Tailwind, shadcn/ui.
```

---

### DAY 13 — Profile Backend Endpoints
**AI: Claude Sonnet 4.6**
**Task:** User profile CRUD API

Use **PROMPT 2** for the `/users` routes.

List these endpoints:
- GET `/users/me` — full profile (private)
- PATCH `/users/me` — update any profile fields
- POST `/users/me/photo` — upload via multer → Cloudinary
- POST `/users/me/id-document` — Aadhaar upload (Cloudinary, never log)
- POST `/users/me/verify-email/send` — send email OTP
- POST `/users/me/verify-email/confirm` — verify email OTP
- PATCH `/users/me/location` — update lat/lng + city
- GET `/users/:username` — public profile (use profileFilter middleware from PROMPT 10)
- GET `/users/search?q=` — search by username/name

Also use **PROMPT 10** for the profile filter middleware (paste it to Claude).

Register in app.js:
```js
app.use('/api/v1/users', require('./routes/user.routes'));
```

---

### DAY 14 — Multer + Cloudinary Upload Middleware
**AI: ChatGPT free**
**Task:** File upload middleware

```
Write Express middleware for handling file uploads in a Node.js project.

File: server/src/middleware/upload.middleware.js

Use multer (memStorage — no disk write) + cloudinary.

Functions:
1. uploadProfilePhoto — accepts image/jpeg, image/png, image/webp only,
   max 5MB, uploads to Cloudinary folder 'freiwilliger/profiles',
   returns secure_url on req.fileUrl

2. uploadIdDocument — accepts image/* and application/pdf,
   max 5MB, uploads to 'freiwilliger/id-docs',
   NEVER console.log the URL, returns secure_url on req.fileUrl

Cloudinary config is in server/src/config/cloudinary.js already.
Include error handling for file type and size violations.
CommonJS style.
```

---

### DAY 15 — Role Selection + Profile Display Pages
**AI: v0.dev + wire-up**
**Task:** Role selection screen + public profile view

**v0.dev prompt:**
```
Build two React pages for Freiwilliger:

Page 1 — Role Selection (shown once after registration):
Two large clickable cards side by side (stacked on mobile):
Card 1: Volunteer icon + "I want to Volunteer" + description
Card 2: Organiser icon + "I want to Hire / Post Events" + description
Both cards in indigo style. Selecting one highlights it, shows Continue button.

Page 2 — Public Profile View:
Shows another user's profile (read-only).
Sections: avatar + name + username + score badge + city
Tabs: About | Reviews | Work History
About tab: skills tags, languages, gender, qualification
Reviews tab: list of star ratings + text reviews
Action buttons at bottom: Message | Add to Network | Favourite
Loading skeleton state when data is loading.
```

**End of Week 3:** Profile setup complete for both roles. Public profile view working.

---

## 🗺️ WEEK 4 — Location + Events Backend (Days 16–20)

---

### DAY 16 — Geolocation Engine
**AI: ChatGPT free (hook) + manual integration**
**Task:** Frontend geolocation + Nominatim

Use **PROMPT 9** for the `useGeolocation` hook in ChatGPT free.

Place at: `client/src/hooks/useGeolocation.js`

Backend geo service: Use **PROMPT 11** (already generated the `geo.service.js`).
If Manus already generated it, review and test it.

Test Nominatim manually:
```
GET https://nominatim.openstreetmap.org/reverse?lat=26.91&lon=75.79&format=json
```
(Jaipur coordinates — should return Jaipur, Rajasthan, India)

Wire geolocation into Redux:
```js
// authSlice.js — add to state:
location: { lat: null, lng: null, city: null, state: null }
// action: setLocation
```

On dashboard mount, call useGeolocation → dispatch setLocation → trigger event feed fetch.

---

### DAY 17 — Event CRUD Backend
**AI: Claude Sonnet 4.6**
**Task:** Full events API

Use **PROMPT 2** for the `/events` routes.

List all endpoints from Section 5 of the report.
Key implementations to specify:
- GET `/events/feed` — uses MongoDB $near query with 50km radius (from Section 6.3)
- POST `/events` — organiser only, creates event, auto-generates groupChatId
- PATCH `/events/:id/applicants/:userId` — select/reject, triggers notification
- POST `/events/:id/mark-attendance` — sets attended: true/false, triggers score job

Include the $near query from the report:
```js
// Paste Section 6.3 backend event feed query into your prompt
```

Register: `app.use('/api/v1/events', require('./routes/event.routes'));`

---

### DAY 18 — Application System Backend
**AI: ChatGPT free**
**Task:** Apply/withdraw/select endpoints

```
Write Express controller functions for volunteer application management in a MERN app.

POST /events/:id/apply
- Check volunteer not already applied
- Push to event.applications array with status: 'pending'
- Emit Socket.io notification to organiser: { type: 'new_applicant', eventId, volunteerId }

DELETE /events/:id/apply
- Set application status to 'withdrew' (don't remove from array)

PATCH /events/:id/applicants/:userId
- Body: { action: 'select' | 'reject' | 'shortlist' }
- Update application.status accordingly
- If selected: add to event.selectedVolunteers
- If selected: emit Socket.io notification to volunteer: { type: 'selected', eventId }
- If rejected: emit Socket.io notification to volunteer: { type: 'rejected', eventId }

GET /events/:id/applicants
- Organiser only (check event.organiserId === req.user._id)
- Populate volunteer profiles with visibility filter applied
- Include skillsMatchPercent: count matching skills vs event.requirements.requiredSkills
```

---

### DAY 19 — Raise Requirement Form (Organiser UI)
**AI: v0.dev**
**Task:** Event creation multi-step form

```
Build a 5-step event creation form for Freiwilliger organisers ("Raise Requirement").

Step 1 — Event Basics:
Event Name*, Description*, Category* (dropdown: Wedding, Corporate, Festival, Sports,
Concert, Conference, Exhibition, Charity, Other), Venue Address*, City*, State*, Pincode*

Step 2 — Date & Time:
Start Date + Time*, End Date + Time*, Duration auto-calculated and shown

Step 3 — Roles & Count:
Total volunteers needed* (number input)
Roles needed (tag input): Usher, Crowd Manager, Registration Desk, Security, etc. (preset + free-text)

Step 4 — Requirements:
Gender preference (Any/Male/Female), Age range (slider: 18–60),
Required skills (multi-select tags), Required languages (multi-select),
Dress code (text), Min Help Score required (0–100 slider, default 0),
Other requirements (textarea)

Step 5 — Compensation:
Payment type (radio): Paid / Unpaid / Refreshments only / Paid + Refreshments
If Paid: amount in ₹ (number), flat or per-hour toggle
If Refreshments: description of refreshments

Preview card at bottom showing event summary.
Submit button: "Publish Requirement"

Mobile-first, all steps show form progress bar, Tailwind + shadcn/ui.
```

---

### DAY 20 — Event Feed UI + Filter Drawer
**AI: v0.dev (2 prompts)**
**Task:** Volunteer dashboard main feed

**Prompt 1 — Event Feed:**
```
Build the main event feed for Freiwilliger volunteer dashboard.

Header: circular avatar (links to profile) | "Freiwilliger" wordmark | settings icon
Search bar below header (search events by name/category)
City indicator: "Showing events near Jaipur ↓" (tappable to change city)

Feed: vertical scroll list of EventCard components (already built).
Empty state: illustration + "No events in your area yet" + "Check back soon"
Pull-to-refresh indicator at top.

Bottom navigation bar (fixed):
🏠 Home | 💬 Messages | 🔗 Network | 📋 My Events

Accept props: events[], city, isLoading, onSearch, onFilterOpen
```

**Prompt 2 — Filter Drawer:**
```
Build a bottom-sheet filter drawer for Freiwilliger event feed.

Filters:
- Payment: toggle buttons [Any] [Paid] [Unpaid] [Refreshments]
- Distance: slider 1–50 km
- Date range: date range picker (from/to)
- Gender preference: [Any] [Male] [Female]
- Min pay amount: ₹ number input (shows only if Paid selected)
- Skills match: toggle "Only show events matching my skills"

Clear All button (top left) | Apply Filters button (full width, bottom)
Smooth slide-up animation. Overlay background.
Accept: filters, onChange, onApply, onClose, isOpen
```

**End of Week 4:** Event feed live with real data, location-based filtering working.

---

## 📋 WEEK 5 — Event Detail + Organiser Dashboard (Days 21–25)

---

### DAY 21 — Event Detail View
**AI: v0.dev**

```
Build the Event Detail expanded view for Freiwilliger (full-screen page or large drawer).

Sections:
1. Header: organiser logo + name + Hire Score badge + city + "View Profile" link
2. Event title + category chip + status badge (Open/Ongoing/Completed)
3. Location: map pin icon + full address + city
4. Date & Time: calendar icon + start–end datetime
5. Compensation: big badge — ₹[amount] paid / Unpaid / Refreshments
6. Roles: list of role pills
7. Requirements section:
   - Gender preference
   - Age range
   - Required skills (matching ones highlighted green if user has them)
   - Required languages
   - Min Help Score (show user's score vs required)
   - Dress code
8. Organiser's hiring history: "Hired [N] volunteers in [M] events"
9. Reviews of organiser: star average + 3 recent review cards

Action bar (fixed bottom):
[❤️ Save] [💬 Message] [Apply Now →]

If already applied: show "Applied ✓" status + Withdraw option
If selected: show "Selected 🎉" badge
```

---

### DAY 22 — Organiser Dashboard UI
**AI: v0.dev**

```
Build the Organiser Dashboard for Freiwilliger.

Header: organiser logo/avatar | company name | settings icon
Sub-header: Hire Score badge + "Your Events" title

Main section: List of posted events, each showing:
- Event name + category
- Date + city
- Status badge: Open (green) / Ongoing (blue) / Completed (gray) / Cancelled (red)
- Applications count: "12 applied, 3 selected"
- Quick action: "Manage →"

Empty state: illustration + "No events posted yet" + "Raise a Requirement +" button

FAB button (floating action button): ➕ bottom-right corner → opens Raise Requirement form

Bottom navigation:
🏠 Home | 💬 Messages | ➕ Post | 📋 Events
```

---

### DAY 23 — Applicant Management UI
**AI: v0.dev**

```
Build the Applicant Management page for Freiwilliger organisers.

Header: back arrow + event name + "Applicants" subtitle

Tabs: All (N) | Shortlisted (N) | Selected (N) | Rejected (N)

Each applicant card shows:
- Profile photo (circle avatar) + Full name + username
- Help Score badge (coloured by tier)
- City + age range
- Skills match: "7/10 skills matched" with colored bar
- "Returning Volunteer" badge if worked with organiser before
- Applied date

Action buttons on each card:
[Shortlist] [Select ✓] [Reject ✗]
If Selected: shows green "Selected" badge, button changes to [Remove]

Bulk select: "Select All Shortlisted" button
Counter: "3 of 10 volunteers selected"

Tapping a card expands it to show full skills, languages, past work, reviews.
Confirm selection: bottom sheet "Confirm selection of 3 volunteers? This will notify them."
```

---

### DAY 24 — My Events (Volunteer View)
**AI: v0.dev**

```
Build the My Events page for Freiwilliger volunteers.

Tabs: Upcoming | Ongoing | Completed

Upcoming tab: events the volunteer is selected for, not yet started
Each card: event name, organiser, date, city, status: "Selected ✓"
Action: "View Group Chat" button

Ongoing tab: events currently happening
Each card: same info + attendance status chip

Completed tab: past events
Each card: event info + "Rate this event" prompt if not reviewed yet
Stars rating widget + text review form (inline, collapsible)
Show review if already submitted.

Empty state per tab with appropriate message.
Mobile-first.
```

---

### DAY 25 — Wire Frontend to Backend (Events)
**AI: ChatGPT free (for RTK Query slices)**
**Task:** Connect all event-related API calls

```
Write RTK Query API slices for a React/Redux app connecting to these endpoints:
Base URL from VITE_API_BASE_URL env variable.
All requests need Authorization: Bearer token header.

eventsApi.js endpoints:
- getFeed(filters) → GET /events/feed with query params
- getEvent(id) → GET /events/:id
- createEvent(body) → POST /events
- applyToEvent(eventId) → POST /events/:eventId/apply
- withdrawApplication(eventId) → DELETE /events/:eventId/apply
- getApplicants(eventId) → GET /events/:eventId/applicants
- respondToApplicant({eventId, userId, action}) → PATCH /events/:eventId/applicants/:userId
- getMyEventsVolunteer() → GET /events/my/volunteer
- getMyEventsOrganiser() → GET /events/my/organiser
- markAttendance({eventId, volunteerId, attended}) → POST /events/:eventId/mark-attendance

Include optimistic updates for apply/withdraw.
Invalidate tags on mutations.
```

**End of Week 5:** Full event cycle working — create, discover, apply, select, manage.

---

## 💬 WEEK 6 — Real-Time Messaging (Days 26–30)

---

### DAY 26 — Socket.io Backend Setup
**AI: Claude Sonnet 4.6**
**Task:** Full real-time system (hardest infrastructure day)

Use **PROMPT 6** in Claude.

This generates:
- `server/src/config/socket.js`
- `client/src/lib/socket.js`
- `client/src/hooks/useSocket.js`
- `server/src/services/notification.service.js`

After placing files, update `server/server.js`:
```js
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const setupSocket = require('./src/config/socket');

const httpServer = http.createServer(app);
const io = setupSocket(httpServer);
app.set('io', io); // makes io accessible in controllers

httpServer.listen(process.env.PORT || 5000);
```

In controllers, emit notifications:
```js
const io = req.app.get('io');
io.to(`user:${volunteerId}`).emit('notification', { type: 'selected', eventId });
```

---

### DAY 27 — Messaging Backend
**AI: ChatGPT free**
**Task:** Conversation + message endpoints

```
Write Express controller for messaging in a MERN app.

Endpoints:
GET /conversations — list all conversations for req.user, sorted by lastMessage.sentAt desc
  Populate: participants (username, profilePhoto), lastMessage

POST /conversations — start new DM conversation
  Body: { participantId }
  Check if conversation already exists (find where participants includes both IDs)
  If exists: return existing. If not: create new.

GET /conversations/:id/messages — paginated messages
  Query: ?page=1&limit=30
  Returns messages sorted by sentAt desc (latest first)
  Populate: senderId (username, profilePhoto)

POST /conversations/:id/messages — REST fallback (Socket.io is primary)
  Body: { text }
  Creates message, updates conversation lastMessage

Also: create event group chat auto-creation function:
  createGroupChat(eventId, organiserId, volunteerIds[])
  Creates conversation type:'group' with all participants + eventId
  Call this when organiser confirms final volunteer selection
```

---

### DAY 28 — Chat UI
**AI: v0.dev**
**Task:** Messages section UI

```
Build the Messages section for Freiwilliger.

Left panel (or full screen on mobile): Conversation List
- Tabs: Volunteers | Organisers (filters by the other party's role)
- Search bar within conversations
- Each row: avatar | name | last message preview (truncated) | timestamp | unread badge
- Active conversation highlighted

Right panel (slides in on mobile): Chat Window
- Header: avatar + name + online indicator (green dot) + back button
- Messages: right-aligned (own) in indigo bubbles, left-aligned (other) in gray bubbles
- Show sender avatar on left messages
- Timestamps below message groups
- Auto-scroll to bottom on new message
- "typing..." indicator (animated dots)
- Input bar: text input + send button (paper plane icon)
- Shows read receipts (single/double check marks)

Group Chat: shows "📢 Group · [Event Name]" in header, all messages with sender names

Mobile: List → Chat is a full navigation (no split view)
```

---

### DAY 29 — Connect Chat to Socket.io (Frontend)
**AI: Claude Sonnet 4.6 (for integration bugs)**
**Task:** Wire chat UI to real-time backend

Integrate `useSocket` hook into ChatWindow component:
```jsx
const { messages, sendMessage, isTyping } = useSocket(conversationId);
```

Wire up:
1. On conversation select → emit `join:conversation`
2. On send → emit `send:message`
3. On input → emit `typing` (debounced 1s)
4. Listen for `new:message` → add to messages list
5. Listen for `user:typing` → show typing indicator

Notification bell in dashboard header:
- Listen on personal room `user:{userId}` for notifications
- Badge counter (red dot with count)
- Dropdown list of recent notifications (type-based icons)
- Mark as read on click

---

### DAY 30 — Messaging Testing + Unread Count
**AI: ChatGPT free**
**Task:** Unread count + polish

```
Write a React hook useUnreadCount() for a chat application.

Listens to Socket.io event 'new:message' on the /notify namespace.
Maintains a Map of conversationId → unreadCount in local state.
When user opens a conversation: emit 'mark:read' and reset that count to 0.
Returns: { totalUnread, unreadByConversation }

Also write the backend handler for marking messages as read:
- Socket event 'mark:read' with conversationId
- Updates Message.readBy to include userId for all unread messages in that conversation
```

**End of Week 6:** Real-time messaging fully working — DMs, group chats, typing indicators, unread counts.

---

## ⭐ WEEK 7 — Reviews + Scoring System (Days 31–35)

---

### DAY 31 — Reviews Backend
**AI: ChatGPT free**
**Task:** Review CRUD endpoints

```
Write Express controller for reviews in a MERN/Node app.

POST /reviews
- Body: { eventId, revieweeId, stars (0-5), text, noShow (bool) }
- Validate: reviewer must have attended event or be organiser of event
- One review per pair per event (unique index check)
- Review window: 7 days after event.dateTime.end
- reviewerRole determined by req.user.role

GET /reviews/user/:userId
- Returns all reviews where revieweeId = userId
- Populate: reviewerId (username, profilePhoto, role)
- Include average stars calculated

GET /reviews/event/:eventId
- All reviews for an event
```

Also write a cron job that disables review forms:
```
// runs every hour
Find events where status='completed' AND dateTime.end < 7 days ago AND reviewsEnabled=true
Set reviewsEnabled = false for those events
```

---

### DAY 32 — Scoring System
**AI: Claude Sonnet 4.6**
**Task:** Complete scoring + cron job

Use **PROMPT 7** in Claude.

After placing files, add `scoreProcessed: { type: Boolean, default: false }` to Event model.

Register cron job in server.js:
```js
require('./src/jobs/scoreUpdater.job');
```

Add score history to User model:
```js
scoreHistory: [{
  field: String,        // 'helpScore' or 'hireScore'
  delta: Number,
  reason: String,       // 'review' or 'no-show'
  eventId: ObjectId,
  timestamp: Date,
}]
```

---

### DAY 33 — Score & Review UI
**AI: v0.dev**
**Task:** Score badges + review components

```
Build score-related React components for Freiwilliger.

Component 1 — ScoreBadge({ score, role })
  Circular badge showing score number.
  Color by tier: 80+ = emerald, 60-79 = blue, 40-59 = amber, 20-39 = orange, 0-19 = red
  Tooltip on hover: shows tier label (Top Volunteer / Reliable / etc.)
  Size variants: sm (24px) | md (36px) | lg (48px)

Component 2 — ReviewCard({ review })
  Reviewer avatar + name + role chip
  Star display (filled/empty stars, 0-5)
  Review text
  Date (relative: "2 days ago")
  No-show badge if review.noShow = true

Component 3 — ReviewForm({ eventId, revieweeId, revieweeRole, onSubmit })
  Star picker (tap stars to set rating)
  Text area for review comment
  No-show toggle (if reviewer is organiser)
  Submit button
  Shows "Review submitted ✓" state after submission
```

---

### DAY 34 — Contact Request System
**AI: Claude Sonnet 4.6**
**Task:** Contact request flow (Section 19)

Generate the full contactRequests feature:
```
Build the Contact Request system for Freiwilliger (Section 19 of project spec).

Generate:
1. server/src/models/ContactRequest.model.js
   [paste Section 19.3 schema]

2. server/src/controllers/contactRequest.controller.js
   - POST /contact-requests: organiser submits request, validates:
     * organiser.hireScore > 30
     * volunteer is in event.selectedVolunteers
     * reason + details provided
     Email notification to admin inbox (Nodemailer)
   - GET /contact-requests/mine: organiser sees their requests
   - PATCH /contact-requests/:id/volunteer-response: volunteer approves/denies
     On approve: send in-app notification to organiser
     Log in contactRequests permanently
   - GET /contact-requests/:id/reveal: returns phone/email IF status=approved_by_volunteer
     One-time view (don't make it downloadable — just display)

3. server/src/routes/contactRequest.routes.js

4. ContactRequestFlow.jsx: the volunteer notification + approve/deny UI
   Shows: organiser name + reason + [APPROVE] [DENY] buttons
   After response: shows outcome message
```

---

### DAY 35 — Review & Score Integration Testing
**AI: ChatGPT free**
**Task:** Fix edge cases + test scoring

Test scenarios:
1. Volunteer attends event → organiser marks attended → review window opens
2. Organiser submits 5-star review → cron job runs → volunteer helpScore += 10
3. Volunteer no-show → cron job → helpScore -= 10
4. Volunteer reviews organiser → hireScore updates
5. Review window closes after 7 days
6. Score stays between 0–100

Write score history endpoint:
```
GET /users/me/score-history
Returns last 20 score changes with: delta, reason, eventId, eventName, timestamp
Used to show "Why did my score change?" in Settings
```

**End of Week 7:** Reviews and scoring fully working.

---

## 🔗 WEEK 8 — Network + Settings (Days 36–40)

---

### DAY 36 — Network System
**AI: ChatGPT free**
**Task:** Network endpoints + UI

**Backend:**
```
Write Express controller for the Network feature:

POST /network/:userId — add user to network (push to req.user.network array)
DELETE /network/:userId — remove from network
GET /network — get my network list with populated user cards
POST /network/favourites/:userId — add to favourites
DELETE /network/favourites/:userId — remove from favourites
GET /network/favourites — get favourites list

Block system:
POST /users/:userId/block — add to blockedUsers, remove from network/favourites
DELETE /users/:userId/block — unblock

When loading event feed or user search: filter out blocked users from results.
When sending messages: check if either user has blocked the other.
```

**v0.dev prompt for Network page:**
```
Build the Network page for Freiwilliger.

Tabs: My Network | Favourites

Each person card: avatar + name + role badge + city + score badge
Action buttons: Message | ⭐ Favourite | Remove

Search bar to filter within network.
Empty state for each tab.
People are added via profile page → "Add to Network" button.
```

---

### DAY 37 — Settings Module (Core)
**AI: v0.dev (layout) + Claude (backend)**

Use **PROMPT 12** in v0.dev for the Settings page layout.

Then in Claude, generate settings endpoints:
```
Generate Express routes and controller for the Settings module.
Endpoints from this list: [paste Section 16.14 API endpoints table]
Focus on these first:
- PATCH /settings/profile
- PATCH /settings/security/password (revoke all other refresh tokens on success)
- PATCH /settings/visibility (updates visibilityPrefs in user document)
- PATCH /settings/notifications (updates notificationPrefs)
- DELETE /settings/account (soft delete: set accountStatus: 'pending_deletion', deletionRequestedAt: now)
```

Add new settings fields to User model (from Section 16.13):
```js
notificationPrefs: { ... }
visibilityPrefs: { ... }
blockedUsers: [ObjectId]
accountStatus: String
deletionRequestedAt: Date
```

---

### DAY 38 — Settings Sub-Pages
**AI: v0.dev**

**Generate 3 settings sub-pages:**

Prompt 1 — Notification Preferences:
```
Build Notification Preferences settings page for Freiwilliger.
Show the notification table from the spec as a list of toggles.
Each row: notification type label | In-App toggle | Email toggle
Some toggles locked as "Always ON" (show lock icon).
Save button that PATCHes /settings/notifications.
```

Prompt 2 — Visibility Settings:
```
Build Visibility Settings page for Freiwilliger.
Each setting as a labeled row with dropdown or toggle:
- Who can see profile: Everyone / Organisers only / Nobody
- Who can message me: Everyone / People I worked with / Nobody
- Who can add me to network: Everyone / Nobody
- Show Help Score: Yes/No toggle
- Show work history: Yes/No toggle
- Show city on profile: Yes/No toggle
Disclaimer text at bottom.
```

Prompt 3 — Data Privacy page:
```
Build the Data Privacy settings page for Freiwilliger.
Display the "WE PROMISE" commitments as a styled card (Section 18.1 of spec).
Display the "WHO SEES WHAT" table visually (Section 18.2).
Two action buttons:
  "Download My Data" → triggers GET /settings/data/export → shows "Email sent ✓"
  "Delete My Account" → opens confirmation bottom sheet with password re-entry
```

---

### DAY 39 — Help Centre + Support
**AI: Bolt.new + ChatGPT free**
**Task:** FAQ + Report + Contact

**Bolt.new prompt:**
```
Create a FAQ page for a React app with searchable accordion items.
Data stored as static JSON in client/src/data/faqs.json
Categories: Getting Started, For Volunteers, For Organisers, Payments, Scores & Reviews, Privacy, Technical
Each category has 3-5 questions with answers.
Search bar filters questions by keyword (real-time).
Uses shadcn/ui Accordion component.
```

**ChatGPT for Report a Problem:**
```
Write a React form component for "Report a Problem" in a support system.
Fields: Category (dropdown), Subject (text), Description (textarea min 20 chars),
Screenshot (optional file upload).
Uses React Hook Form + Zod validation.
On submit: POST /support/report
Show success: "Report submitted. Ticket #[id]"
```

---

### DAY 40 — Polish + Global Search
**AI: v0.dev (search) + ChatGPT (backend)**

**Search backend (ChatGPT):**
```
Write a MongoDB text search endpoint for a MERN app.
GET /users/search?q=[query]&role=[volunteer|organiser|all]
Search fields: username (text index), volunteerProfile.name, organiserProfile.companyName
Return: array of user cards (apply profileFilter, public fields only)
Limit to 20 results. Add text index to User model.
```

**Search UI (v0.dev):**
```
Build a global search overlay for Freiwilliger.
Triggered by search bar on dashboard.
Shows: recent searches (stored in localStorage), then live results as user types (debounced 300ms).
Each result card: avatar + name + role badge (Volunteer/Organiser) + city + score
Clicking result navigates to that user's public profile.
"No results found" state.
```

**End of Week 8:** Network, Settings, Search all working.

---

## 🚀 WEEK 9 — PWA + CI/CD + Testing (Days 41–45)

---

### DAY 41 — Deployment (Backend — Render.com)
**AI: Perplexity (for Render docs) + manual**

1. Push all code to GitHub (main branch)
2. Go to render.com → New Web Service → Connect GitHub repo
3. Settings:
   - Build command: `cd server && npm install`
   - Start command: `cd server && node server.js`
   - Environment: Node 20
4. Add all Environment Variables from `server/.env` in Render dashboard
5. Deploy and check logs for:
   - `✅ MongoDB connected`
   - `Server running on port 5000`
6. Copy your Render URL: `https://freiwilliger-api.onrender.com`
7. Update CORS in `server/src/app.js`:
   ```js
   cors({ origin: process.env.CLIENT_URL, credentials: true })
   ```

---

### DAY 42 — Deployment (Frontend — Vercel)
**AI: Perplexity if needed**

1. Go to vercel.com → New Project → Import GitHub repo
2. Settings:
   - Framework: Vite
   - Root directory: `client`
   - Build command: `npm run build`
   - Output: `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL=https://freiwilliger-api.onrender.com/api/v1`
   - `VITE_SOCKET_URL=https://freiwilliger-api.onrender.com`
4. Deploy → get your Vercel URL
5. Go back to Render → update `CLIENT_URL` env var to your Vercel URL
6. Trigger redeploy on Render

Test: Open Vercel URL → register a user → full flow works.

---

### DAY 43 — GitHub Actions CI/CD
**AI: ChatGPT free**

```
Write GitHub Actions workflow files for a MERN monorepo.

.github/workflows/deploy-backend.yml
- Trigger: push to main, changes in server/**
- Steps: checkout, setup Node 20, cd server && npm install, npm test (if tests exist)
- On success: trigger Render deploy hook (use Render deploy hook URL as secret)

.github/workflows/deploy-frontend.yml
- Trigger: push to main, changes in client/**
- Steps: checkout, setup Node 20, cd client && npm install && npm run build
- Vercel deploys automatically on push (no extra step needed if connected to GitHub)

.github/workflows/lint.yml
- Trigger: pull_request to main
- Runs ESLint on both client and server
```

Store Render deploy hook as GitHub secret: `RENDER_DEPLOY_HOOK`

---

### DAY 44 — PWA Setup
**AI: ChatGPT free**

```
Add PWA support to a React Vite app.

1. Install: npm install vite-plugin-pwa
2. Update vite.config.js to include VitePWA plugin with:
   - App name: Freiwilliger
   - Short name: Freiwilliger
   - Description: Find volunteer work near you
   - Theme color: #4F46E5 (indigo-600)
   - Icons: 192x192 and 512x512 (generate placeholder icons)
   - Pages to cache: /, /login, /dashboard
   - Strategy: networkFirst for API calls, cacheFirst for static assets
3. Add manifest.json entries for:
   - display: standalone
   - start_url: /
   - orientation: portrait

Also add an "Add to Home Screen" prompt component that shows after 3 visits.
```

---

### DAY 45 — Bug Hunt + Performance
**AI: Claude Sonnet 4.6 (for complex bugs)**

Run through every feature and log bugs. For each bug:
- Simple bugs: fix yourself / ChatGPT
- Complex logic bugs: Claude

Performance checklist:
- [ ] MongoDB indexes verified (2dsphere, text, compound)
- [ ] Pagination on: messages (30/page), events feed (20/page), reviews (10/page)
- [ ] Images optimized via Cloudinary transformation: `f_auto,q_auto,w_400`
- [ ] RTK Query cache configured (events feed: 60s, profile: 5min)
- [ ] API response times < 500ms on Render

Run Lighthouse audit on Vercel URL. Target score ≥ 85.

**End of Week 9:** App deployed and live on the internet!

---

## 🎨 WEEK 10 — Profile Polish + Contact Request UI (Days 46–50)

---

### DAY 46 — Organiser Event Management Page
**AI: v0.dev**

```
Build the Event Management page for Freiwilliger organisers (detailed view of one event).

Header: event name + status badge + edit button
Event summary card: date, city, compensation, total/selected/attended counts

Sub-tabs:
Tab 1 — Volunteers:
  List of selected volunteers with mini-cards
  Each card: avatar + name + Help Score + attendance status chip (Pending/Attended/No-show)
  Per volunteer: [Mark Attended] [Mark No-show] [Message] buttons
  After event ends: [Write Review] button (opens ReviewForm inline)

Tab 2 — Event Group:
  Opens the group chat for this event (renders ChatWindow component)

Tab 3 — Event Details:
  Full event info in read-only format
  Edit event button (opens Raise Requirement form pre-filled)
  Cancel Event button (with confirmation)
```

---

### DAY 47 — Contact Request UI (Organiser Side)
**AI: v0.dev**

```
Build the Contact Info Request form for Freiwilliger organisers.

Shown as a button on each selected volunteer's mini-card: "Request Contact Info"
Opens a bottom sheet/modal.

Form:
- Pre-filled: volunteer name
- Reason category (dropdown): Emergency | Event coordination | Technical issue | Other
- Details (textarea, min 50 chars): "Explain why in-app messaging is not sufficient"
- Info requested (checkboxes): ☑ Phone Number ☑ Email Address

Submit button: "Submit Request to Freiwilliger"
After submit: "Request submitted. Freiwilliger will review within 24 hours."

Also: Request status list on organiser profile:
  Shows pending/approved/denied requests with volunteer names and status chips.
```

---

### DAY 48 — Contact Request UI (Volunteer Side)
**AI: v0.dev + wire to backend**

```
Build the Contact Request notification and response UI for Freiwilliger volunteers.

Notification in notification bell:
"[Organiser Name] has requested your contact information. Tap to review."

Full-screen review page:
- Organiser's name + Hire Score + event name
- Reason category + reason text (what organiser wrote)
- "Freiwilliger has reviewed and approved this request to reach you."
- What they're requesting: Phone / Email / Both

Two large buttons:
  [APPROVE — Share my contact] → green
  [DENY — Keep private] → outlined/secondary

After APPROVE: "Contact shared. [Organiser] can now view your info."
After DENY: "Request declined. Your info remains private."

Privacy reminder text below: "Your info is only shared once and is not stored on the organiser's account."
```

---

### DAY 49 — Score History + Profile Completeness
**AI: v0.dev**

```
Build two React components for Freiwilliger user profiles:

Component 1 — ScoreHistoryTimeline
Shows last 10 score changes as a vertical timeline.
Each item: date | delta (green +8 / red -10) | reason ("5-star review from EventCo" / "No-show penalty")
Mini avatar of reviewer if from a review.
Link to the event.

Component 2 — ProfileCompleteness
Horizontal progress bar showing profile completion percentage.
Checklist of missing items:
  ✅ Phone verified | ✅ Photo uploaded | ❌ Email not verified | ❌ Skills missing
Clicking a missing item navigates to the relevant settings section.
Show this on own profile view only (not public profiles).
Target: 100% to get "Verified Profile" badge on public profile.
```

---

### DAY 50 — End-to-End Smoke Test
**AI: Claude (for any final complex issues)**

Full user journey test:

**Journey 1 — Volunteer:**
Register → complete profile → browse events → apply → get selected → join group chat → attend event → get reviewed → see score update

**Journey 2 — Organiser:**
Register → complete organiser profile → create event → receive applications → select volunteers → group chat auto-created → mark attendance → review volunteers → contact request flow

**Journey 3 — Both sides:**
Organiser requests contact info → Freiwilliger reviews → Volunteer approves → Organiser views phone

Fix any bugs found.

**End of Week 10:** Feature-complete application! 🎉

---

## 🔧 ONGOING — Maintenance Days (Week 11+)

These are tasks to tackle as needed, not time-bound:

| Task | AI to Use |
|------|-----------|
| Add Terms & Conditions page content | ChatGPT (generate legal-style text) |
| Add Privacy Policy page content | ChatGPT |
| FAQ content (all 7 categories) | ChatGPT |
| Hindi language support (Phase 2) | Manus (bulk translation) |
| FCM push notifications | Claude (complex integration) |
| Admin dashboard (moderation) | Bolt.new + v0.dev |
| Aadhaar e-KYC via DigiLocker API | Claude |
| State-level event discovery | Claude (MongoDB geoWithin) |
| Error monitoring (Sentry free tier) | ChatGPT |
| Analytics (Mixpanel free tier) | ChatGPT |

---

## 🔌 CONNECTING ALL ENDPOINTS — Integration Map

```
Frontend (Vercel)         ←→        Backend (Render)
React + Redux                        Express.js

Auth flow:
Phone OTP (Firebase — client side):
  RecaptchaVerifier → signInWithPhoneNumber(+91XXXXXX) → user enters OTP
  → confirmationResult.confirm(otp) → result.user.getIdToken() → firebaseIdToken

Phone Auth (backend):
  POST /api/v1/auth/phone { firebaseIdToken }
  → admin.auth().verifyIdToken() → extracts phone number
  → finds/creates user in MongoDB → issues our own JWT pair
  → returns { accessToken } + sets httpOnly refreshToken cookie

Session management:
  Redux stores accessToken in memory
  Axios interceptor adds: Authorization: Bearer {accessToken}
  On 401 → POST /api/v1/auth/refresh-token → new accessToken → retry

Real-time:
socket.connect({ auth: { token: accessToken } })
  → authenticated via io.use() middleware
  → joins personal room user:{userId}

Event flow:
useGeolocation → PATCH /users/me/location
→ triggers RTK Query refetch of /events/feed
→ returns nearby events sorted by distance

Application flow:
POST /events/:id/apply
→ backend emits to organiser's socket room
→ organiser sees real-time notification badge
→ PATCH /events/:id/applicants/:userId (select)
→ backend emits to volunteer's socket room
→ volunteer sees "Selected!" notification

Messaging flow:
POST /conversations (if new) → get conversationId
socket.emit('join:conversation', conversationId)
socket.emit('send:message', { conversationId, text })
→ saved to MongoDB
→ emitted back to all room members
→ ChatWindow renders new message

Score flow:
node-cron fires at 02:00 IST daily
→ finds completed events
→ calculates deltas from reviews
→ updates user.volunteerProfile.helpScore or organiserProfile.hireScore
→ emits score:updated to affected user's socket room
→ ScoreBadge component re-renders via RTK Query invalidation

File upload flow:
File selected in UI → FormData created
→ POST /users/me/photo (Authorization header)
→ multer reads file to memory buffer
→ cloudinary.uploader.upload_stream()
→ returns secure_url
→ PATCH user.volunteerProfile.profilePhoto = secure_url
→ Redux store updated
```

---

## ⚡ CREDIT-SAVING TIPS

### Claude (most precious credits)
- Always write one BIG prompt instead of multiple small ones
- Include ALL context in the first message (don't rely on conversation history)
- Ask for complete files, not snippets
- Ask for multiple related files in one prompt
- Paste errors as code blocks with full stack traces — saves back-and-forth
- Use Claude ONLY for: auth, Socket.io, complex middleware, cron jobs, security logic, hard bugs

### v0.dev (use generously for UI)
- Be very specific about props — saves regeneration credits
- Ask for loading states + empty states in the same prompt
- Mention shadcn/ui + Tailwind explicitly every time
- One component per prompt (don't bundle multiple unrelated components)

### Bolt.new (use for scaffolding only)
- Best for: initial setup, boilerplate, file structure generation
- Not for: complex business logic (it gets it wrong)

### Manus (save for bulk generation)
- Best for: generating 5+ related utility files at once
- Run as an agent task, not a chat

### ChatGPT free (use freely)
- Simple utility functions, hooks, regex, npm package questions, config files
- Quick bug fixes on small isolated functions
- Generating static content (FAQ, legal text)

---

## 📁 MASTER FILE CHECKLIST

Track your progress:

**Server files to create:**
- [ ] models/User.model.js
- [ ] models/Event.model.js
- [ ] models/Conversation.model.js
- [ ] models/Message.model.js
- [ ] models/Review.model.js
- [ ] models/OtpToken.model.js
- [ ] models/ContactRequest.model.js
- [ ] controllers/auth.controller.js
- [ ] controllers/user.controller.js
- [ ] controllers/event.controller.js
- [ ] controllers/review.controller.js
- [ ] controllers/message.controller.js
- [ ] controllers/network.controller.js
- [ ] controllers/contactRequest.controller.js
- [ ] controllers/settings.controller.js
- [ ] middleware/auth.middleware.js
- [ ] middleware/role.middleware.js
- [ ] middleware/upload.middleware.js
- [ ] middleware/profileFilter.middleware.js
- [ ] services/phone.service.js
- [ ] config/firebase.admin.js
- [ ] services/geo.service.js
- [ ] services/notification.service.js
- [ ] services/score.service.js
- [ ] jobs/scoreUpdater.job.js
- [ ] config/socket.js
- [ ] config/cloudinary.js
- [ ] utils/jwt.utils.js
- [ ] utils/hash.utils.js
- [ ] utils/apiResponse.utils.js
- [ ] utils/scoreTier.utils.js

**Client files to create:**
- [ ] features/auth/LoginPage.jsx
- [ ] features/auth/RegisterPage.jsx
- [ ] features/auth/ForgotPassword.jsx
- [ ] features/auth/authSlice.js
- [ ] features/volunteer/VolunteerDashboard.jsx
- [ ] features/volunteer/EventDetail.jsx
- [ ] features/volunteer/EventsPage.jsx
- [ ] features/organiser/OrganiserDashboard.jsx
- [ ] features/organiser/RaiseRequirement.jsx
- [ ] features/organiser/ApplicantList.jsx
- [ ] features/organiser/EventManagement.jsx
- [ ] features/messages/ConversationList.jsx
- [ ] features/messages/ChatWindow.jsx
- [ ] features/messages/GroupChat.jsx
- [ ] features/network/NetworkPage.jsx
- [ ] features/settings/SettingsPage.jsx
- [ ] components/EventCard.jsx
- [ ] components/ScoreBadge.jsx
- [ ] components/FilterDrawer.jsx
- [ ] components/ReviewCard.jsx
- [ ] components/ReviewForm.jsx
- [ ] hooks/useGeolocation.js
- [ ] hooks/useSocket.js
- [ ] hooks/useUnreadCount.js
- [ ] api/authApi.js
- [ ] api/eventsApi.js
- [ ] api/usersApi.js
- [ ] api/messagesApi.js

---

*Built for Freiwilliger v1.1 | India Launch | MERN Stack | Free AI Tiers Only*
*Total estimated days: 50 active days (10 weeks × 5 days)*
