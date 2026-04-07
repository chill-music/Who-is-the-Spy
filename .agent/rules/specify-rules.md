# Who-is-the-Spy-og Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-07

## Active Technologies
- HTML / Javascript (ES6, No Bundler/NPM) + React 18.2, Firebase 10.7 (Firestore, Auth, Storage) (007-shop-leaderboard-redesign)
- Firebase Firestore (users, bff_relationships collections) (007-shop-leaderboard-redesign)
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (008-admin-panel-overhaul)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (008-admin-panel-overhaul)
- JavaScript (ES6, Vanilla React, No JSX/Babel) + React (Global `window.React`), Firestore (Global `window.db`), CSS Modules (standard `.css`) (010-profile-redesign-single-page)
- Firestore (read-only for this UI change, uses existing collections: `users`, `gifts_log`, `moments`) (010-profile-redesign-single-page)
- JavaScript (ES6+ / IIFE) + React 18 (CDN), Firebase 10 Compat (CDN), Tailwind CSS (012-rebuild-spy-game)
- Firestore (Advanced Mode), Memory/LocalState (Normal Mode) (012-rebuild-spy-game)
- JavaScript (ES6+), React 18 (CDN) + Firebase 10 Compat (CDN), Tailwind CSS (Play CDN), Web Audio API (013-spy-game-rebuild)
- Firestore (Online mode), Local state & LocalStorage (Offline mode/Settings) (013-spy-game-rebuild)

- Vanilla JavaScript (ES6+), React 18 via CDN (no JSX transpiler) + Firebase Auth v8 compat (`auth.onAuthStateChanged`, `auth.getRedirectResult`), Firestore v8 compat (`usersCollection.doc().onSnapshot`, `.get()`) (006-fix-onboarding-race)

## Project Structure

```text
src/
tests/
```

## Commands

npm test; npm run lint

## Code Style

Vanilla JavaScript (ES6+), React 18 via CDN (no JSX transpiler): Follow standard conventions

## Recent Changes
- 013-spy-game-rebuild: Added JavaScript (ES6+), React 18 (CDN) + Firebase 10 Compat (CDN), Tailwind CSS (Play CDN), Web Audio API
- 012-rebuild-spy-game: Added JavaScript (ES6+ / IIFE) + React 18 (CDN), Firebase 10 Compat (CDN), Tailwind CSS
- 011-spy-game-renewal: Added [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
