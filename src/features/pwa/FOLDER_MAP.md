# Folder: PWA Integration (src/features/pwa)

## Overview
This directory contains the logic for making the application a Progressive Web App (PWA), including handle mobile and desktop installation.

## Files

### [PWAHandler.js](file:///c:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/src/features/pwa/PWAHandler.js)
- **Purpose**: Install Prompt Manager.
- **Logic**: Listens for the `beforeinstallprompt` event and stores it globally. It provides the trigger function used by the "Install App" banners across the UI.
- **Dependencies**: Integrated with `sw.js` and `manifest.json`.
