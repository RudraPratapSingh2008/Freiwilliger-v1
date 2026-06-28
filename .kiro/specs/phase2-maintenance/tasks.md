# Tasks

## Feature 1: Hindi Language Support (i18n)

- [x] 1. Install react-i18next, i18next, i18next-http-backend, and i18next-browser-languagedetector in client
- [x] 2. Create `client/src/i18n.js` with i18next configuration (fallbackLng: 'en', localStorage detection, lazy-load from /locales/)
- [x] 3. Import `./i18n.js` in `client/src/main.jsx` before App render
- [x] 4. Create `client/public/locales/en.json` with all static UI translation keys (labels, buttons, headings, placeholders, empty states, toasts)
- [x] 5. Create `client/public/locales/hi.json` with Hindi translations for every key in en.json
- [x] 6. Add `preferredLanguage` field (String enum ['en','hi'], default 'en') to User model
- [x] 7. Add PATCH handler in settings controller to update preferredLanguage on user document
- [x] 8. Create `client/src/features/settings/LanguageSwitcher.jsx` component (radio group: English / हिन्दी)
- [x] 9. Add "LANGUAGE" section with LanguageSwitcher to SettingsPage.jsx
- [x] 10. Replace hardcoded strings in all UI components with `t('key')` calls using useTranslation hook

## Feature 2: FCM Push Notifications

- [x] 11. Add `fcmTokens: [{ type: String, trim: true }]` field to User model
- [x] 12. Create `server/src/controllers/fcmToken.controller.js` with registerToken handler (validates token, pushes to array if not present)
- [x] 13. Add POST /users/me/fcm-token route in `server/src/routes/users.routes.js`
- [x] 14. Create `server/src/services/fcm.service.js` with sendPushNotification function (checks socket online status, sends via firebase-admin messaging, removes invalid tokens)
- [x] 15. Export `isUserOnline(userId)` helper from socket manager
- [x] 16. Integrate FCM dispatch in existing notification service for types: new_applicant, selected, rejected, new_message, review_received, contact_request
- [x] 17. Create `client/public/firebase-messaging-sw.js` service worker for background notifications (show notification, handle click deep link)
- [x] 18. Create `client/src/services/fcm.js` with requestNotificationPermission() and onForegroundMessage() functions
- [x] 19. Call requestNotificationPermission() in App.jsx after user authentication
- [x] 20. Add VITE_FIREBASE_VAPID_KEY to client .env.example

## Feature 3: Admin Dashboard

- [x] 21. Add 'admin' to User model role enum: ['volunteer', 'organiser', 'admin']
- [x] 22. Create `server/src/middleware/requireAdmin.js` that rejects non-admin with 403
- [x] 23. Create `server/src/controllers/admin.controller.js` with all handler methods (getUsers, banUser, unbanUser, getReports, updateReport, getContactRequests, approveContactRequest, getStats)
- [x] 24. Create `server/src/routes/admin.routes.js` with all admin endpoints protected by requireAuth + requireAdmin
- [x] 25. Mount admin routes in app.js at /api/v1/admin
- [x] 26. Create `client/src/api/adminApi.js` RTK Query API slice for admin endpoints
- [x] 27. Add adminApi reducer and middleware to store.js
- [x] 28. Create `client/src/components/routing/AdminRoute.jsx` route guard (redirects non-admin to /dashboard)
- [x] 29. Create `client/src/features/admin/AdminLayout.jsx` with sidebar navigation
- [x] 30. Create `client/src/features/admin/AdminOverviewPage.jsx` with stats cards
- [x] 31. Create `client/src/features/admin/AdminUsersPage.jsx` with searchable paginated table and ban/unban actions
- [x] 32. Create `client/src/features/admin/AdminReportsPage.jsx` with filterable list and status update
- [x] 33. Create `client/src/features/admin/AdminContactRequestsPage.jsx` with approve action queue
- [x] 34. Add admin routes (/admin, /admin/users, /admin/reports, /admin/contact-requests) to App.jsx wrapped in AdminRoute

## Feature 4: Aadhaar e-KYC via DigiLocker

- [x] 35. Add `idVerificationStatus` (enum: none/pending/verified/failed, default 'none') and `aadhaarData` object fields to User model
- [x] 36. Create `server/src/services/digilocker.service.js` with getConsentUrl, exchangeCodeForToken, fetchAadhaarDocument, parseAadhaarXml functions
- [x] 37. Create `server/src/controllers/digilocker.controller.js` with initiate and callback handlers
- [x] 38. Create `server/src/routes/digilocker.routes.js` with GET /initiate (protected) and GET /callback endpoints
- [x] 39. Mount DigiLocker routes in app.js at /api/v1/auth/digilocker
- [x] 40. Add DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET, DIGILOCKER_REDIRECT_URI to server .env.example
- [x] 41. Create `client/src/services/digilocker.js` with startVerification function (calls initiate endpoint, opens popup)
- [x] 42. Add "Verify with DigiLocker" button and status badge to VolunteerProfileSetupPage step 5
- [x] 43. Add "Verify with DigiLocker" button and status badge to OrganiserProfileSetupPage final step
- [x] 44. Show "Verified ✓" badge on PublicProfile when idVerificationStatus is 'verified'

## Feature 5: State-Level Event Discovery

- [x] 45. Create `server/src/data/indianStates.json` with array of 28 states and 8 union territories
- [x] 46. Add `discoverByState` handler in events controller (filter by location.state, case-insensitive, paginated)
- [x] 47. Add GET /discover route in events.routes.js (before /:eventId parameterized route)
- [x] 48. Create `client/src/data/indianStates.js` exporting the states/UTs array
- [x] 49. Add `discoverByState` query endpoint to client eventsApi.js
- [x] 50. Create `client/src/features/volunteer/StateDiscovery.jsx` component (dropdown + event list)
- [x] 51. Integrate StateDiscovery component into VolunteerDashboard as a section

## Feature 6: Sentry Error Monitoring

- [x] 52. Install @sentry/node in server
- [x] 53. Add Sentry.init() at top of server/src/app.js (conditional on SENTRY_DSN env var)
- [x] 54. Add Sentry error handler middleware in app.js before 404 handler
- [x] 55. Add Sentry.setUser({ id }) in auth middleware when user is authenticated
- [x] 56. Install @sentry/react in client
- [x] 57. Create `client/src/sentry.js` with conditional Sentry.init (browserTracingIntegration, tracesSampleRate)
- [x] 58. Import sentry.js in main.jsx and wrap App with Sentry.ErrorBoundary
- [x] 59. Add SENTRY_DSN to server .env.example and VITE_SENTRY_DSN to client .env.example

## Feature 7: Mixpanel Analytics

- [x] 60. Install mixpanel-browser in client
- [x] 61. Create `client/src/services/analytics.js` with init, identify, track, reset functions (no-op when token missing)
- [x] 62. Call analytics.init(VITE_MIXPANEL_TOKEN) in App.jsx on mount
- [x] 63. Call analytics.identify on login success and analytics.reset on logout in authSlice
- [x] 64. Add analytics.track calls for: user_registered (RegisterPage), user_logged_in (LoginPage), user_logged_out (authSlice)
- [x] 65. Add analytics.track calls for: event_created (RaiseRequirementPage), event_applied (EventDetailPage), event_selected (ApplicantListPage), event_attended (EventManagementPage)
- [x] 66. Add analytics.track calls for: message_sent (ChatWindow), review_submitted (ReviewForm), profile_completed (ProfileSetupPages), search_performed (SearchOverlay)
- [x] 67. Add VITE_MIXPANEL_TOKEN to client .env.example
