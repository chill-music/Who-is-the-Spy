# Implementation Plan: Admin Panel Overhaul

**Branch**: `008-admin-panel-overhaul` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-admin-panel-overhaul/spec.md`

> [!IMPORTANT]
> **STATUS: ✅ FULLY IMPLEMENTED** — All T001–T038 tasks completed. Branch ready for merge.
> Last commit: `feat(admin): T023-T026 - PRO SPY broadcast with image attach + live preview`

---

## Implementation Summary (completed 2026-04-05)

| Phase | Tasks | Status | Files Changed |
|-------|-------|--------|---------------|
| 1 — Permissions + Bot Infra | T001, T002, T035, T036 | ✅ Done | `firebase.txt`, `01-config.js`, `useAppUIState.js`, `GlobalModals.js` |
| 2 — User Search | T003–T006 | ✅ Done | `UserManagementSection.js` |
| 3 — Staff Management | T007–T009 | ✅ Done | `StaffManagementSection.js` |
| 4 — Feedback + Bot | T010–T013 | ✅ Done | `AdminUtils.js`, `FeedbackInboxSection.js` |
| 5 — Active Staff Widget | T014–T015 | ✅ Done | `AdminOverview.js` |
| 6 — Tickets | T016–T018, T037–T038 | ✅ Done | `TicketsSection.js` |
| 7 — Activity Log | T019–T022 | ✅ Done | `AdminUtils.js`, `ActivityLogSection.js` |
| 8 — Broadcast | T023–T026 | ✅ Done | `BroadcastSection.js` |

### Deviations from Original Plan

1. **Firebase Storage (T024)**: Firebase Storage is not configured in this project. Broadcast images are stored as base64 DataURLs (`FileReader.readAsDataURL`) directly in the Firestore document, with a 500KB size guard to prevent oversized writes. If Storage is added later, replace `imageDataURL` with a Storage upload and `getDownloadURL()`.
2. **logStaffAction (T019)**: Extended with an optional 7th `staffRole` parameter (backwards-compatible — all existing 6-arg callers unchanged).
3. **PRO SPY Bot**: Implemented as a `BOT_CHATS_CONFIG` entry (no real Firestore user document needed). Broadcast and feedback acknowledgements route through this bot ID.
4. **Staff Command Bot (Admin HQ)**: Also registered in `BOT_CHATS_CONFIG`. UI-gated: only renders for `owner`, `admin`, `moderator` roles. Receives ticket escalation alerts via `sendStaffCommandBotMessage`.
5. **Escalation (T037/T038)**: No-admin guard uses browser `confirm()` (no custom modal) for simplicity. Staff notifications use `Promise.allSettled()` so one failed send does not block escalation.

---


---

## Technical Context

**Language/Version**: Vanilla JavaScript (ES5/ES6 mixed, no bundler), React 18 (CDN)
**Primary Dependencies**: Firebase JS SDK v8 (compat), React 18 (CDN), ReactDOM 18 (CDN)
**Storage**: Firebase Firestore (NoSQL), Firebase Storage (for broadcast images)
**Testing**: Manual browser testing (no test framework)
**Target Platform**: Web browser (desktop-first, mobile-responsive)
**Project Type**: Single-page web application (PWA)
**Performance Goals**: Admin panel sections load within 2–3 seconds
**Constraints**: NO npm, NO import/export, NO module bundlers. All scripts loaded via `<script defer>` in `index.html`. Global scope via IIFE + `window.*` exports.
**Scale/Scope**: Single owner + up to ~10 staff members; up to 500 users

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ **Dead Code Prevention**: No new dead code will be introduced. All new functions are called at time of definition or wired to UI events. Old `gold` field reference will be removed, not left alongside `currency`.
- ✅ **Logic & Async Accountability**: All async functions will be wrapped in try/catch with explicit error logging via `console.error`. No empty catch blocks.
- ✅ **Structural Discipline (SOLID)**: Each change touches one responsibility. New `sendProSpyBotMessage` utility is a single-purpose function in AdminUtils.js. No deeply nested logic added.
- ✅ **Dependency Sanitization**: No new dependencies. Firebase Storage is already configured globally.
- ✅ **Type & Null Robustness**: All new field reads will use `|| 0` or `|| ''` fallbacks. Null checks before writing bot messages (verify `toUserId` exists before bot send).

---

## Project Structure

### Documentation (this feature)
```text
specs/008-admin-panel-overhaul/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code Affected
```text
src/
├── 01-config.js                          ← Add PRO SPY bot to BOT_CHATS_CONFIG
├── components/admin/
│   ├── AdminUtils.js                     ← Add sendProSpyBotMessage() utility
│   ├── AdminOverview.js                  ← Fix Active Staff Team: .get() → .onSnapshot()
│   ├── FeedbackInboxSection.js           ← Fix sender name + add Acknowledge button
│   ├── UserManagementSection.js          ← Fix gold→currency, add Ban/Verify buttons
│   ├── TicketsSection.js                 ← Fix escalation colors/roles, fix admin visibility
│   ├── ActivityLogSection.js             ← Fix permissions + add date filter UI
│   └── BroadcastSection.js              ← Route via PRO SPY bot + image upload
firebase.txt                              ← Fix Firestore security rules
```

**Structure Decision**: Single-project web app (Option 1). All admin components are co-located in `src/components/admin/`. New feature code follows the existing IIFE + window export pattern.

---

## Proposed Changes

### Group 1: Foundation (Firestore Rules + Config)

These changes are prerequisites for nearly everything else. The rules fix unblocks Moderator/Admin actions. The config fix enables the PRO SPY bot.

---

#### [MODIFY] `firebase.txt` — Firestore Security Rules

**Changes**:
1. `staff_activity_log`: Change `create` permission from `isOwnerUID()` to `isStaff()` so Moderators and Admins can log their own actions (currently the source of the cascading permission error).
2. `staff_activity_log`: Change `read` to allow ALL staff (not just Owner) so the ActivityLog page loads for all staff. Note: The spec says Owner-only for the log page UI — read access for staff is needed so the UI query doesn't fail for admins/mods who trigger a page load. The UI tab itself is restricted by `minRole: 'admin'` in `18-admin-panel.js`. Actually re-reading the spec: Owner owns the log page. Leave read as owner-only. **But the create must be open to all staff.**
3. `support_tickets` — no rule change: existing `isStaff()` check should already work. The real issue is the failed `logStaffAction` (write to staff_activity_log) inside `sendReply()` which causes the whole try/catch to fail and shows an error. Fixing rule #1 above will fix ticket replies simultaneously.

```
BEFORE (lines 90-95 of firebase.txt):
match /artifacts/{appId}/public/data/staff_activity_log/{logId} {
  allow read:   if isLoggedIn() && isOwnerUID();
  allow create: if isLoggedIn() && isOwnerUID();
  allow update: if false;
  allow delete: if false;
}

AFTER:
match /artifacts/{appId}/public/data/staff_activity_log/{logId} {
  allow read:   if isLoggedIn() && isOwnerUID();
  allow create: if isLoggedIn() && isStaff();
  allow update: if false;
  allow delete: if false;
}
```

---

#### [MODIFY] `src/01-config.js` — Add PRO SPY Bot Configuration

Add a third entry to `BOT_CHATS_CONFIG` array:
```javascript
{
  id: 'pro_spy_bot',
  name_ar: 'PRO SPY',
  name_en: 'PRO SPY',
  emoji: '🕵️',
  description_ar: 'الرسائل الرسمية من فريق PRO SPY',
  description_en: 'Official messages from the PRO SPY team',
  color: '#8b5cf6',
  glow: 'rgba(139,92,246,0.4)',
  photoURL: null,
  official: true,
  readOnly: true,
}
```

Also add `window.BOT_CHATS_CONFIG = BOT_CHATS_CONFIG;` export already exists at line 545 — no additional export needed.

---

### Group 2: AdminUtils.js — New Shared Utility

---

#### [MODIFY] `src/components/admin/AdminUtils.js`

Add a new `sendProSpyBotMessage(toUserId, message, options)` utility function. This function writes a bot message to `botChatsCollection` using the PRO SPY bot identity. Options include `{ imageURL, type }`.

```javascript
var sendProSpyBotMessage = async (toUserId, message, options) => {
    options = options || {};
    if (!toUserId || !message) return false;
    try {
        await botChatsCollection.add({
            botId: 'pro_spy_bot',
            toUserId: toUserId,
            message: message,
            fromName: 'PRO SPY',
            type: options.type || 'system',
            imageURL: options.imageURL || null,
            read: false,
            timestamp: TS()
        });
        return true;
    } catch (e) {
        console.error('[PRO SPY] sendProSpyBotMessage failed:', e);
        return false;
    }
};
window.sendProSpyBotMessage = sendProSpyBotMessage;
```

---

### Group 3: Bug Fixes — High Priority

---

#### [MODIFY] `src/components/admin/UserManagementSection.js`

**Bugs to fix**:
1. **Gold field**: Change `searchResult.gold || 0` → `searchResult.currency || 0`. Label stays "Gold" in UI but reads correct `currency` field.
2. **Level field**: `searchResult.level || 1` is correct but may be missing for users who never set it. Add XP display alongside.
3. **Ban button for Owner**: Add a "🔨 Ban User" button that opens a `BanPanelInline` modal for searched users (when `myRole === 'owner'`).
4. **Verify Data button**: Add a "✅ Verify Data" button that marks user document with `{ verified: true, verifiedBy: currentUser.uid, verifiedAt: TS() }`.
5. **Expanded profile card**: Add all available user data fields (customId, role, createdAt, ban status, XP, charisma).

**Implementation**: The section currently has no `myRole` check. Add `var myRole = window.getUserRole ? window.getUserRole(currentUserData, currentUser?.uid) : currentUserData?.role;` at the top of the component. Add `onOpenProfile` prop passthrough to allow profile viewing from search results.

---

#### [MODIFY] `src/components/admin/AdminOverview.js`

**Bug**: Active Staff Team widget uses `.get()` (one-time fetch) — does not update in real-time when staff come online/go offline.

**Fix**: Change the staff list fetch effect to use `.onSnapshot()` instead of `.get().then()`. Additionally, add online status indicator: compare `s.lastActive` to `Date.now() - 5*60*1000` (5 minutes threshold) to show a green/grey dot indicating online presence.

```javascript
// Change:
usersCollection.where('role', 'in', ['owner', 'admin', 'moderator'])
  .get().then(async (snap) => { ... })

// To:
var unsub = usersCollection.where('role', 'in', ['owner', 'admin', 'moderator'])
  .onSnapshot(async (snap) => { ... }, () => setStaffLoading(false));
return unsub;
```

---

#### [MODIFY] `src/components/admin/FeedbackInboxSection.js`

**Bug 1 — Sender Name**: The `f.userName` field is stored at submission time. If a staff member's `displayName` equals their role label, the wrong name appears. Fix: perform a live lookup for each feedback entry using `f.userId` to get the current `displayName` from `usersCollection`.

**Bug 2 — Missing Acknowledge button**: Add an "Acknowledge" button per feedback entry (visible to Owner only). Clicking it:
1. Sends a PRO SPY bot message to `f.userId` (via `window.sendProSpyBotMessage`)
2. Updates the feedback document: `{ status: 'acknowledged', acknowledgedAt: TS(), acknowledgedBy: currentUser.uid }`
3. Disables the button (shows "✅ Acknowledged" after sending)

**Props addition**: This component needs `currentUser` and `currentUserData` props. Update `18-admin-panel.js` renderSection call for 'feedback' to pass them (already passes via `...props` spread).

---

#### [MODIFY] `src/components/admin/TicketsSection.js`

**Bug 1 — Escalation dropdown invisible text**: Add `color: '#000'` or explicit dark color to `<option>` elements. Change the `<select>` style to include `background: '#1e293b'` and `color: '#e5e7eb'` to ensure legibility across browsers.

**Bug 2 — Escalation shows only Owner, not Admins**: The current code calls `window.fetchStaffList(['admin', 'owner'])` but only when `myRole === 'moderator'`. Fix by also calling it for `'admin'` role. Additionally, the dropdown currently shows individual staff names. Change it to show ROLE OPTIONS rather than individual names:
- Option 1: "🛡️ Admin (Role)" — value: `'admin'`
- Option 2: "👑 Owner (Role)" — value: `'owner'`
This removes the dependency on `fetchStaffList` for escalation target selection. The `escalatedTo` Firestore field now stores the role string, not a UID.

**Bug 3 — Moderator reply permission error**: Root cause is `logStaffAction()` inside `sendReply()` failing because `staff_activity_log` CREATE was owner-only. Fixed by Group 1 Firestore rules change. No code change needed here.

**Bug 4 — Admin can't see open tickets**: The Firestore rule `allow read: if isLoggedIn() && (resource.data.userId == request.auth.uid || isStaff())` should already allow staff. The issue is the `logStaffAction` write failure causing the entire `sendReply` try/catch to fail, which makes it look like read is failing. The Group 1 fix resolves this. Additionally verify: the `onSnapshot` for tickets fires and Admins have the `role` field set in Firestore before the read.

---

### Group 4: New Features

---

#### [MODIFY] `src/components/admin/ActivityLogSection.js`

**Fix 1 — Permissions**: Already fixed by Group 1 (staff_activity_log create permission). Owner-only read is correct.

**Feature — Date Filtering**: Add a date picker at the top of the component.

State additions:
```javascript
var [selectedDate, setSelectedDate] = useState('');
```

Query change: When `selectedDate` is set, compute start/end of that calendar day and filter the Firestore query:
```javascript
var startTs = firebase.firestore.Timestamp.fromDate(new Date(selectedDate + 'T00:00:00'));
var endTs   = firebase.firestore.Timestamp.fromDate(new Date(selectedDate + 'T23:59:59'));
staffLogCollection
  .where('timestamp', '>=', startTs)
  .where('timestamp', '<=', endTs)
  .orderBy('timestamp', 'desc')
  .onSnapshot(...)
```

UI addition: An `<input type="date">` styled with `className: 'input-dark'` above the log list. A "Clear" button to return to default view (last 200 entries).

Also add actor role badge to each log entry (the existing log format stores `staffName` but not role — add a `staffRole` field when writing logs in `AdminUtils.js`).

**AdminUtils.js logStaffAction update**: Add `staffRole` parameter capture:
```javascript
var logStaffAction = async (staffUID, staffName, action, targetUID, targetName, details, staffRole) => {
    await staffLogCollection.add({
        staffUID, staffName, staffRole: staffRole || 'staff', action, ...
    });
};
```

---

#### [MODIFY] `src/components/admin/BroadcastSection.js`

**Feature — PRO SPY Bot Delivery**: Instead of writing to `notificationsCollection`, call `window.sendProSpyBotMessage(userId, message, { type: 'broadcast', imageURL })` for each user.

**Feature — Image Upload**: Add an `<input type="file" accept="image/*">` to the broadcast compose form. On file selection, upload to Firebase Storage at path `broadcast-images/{timestamp}-{filename}` and get the download URL to pass as `imageURL` to the bot message.

State additions:
```javascript
var [imageFile, setImageFile] = useState(null);
var [imageURL, setImageURL] = useState('');
var [uploading, setUploading] = useState(false);
var [previewURL, setPreviewURL] = useState('');
```

**Feature — Preview**: Show a styled preview card below the compose form before sending, showing how the PRO SPY bot message will look with the image and text.

**Delivery change**: The new broadcast flow:
1. (Optional) Upload image → get `imageURL`
2. Fetch all users from `usersCollection`
3. For each user, call `window.sendProSpyBotMessage(userId, message, { type: 'broadcast', imageURL })`
4. Use Firestore batch writes (max 500 per batch) — note: `sendProSpyBotMessage` must support batch mode or be called iteratively with rate limiting

**Important**: Batch writes to `botChatsCollection` should use `db.batch()` for efficiency (same pattern as existing broadcast code).

---

## Implementation Order

The following sequence minimizes breaking changes and ensures each step is independently testable:

```
Step 1: firebase.txt rules fix (unblocks everything else)
Step 2: 01-config.js PRO SPY bot config
Step 3: AdminUtils.js — sendProSpyBotMessage + logStaffAction staffRole fix
Step 4: UserManagementSection.js — gold→currency fix + Ban/Verify buttons
Step 5: TicketsSection.js — escalation dropdown fix + role-based routing
Step 6: AdminOverview.js — onSnapshot for Active Staff Team
Step 7: FeedbackInboxSection.js — name fix + Acknowledge button
Step 8: ActivityLogSection.js — date filter feature
Step 9: BroadcastSection.js — PRO SPY bot routing + image upload
Step 10: End-to-end verification pass
```

---

## Complexity Tracking

No constitution violations. All changes follow existing patterns.

---

## Verification Plan

### Per-Feature Tests (Manual)

| # | Feature | Test Action | Expected Result |
|---|---------|------------|-----------------|
| 1 | Staff Management | Add a user as Moderator → reload Staff tab | New moderator appears in list |
| 2 | PRO SPY Bot | Check `BOT_CHATS_CONFIG` in console | `pro_spy_bot` entry present |
| 3 | Feedback names | Admin submits feedback → Owner views inbox | Admin's personal name shows (not "Admin") |
| 4 | Feedback Acknowledge | Owner clicks Acknowledge | PRO SPY bot message arrives in user's chat |
| 5 | Active Staff Team | Moderator logs in → Owner views overview | Moderator shown in Active Staff widget |
| 6 | User Search Gold | Search any user | Correct Gold/currency value shown |
| 7 | User Search Level | Search any user | Correct level shown |
| 8 | Ban button | Owner searches user → clicks Ban | BanPanelInline opens |
| 9 | Verify button | Owner searches user → clicks Verify | User doc updated with verified:true |
| 10 | Tickets permission | Moderator opens Tickets tab | No permission-denied error in console |
| 11 | Tickets reply | Moderator sends a reply | Reply posted, no error dialog |
| 12 | Admin tickets | Admin opens Tickets tab | Open tickets visible |
| 13 | Escalation text | Moderator opens Escalate modal | Dropdown text is dark/visible |
| 14 | Escalation to admin | Moderator escalates to "Admin (Role)" | Ticket updated with escalatedTo:'admin' |
| 15 | Activity Log read | Owner opens Logs tab | Logs appear, no permission error |
| 16 | Activity Log date | Owner selects a past date | Only that day's logs shown |
| 17 | Moderator log write | Any staff action (reply/close) | Entry appears in staff log |
| 18 | Broadcast via bot | Owner sends broadcast | PRO SPY bot message in all users' chat |
| 19 | Broadcast with image | Owner uploads image + sends | Image appears in bot message |
| 20 | No console errors | Navigate all admin tabs | Zero permission-denied errors |

### Firestore Rules Verification
After deploying updated `firebase.txt` to Firebase Console:
- Log in as Moderator → attempt ticket reply → verify no permission error
- Log in as Admin → open Tickets tab → verify tickets load
- Log in as Moderator → close ticket → verify log entry created in `staff_activity_log`
- Log in as Owner → view Activity Log → verify entries readable
