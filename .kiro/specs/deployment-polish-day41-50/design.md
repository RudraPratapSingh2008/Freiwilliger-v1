# Design Document

## Overview

This design covers the final polish phase for Freiwilliger: CI/CD pipeline setup, PWA configuration, performance optimizations, the Organiser Event Management page, and the Profile Completeness component. All implementations follow existing project conventions — CommonJS on the server, ES modules with RTK Query and shadcn/ui on the client.

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        .github/workflows/                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ deploy-backend   │  │ deploy-frontend  │  │ lint.yml         │      │
│  │ .yml             │  │ .yml             │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          Client (Vite + React)                           │
│                                                                         │
│  ┌─────────────────────┐   ┌──────────────────────────────────────┐    │
│  │ vite.config.js      │   │ src/                                 │    │
│  │ + VitePWA plugin    │   │                                      │    │
│  │ + manifest config   │   │  components/                         │    │
│  │ + workbox config    │   │    InstallPrompt.jsx                 │    │
│  └─────────────────────┘   │    ProfileCompleteness.jsx           │    │
│                             │                                      │    │
│  ┌─────────────────────┐   │  features/organiser/                 │    │
│  │ public/             │   │    EventManagementPage.jsx           │    │
│  │  pwa-192x192.png   │   │    VolunteersTab.jsx                 │    │
│  │  pwa-512x512.png   │   │    EventDetailsTab.jsx               │    │
│  └─────────────────────┘   │                                      │    │
│                             │  lib/                                │    │
│                             │    cloudinary.js  (URL transformer)  │    │
│                             │                                      │    │
│                             │  api/                                │    │
│                             │    eventsApi.js (+ cache config)     │    │
│                             │    usersApi.js  (+ cache config)     │    │
│                             │    reviewsApi.js (+ cache config)    │    │
│                             └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          Server (Express + Mongoose)                     │
│                                                                         │
│  (No new server code — verification of existing pagination and indexes) │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

**CI/CD Flow:**
```
Developer pushes to main
  → GitHub Actions detects path filter match
    → Backend workflow: install → lint → POST to Render deploy hook
    → Frontend workflow: install → build (Vercel auto-deploys via GitHub integration)
```

**PWA Install Flow:**
```
Browser fires beforeinstallprompt
  → InstallPrompt component captures event, shows banner
    → User clicks install → event.prompt() called
      → User accepts/dismisses → banner hidden, event cleared
```

**Cloudinary Transform Flow:**
```
Component receives Cloudinary URL
  → getOptimizedImageUrl(url, { width: 400 })
    → Inserts /f_auto,q_auto,w_400/ after /upload/
      → Returns transformed URL for <img> src
```

**Profile Completeness Flow:**
```
User visits own profile
  → ProfileCompleteness receives user data
    → Calculates completion items based on role
      → Renders progress bar + checklist
        → Click incomplete item → navigate to setup section
```

## Components and Interfaces

### InstallPrompt Component
```
Props: none (standalone)
State: deferredPrompt (BeforeInstallPromptEvent | null), showBanner (boolean)
Events: listens to 'beforeinstallprompt', 'appinstalled'
Renders: fixed-position banner with install button
```

### ProfileCompleteness Component
```
Props: { user: UserObject, isOwnProfile: boolean }
Output: progress bar + checklist + optional verified badge
Internal: calculateCompletion(user) → { percentage, items: ChecklistItem[] }
```

### EventManagementPage Component
```
Props: none (reads eventId from URL params)
Dependencies: useGetEventQuery, useGetApplicantsQuery, useMarkAttendanceMutation
Sub-components: VolunteersTab, EventDetailsTab
Guard: redirects to /dashboard if user is not event owner
```

### VolunteersTab Component
```
Props: { event: EventObject, volunteers: Volunteer[] }
Actions: markAttended, markNoShow, message, writeReview
Conditions: attendance actions require status 'closed'|'completed', review requires reviewsEnabled
```

### EventDetailsTab Component
```
Props: { event: EventObject }
Actions: editEvent (navigate), cancelEvent (mutation with confirmation)
Conditions: cancel button shown only for 'open'|'closed' status
```

### Cloudinary Utility (lib/cloudinary.js)
```
export function getOptimizedImageUrl(url: string, options?: { width?: number }): string
- Input: any image URL
- Output: Cloudinary URL with transform params inserted, or original URL if not Cloudinary
```

## Data Models

### No New Server Models

This feature does not introduce new database models. All data is served by existing Event and User models.

### Client-Side Types

**ChecklistItem** (used by ProfileCompleteness):
```
{
  key: string          // 'phoneVerified' | 'photoUploaded' | 'emailVerified' | 'skillsAdded' | 'companyInfo'
  label: string        // Display text
  isComplete: boolean  // Whether the item is satisfied
  navigateTo: string   // Route to navigate on click
}
```

**CompletionResult** (returned by calculateCompletion):
```
{
  percentage: number       // 0-100
  completedCount: number   // Number of complete items
  totalItems: number       // Total checklist items for the role
  items: ChecklistItem[]   // Individual item details
}
```

## Implementation Details

### 1. GitHub Actions Workflows

**File: `.github/workflows/deploy-backend.yml`**
- Trigger: `push` to `main` with `paths: ['server/**']`
- Jobs: single job with Node.js 20 setup
- Steps: checkout → setup-node → npm ci (in server/) → npm run lint (with `|| true` fallback if no lint script) → curl POST to `${{ secrets.RENDER_DEPLOY_HOOK }}`
- Secret required: `RENDER_DEPLOY_HOOK` (Render webhook URL)

**File: `.github/workflows/deploy-frontend.yml`**
- Trigger: `push` to `main` with `paths: ['client/**']`
- Jobs: single job with Node.js 20 setup
- Steps: checkout → setup-node → npm ci (in client/) → npm run build
- Note: Vercel auto-deploys on push, this workflow validates the build doesn't break

**File: `.github/workflows/lint.yml`**
- Trigger: `pull_request` to `main`
- Jobs: single job with Node.js 20 setup
- Steps: checkout → setup-node → npm ci (in client/) → npx eslint client/src → npm ci (in server/) → lint server if eslintrc present

### 2. PWA Configuration

**Modified: `client/vite.config.js`**
- Add `import { VitePWA } from 'vite-plugin-pwa'`
- Add VitePWA plugin to plugins array with:
  - `registerType: 'autoUpdate'`
  - `manifest`: name, short_name, description, theme_color, background_color, display, start_url, orientation, icons array
  - `workbox.runtimeCaching`: networkFirst for API, cacheFirst for static assets
  - `workbox.navigateFallback`: '/index.html'
  - `includeAssets`: favicon, icons

**New: `client/public/pwa-192x192.png` and `client/public/pwa-512x512.png`**
- Placeholder PWA icons (indigo app icon with "F" letter)

**New: `client/src/components/InstallPrompt.jsx`**
- Listens for `beforeinstallprompt` event
- Stores deferred prompt in ref
- Renders a fixed-bottom banner with install button
- Checks `window.matchMedia('(display-mode: standalone)')` to hide if already installed
- Hides after user interacts with prompt

### 3. Performance — RTK Query Cache

**Modified: `client/src/api/eventsApi.js`**
- Add `keepUnusedDataFor: 60` to `getFeed` endpoint

**Modified: `client/src/api/usersApi.js`**
- Add `keepUnusedDataFor: 300` to profile-related endpoints

**Modified: `client/src/api/reviewsApi.js`**
- Add `keepUnusedDataFor: 120` at the API level or per-endpoint

### 4. Performance — Cloudinary Image Utility

**New: `client/src/lib/cloudinary.js`**
```javascript
/**
 * Transform a Cloudinary URL to include optimization parameters.
 * Non-Cloudinary URLs pass through unchanged.
 *
 * @param {string} url - Image URL
 * @param {object} options - { width: number }
 * @returns {string} Optimized URL
 */
export function getOptimizedImageUrl(url, { width = 400 } = {}) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const transform = `f_auto,q_auto,w_${width}`;
  return url.replace('/upload/', `/upload/${transform}/`);
}
```

Usage: Replace raw Cloudinary URLs in avatar/profile image `src` attributes with `getOptimizedImageUrl(url, { width: 400 })` for avatars and `{ width: 800 }` for event images.

### 5. Organiser Event Management Page

**New: `client/src/features/organiser/EventManagementPage.jsx`**
- Route: `/events/:eventId/manage`
- Fetches event data via `useGetEventQuery(eventId)` and applicants via `useGetApplicantsQuery(eventId)`
- Authorization: if `event.organiserId !== currentUser._id`, redirect to `/dashboard`
- Layout: Header → Summary Card → Tab group (Volunteers | Event Details)

**New: `client/src/features/organiser/VolunteersTab.jsx`**
- Props: `event`, `applicants` (filtered to selected status)
- Renders mini-cards using shadcn Card, Avatar, Badge components
- Actions conditional on event status:
  - Mark Attended / Mark No-show: calls `useMarkAttendanceMutation`
  - Message: navigates to `/messages` (creates conversation if needed)
  - Write Review: navigates to review form (shown only when `event.reviewsEnabled`)
- Empty state: if `selectedVolunteers.length === 0`, show placeholder

**New: `client/src/features/organiser/EventDetailsTab.jsx`**
- Props: `event`
- Renders all event fields in read-only format using Card/Label pairs
- "Edit Event" button → navigates to `/post-event?edit=eventId` (reuse RaiseRequirementPage)
- "Cancel Event" button → AlertDialog confirmation → PATCH event status to cancelled
- Cancel button only shown for open/closed events

### 6. Profile Completeness Component

**New: `client/src/components/ProfileCompleteness.jsx`**
- Props: `user` (full user object), `isOwnProfile` (boolean)
- Only renders when `isOwnProfile === true`
- Calculates completion based on role:
  - **Volunteer items**: phone verified, photo uploaded, email verified, skills added (≥1 skill)
  - **Organiser items**: phone verified, photo uploaded, email verified, company info complete
- Completion percentage: `(completedCount / totalItems) * 100`
- Progress bar: uses existing shadcn `Progress` component
- Checklist: maps items with lucide `CheckCircle2` / `XCircle` icons
- Each incomplete item is a clickable link navigating to the relevant setup path
- At 100%: renders a "Verified Profile" badge (lucide `BadgeCheck` + text)

**Navigation mapping:**
| Item | Route |
|------|-------|
| Phone verified | `/settings` (phone section) |
| Photo uploaded | `/profile-setup/volunteer` or `/profile-setup/organiser` |
| Email verified | `/settings` (email section) |
| Skills added | `/profile-setup/volunteer` |
| Company info | `/profile-setup/organiser` |

### 7. Route Integration

**Modified: `client/src/App.jsx`**
- Add import for `EventManagementPage`
- Add organiser-only route: `<Route path="/events/:eventId/manage" element={<EventManagementPage />} />`

**Modified: `client/src/app/store.js`** (if messagesApi is converted to RTK Query)
- Currently messagesApi uses raw axios — no store registration needed unless converted
- All other API slices already registered

## Error Handling

### CI/CD Workflows
- If `npm ci` fails (network error, lockfile mismatch): workflow aborts, GitHub shows red check on commit/PR
- If Render deploy hook returns non-200: `curl` step fails, workflow reports failure (deploy may still trigger on Render side)
- If ESLint config is missing: lint step exits with error, workflow fails visibly

### PWA
- If service worker registration fails: app continues to function without offline support; console warning logged
- If `beforeinstallprompt` event never fires (browser doesn't support PWA install): InstallPrompt component renders nothing
- If cached response is stale and network unavailable: service worker serves stale cache (networkFirst degrades gracefully)

### Event Management Page
- If event fetch fails (404, network error): show error state with retry button
- If `markAttendance` mutation fails: optimistic update reverted, toast error shown
- If user navigates to manage page for non-existent event: redirect to dashboard with toast

### Profile Completeness
- If user object is partially loaded (fields undefined): treat undefined fields as incomplete (safe default)
- If navigation target route doesn't exist: React Router catches with 404 page

### Cloudinary Transform
- If URL is null/undefined: return the URL as-is (falsy passthrough)
- If URL contains `/upload/` but is not actually Cloudinary (edge case): transform is applied but image may fail to load; no runtime error

## Testing Strategy

### Unit Tests
- `getOptimizedImageUrl`: test with Cloudinary URLs, non-Cloudinary URLs, null/undefined, already-transformed URLs
- `calculateCompletion`: test with fully complete volunteer, fully incomplete organiser, partial combinations
- Pagination utility: test `totalPages` calculation with edge cases (0 items, 1 item, exactly limit items)

### Component Tests
- ProfileCompleteness: render with own profile (shows), render with other's profile (hidden), render at 100% (shows badge)
- InstallPrompt: simulate beforeinstallprompt event, verify banner appears
- EventManagementPage: mock event data, verify tabs render, verify non-owner redirect

### Integration Tests
- CI/CD: manual verification via test push to feature branch
- PWA: Lighthouse PWA audit after build
- Event Management: end-to-end flow of marking attendance

## Correctness Properties

### Property 1: Cloudinary URL Transformation — Round-Trip Structure Preservation

**Validates: Requirements 8.1, 8.2, 8.3**

**Property:** For all valid Cloudinary URLs containing `/upload/`, applying `getOptimizedImageUrl` produces a URL that still contains the original path segments and differs only by the inserted transform string. For all non-Cloudinary URLs, the function returns the input unchanged (identity property).

**Formal Expression:**
```
∀ url ∈ CloudinaryURLs:
  getOptimizedImageUrl(url, { width: w }) contains `f_auto,q_auto,w_${w}`
  AND getOptimizedImageUrl(url, { width: w }).replace(`f_auto,q_auto,w_${w}/`, '') === url

∀ url ∉ CloudinaryURLs:
  getOptimizedImageUrl(url) === url
```

**Testing Strategy:** Property-based test generating random Cloudinary-like URLs (with `/upload/` segment) and non-Cloudinary URLs, verifying the transform is injected correctly and non-matching URLs pass through unchanged.

### Property 2: Profile Completeness Calculation — Bounded Percentage

**Validates: Requirements 13.1, 14.2, 14.3**

**Property:** For any valid user object (volunteer or organiser), the computed completion percentage is always between 0 and 100 inclusive. The percentage equals 100 if and only if all checklist items for that role are satisfied. The number of completed items never exceeds the total items count.

**Formal Expression:**
```
∀ user ∈ Users:
  0 ≤ calculateCompletion(user).percentage ≤ 100
  AND calculateCompletion(user).completedCount ≤ calculateCompletion(user).totalItems
  AND (percentage === 100) ⟺ (completedCount === totalItems)
```

**Testing Strategy:** Property-based test generating random user objects with various combinations of verified/unverified fields, asserting percentage bounds and the 100% ⟺ all-complete equivalence.

### Property 3: Pagination Metadata Consistency

**Validates: Requirements 9.4**

**Property:** For any paginated response, `totalPages` equals `Math.ceil(total / limit)`, `page` is within `[1, totalPages]` (or page 1 when total is 0), and the number of returned items is at most `limit`.

**Formal Expression:**
```
∀ response ∈ PaginatedResponses:
  response.totalPages === Math.ceil(response.total / response.limit)
  AND response.data.length ≤ response.limit
  AND (response.total > 0 → 1 ≤ response.page ≤ response.totalPages)
```

**Testing Strategy:** Property-based test against the pagination utility/controller with varying total counts and page/limit parameters.

### Property 4: Cloudinary Transform Idempotence

**Validates: Requirements 8.1**

**Property:** Applying `getOptimizedImageUrl` twice with the same parameters produces the same result as applying it once (idempotent). The transform is not double-inserted.

**Formal Expression:**
```
∀ url, opts:
  getOptimizedImageUrl(getOptimizedImageUrl(url, opts), opts) === getOptimizedImageUrl(url, opts)
```

**Testing Strategy:** Property-based test applying the function twice to generated Cloudinary URLs and verifying no double-transform occurs.

## Files to Create

| File Path | Purpose |
|-----------|---------|
| `.github/workflows/deploy-backend.yml` | Backend CI/CD workflow |
| `.github/workflows/deploy-frontend.yml` | Frontend CI/CD workflow |
| `.github/workflows/lint.yml` | PR lint workflow |
| `client/src/components/InstallPrompt.jsx` | PWA install prompt component |
| `client/src/lib/cloudinary.js` | Cloudinary URL transform utility |
| `client/src/features/organiser/EventManagementPage.jsx` | Event management page |
| `client/src/features/organiser/VolunteersTab.jsx` | Volunteers tab component |
| `client/src/features/organiser/EventDetailsTab.jsx` | Event details tab component |
| `client/src/components/ProfileCompleteness.jsx` | Profile completeness widget |

## Files to Modify

| File Path | Change |
|-----------|--------|
| `client/vite.config.js` | Add VitePWA plugin configuration |
| `client/package.json` | Add vite-plugin-pwa dependency |
| `client/src/api/eventsApi.js` | Add keepUnusedDataFor to getFeed |
| `client/src/api/usersApi.js` | Add keepUnusedDataFor to profile endpoints |
| `client/src/api/reviewsApi.js` | Add keepUnusedDataFor |
| `client/src/App.jsx` | Add EventManagementPage route |
| `client/src/features/profile/PublicProfile.jsx` | Integrate ProfileCompleteness component |
