# Implementation Plan: Deployment Polish Day 41–50

## Overview

This plan implements 9 task groups covering CI/CD workflows, PWA support, performance optimizations, the Organiser Event Management page, Profile Completeness component, and property-based tests. Tasks 1–5 are infrastructure/config with no code dependencies. Tasks 6–7 are new UI components. Task 8 is route integration depending on Tasks 6–7. Task 9 is property-based tests depending on Tasks 4 and 7.

## Tasks

- [x] 1. GitHub Actions CI/CD Workflows
  - [x] 1.1 Create `.github/workflows/deploy-backend.yml` with push trigger on `main` filtered to `server/**`, Node.js 20 setup, `npm ci`, lint step, and curl POST to `${{ secrets.RENDER_DEPLOY_HOOK }}`
    - Trigger: `on: push: branches: [main], paths: ['server/**']`
    - Job: `deploy` running on `ubuntu-latest`
    - Steps: actions/checkout, actions/setup-node (node-version: 20), npm ci in server/, npm run lint (continue-on-error false), curl -X POST deploy hook
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 1.2 Create `.github/workflows/deploy-frontend.yml` with push trigger on `main` filtered to `client/**`, Node.js 20 setup, `npm ci`, and `npm run build`
    - Trigger: `on: push: branches: [main], paths: ['client/**']`
    - Steps: actions/checkout, actions/setup-node (node-version: 20), npm ci in client/, npm run build
    - Purpose: validate build before Vercel auto-deploys
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 1.3 Create `.github/workflows/lint.yml` with pull_request trigger on `main`, Node.js 20 setup, install and ESLint run for both client and server directories
    - Trigger: `on: pull_request: branches: [main]`
    - Steps: checkout, setup-node, npm ci in client/, npx eslint src/ in client/, npm ci in server/ (if eslint config exists, run lint)
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 1.4 Add ESLint configuration to server if not present to support the lint workflow
    - Check if server has eslint config; if not, add minimal eslint.config.js for CommonJS Node.js
    - Add `"lint": "eslint src/"` script to server/package.json if missing
    - _Requirements: 1.1, 3.1_

- [x] 2. PWA Configuration with vite-plugin-pwa
  - [x] 2.1 Install `vite-plugin-pwa` as a dev dependency in the client package
    - Run `npm install -D vite-plugin-pwa` in client/
    - _Requirements: 4.3_
  - [x] 2.2 Update `client/vite.config.js` to add VitePWA plugin with manifest and workbox configuration
    - Import `{ VitePWA }` from `'vite-plugin-pwa'`
    - Add to plugins array with: registerType 'autoUpdate', manifest (name: "Freiwilliger", short_name: "Freiwilliger", description, theme_color: "#4F46E5", background_color: "#ffffff", display: "standalone", start_url: "/", orientation: "portrait", icons: 192x192 and 512x512)
    - Workbox runtimeCaching: networkFirst for urlPattern matching `/api/`, cacheFirst for static assets (js, css, png, jpg, svg, woff2)
    - navigateFallback: '/index.html'
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3_
  - [x] 2.3 Add precache configuration for application shell pages (`/`, `/login`, `/dashboard`) and offline fallback
    - Configure additionalManifestEntries or navigateFallback for shell pages
    - _Requirements: 5.3, 5.4_
  - [x] 2.4 Create placeholder PWA icon files: `client/public/pwa-192x192.png` and `client/public/pwa-512x512.png`
    - Generate simple indigo icons with "F" letter or use placeholder
    - _Requirements: 4.2_
  - [x] 2.5 Create `client/src/components/InstallPrompt.jsx` — listens for `beforeinstallprompt`, shows install banner, handles prompt interaction, hides in standalone mode
    - Listen for `beforeinstallprompt` event on window, store deferred prompt in useRef
    - Check `window.matchMedia('(display-mode: standalone)').matches` to suppress if already installed
    - Render fixed-bottom banner with app name and "Install" button
    - On click: call `deferredPrompt.current.prompt()`, await userChoice, hide banner
    - On dismiss or `appinstalled` event: hide banner for session
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 3. RTK Query Cache Configuration
  - [x] 3.1 Add `keepUnusedDataFor: 60` to the `getFeed` endpoint in `client/src/api/eventsApi.js`
    - Add the option at the endpoint level inside the `getFeed` builder.query config
    - _Requirements: 7.1_
  - [x] 3.2 Add `keepUnusedDataFor: 300` to profile-related endpoints in `client/src/api/usersApi.js`
    - Add at the API-level default or per-endpoint for user profile queries
    - _Requirements: 7.2_
  - [x] 3.3 Add `keepUnusedDataFor: 120` to the reviewsApi in `client/src/api/reviewsApi.js`
    - Add at the API-level or per-endpoint as appropriate
    - _Requirements: 7.3_

- [x] 4. Cloudinary Image Transform Utility
  - [x] 4.1 Create `client/src/lib/cloudinary.js` with `getOptimizedImageUrl(url, { width })` function
    - If url is falsy or does not contain 'res.cloudinary.com', return url unchanged
    - If url already contains the transform string (idempotence check), return unchanged
    - Insert `f_auto,q_auto,w_{width}` after `/upload/` in the URL
    - Default width: 400
    - _Requirements: 8.1, 8.2, 8.3_
  - [x] 4.2 Update avatar/profile image rendering in PersonCard, PublicProfile, and ConversationListItem to use `getOptimizedImageUrl(url, { width: 400 })`
    - Import utility and wrap Cloudinary URLs in img src attributes
    - _Requirements: 8.1_
  - [x] 4.3 Update event image rendering (EventCard, EventDetailPage) to use `getOptimizedImageUrl(url, { width: 800 })` if event images are present
    - _Requirements: 8.2_

- [x] 5. Pagination Verification
  - [x] 5.1 Verify messages endpoint supports pagination with default 30/page and returns pagination metadata (page, limit, total, totalPages)
    - Check `server/src/controllers/messages.controller.js` for pagination in conversation messages endpoint
    - Add pagination metadata to response if missing
    - _Requirements: 9.1, 9.4_
  - [x] 5.2 Verify events feed endpoint supports pagination with default 20/page and returns pagination metadata
    - Check `server/src/controllers/events.controller.js` for getFeed pagination
    - Confirm response includes page, limit, total, totalPages
    - _Requirements: 9.2, 9.4_
  - [x] 5.3 Verify reviews endpoint supports pagination with default 10/page and returns pagination metadata
    - Check `server/src/controllers/reviews.controller.js`
    - Add pagination metadata to response if missing
    - _Requirements: 9.3, 9.4_

- [x] 6. Organiser Event Management Page
  - [x] 6.1 Create `client/src/features/organiser/EventManagementPage.jsx` with route param extraction, event data fetching, authorization guard, header (event name + status badge + edit button), and summary card (date, city, compensation, volunteer counts)
    - Use `useParams()` to get eventId, `useGetEventQuery` and `useGetApplicantsQuery` for data
    - Authorization: compare `event.organiserId` to current user `_id`, redirect to `/dashboard` if mismatch
    - Header: event name (h1), Badge for status, Button linking to edit form
    - Summary card: shadcn Card with date, location.city, compensation.paymentType, totalVolunteersNeeded, selectedVolunteers.length, attendanceLog.length
    - Tabs component wrapping VolunteersTab and EventDetailsTab
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [x] 6.2 Create `client/src/features/organiser/VolunteersTab.jsx` — list of selected volunteers with mini-cards (avatar, name, Help Score, attendance chip), conditional action buttons
    - Filter applicants to status 'selected', populate with user data
    - Mini-card: Avatar, name, ScoreBadge (helpScore), attendance chip (attended/no-show/pending)
    - Actions (visible per conditions):
      - "Mark Attended": shown if event status is 'closed'|'completed' and no attendance record exists, calls `useMarkAttendanceMutation({ eventId, volunteerId, attended: true })`
      - "Mark No-show": same condition, calls with `attended: false`
      - "Message": always shown, navigates to `/messages` (triggers conversation creation)
      - "Write Review": shown only when `event.reviewsEnabled === true` and volunteer attended
    - Empty state: "No volunteers selected yet" placeholder
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - [x] 6.3 Create `client/src/features/organiser/EventDetailsTab.jsx` — read-only event info, Edit and Cancel buttons
    - Display all event fields: name, description, category, location (address, city), dateTime (start/end), requirements, compensation, roles
    - "Edit Event" button navigates to `/post-event?edit={eventId}`
    - "Cancel Event" button: shown only for status 'open'|'closed', wrapped in AlertDialog for confirmation
    - On confirm: PATCH event status to 'cancelled' (add `cancelEvent` mutation to eventsApi or use inline fetch)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [x] 6.4 Add `cancelEvent` mutation to `client/src/api/eventsApi.js` if not already present
    - PATCH `/events/${eventId}` with body `{ status: 'cancelled' }`
    - Invalidates Event and MyEventsOrganiser tags
    - _Requirements: 12.5_

- [x] 7. Profile Completeness Component
  - [x] 7.1 Create `client/src/components/ProfileCompleteness.jsx` with `calculateCompletion(user)` logic returning percentage, completedCount, totalItems, and items array based on user role
    - Volunteer items: phone verified (`user.isPhoneVerified`), photo uploaded (`user.volunteerProfile.profilePhoto`), email verified (`user.volunteerProfile.isEmailVerified`), skills added (`user.volunteerProfile.skills.length > 0`)
    - Organiser items: phone verified (`user.isPhoneVerified`), photo uploaded (`user.organiserProfile.profilePhoto || user.organiserProfile.logo`), email verified (`user.organiserProfile.isEmailVerified`), company info complete (`user.organiserProfile.entityType && user.organiserProfile.companyName && user.organiserProfile.companyEmail`)
    - Percentage: `Math.round((completedCount / totalItems) * 100)`
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  - [x] 7.2 Render horizontal progress bar using shadcn Progress component and checklist with CheckCircle2/XCircle icons from lucide-react
    - Progress value = percentage
    - Each item: icon (green CheckCircle2 if complete, red XCircle if not) + label text
    - Incomplete items are clickable links using `useNavigate`
    - _Requirements: 13.1, 13.2, 14.1_
  - [x] 7.3 Display "Verified Profile" badge (BadgeCheck icon from lucide-react) when completion reaches 100%
    - Conditional render: only show badge div when percentage === 100
    - Badge uses indigo color scheme with BadgeCheck icon and "Verified Profile" text
    - _Requirements: 14.2, 14.3_
  - [x] 7.4 Integrate ProfileCompleteness into PublicProfile page — render only when `isOwnProfile` is true
    - Import ProfileCompleteness component
    - Pass user data and isOwnProfile boolean (compare profile user id to logged-in user id)
    - Render above or below the main profile info section
    - _Requirements: 13.5_

- [x] 8. Route Integration and Final Wiring
  - [x] 8.1 Add `EventManagementPage` import and organiser-only route `/events/:eventId/manage` to `client/src/App.jsx`
    - Import EventManagementPage from `./features/organiser/EventManagementPage`
    - Add inside the existing organiser-only `<RoleRoute requiredRole="organiser">` block
    - _Requirements: 15.1_
  - [x] 8.2 Add `InstallPrompt` component to the app layout (render at the bottom of the BrowserRouter in App.jsx)
    - Import and render `<InstallPrompt />` after `</Routes>` inside `<BrowserRouter>`
    - _Requirements: 6.1_
  - [x] 8.3 Verify all navigation paths from EventManagementPage resolve to existing routes (messages, review form, profile, edit)
    - Message navigates to `/messages` (exists)
    - Write Review navigates to review form route (verify exists or create)
    - Edit navigates to `/post-event?edit=id` (RaiseRequirementPage handles edit mode)
    - _Requirements: 15.3_
  - [x] 8.4 Verify store.js has all required API slices registered — messagesApi is axios-based (no store change needed), all RTK Query slices already present
    - _Requirements: 15.2_

- [ ] 9. Property-Based Tests
  - [~] 9.1 Write property test for `getOptimizedImageUrl`: for all generated Cloudinary URLs, transform is correctly inserted and original path preserved; for non-Cloudinary URLs, output equals input ~PBT
    - Generate random Cloudinary URLs matching pattern `https://res.cloudinary.com/.../upload/...`
    - Assert: result contains `f_auto,q_auto,w_{width}` and removing transform yields original URL
    - Generate random non-Cloudinary URLs, assert output === input
    - _Validates: Requirements 8.1, 8.2, 8.3_
  - [~] 9.2 Write property test for `getOptimizedImageUrl` idempotence: applying function twice produces same result as once ~PBT
    - For all generated Cloudinary URLs: `f(f(url, opts), opts) === f(url, opts)`
    - _Validates: Requirements 8.1_
  - [~] 9.3 Write property test for `calculateCompletion`: percentage is always 0–100, completedCount ≤ totalItems, percentage is 100 iff all items complete ~PBT
    - Generate random user objects with boolean/array fields for volunteer and organiser roles
    - Assert: `0 <= percentage <= 100`, `completedCount <= totalItems`, `(percentage === 100) === (completedCount === totalItems)`
    - _Validates: Requirements 13.1, 14.2, 14.3_
  - [~] 9.4 Write property test for pagination metadata: totalPages equals ceil(total/limit), returned items count ≤ limit ~PBT
    - Generate random total (0–1000) and limit (1–100) values
    - Assert: `totalPages === Math.ceil(total / limit)` (or 1 when total is 0)
    - Assert: simulated page data length ≤ limit
    - _Validates: Requirements 9.4_

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Wave 1 - Infrastructure & Config (no code dependencies)",
      "tasks": ["1", "2", "3", "4", "5"]
    },
    {
      "name": "Wave 2 - UI Components",
      "tasks": ["6", "7"],
      "dependsOn": ["4"]
    },
    {
      "name": "Wave 3 - Integration & Tests",
      "tasks": ["8", "9"],
      "dependsOn": ["6", "7"]
    }
  ]
}
```

## Notes

- Tasks 1–5 are independent config/infrastructure work with no code dependencies between them — they can all run in parallel.
- Task 4 (Cloudinary utility) is a dependency for Task 6 (Event Management may use optimized images) and Task 9 (property tests).
- Task 6 (Event Management Page) uses existing `useGetEventQuery`, `useGetApplicantsQuery`, and `useMarkAttendanceMutation` — no new backend work needed.
- The messagesApi currently uses raw axios (not RTK Query), so no store.js registration is required for it.
- PWA icons (Task 2.4) can be simple placeholder images initially — proper branded icons can be designed later.
- The `cancelEvent` mutation in Task 6.4 may alternatively reuse an existing event update mutation if one exists in the eventsApi.
- Server pagination (Task 5) is a verification task — if pagination is already implemented correctly, no code changes are needed.
