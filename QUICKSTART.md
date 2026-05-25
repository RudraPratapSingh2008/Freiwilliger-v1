# Freiwilliger — Quick Start Guide

## What Just Happened?

You now have a **complete MERN stack monorepo** with:
- React 18 frontend with Redux + Axios + Socket.io
- Express.js backend with MongoDB + Socket.io
- All dependencies installed and ready to run
- Production build verified and working

**Total Setup Time:** ~30 minutes
**Total Files Created:** 27 core files
**Ready to Code:** YES ✅

---

## 60-Second Start

### Terminal 1 — Start Backend
```bash
cd server
npm run dev
```
✅ Runs on `http://localhost:5000`

### Terminal 2 — Start Frontend  
```bash
cd client
npm run dev
```
✅ Runs on `http://localhost:5173`

### Open Browser
```
http://localhost:5173
```
✅ See: Home → Login → Register → Dashboard → Settings

---

## What's Actually Working Right Now?

### Frontend ✅
- **Routes:** 5 placeholder pages (home, login, register, dashboard, settings)
- **Redux:** auth state management ready
- **Axios:** HTTP client with automatic token refresh
- **Socket.io:** Real-time connection initialized
- **Styling:** Tailwind CSS fully configured
- **Build:** Production build tested (npm run build)

### Backend ✅
- **Express:** Server running with security middleware
- **Routes:** 6 endpoint files with placeholders (auth, users, events, reviews, messages, network)
- **MongoDB:** Connection code ready (just needs connection string)
- **Socket.io:** Server with authentication middleware
- **CORS:** Configured for localhost
- **Rate Limiting:** Enabled for security
- **Logging:** Morgan HTTP logging active

---

## What Needs Configuration?

### `.env` Files

**For Server** (`server/.env`):
```bash
# Copy server/.env.example to server/.env
# Fill in these required values:

MONGODB_URI=mongodb+srv://...             # From MongoDB Atlas
FIREBASE_PROJECT_ID=your-project-id       # From Firebase
JWT_ACCESS_SECRET=any-random-string       # Generate a secret
JWT_REFRESH_SECRET=another-random-string  # Generate another
CLOUDINARY_CLOUD_NAME=your-cloud-name     # From Cloudinary
CLOUDINARY_API_KEY=your-key               # From Cloudinary
CLOUDINARY_API_SECRET=your-secret         # From Cloudinary
EMAIL_USER=your-email@gmail.com           # Gmail address
EMAIL_PASSWORD=your-app-password          # Gmail app password
```

**For Client** (`client/.env`):
```bash
# Copy client/.env.example to client/.env
# Fill in these values:

VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Project Structure (What's Where)

```
client/                          # React Frontend
├── src/
│   ├── App.jsx                 # Main routes
│   ├── app/store.js            # Redux store
│   ├── features/auth/          # Auth state
│   ├── lib/
│   │   ├── axios.js            # HTTP client
│   │   └── socket.js           # WebSocket
│   └── index.css               # Styles
└── package.json                # Dependencies

server/                          # Express Backend
├── src/
│   ├── app.js                  # Express setup
│   ├── config/db.js            # MongoDB
│   └── routes/                 # API endpoints
│       ├── auth.routes.js
│       ├── users.routes.js
│       ├── events.routes.js
│       ├── reviews.routes.js
│       ├── messages.routes.js
│       └── network.routes.js
└── package.json                # Dependencies
```

---

## Common Commands

### Development

```bash
# Start backend
cd server && npm run dev

# Start frontend
cd client && npm run dev

# Build frontend for production
cd client && npm run build

# Check server health
curl http://localhost:5000/api/v1/health
```

### Install More Packages

```bash
# In client directory
cd client && npm install package-name

# In server directory
cd server && npm install package-name
```

### Useful Endpoints (Already Responding!)

```bash
# Health check
curl http://localhost:5000/api/v1/health

# All routes below respond with { message: "..." }
http://localhost:5000/api/v1/auth/login
http://localhost:5000/api/v1/users/me
http://localhost:5000/api/v1/events/feed
http://localhost:5000/api/v1/messages/conversations
http://localhost:5000/api/v1/reviews/
http://localhost:5000/api/v1/network/
```

---

## Redux State (Frontend)

```javascript
// Available in any component
import { useSelector } from 'react-redux'

const user = useSelector(state => state.auth.user)
const token = useSelector(state => state.auth.accessToken)
const isLoggedIn = useSelector(state => state.auth.isAuthenticated)
const loading = useSelector(state => state.auth.loading)
const error = useSelector(state => state.auth.error)
```

---

## Socket.io (Real-time)

```javascript
// Client side
import { getSocket } from './lib/socket'

const socket = getSocket()
socket.emit('send:message', { text: 'Hello' })
socket.on('new:message', (data) => {
  console.log('New message:', data)
})
```

---

## Axios (HTTP Requests)

```javascript
// Client side
import api from './lib/axios'

// Automatically adds Bearer token
const response = await api.get('/users/me')

// Auto-refreshes on 401 (token expired)
// No extra code needed!
```

---

## File Locations Reference

| What | Where |
|------|-------|
| Home page | `client/src/App.jsx` |
| Auth logic | `client/src/features/auth/authSlice.js` |
| API config | `client/src/lib/axios.js` |
| WebSocket | `client/src/lib/socket.js` |
| Store | `client/src/app/store.js` |
| Express app | `server/src/app.js` |
| DB config | `server/src/config/db.js` |
| Auth routes | `server/src/routes/auth.routes.js` |
| User routes | `server/src/routes/users.routes.js` |
| Event routes | `server/src/routes/events.routes.js` |

---

## Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Full architecture overview |
| `SETUP.md` | Detailed setup instructions |
| `PROJECT_CHECKLIST.md` | Implementation progress |
| `FILES_CREATED.md` | Complete file listing |
| `DIRECTORY_STRUCTURE.txt` | Full file tree |
| `QUICKSTART.md` | This file |

---

## Troubleshooting

### Client won't start
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Server won't start
```bash
cd server
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't connect to API
- Check server is running: `npm run dev` in server terminal
- Check vite proxy: `vite.config.js` has `/api` proxy
- Check .env has `VITE_API_BASE_URL=http://localhost:5000/api/v1`

### Can't connect to Socket.io
- Check server Socket.io is initialized
- Check `VITE_SOCKET_URL=http://localhost:5000` in client .env
- Check auth token is available (will be after login)

---

## What's Next?

### Phase 1: This Week
1. ✅ Project scaffolding (DONE)
2. 🔲 Configure external services (Day 2)
   - MongoDB Atlas
   - Firebase
   - Cloudinary
3. 🔲 Create database models (Day 3-4)
4. 🔲 Create utility files (Day 5)

### Phase 2: Next Week  
5. 🔲 Authentication (Days 6-10)
6. 🔲 Events system (Days 11-20)
7. 🔲 Real-time messaging (Days 21-30)

### Phase 3: Later
8. 🔲 Scoring & reviews (Days 31-35)
9. 🔲 Settings & polish (Days 36-40)
10. 🔲 Deployment & testing (Days 41-50)

---

## Key Statistics

| Metric | Value |
|--------|-------|
| React Components | 1 (App.jsx) |
| API Routes | 29 placeholders |
| Dependencies | 29 packages |
| Lines of Code | ~500 |
| Configuration Files | 8 |
| Database Models | 0 (to be added) |
| Ready for Production | NO (features not implemented) |

---

## External Services Checklist

Before you can login/register, set up these free accounts:

- [ ] MongoDB Atlas (free M0 cluster)
- [ ] Firebase (free project, enable phone auth)
- [ ] Cloudinary (free tier, 25 monthly requests)
- [ ] Gmail account with app password
- [ ] Render.com account (for backend deployment)
- [ ] Vercel account (for frontend deployment)

---

## Most Important URLs

**Local Development:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api/v1
- Health Check: http://localhost:5000/api/v1/health

**Documentation:**
- Architecture: README.md
- Setup: SETUP.md
- Progress: PROJECT_CHECKLIST.md
- Files: FILES_CREATED.md

---

## One More Thing

### To verify everything is working:

1. Open two terminals
2. Terminal 1: `cd server && npm run dev`
3. Terminal 2: `cd client && npm run dev`
4. Wait for both to say "ready"
5. Open http://localhost:5173 in browser
6. You should see "Home Page" text
7. Click around the routes to verify they work

**If you see this, everything is working!** ✅

---

## Need Help?

1. Check the error message in the terminal
2. Look at FILES_CREATED.md for file locations
3. Check SETUP.md for detailed configuration
4. Read README.md for architecture overview
5. Review PROJECT_CHECKLIST.md for what comes next

---

**You're ready to code!** 🚀

See you in the next phase. Good luck building Freiwilliger!
