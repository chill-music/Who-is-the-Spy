# Data Model: Security & Crawler Configuration

This feature does not involve runtime database changes. It primarily deals with state configuration files stored in the repository root.

## Configuration Entities

### Site Metadata (`index.html`)
- **CSP Policy**: A string containing permission directives for the browser.
- **Anti-Clickjacking Script**: A self-contained IIFE that checks the window hierarchy.

### Crawler Configuration (`robots.txt`, `sitemap.xml`)
- **Allowed Routes**: All (`/`).
- **Sitemap Link**: Reference to the XML map.
- **Priority**: Main entry point (`1.0`).

### Security Identity (`.well-known/security.txt`)
- **Contact URI**: `mailto` format.
- **Expiration**: Standard ISO date string.
- **Policy Link**: URL to the security disclosure terms.
