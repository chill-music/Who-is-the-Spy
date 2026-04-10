# Research: Site Security & SEO Hardening

## Decisions

### 1. Content Security Policy (CSP) Configuration
- **Decision**: Implement CSP via `<meta http-equiv="Content-Security-Policy" content="...">`.
- **Rationale**: GitHub Pages does not support custom HTTP headers.
- **Whitelist**:
  - `default-src 'self' https://*.firebaseio.com https://*.firebaseapp.com;`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://*.googleapis.com https://unpkg.com https://cdn.jsdelivr.net;` (Note: `unsafe-inline` is required because the project architecture relies on IIFE scripts and inline Firebase config).
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`
  - `font-src 'self' https://fonts.gstatic.com;`
  - `img-src 'self' data: https:;`
  - `connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com;`
- **Alternatives considered**: Using Cloudflare Workers to inject headers. Rejected as it adds external dependency and cost for a simple PWA.

### 2. Anti-Clickjacking Implementation
- **Decision**: Use a legacy JavaScript Frame-Buster.
- **Rationale**: Standard `X-Frame-Options` header is unavailable on GitHub Pages. CSP `frame-ancestors` directive via Meta tag is not supported by all browsers (Meta CSP has limited directives).
- **Snippet**:
  ```javascript
  (function() {
      if (self !== top) {
          top.location.replace(self.location.href);
      }
  })();
  ```
- **Alternatives considered**: `X-Frame-Options` meta tag. Rejected because it is largely ignored by modern browsers.

### 3. Security.txt Standard (RFC 9116)
- **Decision**: Create `/.well-known/security.txt`.
- **Content**:
  - Contact: `mailto:security@prospy.mooo.com`
  - Expires: 2027-01-01T00:00:00.000Z
  - Preferred-Languages: ar, en
  - Canonical: `https://prospy.mooo.com/.well-known/security.txt`

### 4. Search Engine Optimization
- **Robots.txt**: allow all, point to sitemap.
- **Sitemap.xml**: Single entry for `https://prospy.mooo.com/` as it is a SPA.

---

## Findings

- **Firebase Compatibility**: Firebase requires `connect-src` and `script-src` access to `gstatic.com` and `googleapis.com`.
- **Meta Tag CSP Limitations**: Some directives like `frame-ancestors`, `report-uri`, and `sandbox` are NOT supported in Meta tags. This is why a JS frame-buster is still necessary for Clickjacking protection.
