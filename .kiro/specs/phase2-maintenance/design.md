# Design Document

## Overview

This design covers the implementation of all seven Phase 2 maintenance features for Freiwilliger. Each feature is designed to integrate cleanly with the existing Express + Mongoose server (CommonJS) and React + Redux Toolkit client (ES modules) architecture.

---

## Feature 1: Hindi Language Support (i18n)

### Server Changes

No server changes required. Server error messages remain in English.

### Client Changes

#### New Dependencies
- `react-i18next` — React bindings for i18next
- `i18next` — Core i18n framework
- `i18next-http-backend` — Lazy-load translation JSON files
- `i18next-browser-languagedetector` — Detect stored language preference

#### New Files

**`client/src/i18n.js`** — i18next configuration
```
- Import i18next, react-i18next, http-backend, language-detector
- Configure: fallbackLng: 'en', backend loadPath: '/locales/{{lng}}.json'
- Detection order: ['localStorage'], lookupLocalStorage: 'i18n_language'
- Export initialized i18n instance
```

**`client/public/locales/en.json`** — English translations (all static UI keys)

**`client/public/locales/hi.json`** — Hindi translations (same keys as en.json)

**`client/src/features/settings/LanguageSwitcher.jsx`** — Language selection component
```
- Radio group or select: English / हिन्दी
- On change: call i18n.changeLanguage(lng), save to localStorage
- If authenticated: PATCH /api/v1/settings with { preferredLanguage: lng }
```

#### Modified Files

- **`client/src/main.jsx`** — Import `./i18n.js` before App render
- **`client/src/features/settings/SettingsPage.jsx`** — Add "LANGUAGE" section with LanguageSwitcher
- **All UI components** — Replace hardcoded strings with `t('key')` calls using `useTranslation()` hook

#### User Model Change

Add to User_Model:
```javascript
preferredLanguage: { type: String, enum: ['en', 'hi'], default: 'en' }
```

---

## Feature 2: FCM Push Notifications

### Server Changes

#### User Model Addition
```javascript
fcmTokens: [{ type: String, trim: true }]
```

#### New Files

**`server/src/routes/fcmToken.routes.js`**
- POST /users/me/fcm-token — protected by auth middleware

**`server/src/controllers/fcmToken.controller.js`**
- `registerToken(req, res)` — Validate token string, push to fcmTokens if not present, respond 200

**`server/src/services/fcm.service.js`**
```
- Import firebase-admin (already configured)
- export async function sendPushNotification(userId, payload)
  - Look up user, get fcmTokens array
  - Check active Socket_Connections map (from socket.io manager)
  - If user has active socket connection → skip
  - Build FCM message: { notification: { title, body }, data: { type, resourceId } }
  - Call admin.messaging().sendEachForMulticast({ tokens, ...message })
  - On 'messaging/registration-token-not-registered' error: remove invalid token from user
```

#### Modified Files

- **`server/src/routes/users.routes.js`** — Mount fcmToken route at `/me/fcm-token`
- **`server/src/services/notification.service.js`** (existing) — After creating in-app notification, call `fcm.service.sendPushNotification()` for types: new_applicant, selected, rejected, new_message, review_received, contact_request
- **`server/src/socket/socketManager.js`** — Export a `getActiveUserIds()` or `isUserOnline(userId)` helper

### Client Changes

#### New Files

**`client/src/services/fcm.js`**
```
- Import getMessaging, getToken, onMessage from firebase/messaging
- export async function requestNotificationPermission()
  - Request browser Notification permission
  - Get FCM token from Firebase SDK (vapidKey from env)
  - POST token to /api/v1/users/me/fcm-token
- export function onForegroundMessage(callback)
  - Listen for foreground messages via onMessage()
```

**`client/public/firebase-messaging-sw.js`** — Service worker for background notifications
```
- importScripts firebase-app-compat, firebase-messaging-compat
- Initialize Firebase app with config
- On background message: show notification, handle click → open deep link URL
```

#### Modified Files

- **`client/src/App.jsx`** — Call `requestNotificationPermission()` after user is authenticated
- **`client/vite.config.js`** — Ensure firebase-messaging-sw.js is excluded from Vite PWA injection

---

## Feature 3: Admin Dashboard

### Server Changes

#### User Model Modification
```javascript
role: {
  type: String,
  enum: ['volunteer', 'organiser', 'admin'],
  required: true
}
```

#### New Files

**`server/src/middleware/requireAdmin.js`**
```javascript
module.exports = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};
```

**`server/src/routes/admin.routes.js`**
- All routes prefixed with requireAuth + requireAdmin middleware
- GET /users — paginated, query params: page, limit, role, accountStatus, search
- PATCH /users/:id/ban
- PATCH /users/:id/unban
- GET /reports — paginated, query params: page, limit, status
- PATCH /reports/:id — body: { status }
- GET /contact-requests — paginated
- PATCH /contact-requests/:id/approve
- GET /stats

**`server/src/controllers/admin.controller.js`**
```
- getUsers: Build Mongoose query with filters, text search, paginate
- banUser: Set isBanned: true, return updated user
- unbanUser: Set isBanned: false, return updated user
- getReports: Query SupportReport model with status filter, paginate
- updateReport: Update status field on report
- getContactRequests: Query ContactRequest model where status = 'pending'
- approveContactRequest: Set status = 'approved'
- getStats: Use countDocuments for users, events, reports
```

#### Modified Files

- **`server/src/app.js`** — Add `app.use('/api/v1/admin', adminRoutes)`

### Client Changes

#### New Files

**`client/src/api/adminApi.js`** — RTK Query API slice for all admin endpoints

**`client/src/features/admin/AdminLayout.jsx`** — Admin shell with sidebar nav

**`client/src/features/admin/AdminOverviewPage.jsx`** — Stats cards (total users, events, active events, open reports)

**`client/src/features/admin/AdminUsersPage.jsx`** — Searchable paginated user table with ban/unban actions

**`client/src/features/admin/AdminReportsPage.jsx`** — Filterable report list with status update

**`client/src/features/admin/AdminContactRequestsPage.jsx`** — Queue with approve action

**`client/src/components/routing/AdminRoute.jsx`** — Route guard checking role === 'admin', redirects to /dashboard otherwise

#### Modified Files

- **`client/src/App.jsx`** — Add admin routes: /admin, /admin/users, /admin/reports, /admin/contact-requests wrapped in AdminRoute
- **`client/src/app/store.js`** — Add adminApi reducer and middleware

---

## Feature 4: Aadhaar e-KYC via DigiLocker

### Server Changes

#### User Model Addition
```javascript
idVerificationStatus: {
  type: String,
  enum: ['none', 'pending', 'verified', 'failed'],
  default: 'none'
},
aadhaarData: {
  lastFourDigits: { type: String },
  name: { type: String },
  dob: { type: String },
  gender: { type: String },
  photo: { type: String }, // base64 or Cloudinary URL
  verifiedAt: { type: Date }
}
```

#### New Files

**`server/src/services/digilocker.service.js`**
```
- Configuration: DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET, DIGILOCKER_REDIRECT_URI from env
- export function getConsentUrl(state) — Build DigiLocker OAuth2 authorization URL
- export async function exchangeCodeForToken(code) — POST to DigiLocker token endpoint
- export async function fetchAadhaarDocument(accessToken) — GET Aadhaar XML from DigiLocker API
- export function parseAadhaarXml(xmlString) — Extract name, DOB, gender, photo, last 4 digits
```

**`server/src/routes/digilocker.routes.js`**
- GET /auth/digilocker/initiate — Protected, generates consent URL with user ID in state param, returns URL
- GET /auth/digilocker/callback — Receives code + state, calls service, updates user

**`server/src/controllers/digilocker.controller.js`**
```
- initiate: Return { consentUrl } to client
- callback: Exchange code → fetch XML → parse → update user idVerificationStatus + aadhaarData
  - On success: idVerificationStatus = 'verified'
  - On failure: idVerificationStatus = 'failed', return error
```

#### Modified Files

- **`server/src/app.js`** — Add `app.use('/api/v1/auth/digilocker', digilockerRoutes)`

### Client Changes

#### New Files

**`client/src/services/digilocker.js`**
```
- export async function startVerification() — Call GET /auth/digilocker/initiate, open popup with consent URL
- Listen for popup close / redirect back, refetch user profile
```

#### Modified Files

- **`client/src/features/profile/VolunteerProfileSetupPage.jsx`** — On step 5, add "Verify with DigiLocker" button, show status badge
- **`client/src/features/profile/OrganiserProfileSetupPage.jsx`** — Same DigiLocker integration on final step
- **`client/src/features/profile/PublicProfile.jsx`** — Show "Verified ✓" badge when idVerificationStatus === 'verified'

---

## Feature 5: State-Level Event Discovery

### Server Changes

#### New/Modified Files

**`server/src/controllers/events.controller.js`** — Add `discoverByState` method
```
- Read query param: state (string, required)
- Query Event model: { 'location.state': new RegExp(`^${state}$`, 'i'), status: 'active' }
- Paginate with page/limit defaults
- Return { events, page, limit, totalCount }
```

**`server/src/data/indianStates.json`** — Static JSON array of 36 state/UT names for client validation

#### Modified Files

- **`server/src/routes/events.routes.js`** — Add `GET /discover` route before `/:eventId` parameterized route

### Client Changes

#### New Files

**`client/src/features/volunteer/StateDiscovery.jsx`**
```
- Dropdown populated with Indian states/UTs list
- On selection: call eventsApi discover endpoint with state param
- Render event cards below the dropdown
- Displayed as a section on the volunteer dashboard
```

**`client/src/data/indianStates.js`** — Exported array of 36 state/UT names

#### Modified Files

- **`client/src/api/eventsApi.js`** — Add `discoverByState` query endpoint
- **`client/src/features/volunteer/VolunteerDashboard.jsx`** — Render StateDiscovery component as a section

---

## Feature 6: Sentry Error Monitoring

### Server Changes

#### New Dependencies
- `@sentry/node` — Server-side Sentry SDK

#### Modified Files

**`server/src/app.js`**
```
- At top (before other middleware): if SENTRY_DSN exists, call Sentry.init({ dsn, environment })
- Before 404 handler: app.use(Sentry.Handlers.errorHandler())
- In auth middleware (or via Sentry.setUser): tag user ID on scope when authenticated
```

#### Environment Variables
- `SENTRY_DSN` — Server Sentry DSN (optional, app works without it)

### Client Changes

#### New Dependencies
- `@sentry/react` — Client-side Sentry SDK

#### New Files

**`client/src/sentry.js`**
```
- Import * as Sentry from '@sentry/react'
- If VITE_SENTRY_DSN exists:
  - Sentry.init({ dsn, integrations: [Sentry.browserTracingIntegration()], tracesSampleRate: 0.2 })
- Export Sentry for use in ErrorBoundary
```

#### Modified Files

- **`client/src/main.jsx`** — Import `./sentry.js` before App, wrap `<App />` in `<Sentry.ErrorBoundary fallback={...}>`
- **`client/.env.example`** — Add VITE_SENTRY_DSN placeholder

#### Environment Variables
- `VITE_SENTRY_DSN` — Client Sentry DSN (optional, app works without it)

---

## Feature 7: Mixpanel Analytics

### Client Changes

#### New Dependencies
- `mixpanel-browser` — Mixpanel client SDK

#### New Files

**`client/src/services/analytics.js`**
```javascript
import mixpanel from 'mixpanel-browser';

let initialized = false;

export function init(token) {
  if (!token) return;
  mixpanel.init(token, { track_pageview: false, persistence: 'localStorage' });
  initialized = true;
}

export function identify(userId, properties = {}) {
  if (!initialized) return;
  mixpanel.identify(userId);
  mixpanel.people.set(properties);
}

export function track(eventName, properties = {}) {
  if (!initialized) return;
  mixpanel.track(eventName, properties);
}

export function reset() {
  if (!initialized) return;
  mixpanel.reset();
}
```

#### Modified Files

- **`client/src/App.jsx`** — On mount: `analytics.init(import.meta.env.VITE_MIXPANEL_TOKEN)`
- **`client/src/features/auth/authSlice.js`** — After login success: call `analytics.identify(user._id, { role, city })`; after logout: call `analytics.reset()`
- **Various feature files** — Add `analytics.track()` calls at relevant action points:
  - RegisterPage → `user_registered`
  - LoginPage → `user_logged_in`
  - authSlice logout → `user_logged_out`
  - RaiseRequirementPage → `event_created`
  - EventDetailPage apply → `event_applied`
  - ApplicantListPage select → `event_selected`
  - EventManagementPage mark attended → `event_attended`
  - ChatWindow send → `message_sent`
  - ReviewForm submit → `review_submitted`
  - ProfileSetup complete → `profile_completed`
  - SearchOverlay search → `search_performed`

#### Environment Variables
- `VITE_MIXPANEL_TOKEN` — Mixpanel project token (optional, tracking is no-op without it)

---

## Database Schema Changes Summary

| Model | Field Added | Type |
|-------|------------|------|
| User | preferredLanguage | String enum ['en','hi'], default 'en' |
| User | fcmTokens | [String] |
| User | role enum | Add 'admin' value |
| User | idVerificationStatus | String enum ['none','pending','verified','failed'] |
| User | aadhaarData | Object (lastFourDigits, name, dob, gender, photo, verifiedAt) |

---

## Environment Variables Summary

### Server (.env)
| Variable | Purpose | Required |
|----------|---------|----------|
| SENTRY_DSN | Sentry error tracking DSN | No |
| DIGILOCKER_CLIENT_ID | DigiLocker OAuth2 client ID | For KYC feature |
| DIGILOCKER_CLIENT_SECRET | DigiLocker OAuth2 client secret | For KYC feature |
| DIGILOCKER_REDIRECT_URI | DigiLocker callback URL | For KYC feature |

### Client (.env)
| Variable | Purpose | Required |
|----------|---------|----------|
| VITE_SENTRY_DSN | Sentry error tracking DSN | No |
| VITE_MIXPANEL_TOKEN | Mixpanel project token | No |
| VITE_FIREBASE_VAPID_KEY | FCM VAPID key for push notifications | For FCM feature |

---

## Correctness Properties

1. **Translation round-trip**: For every key in en.json, hi.json SHALL contain the same key. Parsing en.json and hi.json SHALL produce objects with identical key sets.
2. **FCM token idempotence**: Calling POST /users/me/fcm-token with the same token multiple times SHALL result in exactly one entry in the fcmTokens array.
3. **Admin authorization invariant**: For any admin endpoint, requests from users with role !== 'admin' SHALL always receive HTTP 403.
4. **Aadhaar data minimisation invariant**: After DigiLocker verification completes, the User document SHALL NOT contain a field with more than 4 consecutive digits from the Aadhaar number.
5. **Sentry graceful degradation**: When SENTRY_DSN / VITE_SENTRY_DSN is empty or undefined, the application SHALL start and run without throwing errors related to Sentry.
6. **Analytics graceful degradation**: When VITE_MIXPANEL_TOKEN is empty or undefined, calling track() and identify() SHALL not throw errors.
7. **State discovery filter correctness**: The events returned by GET /events/discover?state=X SHALL all have location.state matching X (case-insensitive).
