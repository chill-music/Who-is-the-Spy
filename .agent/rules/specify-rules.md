# Who-is-the-Spy-og Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-05

## Active Technologies
- HTML / Javascript (ES6, No Bundler/NPM) + React 18.2, Firebase 10.7 (Firestore, Auth, Storage) (007-shop-leaderboard-redesign)
- Firebase Firestore (users, bff_relationships collections) (007-shop-leaderboard-redesign)
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (008-admin-panel-overhaul)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (008-admin-panel-overhaul)

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
- 008-admin-panel-overhaul: Added [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]
- 007-shop-leaderboard-redesign: Added HTML / Javascript (ES6, No Bundler/NPM) + React 18.2, Firebase 10.7 (Firestore, Auth, Storage)

- 006-fix-onboarding-race: Added Vanilla JavaScript (ES6+), React 18 via CDN (no JSX transpiler) + Firebase Auth v8 compat (`auth.onAuthStateChanged`, `auth.getRedirectResult`), Firestore v8 compat (`usersCollection.doc().onSnapshot`, `.get()`)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
