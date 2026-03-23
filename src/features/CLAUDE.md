# Who-is-the-Spy: src/features/ Directory

## Module Purpose
The `src/features/` directory represents the modernized, isolated architecture of the "Who-is-the-Spy" project. It is meant to encapsulate high-level domains (e.g., Family, Couples, BFF, Shop) into decoupled directories containing their own constants, services, utilities, and UI components, gradually replacing the rigid `src/` root monolith scripts.

## Core Features
*   **Domain Isolation:** Each subdirectory (currently pioneered by `family/`) entirely contains its business logic and data access tier.
*   **Encapsulated Architecture:** Instead of a single 3000-line functional blob, logic here is split logically: `Service.js` (Firebase logic), `Utils.js` (Transformers), and `Constants.js` (enums and thresholds).
*   **Component-Driven UI:** Introduces the `components/` subfolder structure per feature, abstracting complex DOM rendering (e.g., Modals, Lists) away from the data services.

## Logic & Data Flow
*   A user interaction inside a specific UI framework triggers an event.
*   The event handler within `components/` delegates heavily to the corresponding `Service.js` to execute Firebase Transactions asynchronously.
*   UI state updates occur predictably via rendering loops fetching the latest snapshot data via isolated `Service` getters rather than mutating global arrays blindly.

## Dependencies
*   **Global Access:** Though modernized, features here still rely on the root `core/` assignments like `window.db` and global User ID parameters, pending a proper bundler integration.
*   **Sibling Cross-Talk:** Generally interacts loosely with `src/utils/` for formatting, but seeks to eliminate cross-talk logic between different feature domains (e.g., Family shouldn't directly hack Couple data without a firm API).

## Technical Constraints
*   **Migration In-Progress:** This directory functions alongside the legacy root `src/` files. Careful event-listener management is required to prevent double-bindings when legacy features try to interact with modernized features.
*   **RTL DOM Standards:** Modern components built here must still inherently adopt the `dir="rtl"` standard HTML generation layout to preserve the UI structure across Arabic content.
