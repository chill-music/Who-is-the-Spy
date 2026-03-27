# Who-is-the-Spy: src/utils/ Directory

## Module Purpose
The `src/utils/` directory functions as a shared repository for pure helper functions, data transformers, string formatters, and standard authentication operations. Logic placed here should theoretically be stateless and reusable across varied component scopes within the game framework.

## Core Features
*   **Auth State Helpers:** `auth.js` abstracts common Firebase authentication actions such as token gathering, explicit logout flows, or login validation checks.
*   **Formatting Utility:** `format.js` handles data transformation—such as converting numerical timestamps to readable relative or absolute date strings, number abbreviations (e.g., 1000 to "1k"), and general text sanitization.

## Logic & Data Flow
*   **Stateless Execution:** Most exports or global attachments in this folder take input parameters, perform a deterministic transformation, and return primitives.
*   **Component Agnostic:** A UI module in `src/features/` or a monolith module like `src/19-family.js` calls these formatters immediately prior to DOM injection to ensure correct display logic.

## Dependencies
*   **Isolated Ecosystem:** Functions here generally avoid heavy external dependencies, though `auth.js` will expect `window.auth` to be correctly initialized by `src/core/firebase.js`.
*   **Translations:** `format.js` frequently interacts with `TRANSLATIONS` or localized logic to append Arabic terminology like "يوم" (Day) or "ساعة" (Hour) to time outputs.

## Technical Constraints
*   **Modular ES6 Architecture (Target):** Unlike the legacy monolith array, files in `utils/` aim for explicit input/output definitions. However, if used via script tags, functions must be globally assigned carefully to avoid collisions.
*   **Performance Sensitivity:** Formatting functions are called continuously during chat renders and long list iterations. They must remain highly performant (e.g., avoiding recurrent heavy regex compiling if possible).
