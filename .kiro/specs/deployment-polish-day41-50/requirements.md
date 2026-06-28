# Requirements Document

## Introduction

This spec covers the final polish phase (Days 43–50) of the Freiwilliger build plan. It delivers CI/CD automation via GitHub Actions, Progressive Web App support, performance optimizations (caching, pagination verification, image transforms), an Organiser Event Management page for post-selection volunteer management, and a Profile Completeness component to guide users toward full verification.

## Glossary

- **CI_CD_Pipeline**: The set of GitHub Actions workflow files that automate linting, building, and deploying the Freiwilliger client and server.
- **PWA_Module**: The client-side Progressive Web App configuration including service worker, manifest, and install prompt, powered by vite-plugin-pwa.
- **Service_Worker**: A background script registered by the PWA_Module that intercepts network requests to serve cached responses or fetch from the network.
- **Event_Management_Page**: A protected organiser-only page at `/events/:eventId/manage` providing full event oversight including volunteer management and attendance tracking.
- **Profile_Completeness_Component**: A UI widget displayed on the user's own profile showing completion percentage, a checklist of required items, and navigation to missing sections.
- **RTK_Query_Cache**: The Redux Toolkit Query caching layer configured with `keepUnusedDataFor` to control how long stale data is retained.
- **Cloudinary_Transform**: URL-based image transformation parameters (format, quality, width) applied to Cloudinary-hosted images for optimized delivery.
- **Render_Deploy_Hook**: A webhook URL provided by Render that triggers a new deployment of the backend service when called.
- **Organiser**: A user with `role: 'organiser'` who creates events and manages volunteers.
- **Volunteer**: A user with `role: 'volunteer'` who applies to events and receives attendance tracking.
- **Help_Score**: A numeric score (0–100) on the volunteer profile reflecting reliability and review quality.
- **Verified_Profile_Badge**: A visual badge displayed on profiles that have reached 100% completion.

## Requirements

### Requirement 1: GitHub Actions CI/CD — Backend Deployment Workflow

**User Story:** As a developer, I want the backend to deploy automatically when code is pushed to main, so that production stays up to date without manual intervention.

#### Acceptance Criteria

1. WHEN a push to the `main` branch modifies files under `server/**`, THE CI_CD_Pipeline SHALL run `npm install` and `npm run lint` (if a lint script exists) in the server directory using Node.js 20.
2. WHEN the install and lint steps succeed, THE CI_CD_Pipeline SHALL send an HTTP POST request to the configured Render_Deploy_Hook URL to trigger a backend deployment.
3. IF the install or lint step fails, THEN THE CI_CD_Pipeline SHALL abort the workflow and report failure status on the commit.
4. WHEN a push to the `main` branch does not modify files under `server/**`, THE CI_CD_Pipeline SHALL skip the backend deployment workflow entirely.

### Requirement 2: GitHub Actions CI/CD — Frontend Deployment Workflow

**User Story:** As a developer, I want the frontend build to be validated on push to main, so that broken builds are caught before Vercel auto-deploys.

#### Acceptance Criteria

1. WHEN a push to the `main` branch modifies files under `client/**`, THE CI_CD_Pipeline SHALL run `npm install` and `npm run build` in the client directory using Node.js 20.
2. IF the build step fails, THEN THE CI_CD_Pipeline SHALL abort the workflow and report failure status on the commit.
3. WHEN a push to the `main` branch does not modify files under `client/**`, THE CI_CD_Pipeline SHALL skip the frontend validation workflow entirely.

### Requirement 3: GitHub Actions CI/CD — Pull Request Lint Workflow

**User Story:** As a developer, I want ESLint to run on every pull request, so that code quality issues are caught before merge.

#### Acceptance Criteria

1. WHEN a pull request is opened or updated targeting the `main` branch, THE CI_CD_Pipeline SHALL run ESLint on both client and server directories using Node.js 20.
2. IF any ESLint rule violations are found, THEN THE CI_CD_Pipeline SHALL report failure status on the pull request.
3. WHEN no ESLint rule violations are found, THE CI_CD_Pipeline SHALL report success status on the pull request.

### Requirement 4: PWA Manifest Configuration

**User Story:** As a mobile user, I want Freiwilliger to behave like a native app, so that I can install it on my home screen with proper branding.

#### Acceptance Criteria

1. THE PWA_Module SHALL generate a web app manifest with name "Freiwilliger", short_name "Freiwilliger", theme_color "#4F46E5", background_color "#ffffff", display "standalone", start_url "/", and orientation "portrait".
2. THE PWA_Module SHALL reference icon files at sizes 192x192 and 512x512 in the manifest.
3. THE PWA_Module SHALL register a Service_Worker using the vite-plugin-pwa plugin integrated into the Vite build configuration.

### Requirement 5: PWA Service Worker Caching Strategies

**User Story:** As a user with unreliable connectivity, I want previously visited pages to load from cache, so that the app remains usable offline for static content.

#### Acceptance Criteria

1. THE Service_Worker SHALL use a networkFirst strategy for requests matching the API base URL pattern (`/api/`).
2. THE Service_Worker SHALL use a cacheFirst strategy for static assets (JavaScript, CSS, images, fonts).
3. THE Service_Worker SHALL precache the application shell pages: `/`, `/login`, and `/dashboard`.
4. IF a network request fails and no cached response exists, THEN THE Service_Worker SHALL return a fallback offline page.

### Requirement 6: PWA Install Prompt Component

**User Story:** As a mobile user visiting the site in a browser, I want to be prompted to install the app, so that I can add it to my home screen easily.

#### Acceptance Criteria

1. WHEN the browser fires the `beforeinstallprompt` event, THE PWA_Module SHALL display an "Add to Home Screen" banner or button to the user.
2. WHEN the user clicks the install button, THE PWA_Module SHALL trigger the native browser install prompt.
3. WHEN the user dismisses or accepts the prompt, THE PWA_Module SHALL hide the install banner and not show it again for the current session.
4. WHILE the application is already running in standalone display mode, THE PWA_Module SHALL not display the install prompt.

### Requirement 7: Performance — RTK Query Cache Configuration

**User Story:** As a user browsing events, I want recently fetched data to be served from cache, so that navigation feels instant and reduces redundant API calls.

#### Acceptance Criteria

1. THE RTK_Query_Cache SHALL retain unused events feed data for 60 seconds before invalidation (keepUnusedDataFor: 60).
2. THE RTK_Query_Cache SHALL retain unused user profile data for 300 seconds before invalidation (keepUnusedDataFor: 300).
3. THE RTK_Query_Cache SHALL retain unused reviews data for 120 seconds before invalidation (keepUnusedDataFor: 120).

### Requirement 8: Performance — Cloudinary Image Transformations

**User Story:** As a user on a mobile device, I want images to load quickly in optimized formats, so that the app feels responsive on slower connections.

#### Acceptance Criteria

1. WHEN rendering a user avatar or profile photo from a Cloudinary URL, THE Client SHALL apply the transformation parameters `f_auto,q_auto,w_400` to the image URL.
2. WHEN rendering an event image from a Cloudinary URL, THE Client SHALL apply the transformation parameters `f_auto,q_auto,w_800` to the image URL.
3. IF an image URL is not a Cloudinary URL, THEN THE Client SHALL render the image without modification.

### Requirement 9: Performance — Pagination Verification

**User Story:** As a developer, I want to confirm that key endpoints support pagination, so that large datasets do not degrade application performance.

#### Acceptance Criteria

1. THE Server SHALL support pagination on the messages endpoint with a default page size of 30 messages per page.
2. THE Server SHALL support pagination on the events feed endpoint with a default page size of 20 events per page.
3. THE Server SHALL support pagination on the reviews endpoint with a default page size of 10 reviews per page.
4. WHEN a paginated endpoint is called, THE Server SHALL return pagination metadata including `page`, `limit`, `total`, and `totalPages` fields.

### Requirement 10: Organiser Event Management Page — Layout and Navigation

**User Story:** As an organiser, I want a dedicated page to manage each of my events, so that I can oversee volunteer selection, attendance, and event details in one place.

#### Acceptance Criteria

1. WHEN an organiser navigates to `/events/:eventId/manage`, THE Event_Management_Page SHALL display a header containing the event name, a status badge reflecting the current event status, and an edit button.
2. THE Event_Management_Page SHALL display a summary card showing the event date, city, compensation type, total volunteers needed, selected count, and attended count.
3. THE Event_Management_Page SHALL provide sub-tabs for "Volunteers" and "Event Details".
4. IF a non-organiser user or a user who is not the event owner navigates to `/events/:eventId/manage`, THEN THE Client SHALL redirect the user to the dashboard.

### Requirement 11: Organiser Event Management Page — Volunteers Tab

**User Story:** As an organiser, I want to see and manage my selected volunteers for an event, so that I can track attendance and communicate with them.

#### Acceptance Criteria

1. WHEN the "Volunteers" tab is active, THE Event_Management_Page SHALL display a list of selected volunteers with mini-cards showing avatar, name, Help_Score, and an attendance status chip.
2. WHILE the event status is "closed" or "completed", THE Event_Management_Page SHALL provide a "Mark Attended" action button for each volunteer without an attendance record.
3. WHILE the event status is "closed" or "completed", THE Event_Management_Page SHALL provide a "Mark No-show" action button for each volunteer without an attendance record.
4. THE Event_Management_Page SHALL provide a "Message" action button for each volunteer that navigates to the messaging page with that volunteer.
5. WHILE the event has `reviewsEnabled` set to true, THE Event_Management_Page SHALL provide a "Write Review" action button for each attended volunteer.
6. IF no volunteers have been selected for the event, THEN THE Event_Management_Page SHALL display an empty state message indicating no volunteers have been selected yet.

### Requirement 12: Organiser Event Management Page — Event Details Tab

**User Story:** As an organiser, I want to view the full details of my event and perform administrative actions, so that I can edit or cancel the event when needed.

#### Acceptance Criteria

1. WHEN the "Event Details" tab is active, THE Event_Management_Page SHALL display all event information in a read-only format including name, description, category, location, date/time, requirements, compensation, and roles.
2. THE Event_Management_Page SHALL display an "Edit Event" button that navigates to the event editing form.
3. WHILE the event status is "open" or "closed", THE Event_Management_Page SHALL display a "Cancel Event" button.
4. WHEN the organiser clicks "Cancel Event", THE Event_Management_Page SHALL show a confirmation dialog before executing the cancellation.
5. WHEN the organiser confirms cancellation, THE Event_Management_Page SHALL send a cancellation request to the server and update the event status to "cancelled".

### Requirement 13: Profile Completeness Component — Progress Display

**User Story:** As a user, I want to see how complete my profile is, so that I am motivated to fill in missing information and earn the verified badge.

#### Acceptance Criteria

1. WHEN a user views their own profile, THE Profile_Completeness_Component SHALL display a horizontal progress bar showing the profile completion percentage.
2. THE Profile_Completeness_Component SHALL display a checklist of required items with status icons (checkmark for complete, cross for incomplete).
3. WHILE viewing a volunteer profile, THE Profile_Completeness_Component SHALL include checklist items for: phone verified, photo uploaded, email verified, and skills added.
4. WHILE viewing an organiser profile, THE Profile_Completeness_Component SHALL include checklist items for: phone verified, photo uploaded, email verified, and company info complete (entity type, company name, and company email filled).
5. WHEN viewing another user's public profile, THE Profile_Completeness_Component SHALL not be displayed.

### Requirement 14: Profile Completeness Component — Navigation and Badge

**User Story:** As a user with incomplete profile items, I want to click on a missing item to go directly to the relevant setup section, so that completing my profile is easy.

#### Acceptance Criteria

1. WHEN the user clicks on an incomplete checklist item, THE Profile_Completeness_Component SHALL navigate the user to the relevant profile setup section for that item.
2. WHEN the profile completion reaches 100%, THE Profile_Completeness_Component SHALL display the Verified_Profile_Badge on the user's profile.
3. WHEN the profile completion is below 100%, THE Profile_Completeness_Component SHALL not display the Verified_Profile_Badge.

### Requirement 15: Final Integration — Route Wiring

**User Story:** As a developer, I want all new pages to be properly routed in the application, so that users can navigate to them without errors.

#### Acceptance Criteria

1. THE Client SHALL register the route `/events/:eventId/manage` as an organiser-only protected route in App.jsx.
2. THE Client SHALL ensure the messagesApi slice is registered in the Redux store if not already present.
3. THE Client SHALL ensure all page navigation from the Event_Management_Page to messaging, review forms, and profile pages resolve to valid routes.
