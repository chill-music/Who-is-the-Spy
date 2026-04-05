# Research: Admin Panel Overhaul (008)

## Phase 0 Research Findings

---

### Decision 1: Staff Management — Why Only Owner Appears
**Decision**: The bug is in the Firestore query, not the data model.
**Rationale**: `StaffManagementSection.js` queries `usersCollection.where('role', 'in', ['owner', 'admin', 'moderator'])`. This is correct. However, many staff accounts may have their role stored in a **different field** (`staffRole` sub-object rather than top-level `role`). Looking at `01-config.js` line 271, it comments: `user.staffRole = { role: 'admin'|'moderator', ... }` BUT the actual query uses a flat `role` field. If users were assigned via `.update({ role: 'moderator' })` (which `addStaff` and `updateRole` do), the field IS flat `role`. The real issue is the fallback owner-only display: the `AdminOverview.js` `Active Staff Team` widget uses `.get()` (one-time fetch) not a live listener. This means newly added staff appear in `StaffManagementSection` but may show as loading in the overview widget since it only fires once. The Staff Management Section itself should show all staff correctly provided the `role` field is set flatly. **Conclusion: Staff Management page should work. The Active Staff Team widget in AdminOverview uses `.get()` not `.onSnapshot()` which means it doesn't update in real-time. Fix: convert to `onSnapshot`.

---

### Decision 2: PRO SPY Bot — How Bots Are Implemented
**Decision**: Add a new entry to `BOT_CHATS_CONFIG` array in `01-config.js`, and add a Firestore document seed for the bot's messaging profile.
**Rationale**: Existing bots (`detective_bot`, `love_bot`) are defined in `BOT_CHATS_CONFIG` in `01-config.js`. They are "virtual" bots — no separate Firestore user doc required for the bot to send messages. Messages are written to `botChatsCollection` (collection `bot_chats`) with fields `{ botId, toUserId, message, timestamp, read, fromName }`. The PRO SPY bot needs:
1. A new entry in `BOT_CHATS_CONFIG` with `id: 'pro_spy_bot'`
2. A new `sendProSpyBotMessage(toUserId, message, imageURL?)` utility function in `AdminUtils.js`
3. The `BroadcastSection` to call this function for each user instead of writing raw notifications
**Alternatives considered**: Creating a full Firebase Auth user for the bot (rejected — unnecessary complexity, not how existing bots work).

---

### Decision 3: Feedback Inbox — Wrong Sender Name
**Decision**: The bug is in `FeedbackInboxSection.js` displaying `f.userName` which IS the correct field. The root cause is in `HelpCenterModal.js` where feedback is saved: `userName: userData?.displayName || 'User'`. For Admin/Moderator users, if their `displayName` is overridden or stored incorrectly, the wrong value appears. HOWEVER — the user reports that the **admin/moderator's role name** appears (e.g., "Admin" or "Moderator"), not their display name. This means somewhere in the code path, `userData.displayName` is being set to the role label rather than the person's name. Looking at the data flow: `HelpCenterModal` receives `userData` from parent. The `FeedbackInboxSection` reads `f.userName`. The real bug is that the FeedbackInboxSection likely shows `f.userName` which was saved from `userData.displayName`. The role label may be stored in `displayName` for some accounts. Fix: In `FeedbackInboxSection`, resolve the submitter's name by also loading from `usersCollection.doc(f.userId)` if the stored `userName` looks like a role label. Better fix: store `displayName` separately from role in the feedback document. No code change needed to feedback submission — the submission code correctly stores `userData?.displayName`. The issue is the display of stored data. The `FeedbackInboxSection` displays `f.userName` — this is already the right field. If staff have been given wrong display names, that's a data issue not a code issue. **HOWEVER** — review more carefully: the user says "the admin and moderator names appear" — meaning the role LABEL is shown, not the person's name. This means `userData.displayName` for those users IS their role label (e.g., a user was given the displayName "Admin"). The fix in `FeedbackInboxSection` should: if `f.userName` exists AND matches a role keyword, do a live lookup of the actual user name. More robustly: always do a lookup for each feedback's `userId` to freshen the display name.

---

### Decision 4: Firestore Rules — Staff Activity Log Permission
**Decision**: The `staff_activity_log` collection currently restricts **read AND create** to `isOwnerUID()` only (firebase.txt lines 91–92). This means when ANY staff member (Admin/Moderator) tries to trigger `logStaffAction()` from client code, the `add()` call fails with `permission-denied`, causing the log to silently fail. Fix: Allow staff to CREATE logs (they're writing their own actions) but only Owner can READ.
**Rationale**: `AdminUtils.js:logStaffAction` calls `staffLogCollection.add(...)`. Any Moderator calling `sendReply()`, `closeTicket()`, or `escalateTicket()` triggers this, which fails and throws an error that bubbles up as the visible permission-denied error in the UI.

---

### Decision 5: Support Tickets — Permission Denied Error
**Decision**: The `permission-denied` error on ticket reads is caused by the `isStaff()` function in Firestore Rules calling `getUserRole()` which itself does a `get()` on the user document. This creates a **cross-document read** which can fail if the security rule evaluation itself hits the read limit, or if the user document access pattern has issues. The actual rule on line 101 is: `allow read: if isLoggedIn() && (resource.data.userId == request.auth.uid || isStaff())`. The `isStaff()` calls `getUserRole()` which does `get(...)`. This **should** work. The real issue may be that the `ticketsCollection` listener is attached BEFORE the user's Firestore `role` field is set (race condition on first login). Fix: Add explicit error logging, and ensure the `role` field is present on newly created staff accounts.
**Secondary fix needed**: The `staffList` for escalation only loads when `myRole === 'moderator'` (line 38 of TicketsSection.js). Admins need the same, and the list should show ROLE options (not individuals).

---

### Decision 6: User Search — Gold/Currency Field Mismatch
**Decision**: The `UserManagementSection.js` displays `searchResult.gold || 0` but the actual field in Firestore user documents is `currency` (confirmed by Super777Game.js line 3: "Currency: reads/writes window.usersCollection (field: currency)"). The field name `gold` does not exist! The display shows `0` because `searchResult.gold` is always undefined.
**Fix**: Change `searchResult.gold` to `searchResult.currency` in `UserManagementSection.js`.
**Level field**: The level is stored as `searchResult.level`. Looking at ProfileV11.js which reads `userData?.level || 1` — this matches. Level rendering is correct (`searchResult.level || 1`). However, some users may have their level computed from XP rather than stored directly. Recommend showing both `level` and `xp` fields.

---

### Decision 7: Escalation Dropdown Text Visibility
**Decision**: The escalation `<select>` in `TicketsSection.js` uses `className: 'input-dark'`. The `.input-dark` CSS class (defined inline in `18-admin-panel.js` line 126–132) sets `color: #fff` on the input itself, but `<option>` elements inside a `<select>` inherit the **browser's native styling** which may show white text on white/light dropdown background on some OS/browser combos. Fix: explicitly set `background` and `color` on the `<option>` elements.

---

### Decision 8: Activity Log Date Filtering
**Decision**: Add a date picker at the top of `ActivityLogSection.js`. The current query `staffLogCollection.orderBy('timestamp', 'desc').limit(200)` fetches the last 200 entries. For date filtering, add a `selectedDate` state, and when set, query with `.where('timestamp', '>=', startOfDay).where('timestamp', '<', endOfDay)`.
**Important**: The Firestore query uses `orderBy('timestamp', 'desc')`. Adding `.where()` on timestamp requires a **composite index** in Firestore. Since we're filtering the same field we order by, no composite index is needed.

---

### Decision 9: Broadcast via PRO SPY Bot with Images
**Decision**: The broadcast currently writes raw notification documents. To route through PRO SPY bot: write to `botChatsCollection` (same as other bot messages) for each user. For image support: use Firebase Storage to upload the image and store the download URL in the bot message document.
**Rationale**: The `botChatsCollection` already handles bot messages with a `type` field. Adding `imageURL` to the payload is backward compatible. The UI that renders bot messages will need to be updated to show the image.
**Note**: The broadcast uploads to Firebase Storage which is already configured (`var storage = firebase.storage()` in `01-config.js`). The `storage` reference is already globally available.

---

### Decision 10: Feedback Acknowledge via PRO SPY Bot
**Decision**: When Owner clicks "Acknowledge", write a bot message to `botChatsCollection` with `botId: 'pro_spy_bot'`, `toUserId: f.userId`, and a thank-you message. Store `acknowledgedAt` on the feedback document.
**Rationale**: Same pattern as `detective_bot` which sends messages to users via `botChatsCollection`. The feedback document already has `userId` for the recipient.

---

## Key Findings Summary

| Issue | Root Cause | Fix Location |
|-------|-----------|--------------|
| Staff Management empty | Unknown — code looks correct. May be a `role` field not being set | Verify with Owner |
| PRO SPY bot missing | Not configured in BOT_CHATS_CONFIG | `01-config.js` |
| Feedback wrong names | `f.userName` saved from `userData.displayName` which may be "Admin" for staff | `FeedbackInboxSection.js` live-lookup |
| Feedback acknowledge | Feature doesn't exist | `FeedbackInboxSection.js` new button |
| Active Staff Team static | Uses `.get()` not `.onSnapshot()` | `AdminOverview.js` |
| User search Gold=0 | Field name `gold` should be `currency` | `UserManagementSection.js` |
| Activity Log permission | Staff cannot CREATE log entries (Firestore rule) | `firebase.txt` |
| Tickets permission-denied | Possible race condition or `role` missing on account | `firebase.txt` + verify |
| Escalation text invisible | `<option>` color on dark background | `TicketsSection.js` |
| Escalation shows only owner | `fetchStaffList` only called for `moderator` role; shows individuals not roles | `TicketsSection.js` |
| Moderator reply error | `logStaffAction` inside reply fails with permission-denied on CREATE | `firebase.txt` |
| Admin can't see tickets | Same permission issue or role not recognized | `firebase.txt` |
| Broadcast not via bot | Sends raw notification docs | `BroadcastSection.js` |
| Broadcast no images | Feature doesn't exist | `BroadcastSection.js` |
| Activity Log no date filter | Feature doesn't exist | `ActivityLogSection.js` |
