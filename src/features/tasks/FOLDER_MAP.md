# Folder: Player Engagement (src/features/tasks)

## Overview
This directory contains the logic for daily player missions, providing consistent goals for users to earn currency and progress.

## Files

### [DailyTasksPanel.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/tasks/DailyTasksPanel.js)
- **Purpose**: Daily Mission List.
- **Logic**: Fetches the `daily_tasks` collection and compares it against the user's progress. It handles the "Claim" action for completed missions, triggering currency transactions in the `users` collection.
- **Dependencies**: Interacts with `01-config.js` and updates the user's currency.
