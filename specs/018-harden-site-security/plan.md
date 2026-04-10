# Implementation Plan: Harden Site Security & SEO

**Branch**: `018-harden-site-security` | **Date**: 2026-04-09 | **Spec**: [spec.md](file:///C:/Users/sheha/OneDrive/Desktop/Who-is-the-Spy-og/specs/018-harden-site-security/spec.md)
**Input**: Feature specification from `/specs/018-harden-site-security/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

The project requires hardening of its security and SEO infrastructure based on the `web-check-results.json` scan. Since the site is hosted on GitHub Pages, we will implement a Content Security Policy (CSP) via Meta tags, a JavaScript-based frame-buster to prevent Clickjacking, and standard SEO/Standard files (robots.txt, sitemap.xml, security.txt).

## Technical Context

**Language/Version**: JavaScript (ES6+, No Bundler)  
**Primary Dependencies**: Firebase (v10.7.1), React (CDN), React DOM (CDN)  
**Storage**: N/A (Meta/Configuration changes)  
**Testing**: Manual Browser Verification & Security Headers Scanner (e.g., Mozilla Observatory)  
**Target Platform**: Web (Modern Browsers), PWA  
**Project Type**: Static Web Application (GitHub Pages)  
**Performance Goals**: Zero impact on page load time  
**Constraints**: GitHub Pages does not support custom HTTP response headers; must use client-side fallbacks.  
**Scale/Scope**: Root files and main `index.html` only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **🔴 Dead Code Prevention**: All new files/scripts (frame-buster, robots.txt) will be active. No dead code introduced.
- **🟠 Logic & Async Accountability**: New scripts (CSP transition, frame-buster) will be placed high in the `<head>` to execute synchronously before primary content.
- **🟡 Structural Discipline (SOLID)**: The frame-buster will be a single-responsibility IIFE.
- **🔵 Dependency Sanitization**: CSP will strictly whitelist only the current CDN dependencies (googleapis, unpkg, firebaseapp).
- **⚪ Type & Null Robustness**: All new JS snippets will be defensive and well-documented.

## Project Structure

### Documentation (this feature)

```text
specs/018-harden-site-security/
├── plan.md              # This file
├── research.md          # Implementation details for CSP and SEO (Phase 0)
├── data-model.md        # N/A (Static metadata)
├── quickstart.md        # Integration guide (Phase 1)
└── checklists/
    └── requirements.md  # Spec validation
```

### Source Code (repository root)

```text
/
├── .well-known/
│   └── security.txt     # Security disclosure policy
├── index.html           # Target for CSP & Frame-buster
├── robots.txt           # Crawler instructions
└── sitemap.xml          # Search engine map
```

**Structure Decision**: Standard static file layout in the root directory for accessibility by crawlers and security standards.

## Complexity Tracking

*No violations identified.*
