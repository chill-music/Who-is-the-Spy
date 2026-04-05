# Feature Specification: Admin Panel Overhaul

**Feature Branch**: `008-admin-panel-overhaul`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "Staff Management visibility, PRO SPY bot, Feedback Inbox fixes, Active Staff Team bug, User search enhancements, Support Tickets escalation and permissions, Broadcast via bot with images, Staff Activity Log filtering and permissions, comprehensive code audit"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Staff Management Board Shows All Staff (Priority: P1)

As an Owner, I want the Staff Management page to display all staff members I have added (including Admins and Supervisors/Moderators), not just myself, so I can see who is on my team and manage them.

**Why this priority**: The inability to see or manage staff renders the entire Staff Management page non-functional, blocking core administrative workflows.

**Independent Test**: Navigate to Staff Management page as Owner → All added Admins and Moderators are visible in their respective role sections with remove/action buttons.

**Acceptance Scenarios**:

1. **Given** an Owner has added one or more Admins and Moderators, **When** they open the Staff Management page, **Then** every Admin and Moderator is listed with their name and role displayed.
2. **Given** an owner views the Staff Management board, **When** they click "Remove" on a staff member, **Then** that person is removed from the staff role and disappears from the board.
3. **Given** an owner wants to add a new staff member, **When** they use the Add Staff UI, **Then** the new member immediately appears on the board under the correct role.
4. **Given** a staff member is removed, **When** that user logs into the app, **Then** they no longer have staff-level permissions.

---

### User Story 2 - PRO SPY Bot Creation (Priority: P1)

As an Owner, I want a new bot called "PRO SPY" to exist alongside all existing bots in the game, so it can be used as the delivery channel for professional announcements and automated feedback responses.

**Why this priority**: The PRO SPY bot is a dependency for multiple other features (Broadcast and Feedback acknowledgements). It must exist before those features can use it.

**Independent Test**: Open the bots list in-game → PRO SPY appears as a selectable bot profile alongside the existing bots.

**Acceptance Scenarios**:

1. **Given** the app boots, **When** any player opens the bots section or encounters a bot interaction, **Then** PRO SPY bot appears in the list with a distinct name and avatar.
2. **Given** the PRO SPY bot exists, **When** it sends a message, **Then** the message is displayed under the "PRO SPY" name in a professional styled format.
3. **Given** PRO SPY is a bot account, **When** it appears on leaderboards, **Then** it follows the same bot display rules as existing bots (bot_ UID prefix).

---

### User Story 3 - Feedback Inbox Shows Correct Sender Name (Priority: P1)

As an Owner reviewing the Feedback Inbox, I want every feedback entry to display the actual name of the person who submitted the feedback (whether they are a regular user, moderator, or admin), so I can correctly identify who provided which piece of feedback.

**Why this priority**: Displaying staff role names instead of individual user names makes feedback attribution impossible and undermines the inbox's trustworthiness.

**Independent Test**: Have an Admin and a Moderator each submit feedback → Both appear in the Feedback Inbox with the submitting user's personal name, not their role title.

**Acceptance Scenarios**:

1. **Given** an Owner views the Feedback Inbox, **When** a feedback entry was submitted by an Admin named "Alice", **Then** the entry shows "Alice", not "Admin".
2. **Given** a Moderator named "Bob" submits feedback, **When** the Owner views the inbox, **Then** "Bob" appears as the sender name.
3. **Given** a regular user submits feedback, **When** the Owner views the inbox, **Then** the user's display name appears correctly (this should already work; verify it remains unaffected).

---

### User Story 4 - Feedback "Seen" Acknowledgement via PRO SPY Bot (Priority: P2)

As an Owner, I want a button on each feedback entry that, when clicked, sends an automated message from the PRO SPY bot to the feedback author, thanking them and confirming their feedback was seen.

**Why this priority**: Closing the feedback loop increases user trust and engagement. It depends on the PRO SPY bot (Story 2) existing first.

**Independent Test**: Submit feedback as a test user → Owner clicks "Acknowledge" button on that entry in the Feedback Inbox → The test user receives a PRO SPY bot message thanking them.

**Acceptance Scenarios**:

1. **Given** the Owner is viewing a feedback entry, **When** they click "Acknowledge / Mark Seen", **Then** a PRO SPY bot message is sent to the feedback submitter's chat saying their feedback was received and thanking them.
2. **Given** an acknowledgement is already sent, **When** the Owner views that feedback entry again, **Then** the button is disabled or marked "Acknowledged" to prevent duplicate messages.
3. **Given** the PRO SPY bot sends the acknowledgement, **When** the feedback author opens their chat, **Then** they see a polished, professional-looking message (not a plain text dump).

---

### User Story 5 - Active Staff Team Widget Shows Online Staff (Priority: P1)

As an Owner viewing the Admin Panel home page, I want the "👮 Active Staff Team" widget to properly show which staff members are currently online, so I can understand team availability at a glance.

**Why this priority**: A broken widget on the main admin dashboard reduces trust in the panel and hides real-time staff presence information.

**Independent Test**: Log in as Owner and simultaneously have a Moderator log in → The Active Staff Team widget on the admin homepage shows the Moderator as online.

**Acceptance Scenarios**:

1. **Given** a Moderator is logged in and online, **When** the Owner views the Admin Panel home page, **Then** that Moderator's name appears in the Active Staff Team section.
2. **Given** no staff members are online, **When** the Owner views the widget, **Then** an appropriate "No staff online" message is shown rather than an empty or broken state.
3. **Given** a staff member goes offline, **When** the Owner refreshes or the widget auto-updates, **Then** that staff member is removed from the active list.

---

### User Story 6 - User Search Accuracy (Gold, Level, Full Data) (Priority: P1)

As an Owner, when I search for a user on the Users page by their UID or custom ID, I want to see their exact Gold amount, correct Level, and all profile data accurately displayed, along with the ability to Ban them or mark their data as verified.

**Why this priority**: Inaccurate data display undermines the Owner's ability to make informed moderation decisions. Missing action buttons remove core administrative capability.

**Independent Test**: Search for a known user by UID → Their Gold and Level shown match the exact values in their Firestore profile → Ban and Verify buttons are visible and functional.

**Acceptance Scenarios**:

1. **Given** a user has 5,432 Gold, **When** the Owner searches for them and views their profile card, **Then** exactly "5,432" Gold is displayed (no rounding, no caching issue).
2. **Given** a user is at Level 14, **When** the Owner searches for them, **Then** "Level 14" is shown correctly.
3. **Given** the Owner views a searched user's profile, **When** they click "Ban", **Then** the user is banned and notified, and the UI updates to reflect banned status.
4. **Given** the Owner views a searched user's profile, **When** they click "Verify All Data", **Then** the system marks all of that user's data as verified and confirms the action.
5. **Given** any user is searched, **When** their card is shown, **Then** all available profile fields are displayed (UID, custom ID, name, Gold, Level, XP, banned status, join date, etc.).

---

### User Story 7 - Support Tickets Escalation Visibility and Role Routing (Priority: P1)

As a Moderator escalating a ticket, I want the "Select Admin" dropdown to show names in readable (dark) text, include both Admins and the Owner, and route the escalation to a Role rather than a specific individual, so escalation is effective and legible.

**Why this priority**: White-on-white text makes the dropdown unusable. Missing owner/admin options block escalation. Routing to a role rather than an individual ensures the escalation is always handled even if one person is unavailable.

**Independent Test**: Open the Escalate modal as a Moderator → Dropdown text is clearly visible → "Admin" and "Owner" roles are listed → Selecting one escalates the ticket to all members of that role.

**Acceptance Scenarios**:

1. **Given** a Moderator opens the Escalate modal, **When** the dropdown appears, **Then** the option text is dark/readable against the background (not white on white).
2. **Given** the escalation dropdown is open, **When** the Moderator looks at the options, **Then** both "Admin" and "Owner" are listed as escalation targets.
3. **Given** a Moderator selects "Admin" and escalates, **When** the escalation is submitted, **Then** it is routed to all staff members with the Admin role, not a specific named person.
4. **Given** a permission-denied error currently blocks ticket reads, **When** the Firestore security rules are updated, **Then** Moderators can read and act on open tickets without errors.

---

### User Story 8 - Moderators and Admins Can Reply to Tickets (Priority: P1)

As a Moderator or Admin, I want to be able to reply to support tickets without encountering permission errors, and I want Admins to be able to see all open tickets (currently they cannot).

**Why this priority**: Staff who cannot reply to or view tickets cannot perform their core job function, rendering the ticket system broken for half the staff hierarchy.

**Independent Test**: Log in as a Moderator, open a ticket, type a reply → Reply posts successfully with no error. Log in as Admin → Open tickets are visible in the list.

**Acceptance Scenarios**:

1. **Given** a Moderator is viewing an open ticket, **When** they type and submit a reply, **Then** the reply is saved and visible in the ticket thread with no error.
2. **Given** an Admin logs into the admin panel, **When** they navigate to Support Tickets, **Then** they see the list of open tickets (same as Moderators currently see).
3. **Given** both Moderator and Admin can reply, **When** a reply is sent, **Then** the reply author's name and role are displayed alongside the message.

---

### User Story 9 - Broadcast via PRO SPY Bot with Image Support (Priority: P2)

As an Owner (or Admin), I want the Broadcast page to send announcements through the PRO SPY bot instead of a plain system notification, with support for uploading a cover image, so broadcasts look professional and polished.

**Why this priority**: Professional-looking announcements delivered via a bot feel premium and are more engaging than raw notification pushes.

**Independent Test**: Go to Broadcast page → Upload an image → Write a message → Send → PRO SPY bot message appears in all user chats with the image and styled text layout.

**Acceptance Scenarios**:

1. **Given** the Owner is on the Broadcast page, **When** they compose a message, **Then** they can optionally upload an image to be included in the broadcast.
2. **Given** a broadcast is sent with an image, **When** users receive it through the PRO SPY bot, **Then** the image appears prominently at the top of the message with text below.
3. **Given** a broadcast is sent, **When** any user receives it, **Then** it is displayed as a PRO SPY bot message with a professional announcement layout (clear title, styled body, optional image).
4. **Given** a broadcast has no image, **When** it is sent, **Then** it still appears as a styled PRO SPY announcement (not a raw text dump).
5. **Given** the Owner is composing a broadcast, **When** they preview it, **Then** they see an accurate preview of how the message will appear to end users.

---

### User Story 10 - Staff Activity Log: Permission Fix and Date Filtering (Priority: P1)

As an Owner, I want the Staff Activity Log to load without permission errors and display a complete, chronological log of all staff actions, filterable by date so I can review what any staff member did on any specific past day.

**Why this priority**: A completely broken log page (permission-denied error) provides zero visibility. Date filtering is essential for accountability and retrospective review.

**Independent Test**: Open Staff Activity Log as Owner → No permission error → Actions from Moderators, Admins, and the Owner are listed → Select a past date → Only actions from that day are shown.

**Acceptance Scenarios**:

1. **Given** the Owner navigates to Staff Activity Log, **When** the page loads, **Then** no permission-denied error appears and the log loads successfully.
2. **Given** a log is loaded, **When** the Owner views it, **Then** entries from Moderators, Admins, and the Owner are all present, each showing the staff member's name, action type, target (if applicable), and timestamp.
3. **Given** a date picker or dropdown is at the top of the log, **When** the Owner selects a specific date (e.g., the 30th), **Then** only log entries from that date are displayed.
4. **Given** no actions were taken on a selected date, **When** the Owner selects that date, **Then** a clear "No activity on this date" message is shown.
5. **Given** new staff actions occur, **When** they are performed, **Then** they are immediately recorded in the log with the correct timestamp and actor identity.

---

### User Story 11 - Comprehensive Code Audit and Bug Fixes (Priority: P2)

As the Owner/Developer, I want a thorough review of all admin panel code for logical inconsistencies, permission mismatches, broken functionality, and Firestore rule gaps, followed by targeted fixes for each discovered issue.

**Why this priority**: Undetected bugs compound over time and erode the reliability of the entire admin system. A proactive audit prevents future regressions.

**Independent Test**: After the audit, each previously broken feature (listed in stories 1–10) works without errors. No new console errors appear on any admin panel page.

**Acceptance Scenarios**:

1. **Given** the audit is complete, **When** the Owner navigates through every admin panel page, **Then** no console errors are logged relating to permissions, undefined variables, or missing data.
2. **Given** all Firestore security rules are reviewed, **When** rules are updated, **Then** all staff roles can access exactly the data they are authorized to access and nothing more.
3. **Given** any logical inconsistency is found (e.g., wrong data field being read), **When** the fix is applied, **Then** the UI reflects accurate, real-time data from the source of truth.

---

### Edge Cases

- What happens if a staff member is removed from their role while they are actively logged in and using the admin panel?
- How does the escalation route to "Admin" role when no Admins are currently assigned?
- What if a user has 0 Gold — does the search display "0" or show as missing/null?
- What if a broadcast image upload fails mid-send — does the text still go out or does the whole broadcast abort?
- What if the PRO SPY bot acknowledgement fails to send (e.g., user has blocked bots or their chat doesn't exist)?
- What happens when viewing the Staff Activity Log for a date before the logging system was in place?
- What if an Admin tries to Ban themselves or the Owner via the User search — should that be blocked?

---

## Requirements *(mandatory)*

### Functional Requirements

**Staff Management**
- **FR-001**: The Staff Management page MUST display all staff members (Admins, Moderators/Supervisors) associated with the owner's game family, not only the Owner.
- **FR-002**: The Owner MUST be able to remove any staff member directly from the Staff Management board.
- **FR-003**: The Owner MUST be able to add new staff members from the Staff Management board.
- **FR-004**: Staff additions and removals MUST take effect immediately without requiring a page refresh.

**PRO SPY Bot**
- **FR-005**: A new bot named "PRO SPY" MUST be created and registered in the system alongside existing bots via a `BOT_CHATS_CONFIG` entry.
- **FR-006**: PRO SPY is a **broadcast-only** bot. It does NOT require a Firestore user document, a `bot_` UID prefix, or leaderboard visibility. It is identified solely by `botId: 'pro_spy_bot'` in `botChatsCollection` documents.
- **FR-007**: PRO SPY MUST be able to send messages to individual users (for feedback acknowledgements) and to all users (for broadcasts) by writing to `botChatsCollection`.

**Staff Command Bot**
- **FR-041**: A dedicated staff-only administrative bot named "🔒 Staff Command" MUST be registered in `BOT_CHATS_CONFIG` with a `staffOnly: true` flag and `minRole: 'moderator'`.
- **FR-042**: The Staff Command bot MUST be **hidden from regular users** in the bot chat UI. It MUST only be visible and accessible to users whose `role` is `'admin'`, `'moderator'`, or `'owner'`.
- **FR-043**: The Staff Command bot MUST deliver administrative alerts (such as ticket escalation notifications) to targeted staff members by writing to `botChatsCollection` with `botId: 'staff_command_bot'`. It is the **only** internal bot used for admin notifications; existing bots (`detective_bot`, `love_bot`) are left untouched.

**Feedback Inbox**
- **FR-008**: Every feedback entry in the Feedback Inbox MUST display the personal display name of the person who submitted the feedback, regardless of their staff role.
- **FR-009**: Each feedback entry MUST have an "Acknowledge" button visible to the Owner.
- **FR-010**: Clicking "Acknowledge" MUST send a PRO SPY bot message to the feedback submitter containing a thank-you and confirmation their feedback was seen.
- **FR-011**: After an acknowledgement is sent, the "Acknowledge" button MUST be disabled or replaced with a "Acknowledged" indicator to prevent duplicate sends.

**Active Staff Team Widget**
- **FR-012**: The "👮 Active Staff Team" widget on the Admin Panel home MUST query and display the real-time online status of all staff members.
- **FR-013**: Staff members are considered "online" if their `lastActive` Firestore timestamp is within exactly **5 minutes** of the current time. This is a hardcoded constant: `Date.now() - 5 * 60 * 1000`. No configuration option is required.
- **FR-014**: The widget MUST show a "No staff currently online" state when no staff are detected as active.

**User Search (Users Page)**
- **FR-015**: The Gold amount shown for a searched user MUST exactly match the value stored in their profile record (no rounding, no caching).
- **FR-016**: The Level displayed for a searched user MUST accurately reflect their current level as computed from their XP/level field.
- **FR-017**: The Owner MUST see a "Ban User" action button on every searched user's profile (excluding Owner themselves).
- **FR-018**: The Owner MUST see a "Verify Data" action button on every searched user's profile.
- **FR-019**: The search result card MUST display all available user profile fields: UID, custom ID, display name, Gold, Level, XP, ban status, join date, and any other stored attributes.

**Support Tickets — Escalation**
- **FR-020**: The "Select Admin" dropdown in the Escalate modal MUST render option text in a color that is legible against the dropdown background.
- **FR-021**: The escalation target dropdown MUST include both "Admin (Role)" and "Owner (Role)" as options — not individual names. The ticket document stores the role string (`escalatedTo: 'admin'` or `'owner'`), not a UID.
- **FR-022**: When a Moderator escalates to "Admin", the escalation MUST be delivered to **all users with the Admin role** via a **Staff Command bot** (`staff_command_bot`) message written to `botChatsCollection` for each admin-role user. The `detective_bot` MUST NOT be modified or used for this purpose — it continues to operate exactly as it does today. The escalation message must include the ticket subject, the escalating moderator's name, and instructions to open their Tickets tab.
- **FR-022a**: Before submitting an escalation to "Admin", the system MUST check if any Admin-role users exist. If none are found, a **warning dialog** MUST appear to the Moderator: "No Admins are currently assigned. Do you want to escalate to Owner instead?" with Confirm/Cancel options.
- **FR-023**: The `staff_activity_log` Firestore collection CREATE rule MUST be updated from `isOwnerUID()` to `isStaff()`, allowing Moderators and Admins to write their own action records. This resolves cascading permission errors across Tickets, Broadcast, and the Activity Log.

**Support Tickets — Replies and Visibility**
- **FR-024**: Moderators MUST be able to submit replies to open tickets without encountering a permission error.
- **FR-025**: Admins MUST be able to view the list of open support tickets.
- **FR-026**: Both Moderators and Admins MUST be able to add replies to tickets, with the reply storing the responder's name and role.

**Broadcast**
- **FR-027**: The Broadcast page MUST send messages via the PRO SPY bot rather than a raw system notification.
- **FR-028**: The Broadcast compose form MUST include an optional image upload field.
- **FR-029**: When a broadcast is sent with an image, the PRO SPY bot message MUST include the image displayed before the text body.
- **FR-030**: The broadcast message MUST be rendered in a styled, professional layout (titled announcement format) when received by users.
- **FR-031**: The Broadcast compose page MUST show a preview of how the message will look before sending.

**Staff Activity Log**
- **FR-032**: The Staff Activity Log page MUST load without a permission-denied error for the Owner.
- **FR-033**: The log MUST display entries from all staff roles: Owner, Admin, Moderator.
- **FR-034**: Each log entry MUST show: staff member name, role, action type, relevant target/subject (if applicable), and UTC timestamp.
- **FR-035**: A date picker or date-filter dropdown MUST appear at the top of the Staff Activity Log page.
- **FR-036**: When a date is selected, the log MUST show ONLY entries from that calendar day.
- **FR-037**: All staff actions performed across the admin panel MUST be automatically recorded in the activity log with the correct actor and timestamp.

**Code Audit**
- **FR-038**: A systematic review MUST be performed across all admin panel JavaScript files to identify permission mismatches, incorrect Firestore field reads, undefined variable accesses, and broken UI states.
- **FR-039**: Firestore security rules MUST be audited and updated to reflect the correct read/write permissions for Owner, Admin, and Moderator roles.
- **FR-040**: All identified issues from the audit MUST be resolved before the feature branch is merged.

### Key Entities

- **Staff Member**: A user with a role of Owner, Admin, or Moderator. Stored in Firestore under the family/staff or roles collection. Attributes: userId, displayName, role, addedAt, isOnline/lastActive.
- **PRO SPY Bot**: A bot user account with a `bot_` prefixed UID, a name field of "PRO SPY", and an avatar. Capable of sending direct messages and broadcast messages.
- **Feedback Entry**: A document in the feedback collection. Attributes: submitterId (user UID), submitterName (user display name), content, submittedAt, isAcknowledged (boolean), acknowledgedAt.
- **Support Ticket**: A document in the tickets collection. Attributes: creatorId, subject, description, status (open/escalated/closed), escalatedTo (role name), replies (array of {authorId, authorName, authorRole, content, timestamp}).
- **Broadcast Message**: Composed by Owner/Admin. Attributes: content (text), imageUrl (optional), sentAt, sentBy, deliveryChannel ("PRO_SPY_BOT").
- **Activity Log Entry**: A document in the staffLogs collection. Attributes: actorId, actorName, actorRole, actionType, target (optional), details (optional), timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of staff members added to a family appear on the Staff Management board immediately after being added, with no page refresh required.
- **SC-002**: 100% of feedback entries in the Feedback Inbox display the submitter's personal display name instead of their role title.
- **SC-003**: The "Acknowledge" PRO SPY message is delivered to the feedback submitter within 5 seconds of the Owner clicking the button.
- **SC-004**: The Active Staff Team widget reflects real-time staff online status with no more than a 60-second delay.
- **SC-005**: Gold and Level values displayed on the User Search result card match the stored values with 100% accuracy (zero rounding or stale data).
- **SC-006**: 0 permission-denied errors appear in the browser console when any authorized staff role performs their permitted actions across all admin panel pages.
- **SC-007**: Moderators and Admins successfully submit ticket replies in 100% of attempts with no error dialogs.
- **SC-008**: Broadcasts sent via PRO SPY bot are received by 100% of targeted users within a reasonable delivery window.
- **SC-009**: The Staff Activity Log loads within 3 seconds for date ranges containing up to 500 entries, and date filtering reduces visible entries to only those matching the selected day.
- **SC-010**: The code audit identifies and resolves all critical (permission-denied, data rendering, broken action buttons) issues across all admin panel pages before merge.

---

## Assumptions

- The project uses Firebase Firestore for all data storage; Firestore security rules are the primary access control mechanism.
- Staff roles (Owner, Admin, Moderator) are stored in a consistent Firestore structure that can be queried to populate the Staff Management board and the Active Staff Team widget.
- PRO SPY is a broadcast-only bot. It does NOT require a Firestore user document or `bot_` UID prefix. It exists solely as a `BOT_CHATS_CONFIG` entry and writes messages to `botChatsCollection`. PRO SPY does NOT appear on leaderboards.
- User online/presence status is already tracked via a `lastActive` field in user documents; the Active Staff Team widget will read this field and apply a **strict 5-minute threshold** (`Date.now() - 5 * 60 * 1000`) to determine online status.
- The feedback collection already stores a `userId` field that can be used to look up the submitter's current `displayName` from the users collection at read time; the bug is that the inbox is rendering the stale `userName` field stored at submission time.
- **Root cause of permission-denied errors**: The `staff_activity_log` Firestore collection restricts CREATE to `isOwnerUID()` only. Because every staff action calls `logStaffAction()` which writes to this collection, the failed write makes the enclosing try/catch surface a visible permission error. The `support_tickets` rule already correctly uses `isStaff()`. If ticket errors persist after fixing the log CREATE rule, the fallback is to audit the `isStaff()` function and verify the `role` field is present on all staff accounts.
- The Broadcast page already exists and sends messages; the change is to route delivery through the PRO SPY bot and add image support.
- All Staff Activity Log entries will be written at the time of action in the admin panel code (client-side logging to Firestore); there is no server-side trigger intercepting all actions.
- The Owner cannot be banned or removed by anyone (including themselves via search).
- Mobile responsiveness is out of scope for this feature; all changes target the admin panel which is desktop-first.
