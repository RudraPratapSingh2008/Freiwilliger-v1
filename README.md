# Freiwilliger — Volunteer Event Platform for India

A full-stack MERN application connecting volunteers with opportunities to support events across India.

## Project Structure

```
freiwilliger/
├── client/          # React 18 + Vite + Tailwind CSS + Redux
├── server/          # Node.js + Express + MongoDB + Socket.io
└── README.md
```

## Tech Stack

### Client
- **React** 18
- **Vite** (bundler & dev server)
- **Tailwind CSS** v3
- **shadcn/ui** (component library)
- **React Router** v6
- **Redux Toolkit** (state management)
- **Axios** (HTTP client)
- **Socket.io Client** (real-time)

### Server
- **Node.js** 20
- **Express.js** 4
- **MongoDB** (database)
- **Mongoose** 8 (ODM)
- **Socket.io** (WebSockets)
- **Firebase Admin SDK** (phone auth verification)
- **Cloudinary** (file storage)
- **JWT** (authentication)
- **node-cron** (scheduled jobs)

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- MongoDB Atlas account
- Firebase project
- Cloudinary account

### Installation

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Environment Setup

#### Server (`server/.env`)
Create `.env` file in server directory with:
```
MONGODB_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=your-firebase-project
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Client (`client/.env`)
Create `.env` file in client directory with:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

### Running the Project

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev
```

Server runs on `http://localhost:5000`
Client runs on `http://localhost:5173`

## Features

- **User Authentication** — Email/password + Firebase phone OTP
- **Event Discovery** — Location-based event feed with filtering
- **Event Management** — Create, manage, and track event requirements
- **Volunteer Profiles** — Showcase skills, experience, and ratings
- **Real-time Messaging** — Direct messages and group event chats
- **Scoring System** — Automated reputation tracking
- **Network** — Build professional connections
- **Contact Requests** — Secure contact information sharing
- **Reviews & Ratings** — Community feedback system

## API Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication
- `POST /auth/phone` — Verify Firebase phone OTP
- `POST /auth/register` — Complete registration
- `POST /auth/login` — Username/password login
- `POST /auth/refresh-token` — Refresh JWT
- `POST /auth/logout` — Sign out

### Users
- `GET /users/me` — Get own profile
- `PATCH /users/me` — Update profile
- `GET /users/:username` — Get public profile
- `GET /users/search?q=` — Search users

### Events
- `GET /events/feed` — Get nearby events
- `POST /events` — Create event
- `GET /events/:id` — Get event details
- `POST /events/:id/apply` — Apply to event
- `PATCH /events/:id/applicants/:userId` — Manage applicants

### Messages
- `GET /conversations` — List conversations
- `POST /conversations` — Create conversation
- `GET /conversations/:id/messages` — Get messages

### Reviews
- `POST /reviews` — Submit review
- `GET /reviews/user/:userId` — Get user reviews

## Development

### Build
```bash
# Client
cd client && npm run build

# Server uses nodemon for auto-restart
```

### Testing
```bash
# Client
npm run test

# Server
npm test
```

## Deployment

### Backend (Render.com)
1. Connect GitHub repository
2. Set environment variables
3. Build: `npm install`
4. Start: `node server.js`

### Frontend (Vercel)
1. Import GitHub repository
2. Set environment variables
3. Build: `npm run build`
4. Output: `dist`

## Project Status

**Phase 1 — Foundation** ✅
- Project scaffolding
- Database models
- Authentication system

**Phase 2 — Core Features** 🚀
- Event management
- Real-time messaging
- Scoring system

**Phase 3 — Polish**
- PWA setup
- Performance optimization
- Mobile refinements

## License

MIT

## Contact

For questions or support, contact: support@freiwilliger.in
