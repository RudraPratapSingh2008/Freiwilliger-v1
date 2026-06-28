# Design Document: Core Features Day 34–40

## Overview

This design extends the Freiwilliger platform with six feature areas: **Favourites & Block system**, **Settings module**, **Help Centre**, **Global Search**, **Score History timeline**, and **Contact Request frontend wiring**. The architecture follows the existing MERN + RTK Query conventions, adding new controllers/routes on the server and new pages/components on the client.

All backend endpoints live under `/api/v1/` and use the established `successResponse`/`errorResponse` pattern. The client uses RTK Query API slices with optimistic updates, shadcn/ui components, and Tailwind CSS.

---

## Architecture

```mermaid
graph TD
    subgraph Client (Vite + React 18)
        A[App.jsx Router] --> NP[NetworkPage]
        A --> SP[SettingsPage]
        A --> HP[HelpCentrePage]
        A --> SO[SearchOverlay]
        A --> SH[ScoreHistoryTimeline]
        A --> CR[ContactRequestFlow]

        NP --> networkApi.js
        SP --> settingsApi.js
        HP --> supportApi.js
        SO --> usersApi.js
        SH --> usersApi.js
        CR --> contactRequestsApi.js
    end

    subgraph Server (Express + Mongoose)
        NC[network.controller] --> UM[User Model]
        UC[user.controller] --> UM
        SC[settings.controller] --> UM
        SUP[support.controller] --> RM[Report Model]
        SUP --> UM
    end

    networkApi.js -->|HTTP| NC
    settingsApi.js -->|HTTP| SC
    supportApi.js -->|HTTP| SUP
    usersApi.js -->|HTTP| UC
    contactRequestsApi.js -->|HTTP| CRC[contactRequest.controller]
```

---

## Components and Interfaces

### Backend Components

#### 1. User Model Extensions (`server/src/models/User.model.js`)

New fields added to the root `userSchema`:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `notificationPrefs` | Sub-schema | `{ events: true, messages: true, reviews: true, network: true, contactRequests: true }` | Per-category notification toggles |
| `blockedUsers` | `[ObjectId]` ref User | `[]` | Users blocked by this account |
| `accountStatus` | Enum `['active', 'deletion_requested', 'deleted']` | `'active'` | Account lifecycle state |
| `deletionRequestedAt` | `Date` | `null` | Timestamp of deletion request |

New sub-schema for `notificationPrefs`:

```javascript
const notificationPrefsSchema = new Schema({
  events: { type: Boolean, default: true },
  messages: { type: Boolean, default: true },
  reviews: { type: Boolean, default: true },
  network: { type: Boolean, default: true },
  contactRequests: { type: Boolean, default: true },
}, { _id: false });
```

New text index for Global Search:

```javascript
userSchema.index({
  username: 'text',
  'volunteerProfile.fullName': 'text',
  'organiserProfile.companyName': 'text',
  'organiserProfile.fullName': 'text',
}, { name: 'user_text_search' });
```

#### 2. Network Controller Extensions (`server/src/controllers/network.controller.js`)

New endpoints added to existing controller:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/network/favourites/:userId` | Add user to favourites (must be in network) |
| `DELETE` | `/network/favourites/:userId` | Remove user from favourites |
| `GET` | `/network/favourites` | List favourites (populated) |
| `POST` | `/network/block/:userId` | Block a user (also removes from network/favourites) |
| `DELETE` | `/network/block/:userId` | Unblock a user |

**Favourites validation**: Before adding to favourites, verify the target is in the user's `network` array. Reject with 400 if not.

**Block side-effects**: When blocking, also remove from `network` and `favouriteUsers` arrays in both directions.

#### 3. Settings Controller (`server/src/controllers/settings.controller.js`)

New controller file:

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/settings/profile` | Update profile fields (delegates to role-specific sub-doc) |
| `PATCH` | `/settings/security/password` | Change password, revoke refresh tokens |
| `PATCH` | `/settings/visibility` | Update `visibilityPrefs` |
| `PATCH` | `/settings/notifications` | Update `notificationPrefs` |
| `DELETE` | `/settings/account` | Set `accountStatus = 'deletion_requested'` |

#### 4. Support Controller (`server/src/controllers/support.controller.js`)

New controller + model:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/support/report` | Create a support report |

**Report Model** (`server/src/models/Report.model.js`):

```javascript
const reportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['bug', 'account', 'safety', 'feature', 'other'], required: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, minlength: 20 },
  screenshotUrl: { type: String, trim: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
}, { timestamps: true });
```

#### 5. Search Enhancement (`server/src/controllers/user.controller.js`)

The existing `searchUsers` handler is updated to:
1. Use MongoDB `$text` search (with text index) for better performance
2. Exclude blocked users: filter out any userId in `req.user.blockedUsers`
3. Accept optional `role` query parameter for filtering
4. Limit to 20 results

#### 6. Score History Endpoint

Already implemented at `GET /users/me/score-history` — no backend changes needed. The existing implementation returns last 20 entries with populated eventName.

---

### Frontend Components

#### 7. RTK Query API Slices

**`client/src/api/networkApi.js`** (new):
- `getNetwork` — GET `/network`
- `getFavourites` — GET `/network/favourites`
- `addFavourite` — POST `/network/favourites/:userId` (optimistic)
- `removeFavourite` — DELETE `/network/favourites/:userId` (optimistic)
- `removeConnection` — DELETE `/network/:userId`
- `blockUser` — POST `/network/block/:userId`
- `unblockUser` — DELETE `/network/block/:userId`

**`client/src/api/settingsApi.js`** (new):
- `getSettings` — reuses GET `/users/me`
- `updateProfile` — PATCH `/settings/profile`
- `changePassword` — PATCH `/settings/security/password`
- `updateVisibility` — PATCH `/settings/visibility`
- `updateNotifications` — PATCH `/settings/notifications`
- `deleteAccount` — DELETE `/settings/account`

**`client/src/api/supportApi.js`** (new):
- `submitReport` — POST `/support/report` (multipart/form-data for screenshot)

**`client/src/api/usersApi.js`** (new):
- `searchUsers` — GET `/users/search?q=&role=`
- `getScoreHistory` — GET `/users/me/score-history`

**`client/src/api/contactRequestsApi.js`** (new):
- `createContactRequest` — POST `/contact-requests`
- `getMyContactRequests` — GET `/contact-requests/my`
- `respondToContactRequest` — PATCH `/contact-requests/:id`

#### 8. Network Page (`client/src/features/network/NetworkPage.jsx`)

```
NetworkPage
├── Tabs (shadcn/ui Tabs)
│   ├── Tab: "My Network"
│   │   ├── SearchInput (debounced 300ms)
│   │   └── PersonCardGrid
│   │       └── PersonCard (avatar, name, role, city, score, actions)
│   └── Tab: "Favourites"
│       ├── SearchInput
│       └── PersonCardGrid
│           └── PersonCard
└── ConfirmDialog (for Remove action)
```

**PersonCard** actions: Message, Favourite toggle, Remove (with confirm), Block.

State management: RTK Query cache + local `searchTerm` state with `useDeferredValue` or `setTimeout` debounce.

#### 9. Settings Page (`client/src/features/settings/`)

```
SettingsLayout.jsx (shared header + back navigation)
├── SettingsPage.jsx (main list of sections)
├── NotificationPrefsPage.jsx (toggle switches)
├── VisibilitySettingsPage.jsx (toggles)
└── DataPrivacyPage.jsx (promises card, table, Download, Delete)
```

Uses nested routing: `/settings`, `/settings/notifications`, `/settings/visibility`, `/settings/data-privacy`.

#### 10. Help Centre (`client/src/features/help/`)

```
HelpCentrePage.jsx
├── FAQ search input
├── CategoryAccordion (shadcn/ui Accordion)
│   └── FAQItem (question + expandable answer)
└── ReportProblemForm.jsx
    ├── Category select
    ├── Subject input
    ├── Description textarea (min 20 chars validation)
    └── Screenshot file input
```

FAQ data: `client/src/data/faq.json` — static JSON grouped by category.

#### 11. Search Overlay (`client/src/components/SearchOverlay.jsx`)

Full-screen overlay triggered from dashboard header. Features:
- Recent searches from `localStorage` (max 5)
- Debounced input (300ms)
- Result cards: avatar, displayName, role badge, city, score
- Empty state when no results
- Click result → navigate to `/profile/:username`

#### 12. Score History Timeline (`client/src/components/ScoreHistoryTimeline.jsx`)

Vertical timeline component displaying score changes:
- Green text/icon for positive deltas (`+N`)
- Red text/icon for negative deltas (`-N`)
- Shows reason, event name (linked), and relative timestamp
- Used on the volunteer/organiser profile page

#### 13. Contact Request Frontend Wiring

Enhances existing `ContactRequestFlow.jsx` and adds:
- **OrganiserContactSheet** — bottom sheet with reason + details form
- **VolunteerReviewPage** — full-screen page to review incoming requests
- **ContactRequestStatus** — shows sent request statuses on organiser profile

---

## Data Models

### User Model Extensions (additions only)

```javascript
// Added to root userSchema
notificationPrefs: {
  type: notificationPrefsSchema,
  default: () => ({})
},
blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
accountStatus: {
  type: String,
  enum: ['active', 'deletion_requested', 'deleted'],
  default: 'active'
},
deletionRequestedAt: { type: Date, default: null }
```

### Report Model (new)

```javascript
// server/src/models/Report.model.js
{
  userId: ObjectId (ref: User, required),
  category: String (enum: ['bug', 'account', 'safety', 'feature', 'other']),
  subject: String (required, maxlength: 200),
  description: String (required, minlength: 20),
  screenshotUrl: String (optional),
  status: String (enum: ['open', 'in_progress', 'resolved'], default: 'open'),
  timestamps: true
}
```

### FAQ Data Structure (`client/src/data/faq.json`)

```json
[
  {
    "category": "Getting Started",
    "items": [
      { "question": "How do I sign up?", "answer": "..." },
      { "question": "How do I set up my profile?", "answer": "..." }
    ]
  }
]
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Favourite add/remove round-trip

*For any* user A and network connection B, adding B to A's favourites then removing B should result in B not being in A's Favourites_List, and the list should be the same as before adding.

**Validates: Requirements 1.1, 1.2**

### Property 2: Favourites require network membership

*For any* user A and target user C who is NOT in A's network, attempting to add C to A's Favourites_List should be rejected with a 400 status.

**Validates: Requirements 1.4**

### Property 3: Favourites list returns complete populated data

*For any* user's Favourites_List entry, the GET response should include the fields: username, role, displayName, displayPhoto, and city.

**Validates: Requirements 1.3**

### Property 4: Block/unblock round-trip

*For any* user A and target B, blocking then unblocking B should result in B not being in A's Blocked_Users_List.

**Validates: Requirements 2.1, 2.2**

### Property 5: Blocked users excluded from search

*For any* user A with blocked user B, searching with any query that would match B should never return B in A's search results.

**Validates: Requirements 2.4, 8.3**

### Property 6: Network page filter consistency

*For any* set of network connections and a search term, all displayed PersonCards on the Network page must have a displayName containing the search term (case-insensitive).

**Validates: Requirements 3.4**

### Property 7: Settings visibility prefs round-trip

*For any* valid combination of visibility boolean flags, PATCHing to `/settings/visibility` and then reading back the user should return the same flag values.

**Validates: Requirements 4.3**

### Property 8: Settings notification prefs round-trip

*For any* valid combination of notification boolean flags, PATCHing to `/settings/notifications` and then reading back the user should return the same flag values.

**Validates: Requirements 4.4**

### Property 9: FAQ search filters correctly

*For any* search term, all visible FAQ items after filtering should contain the search term in either their question or answer text (case-insensitive).

**Validates: Requirements 6.2**

### Property 10: Report form validation

*For any* description string shorter than 20 characters, the Report form submit button should be disabled and a validation error should be shown.

**Validates: Requirements 7.4**

### Property 11: Search results respect role filter

*For any* search query with a role filter parameter, all returned users should have a `role` field matching the specified filter.

**Validates: Requirements 8.4**

### Property 12: Search results limited to 20

*For any* search query, the number of results returned should be less than or equal to 20.

**Validates: Requirements 8.5**

### Property 13: Score history limited to 20 entries

*For any* user with score history, the GET `/users/me/score-history` endpoint should return at most 20 entries, sorted by timestamp descending.

**Validates: Requirements 10.1**

### Property 14: Score history entries contain required fields

*For any* score history entry returned, it should contain: delta (number), reason (string), eventId, eventName, and timestamp.

**Validates: Requirements 10.2**

### Property 15: Score history timeline colour coding

*For any* score history entry rendered in the timeline, entries with positive delta should use green styling and entries with negative delta should use red styling.

**Validates: Requirements 10.3**

---

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Favourite a user not in network | 400 | `"Target user is not in your network"` |
| Favourite yourself | 400 | `"You cannot favourite yourself"` |
| Block yourself | 400 | `"You cannot block yourself"` |
| Invalid password change (wrong current) | 401 | `"Current password is incorrect"` |
| Report description < 20 chars | 400 | `"Description must be at least 20 characters"` |
| Search with empty query | 200 | Empty array (not an error) |
| Account already deletion_requested | 400 | `"Deletion already requested"` |
| Favourite a user already in favourites | 409 | `"User is already in your favourites"` |
| Block a user already blocked | 409 | `"User is already blocked"` |

Client-side error handling:
- RTK Query `onError` callbacks display toast notifications via a shared toast utility
- Form validation errors displayed inline using Zod + react-hook-form
- Network errors show a retry button in the affected component

---

## Testing Strategy

### Unit Tests (example-based)
- Settings controller: password change revokes tokens
- Report creation returns 201
- Contact request flow: approve/deny PATCH calls
- UI rendering: SettingsPage sections, HelpCentre categories, SearchOverlay empty state

### Property-Based Tests
- Library: **fast-check** (JavaScript PBT library, works with both Node.js backend tests and client-side tests)
- Minimum 100 iterations per property
- Each test tagged with: `Feature: core-features-day34-40, Property N: <title>`
- Focus areas:
  - Favourites add/remove round-trip (Property 1)
  - Block exclusion from search (Property 5)
  - Network page filter consistency (Property 6)
  - Settings prefs round-trip (Properties 7, 8)
  - FAQ search filtering (Property 9)
  - Form validation (Property 10)
  - Search results role filter & limit (Properties 11, 12)
  - Score history limit & fields (Properties 13, 14)
  - Timeline colour coding (Property 15)

### Integration Tests
- Full API flow: block user → search → verify exclusion
- Full API flow: add to network → favourite → remove favourite
- Settings page navigation flow
- Contact request full lifecycle

### Testing Tools
- Backend: Jest (or Node.js test runner) + fast-check + supertest for HTTP
- Frontend: Vitest + React Testing Library + fast-check for property tests on pure logic
