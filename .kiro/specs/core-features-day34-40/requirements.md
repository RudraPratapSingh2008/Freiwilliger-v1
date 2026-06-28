# Requirements Document

## Introduction

This document covers the remaining core features (Days 34–40) of the Freiwilliger volunteer event platform. These features expand the existing Network system, add a Settings module, introduce a Help Centre, implement Global Search, expose Score History, and wire the existing Contact Request frontend to the backend.

## Glossary

- **Platform**: The Freiwilliger MERN stack web application
- **Volunteer**: A user with role "volunteer" who applies to help at events
- **Organiser**: A user with role "organiser" who creates events and hires volunteers
- **Network**: The collection of user connections (mutual add) stored in the User model
- **Favourites_List**: A subset of network connections a user has marked as favourites (stored in `favouriteUsers` on User model)
- **Blocked_Users_List**: An array of ObjectIds on User model representing users the authenticated user has blocked
- **Settings_Controller**: The server-side controller handling account, privacy, notification, and deletion endpoints
- **Search_Service**: Backend logic implementing MongoDB text-index search across user fields
- **Help_Centre**: A client-side FAQ page and Report-a-Problem form backed by a support endpoint
- **Score_History**: An array of timestamped score-change entries stored inside the volunteer or organiser profile
- **Contact_Request_Flow**: The frontend UI that allows organisers to request volunteer contact info and volunteers to approve or deny

## Requirements

### Requirement 1: Favourites Management

**User Story:** As a user, I want to mark network connections as favourites and view them in a dedicated list, so that I can quickly find people I work with most often.

#### Acceptance Criteria

1. WHEN a user sends a POST request to /api/v1/network/favourites/:userId, THE Platform SHALL add the target user to the authenticated user's Favourites_List and return the updated list
2. WHEN a user sends a DELETE request to /api/v1/network/favourites/:userId, THE Platform SHALL remove the target user from the authenticated user's Favourites_List
3. WHEN a user sends a GET request to /api/v1/network/favourites, THE Platform SHALL return the authenticated user's Favourites_List populated with username, role, displayName, displayPhoto, and city
4. WHEN a user attempts to favourite a user who is not in their Network, THE Platform SHALL reject the request with a 400 status and descriptive error message
5. WHEN a user attempts to favourite themselves, THE Platform SHALL reject the request with a 400 status

### Requirement 2: Block System

**User Story:** As a user, I want to block other users so that I no longer see their content or receive communication from them.

#### Acceptance Criteria

1. WHEN a user sends a POST request to /api/v1/users/:userId/block, THE Platform SHALL add the target user to the authenticated user's Blocked_Users_List
2. WHEN a user sends a DELETE request to /api/v1/users/:userId/block, THE Platform SHALL remove the target user from the authenticated user's Blocked_Users_List
3. WHILE a user has blocked another user, THE Platform SHALL exclude the blocked user from event feed results returned to the blocking user
4. WHILE a user has blocked another user, THE Platform SHALL exclude the blocked user from user search results returned to the blocking user
5. WHEN a user attempts to block themselves, THE Platform SHALL reject the request with a 400 status

### Requirement 3: Network Page Frontend

**User Story:** As a user, I want a dedicated Network page with tabs so that I can browse my connections and favourites in one place.

#### Acceptance Criteria

1. WHEN a user navigates to the Network page, THE Platform SHALL display two tabs labelled "My Network" and "Favourites"
2. WHEN the "My Network" tab is active, THE Platform SHALL display all network connections as cards showing avatar, display name, role badge, city, and help/hire score
3. WHEN the "Favourites" tab is active, THE Platform SHALL display only favourited connections with the same card layout
4. WHEN a user types in the search input on the Network page, THE Platform SHALL filter the displayed connections by name with a 300ms debounce
5. WHEN a user clicks the "Message" button on a person card, THE Platform SHALL navigate to the messages page with that user's conversation
6. WHEN a user clicks the "Favourite" toggle on a person card, THE Platform SHALL call the favourites endpoint and update the UI optimistically
7. WHEN a user clicks the "Remove" button on a person card, THE Platform SHALL remove the connection after a confirmation prompt

### Requirement 4: Settings Backend

**User Story:** As a user, I want API endpoints for managing my account settings so that I can control my profile, security, privacy, and notifications.

#### Acceptance Criteria

1. WHEN a user sends a PATCH request to /api/v1/settings/profile with valid fields, THE Settings_Controller SHALL update the user's profile and return the updated data
2. WHEN a user sends a PATCH request to /api/v1/settings/security/password with a valid new password, THE Settings_Controller SHALL hash the new password, revoke all existing refresh tokens, and return a success response
3. WHEN a user sends a PATCH request to /api/v1/settings/visibility with valid preference flags, THE Settings_Controller SHALL update the user's visibilityPrefs and return the updated preferences
4. WHEN a user sends a PATCH request to /api/v1/settings/notifications with valid preference flags, THE Settings_Controller SHALL update the user's notificationPrefs and return the updated preferences
5. WHEN a user sends a DELETE request to /api/v1/settings/account, THE Settings_Controller SHALL set accountStatus to "deletion_requested", record deletionRequestedAt timestamp, and return a confirmation message
6. THE Platform SHALL add the following fields to the User model: notificationPrefs (sub-schema with boolean toggle fields), blockedUsers (array of ObjectId references), accountStatus (enum: active, deletion_requested, deleted), and deletionRequestedAt (Date)

### Requirement 5: Settings Page Frontend

**User Story:** As a user, I want a settings page with grouped sections so that I can manage my account preferences in an intuitive interface.

#### Acceptance Criteria

1. WHEN a user navigates to the Settings page, THE Platform SHALL display the user's avatar, username, and a link to edit their profile at the top
2. WHEN a user views the Settings page, THE Platform SHALL display grouped sections: ACCOUNT, PRIVACY, NOTIFICATIONS, SUPPORT, and LEGAL in an iOS-style list layout
3. WHEN a user taps the "Notification Preferences" item, THE Platform SHALL navigate to a sub-page with toggle switches for each notification category
4. WHEN a user taps the "Visibility Settings" item, THE Platform SHALL navigate to a sub-page with toggles for showHelpScore, showWorkHistory, showCity, who can message, and who can see profile
5. WHEN a user taps the "Data & Privacy" item, THE Platform SHALL navigate to a sub-page displaying a promises card, a "who sees what" table, a Download Data button, and a Delete Account button
6. WHEN a user taps the "Sign Out" button, THE Platform SHALL show a confirmation dialog and sign the user out upon confirmation
7. WHEN a user confirms account deletion, THE Platform SHALL call the DELETE /settings/account endpoint, sign the user out, and redirect to the login page

### Requirement 6: Help Centre FAQ

**User Story:** As a user, I want a searchable FAQ page so that I can find answers to common questions without contacting support.

#### Acceptance Criteria

1. WHEN a user navigates to the Help Centre page, THE Platform SHALL display FAQ items grouped by category: Getting Started, For Volunteers, For Organisers, Payments, Scores & Reviews, Privacy, and Technical
2. WHEN a user types in the FAQ search input, THE Platform SHALL filter visible FAQ items to those whose question or answer contains the search term
3. WHEN a user clicks on a FAQ item, THE Platform SHALL expand an accordion to reveal the answer
4. THE Platform SHALL load FAQ content from a static JSON data file bundled with the client

### Requirement 7: Report a Problem

**User Story:** As a user, I want to submit a problem report so that the support team can investigate issues I encounter.

#### Acceptance Criteria

1. WHEN a user fills out the Report a Problem form with category, subject, and description (minimum 20 characters), THE Platform SHALL enable the submit button
2. WHEN a user submits a valid report, THE Platform SHALL send a POST request to /api/v1/support/report with the form data and optional screenshot file
3. WHEN the support endpoint receives a valid report, THE Platform SHALL store the report and return a 201 status with a confirmation message
4. IF the description is fewer than 20 characters, THEN THE Platform SHALL display a validation error and prevent submission
5. WHEN a user attaches a screenshot, THE Platform SHALL upload the file using the existing upload middleware and include the URL in the report payload

### Requirement 8: Global Search Backend

**User Story:** As a user, I want to search for other users by name or organisation so that I can discover volunteers and organisers on the platform.

#### Acceptance Criteria

1. WHEN a user sends a GET request to /api/v1/users/search with a query parameter q, THE Search_Service SHALL perform a MongoDB text-index search across username, volunteerProfile.fullName, and organiserProfile.companyName fields
2. WHEN returning search results, THE Search_Service SHALL apply the profileFilter middleware to expose only public fields
3. WHEN returning search results, THE Search_Service SHALL exclude users present in the authenticated user's Blocked_Users_List
4. WHEN a role filter parameter is provided, THE Search_Service SHALL filter results to only users matching that role
5. THE Search_Service SHALL limit results to a maximum of 20 entries per request

### Requirement 9: Global Search Frontend

**User Story:** As a user, I want a search overlay with live results so that I can quickly find people on the platform.

#### Acceptance Criteria

1. WHEN a user activates the search bar on the dashboard, THE Platform SHALL open a full-screen search overlay
2. WHEN the search overlay opens with no query entered, THE Platform SHALL display recent searches stored in localStorage
3. WHEN a user types a query in the search overlay, THE Platform SHALL debounce input for 300ms and then fetch results from the search endpoint
4. WHEN results are returned, THE Platform SHALL display result cards showing avatar, display name, role badge, city, and score
5. WHEN no results match the query, THE Platform SHALL display a "No results found" empty state with a suggestion to try different terms

### Requirement 10: Score History

**User Story:** As a user, I want to see a timeline of my score changes so that I can understand how my reputation has evolved.

#### Acceptance Criteria

1. WHEN a user sends a GET request to /api/v1/users/me/score-history, THE Platform SHALL return the last 20 score change entries from the user's profile scoreHistory array
2. WHEN returning score history entries, THE Platform SHALL include delta, reason, eventId, eventName (populated from Event model), and timestamp for each entry
3. WHEN the Score History timeline component renders, THE Platform SHALL display entries as a vertical timeline with positive deltas in green and negative deltas in red

### Requirement 11: Contact Request Frontend Wiring

**User Story:** As an organiser, I want to request volunteer contact information, and as a volunteer I want to review and respond to those requests, so that organisers can reach selected volunteers outside the platform.

#### Acceptance Criteria

1. WHEN an organiser views a selected volunteer's card, THE Platform SHALL display a "Request Contact Info" button
2. WHEN an organiser clicks the "Request Contact Info" button, THE Platform SHALL open a bottom sheet form with reason and details fields
3. WHEN an organiser submits the contact request form, THE Platform SHALL send a POST request to the existing /api/v1/contact-requests endpoint
4. WHEN a volunteer receives a contact request, THE Platform SHALL display a notification and provide a full-screen review page with request details
5. WHEN a volunteer clicks "Approve" on a contact request, THE Platform SHALL send a PATCH request to approve the request and display a confirmation
6. WHEN a volunteer clicks "Deny" on a contact request, THE Platform SHALL send a PATCH request to deny the request and display a confirmation
7. WHEN an organiser views their profile, THE Platform SHALL display the status of all sent contact requests
