# 🤝 Freiwilliger

A full-stack volunteer event platform for India, connecting volunteers with event organisers.

Built with the MERN stack: MongoDB, Express.js, React 18, Node.js 20.

## ✨ Features

- **Phone OTP authentication** via Firebase
- **Location-based event discovery** (MongoDB $near, 50km radius)
- **Real-time messaging** via Socket.io (DMs + event group chats)
- **Volunteer scoring system** (Help Score 0–100, daily cron job)
- **Contact request flow** (privacy-first: phone/email never exposed)
- **QR code event check-in**
- **PDF volunteer certificates**
- **Admin moderation dashboard**
- **Aadhaar e-KYC** via DigiLocker
- **PWA** with offline support
- **Hindi language support** (i18n)
- **Dark mode**
- **FCM push notifications**
- **Sentry error monitoring**
- **Mixpanel analytics**

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Redux Toolkit, RTK Query |
| Backend | Node.js 20, Express.js 4, Mongoose 8, Socket.io |
| Database | MongoDB Atlas (M0 free tier) |
| Auth | Firebase Phone Auth + custom JWT |
| Storage | Cloudinary (images) |
| Real-time | Socket.io (namespaces: /chat, /notify) |
| Deployment | Render.com (backend) + Vercel (frontend) |
| CI/CD | GitHub Actions |

## 📦 Project Structure

```
freiwilliger/
├── client/           # React frontend (Vite)
│   ├── public/       # Static assets, PWA icons, locales
│   └── src/
│       ├── api/      # RTK Query API slices
│       ├── app/      # Redux store
│       ├── components/  # Shared UI components
│       ├── features/ # Feature modules (auth, admin, volunteer, organiser, etc.)
│       ├── hooks/    # Custom React hooks
│       ├── lib/      # Utilities (axios, firebase, socket, cloudinary)
│       └── services/ # External services (analytics, fcm, digilocker)
├── server/           # Express backend
│   └── src/
│       ├── config/   # DB, Firebase, Cloudinary, Socket.io
│       ├── controllers/
│       ├── jobs/     # Cron jobs (scoring, reminders, account deletion)
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── templates/ # Email HTML templates
│       └── utils/
└── .github/workflows/ # CI/CD pipelines
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (free M0 tier)
- Firebase project (phone auth enabled)
- Cloudinary account (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/freiwilliger.git
cd freiwilliger
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment setup

Copy the example env files and fill in your credentials:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**Server .env requires:**
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — random 64-char hex strings
- `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET`
- `FIREBASE_PROJECT_ID`
- `EMAIL_USER` / `EMAIL_PASSWORD` — Gmail App Password

**Client .env requires:**
- `VITE_API_BASE_URL=http://localhost:5000/api/v1`
- `VITE_SOCKET_URL=http://localhost:5000`
- `VITE_FIREBASE_*` — Firebase web app config values

### 4. Firebase Admin Key

Download from Firebase Console → Service Accounts → Generate Private Key.
Save as `server/firebase-admin-key.json` (never commit this file).

### 5. Run development servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Backend runs on http://localhost:5000
Frontend runs on http://localhost:5173

### 6. Create an admin user

```bash
# In MongoDB Atlas or via mongosh:
db.users.updateOne({ username: 'your-username' }, { $set: { role: 'admin' } })
```

## 🧪 Testing

```bash
# Server unit tests
cd server && npm test

# Client unit tests
cd client && npm test

# Client build check
cd client && npm run build

# Lint
cd server && npm run lint
cd client && npm run lint
```

## 🚢 Deployment

### Backend (Render.com)
1. Connect GitHub repo → New Web Service
2. Build: `cd server && npm install`
3. Start: `cd server && node server.js`
4. Add all env vars from server/.env

### Frontend (Vercel)
1. Connect GitHub repo → Import Project
2. Framework: Vite, Root: `client`
3. Add client env vars (VITE_* prefixed)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step deployment guide.

## 📡 API Endpoints

See [API_DOCS.md](./API_DOCS.md) for full endpoint documentation.

## 📄 License

MIT

## 👥 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
