# Quickstart: Defuse Master Refactor

## Local Development

Since this project does not use a build system, follow these steps to test the game:

1. **Modify the file**: Apply the IIFE refactor and localization dictionary to `Defusemaster/DefuseMaster.jsx`.
2. **Register the Script**: Temporarily add the script to `index.html`:
   ```html
   <script defer src="Defusemaster/DefuseMaster.jsx"></script>
   ```
   *(Note: Browsers can serve JSX if served with correct MIME, but usually, we rename to .js if not using a transformer. If using the project's existing React environment, ensure the script is loaded after React).*
3. **Mounting**: Use the dev console or a temporary wrapper to mount the game:
   ```javascript
   const root = ReactDOM.createRoot(document.getElementById('root'));
   root.render(React.createElement(window.DefuseMasterApp));
   ```

## Language Switching
- Locate the **AR/EN** floating button in the bottom right corner.
- Toggle to verify all text transitions.
