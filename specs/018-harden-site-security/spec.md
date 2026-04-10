# Feature Specification: Harden Site Security & SEO

**Feature Branch**: `018-harden-site-security`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Harden site security and SEO based on web-check results"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Security Hardening (Priority: P1)

As a security-conscious owner, I want to ensure that my application is protected from common web vulnerabilities like Cross-Site Scripting (XSS) and Clickjacking, even though I am hosted on GitHub Pages.

**Why this priority**: Protecting user integrity and preventing malicious actors from hijacking the site is the highest priority for a social game.

**Independent Test**: Can be tested by verifying that external, unauthorized scripts are blocked by the browser and that the site cannot be embedded in a third-party iframe.

**Acceptance Scenarios**:

1. **Given** the app is loaded, **When** examining the `<head>` section, **Then** a strict Content Security Policy (CSP) meta tag must be present.
2. **Given** an attempt to embed the site in an external iframe, **When** the page loads, **Then** it must break out of the frame and redirect to the top-level window.

---

### User Story 2 - Search Engine Optimization (Priority: P2)

As a developer, I want search engines to correctly index my application and have clear instructions on what to crawl, so that the game ranks better in search results.

**Why this priority**: Essential for organic growth and professional site presence.

**Independent Test**: Can be tested by accessing `robots.txt` and `sitemap.xml` directly in the browser and verifying they return valid content.

**Acceptance Scenarios**:

1. **Given** a crawler visits the site, **When** it requests `robots.txt`, **Then** it should find a valid file that points to the sitemap.
2. **Given** a crawler visits the site, **When** it requests `sitemap.xml`, **Then** it should find a valid XML structure representing the site's main pages.

---

### User Story 3 - Security Disclosure Standard (Priority: P3)

As a security researcher, I want a standardized way to find contact information to report potential security vulnerabilities to the PRO SPY team.

**Why this priority**: Adds a layer of security maturity and professional standards.

**Independent Test**: Can be tested by navigating to `/.well-known/security.txt`.

**Acceptance Scenarios**:

1. **Given** a security researcher looks for disclosure info, **When** they visit `/.well-known/security.txt`, **Then** they should see contact details and a reasonable expiration date for the policy.

---

## Edge Cases

- **CSP Blocking Legitimate Assets**: If a CDN domain is missed in the CSP, parts of the game (like Firebase or icons) might stop working.
- **Frame-Buster Loop**: If not implemented correctly, it could interfere with legitimate internal navigations (though rare in SPAs).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST include a Content Security Policy (CSP) meta tag in `index.html` allowing only self, Firebase, and trusted CDNs (unpkg, googleapis).
- **FR-002**: System MUST include a JavaScript frame-buster in the root `index.html` to prevent Clickjacking.
- **FR-003**: System MUST have a `robots.txt` file in the root directory.
- **FR-004**: System MUST have a `sitemap.xml` file in the root directory correctly mapping `prospy.mooo.com`.
- **FR-005**: System MUST include a `security.txt` file in the `.well-known/` directory following the RFC 9116 standard.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Security scans (like web-check.xyz or Mozilla Observatory) show a significant improvement in the security score (moving from 'Missing CSP' to 'Implemented').
- **SC-002**: 100% of critical third-party resources (Firebase, React, Icons) load successfully without being blocked by CSP.
- **SC-003**: Automated crawl tests confirm that `robots.txt` and `sitemap.xml` are accessible and yield a 200 OK status.

## Assumptions

- **Hosting Constraint**: It is assumed that GitHub Pages is the current hosting platform, which necessitates the use of meta-tags for CSP instead of server-level headers.
- **Contact Info**: It is assumed that `security@prospy.mooo.com` is an acceptable contact address for the security policy unless specified otherwise.
- **Mobile PWA**: It is assumed these changes should not interfere with the PWA installation or offline capabilities.
