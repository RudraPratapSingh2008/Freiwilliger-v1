# Implementation Plan: Core Features Day 34–40

## Overview

This plan implements six feature areas across 13 tasks. Tasks 1–6 cover backend (Express/Mongoose). Tasks 7–13 cover frontend (React/RTK Query). Backend tasks have no frontend dependencies. Frontend tasks depend on their respective backend tasks being complete. Task 13 (routing) depends on Tasks 7–12.

## Tasks

- [x] 1. User Model Extensions
  - [x] 1.1 Add new fields to User model
    - Add `notificationPrefsSchema` sub-schema with boolean fields: events, messages, reviews, network, contactRequests (all default true)
    - Add `notificationPrefs` field to root userSchema using the new sub-schema
    - Add `blockedUsers` field as `[{ type: Schema.Types.ObjectId, ref: 'User' }]` with default `[]`
    - Add `accountStatus` field as String enum `['active', 'deletion_requested', 'deleted']` with default `'active'`
    - Add `deletionRequestedAt` field as `Date` with default `null`
    - Add text index on `username`, `volunteerProfile.fullName`, `organiserProfile.companyName`, `organiserProfile.fullName` with name `user_text_search`
    - _Requirements: 4.6, 8.1_
  - [ ]* 1.2 Write property test for User model text index
    - **Property 12: Search results limited to 20**
    - **Validates: Requirements 8.5**

- [x] 2. Network Enhancements (Backend)
  - [x] 2.1 Add favourites endpoints to network controller
    - Implement `addFavourite` (POST `/network/favourites/:userId`): validate target is in network array, validate not self, push to `favouriteUsers`, return updated list
    - Implement `removeFavourite` (DELETE `/network/favourites/:userId`): pull from `favouriteUsers`
    - Implement `getFavourites` (GET `/network/favourites`): populate `favouriteUsers` with username, role, displayName (virtual), displayPhoto (virtual), and `location.city`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 2.2 Add block endpoints to network controller
    - Implement `blockUser` (POST `/network/block/:userId`): validate not self, add to `blockedUsers`, also remove from `network` and `favouriteUsers` in both directions
    - Implement `unblockUser` (DELETE `/network/block/:userId`): pull from `blockedUsers`
    - _Requirements: 2.1, 2.2, 2.5_
  - [x] 2.3 Update network routes file
    - Add routes for favourites: `POST /favourites/:userId`, `DELETE /favourites/:userId`, `GET /favourites`
    - Add routes for block: `POST /block/:userId`, `DELETE /block/:userId`
    - All routes use `verifyToken` middleware (already applied via `router.use`)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_
  - [ ]* 2.4 Write property tests for favourites round-trip
    - **Property 1: Favourite add/remove round-trip**
    - **Property 2: Favourites require network membership**
    - **Validates: Requirements 1.1, 1.2, 1.4**
  - [ ]* 2.5 Write property tests for block/unblock
    - **Property 4: Block/unblock round-trip**
    - **Validates: Requirements 2.1, 2.2**

- [x] 3. Settings Backend
  - [x] 3.1 Create settings controller
    - Create `server/src/controllers/settings.controller.js`
    - Implement `updateProfile`: accept body fields, delegate to role-specific sub-document update (similar to existing `updateVolunteerProfile`/`updateOrganiserProfile`)
    - Implement `changePassword`: validate current password with `comparePassword()`, hash new password, set `refreshTokens: []` to revoke all sessions, save
    - Implement `updateVisibility`: update `visibilityPrefs` with provided boolean flags, return updated prefs
    - Implement `updateNotifications`: update `notificationPrefs` with provided boolean flags, return updated prefs
    - Implement `deleteAccount`: set `accountStatus: 'deletion_requested'`, set `deletionRequestedAt: new Date()`, return confirmation
    - Use `successResponse`/`errorResponse` from `apiResponse.utils.js`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 3.2 Create settings routes and register in app.js
    - Create `server/src/routes/settings.routes.js` with all 5 endpoints
    - Apply `verifyToken` middleware to all routes
    - Register in `app.js`: `app.use('/api/v1/settings', settingsRoutes)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]* 3.3 Write property tests for settings prefs round-trip
    - **Property 7: Settings visibility prefs round-trip**
    - **Property 8: Settings notification prefs round-trip**
    - **Validates: Requirements 4.3, 4.4**

- [x] 4. Support Backend
  - [x] 4.1 Create Report model and support controller
    - Create `server/src/models/Report.model.js` with fields: userId, category (enum), subject, description (minlength 20), screenshotUrl, status, timestamps
    - Create `server/src/controllers/support.controller.js` with `createReport` handler
    - Validate description length >= 20, return 400 if invalid
    - Accept optional screenshot via existing `uploadProfilePhoto` middleware (reuse for general uploads)
    - Return 201 on success
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x] 4.2 Create support routes and register in app.js
    - Create `server/src/routes/support.routes.js` with `POST /report`
    - Apply `verifyToken` middleware
    - Register in `app.js`: `app.use('/api/v1/support', supportRoutes)`
    - _Requirements: 7.2, 7.3_

- [x] 5. Score History Endpoint
  - [x] 5.1 Verify and enhance existing score history endpoint
    - Confirm `GET /users/me/score-history` in `user.controller.js` returns correct format: `{ delta, reason, eventId, eventName, timestamp }`
    - Ensure proper population of `eventId` → `eventName` field
    - Ensure max 20 entries sorted descending by timestamp
    - Add error handling for users with no score history (return empty array)
    - _Requirements: 10.1, 10.2_
  - [ ]* 5.2 Write property tests for score history
    - **Property 13: Score history limited to 20 entries**
    - **Property 14: Score history entries contain required fields**
    - **Validates: Requirements 10.1, 10.2**

- [x] 6. Global Search Backend Enhancement
  - [x] 6.1 Update searchUsers in user controller
    - Modify existing `searchUsers` to exclude users in `req.user.blockedUsers` (load blockedUsers from the authenticated user)
    - Add optional `role` query parameter to filter results by role
    - Ensure `.limit(20)` is applied
    - Maintain existing `$regex` fallback for when text index isn't available, but prefer `$text` search when the index is present
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 6.2 Write property tests for search exclusion and limits
    - **Property 5: Blocked users excluded from search**
    - **Property 11: Search results respect role filter**
    - **Validates: Requirements 8.3, 8.4**

- [x] 7. Network Page (Frontend)
  - [x] 7.1 Create networkApi RTK Query slice
    - Create `client/src/api/networkApi.js` with `createApi`
    - Endpoints: `getNetwork`, `getFavourites`, `addFavourite` (optimistic), `removeFavourite` (optimistic), `removeConnection`, `blockUser`, `unblockUser`
    - Register in `client/src/app/store.js` (add reducer + middleware)
    - Tag types: `Network`, `Favourites`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.6_
  - [x] 7.2 Create PersonCard component
    - Create `client/src/components/network/PersonCard.jsx`
    - Display: Avatar, displayName, role Badge, city, helpScore/hireScore via ScoreBadge
    - Actions: Message button (navigates to `/messages`), Favourite toggle (heart icon), Remove button, Block option in menu
    - Use shadcn/ui Card, Badge, Button, Avatar components
    - _Requirements: 3.2, 3.3, 3.5, 3.6, 3.7_
  - [x] 7.3 Create NetworkPage with tabs and search
    - Create `client/src/features/network/NetworkPage.jsx`
    - Use shadcn/ui Tabs with "My Network" and "Favourites" tabs
    - Add search Input at top with 300ms debounce (local state + setTimeout)
    - Filter connections client-side by displayName matching search term
    - Render PersonCard grid for each tab
    - Add confirmation dialog (shadcn/ui AlertDialog) for Remove action
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [ ]* 7.4 Write property test for network filter
    - **Property 6: Network page filter consistency**
    - **Validates: Requirements 3.4**

- [x] 8. Settings Page (Frontend)
  - [x] 8.1 Create settingsApi RTK Query slice
    - Create `client/src/api/settingsApi.js` with `createApi`
    - Endpoints: `updateProfile`, `changePassword`, `updateVisibility`, `updateNotifications`, `deleteAccount`
    - Register in store.js
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 8.2 Create SettingsPage layout and main list
    - Create `client/src/features/settings/SettingsPage.jsx`
    - Header: user avatar, username, "Edit Profile" link
    - Sections: ACCOUNT (Change Password), PRIVACY (Visibility Settings, Data & Privacy), NOTIFICATIONS (Notification Preferences), SUPPORT (Help Centre link, Report a Problem link), LEGAL (Terms, Privacy Policy)
    - iOS-style grouped list using shadcn/ui Card + Separator
    - Sign Out button at bottom with confirmation AlertDialog
    - _Requirements: 5.1, 5.2, 5.6_
  - [x] 8.3 Create NotificationPrefsPage sub-page
    - Create `client/src/features/settings/NotificationPrefsPage.jsx`
    - Toggle switches for each notification category (events, messages, reviews, network, contactRequests)
    - Use shadcn/ui Switch components
    - Load current prefs from user data, PATCH on toggle change
    - _Requirements: 5.3_
  - [x] 8.4 Create VisibilitySettingsPage sub-page
    - Create `client/src/features/settings/VisibilitySettingsPage.jsx`
    - Toggles for: showHelpScore, showWorkHistory, showCity
    - Future-ready slots for: who can message, who can see profile
    - PATCH on toggle change
    - _Requirements: 5.4_
  - [x] 8.5 Create DataPrivacyPage sub-page
    - Create `client/src/features/settings/DataPrivacyPage.jsx`
    - "Our Promises" info card
    - "Who Sees What" table showing visibility of fields
    - Download Data button (placeholder action)
    - Delete Account button → confirmation dialog → calls `deleteAccount` mutation → logout → redirect to `/login`
    - _Requirements: 5.5, 5.7_

- [x] 9. Help Centre (Frontend)
  - [x] 9.1 Create FAQ data file
    - Create `client/src/data/faq.json` with categories: Getting Started, For Volunteers, For Organisers, Payments, Scores & Reviews, Privacy, Technical
    - Include 3-5 FAQ items per category with question and answer fields
    - _Requirements: 6.4_
  - [x] 9.2 Create HelpCentrePage with FAQ accordion
    - Create `client/src/features/help/HelpCentrePage.jsx`
    - Search input at top for filtering FAQ items
    - Filter logic: show items where question or answer includes search term (case-insensitive)
    - Category groupings with shadcn/ui Accordion for expand/collapse
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 9.3 Create supportApi and ReportProblemForm
    - Create `client/src/api/supportApi.js` RTK Query slice with `submitReport` mutation
    - Create `client/src/features/help/ReportProblemForm.jsx`
    - Fields: category (Select), subject (Input), description (Textarea, min 20 chars), screenshot (file input)
    - Validation with Zod: description minLength 20
    - Submit button disabled until form is valid
    - Register supportApi in store.js
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]* 9.4 Write property test for FAQ search filtering
    - **Property 9: FAQ search filters correctly**
    - **Validates: Requirements 6.2**
  - [ ]* 9.5 Write property test for report form validation
    - **Property 10: Report form validation**
    - **Validates: Requirements 7.4**

- [x] 10. Global Search (Frontend)
  - [x] 10.1 Create usersApi RTK Query slice
    - Create `client/src/api/usersApi.js` with `createApi`
    - Endpoints: `searchUsers` (query with `q` and optional `role` params), `getScoreHistory`
    - Register in store.js
    - _Requirements: 8.1, 9.3, 10.1_
  - [x] 10.2 Create SearchOverlay component
    - Create `client/src/components/SearchOverlay.jsx`
    - Full-screen overlay with fixed positioning and backdrop
    - Search input with 300ms debounce (useRef + setTimeout pattern)
    - Recent searches from localStorage (max 5 entries, stored as JSON array)
    - Result cards: Avatar, displayName, role Badge, city, score
    - Empty state: "No results found — try different terms"
    - Click result → navigate to `/profile/:username`, save to recent searches
    - Close button / Escape key to dismiss
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Score History (Frontend)
  - [x] 11.1 Create ScoreHistoryTimeline component
    - Create `client/src/components/ScoreHistoryTimeline.jsx`
    - Fetch data using `useGetScoreHistoryQuery` from usersApi
    - Vertical timeline layout with connecting line
    - Each entry shows: delta with sign (+/-), reason text, event name (linked to `/events/:id`), relative timestamp
    - Positive deltas: green text and icon
    - Negative deltas: red text and icon
    - Empty state if no history
    - _Requirements: 10.1, 10.2, 10.3_
  - [ ]* 11.2 Write property test for timeline colour coding
    - **Property 15: Score history timeline colour coding**
    - **Validates: Requirements 10.3**

- [x] 12. Contact Request Frontend Wiring
  - [x] 12.1 Create contactRequestsApi RTK Query slice
    - Create `client/src/api/contactRequestsApi.js` with `createApi`
    - Endpoints: `createContactRequest` (POST), `getMyContactRequests` (GET), `respondToContactRequest` (PATCH)
    - Register in store.js
    - _Requirements: 11.3, 11.5, 11.6_
  - [x] 12.2 Create OrganiserContactSheet component
    - Create `client/src/components/contact/OrganiserContactSheet.jsx`
    - Bottom sheet (shadcn/ui Sheet) with form: reason (Select), details (Textarea)
    - Triggered from "Request Contact Info" button on selected volunteer card
    - On submit: call `createContactRequest` mutation
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 12.3 Create VolunteerReviewPage
    - Create `client/src/features/volunteer/ContactRequestReviewPage.jsx`
    - Full-page layout showing: organiser info, reason, details, event context
    - Approve and Deny buttons → call `respondToContactRequest` mutation
    - Success confirmation after action
    - _Requirements: 11.4, 11.5, 11.6_
  - [x] 12.4 Add ContactRequestStatus to organiser profile
    - Update `PublicProfile.jsx` or create `ContactRequestStatus.jsx` component
    - Show list of sent contact requests with status badges (pending, approved, denied)
    - Use `getMyContactRequests` query
    - _Requirements: 11.7_

- [x] 13. App.jsx Routing Updates
  - [x] 13.1 Add all new routes to App.jsx
    - Import new page components: NetworkPage, SettingsPage (replace stub), NotificationPrefsPage, VisibilitySettingsPage, DataPrivacyPage, HelpCentrePage, SearchOverlay, ContactRequestReviewPage
    - Add routes within ProtectedRoute:
      - `/network` → NetworkPage
      - `/settings` → SettingsPage (index)
      - `/settings/notifications` → NotificationPrefsPage
      - `/settings/visibility` → VisibilitySettingsPage
      - `/settings/data-privacy` → DataPrivacyPage
      - `/help` → HelpCentrePage
      - `/contact-requests/:id/review` → ContactRequestReviewPage (volunteer only)
    - Remove the SettingsPage stub function
    - Update DashboardRouter to wire `onNavigate("network")` to `/network`
    - _Requirements: 3.1, 5.1, 5.3, 5.4, 5.5, 6.1, 11.4_

- [x] 14. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all API slices are registered in store.js
  - Verify all routes render correctly
  - Test navigation flows: Dashboard → Network, Dashboard → Settings → sub-pages, Dashboard → Help

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Wave 1 - Data Model",
      "tasks": ["1"]
    },
    {
      "name": "Wave 2 - Backend APIs",
      "tasks": ["2", "3", "4", "5", "6"],
      "dependsOn": ["1"]
    },
    {
      "name": "Wave 3 - Frontend Features",
      "tasks": ["7", "8", "9", "10", "11", "12"],
      "dependsOn": ["2", "3", "4", "5", "6"]
    },
    {
      "name": "Wave 4 - Integration & Routing",
      "tasks": ["13", "14"],
      "dependsOn": ["7", "8", "9", "10", "11", "12"]
    }
  ]
}
```

## Notes

- Tasks marked with `*` are optional property-based test tasks and can be skipped for faster MVP
- Backend tasks (1–6) have no frontend dependencies and can be implemented first
- Frontend tasks (7–12) depend on their corresponding backend endpoints
- Task 13 (routing) depends on Tasks 7–12 page components being created
- The existing `searchUsers` and `getScoreHistory` endpoints already work — Tasks 5 and 6 focus on enhancements (blocked user exclusion, text index, role filter)
- RTK Query slices use the same `fetchBaseQuery` + auth header pattern as the existing `eventsApi.js`
