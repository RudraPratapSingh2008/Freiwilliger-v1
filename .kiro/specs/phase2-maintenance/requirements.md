# Requirements Document

## Introduction

This specification covers all seven Phase 2 maintenance features for the Freiwilliger platform: Hindi language support (i18n), FCM push notifications, admin dashboard for moderation, Aadhaar e-KYC via DigiLocker, state-level event discovery, Sentry error monitoring, and Mixpanel analytics. These features add internationalisation, engagement tooling, safety and compliance capabilities, and observability to the existing production application.

## Glossary

- **Client**: The React 18 + Vite single-page application served to browsers and mobile devices
- **Server**: The Express.js + Mongoose REST API running on Node.js
- **User_Model**: The Mongoose schema representing registered users (volunteers, organisers, admins)
- **i18n_Provider**: The react-i18next wrapper that supplies translated strings to React components
- **Translation_File**: A JSON document mapping translation keys to localised strings (en.json, hi.json)
- **Language_Switcher**: A UI control on the Settings page allowing the user to change display language
- **FCM_Service**: The Firebase Cloud Messaging dispatch module on the Server
- **FCM_Token**: A device-specific registration token used by Firebase to route push notifications
- **Push_Notification**: A message delivered via FCM to a user's device when the user has no active Socket.io connection
- **Admin_Dashboard**: A set of protected pages and API endpoints accessible only to users with the admin role
- **Admin_Middleware**: Express middleware that rejects requests from non-admin users with HTTP 403
- **DigiLocker_Service**: A Server module implementing the DigiLocker OAuth2 flow for Aadhaar e-KYC
- **ID_Verification_Status**: A field on the User_Model indicating KYC state (pending, verified, failed)
- **State_Discovery_Endpoint**: An API endpoint that returns events filtered by Indian state
- **Sentry_SDK**: The @sentry/node and @sentry/react libraries for error and performance monitoring
- **Analytics_Utility**: A client-side module wrapping Mixpanel for event tracking and user identification
- **Socket_Connection**: An active Socket.io WebSocket between the Client and Server

## Requirements

### Requirement 1: Hindi Language Support — Translation Infrastructure

**User Story:** As a developer, I want an i18n infrastructure in the Client, so that all static UI text can be displayed in multiple languages without code changes to individual components.

#### Acceptance Criteria

1. THE i18n_Provider SHALL initialise react-i18next with English as the default language and lazy-load Translation_Files for English and Hindi
2. WHEN a Translation_File is loaded, THE i18n_Provider SHALL make all keys available to components via the useTranslation hook
3. THE Translation_File for English SHALL contain keys covering all static labels, button text, headings, placeholders, empty-state messages, and toast notifications present in the Client
4. THE Translation_File for Hindi SHALL contain translations for every key present in the English Translation_File
5. IF a translation key is missing from the active Translation_File, THEN THE i18n_Provider SHALL fall back to the English value for that key

### Requirement 2: Hindi Language Support — Language Switching and Persistence

**User Story:** As a user, I want to switch the app language between English and Hindi, so that I can use the platform in my preferred language.

#### Acceptance Criteria

1. THE Language_Switcher SHALL appear in the Settings page under a section labelled "LANGUAGE"
2. WHEN the user selects a language via the Language_Switcher, THE i18n_Provider SHALL immediately re-render all visible text in the selected language
3. WHEN the user selects a language, THE Client SHALL persist the selection in localStorage under the key "i18n_language"
4. WHEN the user selects a language and is authenticated, THE Client SHALL send a PATCH request to the Server to store the preference on the User_Model field "preferredLanguage"
5. WHEN the Client initialises, THE i18n_Provider SHALL read the language preference from localStorage and apply it before first render
6. IF localStorage contains no language preference, THEN THE i18n_Provider SHALL default to English

### Requirement 3: FCM Push Notifications — Token Management

**User Story:** As a user, I want my device registered for push notifications, so that I receive important updates even when the app is closed.

#### Acceptance Criteria

1. THE User_Model SHALL include a field "fcmTokens" of type array of strings to store device registration tokens
2. THE Server SHALL expose a POST endpoint at /api/v1/users/me/fcm-token that accepts a body containing a "token" string
3. WHEN the POST /api/v1/users/me/fcm-token endpoint receives a valid token, THE Server SHALL append the token to the authenticated user's fcmTokens array if not already present
4. WHEN the Client obtains notification permission from the browser, THE Client SHALL request an FCM registration token from the Firebase SDK and send it to POST /api/v1/users/me/fcm-token
5. THE Client SHALL register a Firebase messaging service worker that handles background push notifications

### Requirement 4: FCM Push Notifications — Notification Dispatch

**User Story:** As a user, I want to receive push notifications for important events when I am offline, so that I do not miss applicant updates, messages, or reviews.

#### Acceptance Criteria

1. THE FCM_Service SHALL send a Push_Notification when the target user has no active Socket_Connection and an in-app notification of the following types is created: new_applicant, selected, rejected, new_message, review_received, contact_request
2. WHEN the FCM_Service sends a Push_Notification, THE payload SHALL include fields: title (string), body (string), and data object containing type, and a relevant resource identifier (eventId or conversationId)
3. IF all FCM_Tokens for a user return an "unregistered" error from Firebase, THEN THE FCM_Service SHALL remove those invalid tokens from the user's fcmTokens array
4. WHEN the user taps a Push_Notification on their device, THE Client service worker SHALL open the app to the relevant deep-link path based on the data.type and resource identifier

### Requirement 5: Admin Dashboard — Server Endpoints and Authorisation

**User Story:** As an admin, I want dedicated API endpoints for user management and report review, so that I can moderate the platform effectively.

#### Acceptance Criteria

1. THE User_Model role enum SHALL include the value "admin" in addition to "volunteer" and "organiser"
2. THE Admin_Middleware SHALL reject requests from users whose role is not "admin" with HTTP status 403 and a JSON body containing message "Access denied"
3. THE Server SHALL expose GET /api/v1/admin/users that returns a paginated list of users filterable by role and accountStatus, and searchable by username or displayName
4. THE Server SHALL expose PATCH /api/v1/admin/users/:id/ban that sets isBanned to true on the target user and returns the updated user object
5. THE Server SHALL expose PATCH /api/v1/admin/users/:id/unban that sets isBanned to false on the target user and returns the updated user object
6. THE Server SHALL expose GET /api/v1/admin/reports that returns a paginated list of support reports filterable by status (open, in_progress, resolved)
7. THE Server SHALL expose PATCH /api/v1/admin/reports/:id that accepts a status field and updates the report's status
8. THE Server SHALL expose GET /api/v1/admin/contact-requests that returns all pending contact requests for admin review
9. THE Server SHALL expose PATCH /api/v1/admin/contact-requests/:id/approve that marks the contact request as approved
10. THE Server SHALL expose GET /api/v1/admin/stats that returns an object with totalUsers, totalEvents, activeEvents, and openReportsCount

### Requirement 6: Admin Dashboard — Client Pages

**User Story:** As an admin, I want a dashboard UI with user management, report handling, and platform statistics, so that I can perform moderation tasks efficiently.

#### Acceptance Criteria

1. THE Client SHALL render admin pages only for authenticated users whose role is "admin"
2. WHEN a non-admin user navigates to an /admin route, THE Client SHALL redirect to the /dashboard page
3. THE Client SHALL provide a route /admin displaying summary statistics cards (total users, total events, active events, open reports)
4. THE Client SHALL provide a route /admin/users displaying a searchable, paginated table of users with actions to ban and unban
5. THE Client SHALL provide a route /admin/reports displaying a filterable list of support reports with the ability to update status
6. THE Client SHALL provide a route /admin/contact-requests displaying a queue of pending contact requests with an approve action

### Requirement 7: Aadhaar e-KYC — DigiLocker OAuth2 Flow

**User Story:** As a user, I want to verify my identity through DigiLocker, so that I can receive a verified badge that increases trust on the platform.

#### Acceptance Criteria

1. THE DigiLocker_Service SHALL implement the OAuth2 authorization code flow: redirect the user to the DigiLocker consent page with the configured client_id, redirect_uri, and scope
2. THE Server SHALL expose GET /api/v1/auth/digilocker/callback that receives the authorization code from DigiLocker after user consent
3. WHEN the callback receives a valid authorization code, THE DigiLocker_Service SHALL exchange the code for an access token and retrieve the Aadhaar XML document
4. WHEN the Aadhaar XML is retrieved, THE DigiLocker_Service SHALL extract name, date of birth, gender, photo, and last four digits of the Aadhaar number
5. THE DigiLocker_Service SHALL store only the extracted fields and the last four Aadhaar digits on the User_Model; the full Aadhaar number SHALL NOT be persisted
6. WHEN extraction succeeds, THE DigiLocker_Service SHALL set the user's idVerificationStatus to "verified"
7. IF the DigiLocker OAuth2 flow fails at any step (invalid code, token exchange failure, XML retrieval error), THEN THE DigiLocker_Service SHALL set the user's idVerificationStatus to "failed" and return an error response to the Client

### Requirement 8: Aadhaar e-KYC — Client Integration

**User Story:** As a user, I want a "Verify with DigiLocker" button during profile setup, so that I can complete identity verification without leaving the app experience.

#### Acceptance Criteria

1. THE Client SHALL display a "Verify with DigiLocker" button on profile setup step 5
2. WHEN the user clicks the "Verify with DigiLocker" button, THE Client SHALL open the DigiLocker consent page in a popup window or redirect
3. WHEN the DigiLocker flow completes successfully, THE Client SHALL display a "Verified ✓" badge next to the user's name
4. WHILE the idVerificationStatus is "pending", THE Client SHALL display a "Verification Pending" indicator
5. IF the idVerificationStatus is "failed", THEN THE Client SHALL display an error message with an option to retry verification

### Requirement 9: State-Level Event Discovery

**User Story:** As a volunteer, I want to browse events filtered by Indian state, so that I can find volunteering opportunities in a specific region.

#### Acceptance Criteria

1. THE Server SHALL expose GET /api/v1/events/discover that accepts a query parameter "state" containing an Indian state or union territory name
2. WHEN the "state" parameter is provided, THE Server SHALL return only events whose location.state field matches the provided value (case-insensitive)
3. THE Server SHALL return a paginated response with page, limit, totalCount, and an array of event documents
4. THE Client SHALL display a "Browse by State" section on the volunteer dashboard containing a dropdown of all 28 Indian states and 8 union territories
5. WHEN the user selects a state from the dropdown, THE Client SHALL fetch and display events from the State_Discovery_Endpoint filtered by that state
6. THE Client SHALL display the state-filtered results alongside the existing location-based event feed without replacing it

### Requirement 10: Error Monitoring — Sentry Integration

**User Story:** As a developer, I want unhandled errors captured and reported to Sentry, so that production issues are detected and diagnosed quickly.

#### Acceptance Criteria

1. THE Server SHALL initialise @sentry/node with the DSN from the environment variable SENTRY_DSN on application startup
2. THE Server SHALL register the Sentry error handler middleware before the 404 handler so that unhandled exceptions and unhandled promise rejections are captured
3. WHEN an error is captured on the Server and a user is authenticated, THE Sentry_SDK SHALL tag the error with the user's ID
4. THE Client SHALL initialise @sentry/react with the DSN from the environment variable VITE_SENTRY_DSN on application mount
5. THE Client SHALL wrap the root App component with Sentry.ErrorBoundary to capture React render errors
6. THE Client SHALL enable Sentry performance tracing for route change transactions
7. IF the SENTRY_DSN or VITE_SENTRY_DSN environment variable is not set, THEN THE Sentry_SDK SHALL not initialise and the application SHALL continue to function normally

### Requirement 11: Analytics — Mixpanel Integration

**User Story:** As a product owner, I want user actions tracked in Mixpanel, so that I can analyse engagement patterns and make data-driven product decisions.

#### Acceptance Criteria

1. THE Analytics_Utility SHALL export functions: init, identify, track, and reset
2. WHEN init is called with a valid Mixpanel token, THE Analytics_Utility SHALL initialise the mixpanel-browser SDK
3. WHEN the user logs in, THE Client SHALL call identify with the user's ID, role, and city
4. WHEN the user logs out, THE Client SHALL call reset to clear the Mixpanel identity
5. THE Client SHALL call track for the following events with relevant properties: user_registered, user_logged_in, user_logged_out, event_created, event_applied, event_selected, event_attended, message_sent, review_submitted, profile_completed, search_performed
6. THE Analytics_Utility SHALL read the Mixpanel token from the environment variable VITE_MIXPANEL_TOKEN
7. IF the VITE_MIXPANEL_TOKEN environment variable is not set, THEN THE Analytics_Utility SHALL not initialise and all tracking calls SHALL be no-ops
