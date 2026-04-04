# Who-is-the-Spy-og Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-04

## Active Technologies
- HTML / Javascript (ES6, No Bundler/NPM) + React 18.2, Firebase 10.7 (Firestore, Auth, Storage) (007-shop-leaderboard-redesign)
- Firebase Firestore (users, bff_relationships collections) (007-shop-leaderboard-redesign)

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
- 007-shop-leaderboard-redesign: Added HTML / Javascript (ES6, No Bundler/NPM) + React 18.2, Firebase 10.7 (Firestore, Auth, Storage)

- 006-fix-onboarding-race: Added Vanilla JavaScript (ES6+), React 18 via CDN (no JSX transpiler) + Firebase Auth v8 compat (`auth.onAuthStateChanged`, `auth.getRedirectResult`), Firestore v8 compat (`usersCollection.doc().onSnapshot`, `.get()`)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
