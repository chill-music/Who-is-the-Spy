# Quickstart: Security & SEO Verification

This guide outlines how to verify the new security and SEO hardening features.

## Verification Steps

### 1. Security Headers
- Open the browser DevTools (F12).
- Refresh the page and check the **Console** tab.
- **Success**: No "Blocked by Content Security Policy" errors appear for Firebase, Unpkg, or Gstatic.
- **Success**: If you try to embed the site in a local `<iframe>`, the browser should immediately navigate to the full page.

### 2. SEO Files
- Navigate to `https://prospy.mooo.com/robots.txt`.
- Navigate to `https://prospy.mooo.com/sitemap.xml`.
- **Success**: Both files return content and match the sitemap specification.

### 3. Security Disclosure
- Navigate to `https://prospy.mooo.com/.well-known/security.txt`.
- **Success**: The file displays the contact information for reporting vulnerabilities.

## Maintenance

### Updating CSP
If you add a new external library (e.g., from a new CDN), you MUST update the `Content-Security-Policy` meta tag in `index.html` to include the new domain. Failure to do so will cause the script/style to be blocked by the browser.

### Updating Sitemap
If you add new standalone pages to the application that are not part of the SPA navigation, add them to `sitemap.xml` to ensure search engine discovery.
