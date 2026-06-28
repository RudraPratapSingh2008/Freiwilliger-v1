# 📡 Freiwilliger API Documentation

Base URL: `/api/v1`

All authenticated endpoints require `Authorization: Bearer <token>` header.

Standard response format:
```json
{
  "success": true|false,
  "data": {},
  "message": "string"
}
```

---

## Auth (`/api/v1/auth`)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | POST | `/auth/phone` | No | Send OTP / login-or-register with phone (rate-limited: 10/15min) |
| 2 | POST | `/auth/register` | No | Complete registration after phone verification |
| 3 | POST | `/auth/login` | No | Login with username + password (rate-limited: 20/15min) |
| 4 | POST | `/auth/refresh-token` | No | Refresh access token using refresh token cookie |
| 5 | POST | `/auth/logout` | No | Logout — clears refresh token cookie |
| 6 | POST | `/auth/forgot-password` | No | Trigger password reset via email |
| 7 | PATCH | `/auth/set-role` | Yes | Set user role (volunteer/organiser) after registration |

### POST `/auth/phone`
```json
// Body
{ "phone": "9876543210", "firebaseToken": "<firebase-id-token>" }

// Response 200
{ "success": true, "data": { "user": {...}, "accessToken": "..." }, "message": "Login successful" }
// Response 201 (new user)
{ "success": true, "data": { "userId": "...", "isNewUser": true }, "message": "Phone verified, complete registration" }
```

### POST `/auth/register`
```json
// Body
{ "userId": "...", "username": "john_doe", "password": "securePass123", "role": "volunteer" }

// Response 201
{ "success": true, "data": { "user": {...}, "accessToken": "..." }, "message": "Registration complete" }
```

### POST `/auth/login`
```json
// Body
{ "username": "john_doe", "password": "securePass123" }

// Response 200
{ "success": true, "data": { "user": {...}, "accessToken": "..." }, "message": "Login successful" }
```

### POST `/auth/refresh-token`
```json
// No body — uses HttpOnly cookie
// Response 200
{ "success": true, "data": { "accessToken": "..." }, "message": "Token refreshed" }
```

### POST `/auth/forgot-password`
```json
// Body
{ "email": "user@example.com" }

// Response 200
{ "success": true, "message": "Password reset email sent" }
```

### PATCH `/auth/set-role`
```json
// Body
{ "role": "volunteer" | "organiser" }

// Response 200
{ "success": true, "data": { "role": "volunteer" }, "message": "Role updated" }
```

---

## Users (`/api/v1/users`)

All routes require authentication.

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | GET | `/users/me` | Get current user profile |
| 2 | PATCH | `/users/me` | Update profile fields (name, bio, etc.) |
| 3 | PATCH | `/users/me/location` | Update user coordinates |
| 4 | PATCH | `/users/me/volunteer-profile` | Update volunteer-specific fields (skills, availability) |
| 5 | PATCH | `/users/me/organiser-profile` | Update organiser-specific fields (company, etc.) |
| 6 | POST | `/users/me/verify-email/send` | Send email verification OTP |
| 7 | POST | `/users/me/verify-email/confirm` | Confirm email with OTP code |
| 8 | GET | `/users/me/score-history` | Get Help/Hire score history timeline |
| 9 | POST | `/users/me/photo` | Upload profile photo (multipart) |
| 10 | POST | `/users/me/id-document` | Upload ID document (multipart) |
| 11 | POST | `/users/me/company-logo` | Upload company/org logo (multipart) |
| 12 | POST | `/users/me/fcm-token` | Register FCM push token |
| 13 | GET | `/users/me/referral` | Get referral code and stats |
| 14 | POST | `/users/me/referral` | Apply a referral code |
| 15 | GET | `/users/search` | Search users by name/username |
| 16 | GET | `/users/:username` | Get public profile by username |

### GET `/users/me`
```json
// Response 200
{ "success": true, "data": { "user": { "_id", "username", "phone", "role", "helpScore", ... } } }
```

### PATCH `/users/me`
```json
// Body (partial update)
{ "fullName": "John Doe", "bio": "Passionate volunteer", "city": "Mumbai" }
```

### PATCH `/users/me/location`
```json
// Body
{ "lat": 19.076, "lng": 72.8777 }
```

### POST `/users/me/photo`
```
// multipart/form-data
// Field: "photo" (JPEG/PNG, max 5MB)
```

### POST `/users/me/fcm-token`
```json
// Body
{ "token": "<fcm-registration-token>" }
```

### GET `/users/search`
```
// Query: ?q=john&page=1&limit=20
```

---

## Events (`/api/v1/events`)

| # | Method | Path | Auth | Role | Description |
|---|--------|------|------|------|-------------|
| 1 | GET | `/events/feed` | Yes | Any | Location-based event feed |
| 2 | GET | `/events/my/volunteer` | Yes | Volunteer | My applied/selected events |
| 3 | GET | `/events/my/organiser` | Yes | Organiser | My posted events |
| 4 | GET | `/events/discover` | Yes | Any | Discover events by state |
| 5 | GET | `/events/:id` | Yes | Any | Single event detail |
| 6 | POST | `/events` | Yes | Organiser | Create new event |
| 7 | POST | `/events/:id/apply` | Yes | Volunteer | Apply to an event |
| 8 | DELETE | `/events/:id/apply` | Yes | Volunteer | Withdraw application |
| 9 | GET | `/events/:id/applicants` | Yes | Organiser | List applicants |
| 10 | PATCH | `/events/:id/applicants/:userId` | Yes | Organiser | Select/reject/shortlist applicant |
| 11 | POST | `/events/:id/mark-attendance` | Yes | Organiser | Mark volunteer attendance |
| 12 | GET | `/events/:id/checkin-qr` | Yes | Organiser | Generate QR check-in code |
| 13 | POST | `/events/:id/checkin` | Yes | Volunteer | Validate QR check-in |
| 14 | GET | `/events/:id/certificate` | Yes | Volunteer | Download PDF certificate |

### GET `/events/feed`
```
// Query: ?lat=19.076&lng=72.877&radius=50&page=1&limit=10&category=Education
// Response 200
{ "success": true, "data": { "events": [...], "total": 42, "page": 1, "totalPages": 5 } }
```

### POST `/events`
```json
// Body
{
  "eventName": "Beach Cleanup Drive",
  "description": "Join us for a community beach cleanup...",
  "category": "Environment",
  "location": { "lat": 19.09, "lng": 72.86, "address": "...", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001" },
  "dateTime": { "start": "2025-03-01T09:00:00Z", "end": "2025-03-01T13:00:00Z" },
  "totalVolunteersNeeded": 20,
  "requirements": { "genderPreference": "Any", "requiredSkills": ["teamwork"], "minHelpScore": 30 },
  "compensation": { "paymentType": "certificate" }
}
```

### PATCH `/events/:id/applicants/:userId`
```json
// Body
{ "action": "select" | "reject" | "shortlist" }
```

### POST `/events/:id/mark-attendance`
```json
// Body
{ "volunteerId": "<mongoId>", "attended": true }
```

---

## Messages (`/api/v1/messages`)

All routes require authentication.

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | GET | `/messages/conversations` | List conversations (newest first) |
| 2 | POST | `/messages/conversations` | Create/fetch direct conversation |
| 3 | GET | `/messages/conversations/:id/messages` | Get paginated messages |
| 4 | POST | `/messages/conversations/:id/messages` | Send message (REST fallback) |

### POST `/messages/conversations`
```json
// Body
{ "participantId": "<mongoId>" }

// Response 200
{ "success": true, "data": { "conversation": { "_id", "participants": [...] } } }
```

### GET `/messages/conversations/:id/messages`
```
// Query: ?page=1&limit=50
// Response 200
{ "success": true, "data": { "messages": [...], "total": 120 } }
```

### POST `/messages/conversations/:id/messages`
```json
// Body
{ "text": "Hello, I'm interested in volunteering!" }
```

**Note:** Primary message delivery is via Socket.io `send:message` event. This REST endpoint is a fallback.

---

## Reviews (`/api/v1/reviews`)

All routes require authentication.

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | POST | `/reviews` | Submit a review |
| 2 | GET | `/reviews/user/:userId` | Get all reviews about a user |
| 3 | GET | `/reviews/event/:eventId` | Get all reviews for an event |

### POST `/reviews`
```json
// Body
{ "eventId": "<mongoId>", "revieweeId": "<mongoId>", "stars": 5, "text": "Great organiser!" }

// Response 201
{ "success": true, "data": { "review": {...} }, "message": "Review submitted" }
```

### GET `/reviews/user/:userId`
```json
// Response 200
{ "success": true, "data": { "reviews": [...], "average": 4.3, "total": 12 } }
```

---

## Network (`/api/v1/network`)

All routes require authentication.

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | POST | `/network/favourites/:userId` | Add user to favourites |
| 2 | DELETE | `/network/favourites/:userId` | Remove from favourites |
| 3 | GET | `/network/favourites` | Get favourites list |
| 4 | POST | `/network/block/:userId` | Block a user |
| 5 | DELETE | `/network/block/:userId` | Unblock a user |
| 6 | POST | `/network/request/:userId` | Send connection request |
| 7 | DELETE | `/network/:userId` | Remove connection |
| 8 | GET | `/network` | Get full network (connections list) |

### POST `/network/favourites/:userId`
```json
// Response 200
{ "success": true, "message": "User added to favourites" }
```

### GET `/network`
```json
// Response 200
{ "success": true, "data": { "connections": [...], "pending": [...] } }
```

---

## Contact Requests (`/api/v1/contact-requests`)

All routes require authentication.

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | POST | `/contact-requests` | Create contact request (organiser → volunteer) |
| 2 | GET | `/contact-requests/mine` | Get my contact requests |
| 3 | PATCH | `/contact-requests/:id/volunteer-response` | Approve or deny request |
| 4 | GET | `/contact-requests/:id/reveal` | Reveal approved contact details |

### POST `/contact-requests`
```json
// Body
{ "volunteerId": "<mongoId>", "eventId": "<mongoId>", "message": "We'd like to offer you a spot..." }

// Response 201
{ "success": true, "data": { "request": {...} }, "message": "Contact request sent" }
```

### PATCH `/contact-requests/:id/volunteer-response`
```json
// Body
{ "action": "approve" | "deny" }

// Response 200
{ "success": true, "message": "Request approved" }
```

### GET `/contact-requests/:id/reveal`
```json
// Response 200 (only if approved)
{ "success": true, "data": { "phone": "9876543210", "email": "user@example.com" } }
```

---

## Settings (`/api/v1/settings`)

All routes require authentication.

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | PATCH | `/settings/profile` | Update display profile settings |
| 2 | PATCH | `/settings/security/password` | Change password |
| 3 | PATCH | `/settings/visibility` | Update privacy/visibility toggles |
| 4 | PATCH | `/settings/notifications` | Update notification preferences |
| 5 | PATCH | `/settings/language` | Update preferred language |
| 6 | DELETE | `/settings/account` | Delete account (30-day grace period) |
| 7 | GET | `/settings/data/export` | Export user data (GDPR compliance) |

### PATCH `/settings/visibility`
```json
// Body
{ "showPhone": false, "showEmail": true, "profileVisibility": "public" | "connections" | "private" }
```

### PATCH `/settings/notifications`
```json
// Body
{ "pushEnabled": true, "emailEnabled": false, "smsEnabled": false }
```

### DELETE `/settings/account`
```json
// Body
{ "password": "currentPassword123", "reason": "optional reason" }

// Response 200
{ "success": true, "message": "Account scheduled for deletion in 30 days" }
```

### GET `/settings/data/export`
```json
// Response 200
{ "success": true, "data": { "user": {...}, "events": [...], "reviews": [...], "messages": [...] } }
```

---

## Support (`/api/v1/support`)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | POST | `/support/report` | Yes | Submit a report/bug (with optional screenshot) |

### POST `/support/report`
```
// multipart/form-data
// Fields: category (string), subject (string), description (string), screenshot (file, optional)

// Response 201
{ "success": true, "message": "Report submitted successfully" }
```

---

## Admin (`/api/v1/admin`)

All routes require authentication + admin role.

| # | Method | Path | Description |
|---|--------|------|-------------|
| 1 | GET | `/admin/users` | List all users (paginated, filterable) |
| 2 | PATCH | `/admin/users/:id/ban` | Ban a user |
| 3 | PATCH | `/admin/users/:id/unban` | Unban a user |
| 4 | GET | `/admin/reports` | List all support reports |
| 5 | PATCH | `/admin/reports/:id` | Update report status |
| 6 | GET | `/admin/contact-requests` | List all contact requests |
| 7 | PATCH | `/admin/contact-requests/:id/approve` | Admin-approve a contact request |
| 8 | GET | `/admin/stats` | Platform statistics dashboard |

### GET `/admin/users`
```
// Query: ?page=1&limit=20&role=volunteer&banned=false&search=john
```

### PATCH `/admin/users/:id/ban`
```json
// Body
{ "reason": "Spam and harassment" }

// Response 200
{ "success": true, "message": "User banned" }
```

### GET `/admin/stats`
```json
// Response 200
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "totalEvents": 567,
    "activeEvents": 89,
    "totalVolunteers": 890,
    "totalOrganisers": 344,
    "reportsOpen": 12
  }
}
```

---

## DigiLocker (`/api/v1/auth/digilocker`)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | GET | `/auth/digilocker/initiate` | Yes | Start Aadhaar e-KYC flow (returns redirect URL) |
| 2 | GET | `/auth/digilocker/callback` | No | DigiLocker OAuth callback (server-to-server) |

### GET `/auth/digilocker/initiate`
```json
// Response 200
{ "success": true, "data": { "redirectUrl": "https://digilocker.gov.in/..." } }
```

### GET `/auth/digilocker/callback`
```
// DigiLocker redirects here with ?code=...
// Server exchanges code for Aadhaar data, marks user as KYC-verified
// Redirects user to client app: /settings?kyc=success
```

---

## Socket.io Events

Namespace: `/chat`

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join:conversation` | Client → Server | `{ conversationId }` | Join a conversation room |
| `send:message` | Client → Server | `{ conversationId, text }` | Send a message |
| `new:message` | Server → Client | `{ message }` | Receive a new message |
| `typing:start` | Client → Server | `{ conversationId }` | User started typing |
| `typing:stop` | Client → Server | `{ conversationId }` | User stopped typing |
| `user:typing` | Server → Client | `{ userId, conversationId }` | Someone is typing |
| `message:read` | Client → Server | `{ messageId }` | Mark message as read |

Namespace: `/notify`

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `notification` | Server → Client | `{ type, title, body, data }` | Real-time notification |

---

## Error Codes

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — validation failed |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — duplicate resource |
| 429 | Too Many Requests — rate limited |
| 500 | Internal Server Error |

## Rate Limiting

- Global: 100 requests / 15 minutes per IP
- Phone auth: 10 requests / 15 minutes per IP
- Login: 20 requests / 15 minutes per IP
