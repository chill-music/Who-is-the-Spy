# Data Model: Admin Panel Overhaul (008)

## Existing Collections (Unchanged Schema)

### `users` collection
```
{
  uid: string,
  displayName: string,
  photoURL: string,
  role: 'owner' | 'admin' | 'moderator' | 'user',   ← staff role (flat field)
  currency: number,  ← this is what the UI incorrectly calls "Gold"
  level: number,
  xp: number,
  ban: { isBanned: boolean, reason: string, bannedBy: string, bannedAt: Timestamp },
  customId: string,
  createdAt: Timestamp,
  lastActive: Timestamp,
  ...
}
```

### `bot_chats` collection (existing, used by detective_bot and love_bot)
```
{
  botId: string,           ← 'detective_bot' | 'love_bot' | 'pro_spy_bot' (NEW)
  toUserId: string,        ← recipient UID
  message: string,
  fromName: string,        ← bot display name
  type: string,            ← 'system' | 'broadcast' | 'feedback_ack'
  read: boolean,
  timestamp: Timestamp,
  imageURL?: string        ← NEW: optional image for broadcast messages
}
```

### `staff_activity_log` collection (existing)
```
{
  staffUID: string,
  staffName: string,
  action: string,          ← 'BAN_USER' | 'REPLY_TICKET' | 'BROADCAST' | etc.
  targetUID: string | null,
  targetName: string | null,
  details: string,
  timestamp: Timestamp
}
```

### `feedback` collection (existing, extended)
```
{
  userId: string,
  userName: string,        ← display name at time of submission
  userPhoto: string,
  text: string,
  rating: number,
  createdAt: Timestamp,
  status: 'new' | 'acknowledged',
  acknowledgedAt?: Timestamp,    ← NEW field
  acknowledgedBy?: string        ← NEW field (owner UID)
}
```

### `support_tickets` collection (existing)
```
{
  userId: string,
  userName: string,
  subject: string,
  status: 'open' | 'replied' | 'closed' | 'escalated',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  escalated?: boolean,
  escalatedTo?: string,          ← role name ('admin' | 'owner'), NOT individual UID
  escalateNote?: string,
  escalatedAt?: Timestamp,
  escalatedBy?: string,
  escalatedByName?: string,
  messages: Array<{
    senderId: string,
    senderName: string,
    senderRole: string,
    text: string,
    timestamp: Timestamp
  }>
}
```

## New Configuration Entries

### BOT_CHATS_CONFIG addition (`01-config.js`)
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

## Firestore Rules Changes

### `staff_activity_log`
```
BEFORE:
  allow read:   if isLoggedIn() && isOwnerUID();
  allow create: if isLoggedIn() && isOwnerUID();

AFTER:
  allow read:   if isLoggedIn() && isOwnerUID();
  allow create: if isLoggedIn() && isStaff();  ← staff can write their own logs
```

### `support_tickets`
No rule change needed — the existing rule uses `isStaff()` which already includes admin and moderator. The permission-denied error is caused by `logStaffAction` failing (the create rule fix above will resolve it).

## Key Field Corrections

| Component | Currently Uses | Should Use |
|-----------|---------------|------------|
| UserManagementSection.js | `searchResult.gold` | `searchResult.currency` |
| TicketsSection escalation | Individual staff UIDs | Role strings ('admin', 'owner') |
| FeedbackInboxSection | `f.userName` (stale) | Fresh lookup from `usersCollection.doc(f.userId)` |
