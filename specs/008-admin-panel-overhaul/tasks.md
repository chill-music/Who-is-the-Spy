# Tasks: Admin Panel Overhaul (008)

**Input**: Design documents from `/specs/008-admin-panel-overhaul/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅
**Tests**: Not requested — no test tasks generated.
**Branch**: `008-admin-panel-overhaul`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2…)
- All file paths are from repo root (`c:\Users\sheha\OneDrive\Desktop\Who-is-the-Spy-og\`)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.
These two changes unblock the permission errors that cascade across Stories 2, 5, 6, 7, and 8.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 Fix Firestore security rules: change `staff_activity_log` CREATE from `isOwnerUID()` to `isStaff()` in `firebase.txt` (lines 91–95) — this single change unblocks Moderator/Admin ticket replies, activity log writes, and broadcast logging
- [ ] T002 Add PRO SPY bot config entry to `BOT_CHATS_CONFIG` array in `src/01-config.js` (after line 252) with `id: 'pro_spy_bot'`, purple theme (`color: '#8b5cf6'`), `official: true`, `readOnly: true`
- [ ] T035 Add Staff Command bot config entry to `BOT_CHATS_CONFIG` in `src/01-config.js` (directly after PRO SPY entry) with `id: 'staff_command_bot'`, red/amber theme (`color: '#f59e0b'`), `official: true`, `readOnly: true`, `staffOnly: true`, `minRole: 'moderator'` — this new field signals the UI layer to hide it from regular users

**Checkpoint**: After T001, T002 & T035 — deploy updated rules to Firebase Console. PRO SPY and Staff Command bot configs are available globally via `window.BOT_CHATS_CONFIG`.

---

## Phase 1b: Staff-Only Bot UI Gating

**Purpose**: Ensure the Staff Command bot is hidden from regular users at the UI layer.

- [ ] T036 Add `staffOnly` bot filtering in `src/features/app/components/GlobalModals.js`: add `showStaffCommandBot` / `setShowStaffCommandBot` state vars (lines 31–32, mirroring `showDetectiveBot`). Add a render block for `staff_command_bot` using `BotChatModal` — guarded by `['owner','admin','moderator'].includes(currentUserData?.role)`. Regular users never see the state setter wired to any UI button.

---

## Phase 2: User Story 1 — Fix User Search Accuracy (Priority: P1) 🎯 MVP

**Goal**: When Owner/Admin searches for a user, the displayed Gold (currency) and Level values are accurate. Ban and Verify action buttons added.

**Independent Test**: Search any user → Gold value matches their actual wallet. Ban button opens modal. Verify button marks the user.

- [ ] T003 [US1] Fix Gold field: change `searchResult.gold || 0` → `searchResult.currency || 0` in `src/components/admin/UserManagementSection.js` (line 76)
- [ ] T004 [P] [US1] Expand user data card in `src/components/admin/UserManagementSection.js`: add `customId`, `role`, `xp`, `charisma`, and `createdAt` fields below the Gold/Level grid
- [ ] T005 [P] [US1] Add "🔨 Ban User" action button (visible when `myRole === 'owner'`) in `src/components/admin/UserManagementSection.js` — opens inline ban form (reason input + duration picker) with `handleBan()` that writes ban fields to Firestore and calls `logStaffAction('BAN_USER')`
- [ ] T006 [P] [US1] Add "✅ Verify Account" action button (visible when `myRole === 'owner'`) in `src/components/admin/UserManagementSection.js` — writes `{ verified: true, verifiedBy: uid, verifiedAt: TS() }` to the user doc and calls `logStaffAction('VERIFY_USER')`

**Checkpoint**: User Story 1 fully functional — Gold shows correct, Ban and Verify buttons work.

---

## Phase 3: User Story 2 — Staff Management Visibility (Priority: P1)

**Goal**: All staff (Owner, Admin, Moderator) appear on the Staff Management board. Owner can add new staff by UID. Any staff member can be removed.

**Independent Test**: Add a user as Moderator → they appear in the Staff list immediately. Remove them → they disappear.

- [ ] T007 [US2] Audit `src/components/admin/StaffManagementSection.js`: verify `loadStaff()` queries `where('role', 'in', ['owner', 'admin', 'moderator'])`. Add `console.log('[StaffMgmt] loaded:', list)` to confirm Firestore returns. Check if any existing staff have role in a nested `staffRole` object vs flat `role` field; if so, add normalization.
- [ ] T008 [US2] Add "➕ Add Staff Member" form in `src/components/admin/StaffManagementSection.js`: UID input + role `<select>` (Admin/Moderator) + confirm button. On submit: write `{ role: selectedRole }` to `usersCollection.doc(uid)` and call `logStaffAction('ASSIGN_ROLE')`
- [ ] T009 [US2] Fix "🗑️ Remove" button in `src/components/admin/StaffManagementSection.js`: ensure handler writes `{ role: 'user' }` to Firestore AND calls `logStaffAction('REMOVE_STAFF')`. Add a confirmation dialog before removing.

**Checkpoint**: User Story 2 fully functional — all staff visible, add/remove works.

---

## Phase 4: User Story 3 — PRO SPY Bot & Feedback Acknowledgement (Priority: P1)

**Goal**: PRO SPY bot utility exists. Staff can acknowledge feedback from the Feedback Inbox, which sends a PRO SPY bot message to the user.

**Independent Test**: Owner opens Feedback Inbox → clicks "Acknowledge" on a feedback entry → the submitter receives a PRO SPY bot message. Feedback `status` updates to `'acknowledged'`.

- [ ] T010 [US3] Add generalized `sendBotMessage(botId, toUserId, message, options)` utility to `src/components/admin/AdminUtils.js`. Writes `{ botId, toUserId, message, fromName: options.fromName||botId, type:options.type||'system', imageURL:options.imageURL||null, read:false, timestamp:TS() }` to `botChatsCollection`. Also add named wrappers: `sendProSpyBotMessage = (u,m,o) => sendBotMessage('pro_spy_bot',u,m,{...o,fromName:'PRO SPY'})` and `sendStaffCommandBotMessage = (u,m,o) => sendBotMessage('staff_command_bot',u,m,{...o,fromName:'\ud83d\udd12 Admin HQ'})`. Export all three as `window.sendBotMessage`, `window.sendProSpyBotMessage`, `window.sendStaffCommandBotMessage`. The `detective_bot` and `love_bot` are **not touched**. Add JSDoc `@param` and `@returns` annotations to `sendBotMessage`. Wrap in try/catch with `console.error` on failure.
- [ ] T011 [P] [US3] Fix sender name display in `src/components/admin/FeedbackInboxSection.js`: perform live lookup `usersCollection.doc(f.userId).get()` for each feedback entry to get current `displayName`. Cache results in a `userNames` state map `{ [uid]: displayName }`.
- [ ] T012 [P] [US3] Add "👁️ Acknowledge" button per feedback entry in `src/components/admin/FeedbackInboxSection.js`. On click: (1) call `window.sendProSpyBotMessage(f.userId, thankYouMsg, { type:'feedback_ack' })`, (2) update feedback doc with `{ status:'acknowledged', acknowledgedAt:TS(), acknowledgedBy:currentUser.uid }`, (3) show "✅ Acknowledged" in-place.
- [ ] T013 [US3] Verify `FeedbackInboxSection` in `src/18-admin-panel.js` receives `currentUser` prop — confirm the `...props` spread on line 36 includes it. Add `currentUserData` destructure guard inside `FeedbackInboxSection` if missing.

**Checkpoint**: User Story 3 fully functional — feedback acknowledgement sends PRO SPY bot message.

---

## Phase 5: User Story 4 — Active Staff Team Widget (Priority: P2)

**Goal**: The "👮 Active Staff Team" widget in Admin Overview shows all staff in real-time, with online/offline indicators.

**Independent Test**: Log in as Admin → Owner opens Admin Panel → Admin appears in Active Staff Team widget within seconds.

- [ ] T014 [US4] Convert staff fetch in `src/components/admin/AdminOverview.js` from `.get().then(...)` (one-time) to `.onSnapshot(...)` (real-time listener). Return the unsubscribe from `useEffect` to prevent memory leaks.
- [ ] T015 [US4] Add online indicator in `src/components/admin/AdminOverview.js`: compare `staff.lastActive` to `Date.now() - 5 * 60 * 1000`. Show 🟢 for online, ⚫ for offline. Fallback gracefully if `lastActive` not present.

**Checkpoint**: Active Staff Team widget updates in real-time.

---

## Phase 6: User Story 5 — Support Tickets (Priority: P2)

**Goal**: Admins can view all open tickets. Moderators can reply. Escalation dropdown is legible. Escalation routes to role, not individual UID.

**Independent Test**: Moderator opens Tickets → tickets load. Reply sends with no error. Escalation dropdown text is visible. Submits escalation → ticket updated with `escalatedTo: 'admin'`.

- [ ] T016 [P] [US5] Fix escalation dropdown text visibility in `src/components/admin/TicketsSection.js`: add explicit `background:'#1e293b'` and `color:'#e5e7eb'` to the `<select>` element style, and same colors to each `<option>` element.
- [ ] T017 [P] [US5] Replace individual-UID escalation with role-based targets in `src/components/admin/TicketsSection.js`: remove `fetchStaffList()` call from escalation flow. Replace dropdown with two static options: `Admin Team` (value: `'admin'`) and `Owner` (value: `'owner'`). Update `handleEscalate()` to write `{ escalatedTo: selectedRole, escalatedToName: roleLabel }`.
- [ ] T037 [US5] Add no-admin guard to `handleEscalate()` in `src/components/admin/TicketsSection.js`: before submitting an escalation to `'admin'`, query `usersCollection.where('role','==','admin').limit(1).get()`. If the snapshot is empty, show a confirmation dialog: "⚠️ No Admins are currently assigned. Escalate to Owner instead?" with Confirm (escalate to Owner) and Cancel options. Only proceed with the original target if admins exist.
- [ ] T038 [US5] Add escalation notification delivery in `src/components/admin/TicketsSection.js`: after the ticket doc is written in `handleEscalate()`, query all admin-role users (or owner-role if escalated to owner) from `usersCollection`, and call `window.sendStaffCommandBotMessage(staffUid, notificationMsg, { type:'escalation' })` for each one. The `detective_bot` is **not used or modified**. The notification message must include the ticket subject, the escalating moderator's name, and instructions to open their Tickets tab. This implements FR-022.
- [ ] T018 [US5] Ensure Admin role can view and reply: verify `loadTickets` `onSnapshot` has no hidden role filter blocking admin read. Pass `staffRole` to `logStaffAction()` inside `sendReply()` (now succeeds after T001 fix).

**Checkpoint**: Ticket workflow functional for Moderator and Admin — no errors, escalation visible and role-based.

---

## Phase 7: User Story 6 — Activity Log Date Filtering (Priority: P2)

**Goal**: Owner can filter Staff Activity Log by date. Log entries include staff role badges.

**Independent Test**: Owner opens Logs → entries visible. Selects a past date → only that day's entries shown. Clears filter → last 200 entries return.

- [ ] T019 [US6] Update `logStaffAction()` in `src/components/admin/AdminUtils.js` to accept and persist an optional 7th `staffRole` parameter: add `staffRole: staffRole || 'staff'` to the `staffLogCollection.add()` payload.
- [ ] T020 [P] [US6] Add date filter UI to `src/components/admin/ActivityLogSection.js`: add `var [selectedDate, setSelectedDate] = useState('')` state. Render `<input type="date">` styled with `className:'input-dark'` and an "✕ Clear" button above the log list.
- [ ] T021 [P] [US6] Add conditional Firestore query in `src/components/admin/ActivityLogSection.js`: when `selectedDate` is set, build `startTs`/`endTs` with `firebase.firestore.Timestamp.fromDate()` and query with `.where('timestamp','>=',startTs).where('timestamp','<=',endTs).orderBy('timestamp','desc')`. When empty, use default `.orderBy('timestamp','desc').limit(200)`. Add `selectedDate` to `useEffect` deps.
- [ ] T022 [P] [US6] Add staff role badge per log entry in `src/components/admin/ActivityLogSection.js`: render a small colored pill next to `log.staffName` using `ROLE_CONFIG[log.staffRole]?.color` (or `#9ca3af` fallback) and `ROLE_CONFIG[log.staffRole]?.icon` for the role emoji.

**Checkpoint**: Activity log shows date-filtered entries with role badges.

---

## Phase 8: User Story 7 — Broadcast via PRO SPY Bot with Images (Priority: P2)

**Goal**: Broadcasts are delivered as PRO SPY bot messages. Owner can attach an image.

**Independent Test**: Owner sends broadcast → PRO SPY bot message appears in all users' Bot Chats. With image attached → image renders in bot message.

- [ ] T023 [US7] Add image upload UI to `src/components/admin/BroadcastSection.js`: add `imageFile`, `imageURL`, `uploading`, `previewURL` state vars. Add file input (styled as button, `accept="image/*"`). On select: set `previewURL = URL.createObjectURL(file)` and store `imageFile`.
- [ ] T024 [US7] Implement Firebase Storage upload inside `handleBroadcast()` in `src/components/admin/BroadcastSection.js`: if `imageFile` is set, upload to `storage.ref('broadcast-images/' + Date.now() + '-' + imageFile.name)` and call `.getDownloadURL()`. Run before batch build.
- [ ] T025 [US7] Replace `notificationsCollection` batch writes with `botChatsCollection` batch writes in `src/components/admin/BroadcastSection.js`: each doc payload → `{ botId:'pro_spy_bot', toUserId:doc.id, message:text, message_en:msg||text, message_ar:msgAr||text, fromName:'PRO SPY', type:'broadcast', imageURL:imageURL||null, read:false, timestamp:TS() }`.
- [ ] T026 [US7] Add image preview card to `src/components/admin/BroadcastSection.js`: when `previewURL` is set, render a preview block showing bot avatar (🕵️), bot name "PRO SPY", image thumbnail, and message text — so Owner can see how it'll look before sending.

**Checkpoint**: Broadcast delivers via PRO SPY bot with optional image.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T027 [P] Git commit: `fix(admin): Firestore rules + PRO SPY bot config` — stages T001–T002 changes
- [ ] T028 [P] Git commit: `fix(admin): user search currency field + staff management` — stages T003–T009
- [ ] T029 [P] Git commit: `feat(admin): PRO SPY bot utility + feedback acknowledge` — stages T010–T013
- [ ] T030 [P] Git commit: `fix(admin): active staff widget real-time + ticket escalation` — stages T014–T018
- [ ] T031 [P] Git commit: `feat(admin): activity log date filter + broadcast images` — stages T019–T026
- [ ] T032 Run full manual verification checklist (20 scenarios from `plan.md`) — fix any failures found
- [ ] T033 [P] Update `specs/008-admin-panel-overhaul/plan.md` — mark implemented sections, note any deviations
- [ ] T034 Merge `008-admin-panel-overhaul` branch into main after all verification passes

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (T001–T002–T035) ← Start here FIRST. No dependencies.
         ↓
Phase 1b (T036)          ← Staff Command bot UI gating. Depends on T035.
         ↓ BLOCKS all other phases
Phase 2  (T003–T006)     ← US1: User Search (can start after T001)
Phase 3  (T007–T009)     ← US2: Staff Management [parallel with Phase 2]
Phase 4  (T010–T013)     ← US3: Feedback + Bot. T010 must come before T012.
Phase 5  (T014–T015)     ← US4: Staff Widget [parallel]
Phase 6  (T016–T018 + T037–T038) ← US5: Tickets [T037 before T038; T016+T017 parallel]
Phase 7  (T019–T022)     ← US6: Activity Log [T019 before T021–T022]
Phase 8  (T023–T026)     ← US7: Broadcast [sequential; needs T010 for bot pattern]
Phase 9  (T027–T034)     ← Polish: After all story phases complete
```

### Parallel Opportunities at Project Start

After T001+T002+T035+T036 are done, these can all run simultaneously:

```
T003 (UserManagementSection — currency fix)
T007 (StaffManagementSection — audit)
T010 (AdminUtils — sendBotMessage + wrappers)
T014 (AdminOverview — onSnapshot)
T016 (TicketsSection — dropdown color)
T019 (AdminUtils — logStaffAction staffRole)
T023 (BroadcastSection — image upload UI)
```

---

## Implementation Strategy

### MVP First (Minimum: Fix All Blockers)

1. Complete **Phase 1** (T001–T002–T035) → Deploy rules + bot configs to Firebase
2. Complete **Phase 1b** (T036) → Staff Command bot hidden from regular users
3. Complete **T003** → User search Gold is correct
4. Complete **T016–T018** + **T037–T038** → Tickets work, escalation notifies admins
5. **STOP and VALIDATE** → Zero permission errors in Admin Panel console

### Full Delivery

6. T004–T006 (User Search extras)
7. T007–T009 (Staff Management)
8. T010–T013 (PRO SPY Bot + Feedback)
9. T014–T015 (Active Staff Widget)
10. T019–T022 (Activity Log dates)
11. T023–T026 (Broadcast images)
12. T027–T034 (Polish + merge)

---

## Task Count Summary

| Phase | Tasks | Parallelizable | Story |
|-------|-------|---------------|-------|
| Phase 1: Foundational | 3 (T001, T002, T035) | 2 | — |
| Phase 1b: Bot UI Gate | 1 (T036) | 0 | — |
| Phase 2: US1 User Search | 4 | 3 | US1 |
| Phase 3: US2 Staff Management | 3 | 0 | US2 |
| Phase 4: US3 Feedback + Bot | 4 | 2 | US3 |
| Phase 5: US4 Staff Widget | 2 | 0 | US4 |
| Phase 6: US5 Tickets | 5 (T016–T018 + T037–T038) | 2 | US5 |
| Phase 7: US6 Activity Log | 4 | 3 | US6 |
| Phase 8: US7 Broadcast | 4 | 0 | US7 |
| Phase 9: Polish | 8 | 5 | — |
| **TOTAL** | **38** | **17** | |
