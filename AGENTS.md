# AI Agent Guidelines

This document outlines the rules and best practices for AI agents working on the Who-is-the-Spy PWA codebase. Following these rules is critical to maintaining project stability and architectural integrity.

## Architecture Constraints

> [!IMPORTANT]
> **NO NPM, NO BUILDER**: This project does not use `npm` or any modern module bundler (Webpack, Vite, etc.).
> **NO IMPORT/EXPORT**: Standard ES6 `import` and `export` statements are NOT supported. Scripts are loaded via `<script defer>` tags in `index.html`.

### How to Add New Features
1. **Create the Script**: Add your new logic to a new `.js` file (e.g., `src/features/my-feature/MyComponent.js`).
2. **Register in `index.html`**: Add a `<script defer src="path/to/script.js?v=2.4"></script>` tag in `index.html`.
3. **Expose to Global Scope**: Wrap your code in an IIFE and assign components or functions to the `window` object.
4. **Update `16-main.js`**: If your component is critical for the initial render, add its name to the `_criticalComponents` or `_secondaryComponents` array in `src/16-main.js` to ensure the app waits until it is loaded before mounting.

## Common Code Patterns

### Exposing Components
```javascript
(function() {
    var MyComponent = function() {
        return React.createElement('div', null, 'Hello World');
    };
    window.MyComponent = MyComponent;
})();
```

### Using Hooks via `window.AppHooks`
Instead of calling a hook directly from `window`, it is preferred to use the `AppHooks` namespace for better reliability:
```javascript
var { useAuthState } = window.AppHooks;
```

### Portals
Use the `PortalModal` helper from `src/01-config.js` for any full-screen modals to avoid `z-index` or `backdrop-filter` stacking context issues.

## Things to NEVER Do

> [!CAUTION]
> **NEVER** run `npm install`.
> **NEVER** use `import` or `export` keywords.
> **NEVER** modify `src/01-config.js` unless adding a new Firestore collection or a universal constant.
> **NEVER** mount React manually outside of `16-main.js`.

## Git Workflow

- **Branching**: Create a separate branch for each feature or bug fix.
- **Commits**: Commit after every significant and verifiable change. Use descriptive commit messages.
- **Stability**: Ensure the app boots successfully before pushing any changes to a shared branch.
