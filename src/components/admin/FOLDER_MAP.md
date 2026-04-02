# Folder: Staff Dashboard Sections (src/components/admin)

## Overview
This directory contains the modular UI sections used by the `AdminPanel` (`18-admin-panel.js`). Access to these components is strictly guarded by the `isStaff()` logic defined in `firebase.txt`.

## Files

### Dashboard & Stats
- **[AdminOverview.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/AdminOverview.js)**: Aggregated system health tiles.
- **[AdminStatCard.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/AdminStatCard.js)**: Reusable KPI card components.
- **[FinancialLogSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/FinancialLogSection.js)**: High-level financial reporting and transaction logs.

### Moderation & Users
- **[UserManagementSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/UserManagementSection.js)**: The primary tool for player lookups and profile editing.
- **[ReportsSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/ReportsSection.js)**: Inbox for player misconduct reports.
- **[BanPanelInline.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/BanPanelInline.js)**: Central logic for restricting access and muting users.
- **[StaffManagementSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/StaffManagementSection.js)**: Admin-only tool for managing staff hierarchy.
- **[ActivityLogSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/ActivityLogSection.js)**: Audit trail for staff actions to prevent abuse.

### Content & Communication
- **[BroadcastSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/BroadcastSection.js)**: System-wide lobby announcements.
- **[MomentsModerationSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/MomentsModerationSection.js)**: Review queue for community "Moments."
- **[FAQManagementSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/FAQManagementSection.js)**: Management of the project's help articles.
- **[FakeProfilesSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/FakeProfilesSection.js)**: Manages simulated bot/fake accounts for load testing and engagement.

### Support & Feedback
- **[TicketsSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/TicketsSection.js)**: Help desk resolve interface.
- **[FeedbackInboxSection.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/FeedbackInboxSection.js)**: Public feedback and suggestion reviewer.

### Support Logic
- **[AdminUtils.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/components/admin/AdminUtils.js)**: Internal shared helpers for permission checks and data formatting.
