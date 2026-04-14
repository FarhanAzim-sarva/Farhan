# Farhan
 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index c974d61a0064db6461b5347f4db9405df39e2094..3471ee0874d5ce9ab6b3190faeadb0c1807c7bf4 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,53 @@
-# Farhan
\ No newline at end of file
+# Farhan Portfolio Site
+
+Static personal portfolio for **Farhan Azim Aurronoy** (finance, analytics, banking, and product systems).
+
+## Stack
+
+- Plain HTML/CSS/JS (single-page site).
+- No build step or framework required.
+
+## Local preview
+
+Because this is a static site, you can open `index.html` directly or run a small local server:
+
+```bash
+python -m http.server 8080
+```
+
+Then open `http://localhost:8080`.
+
+## Automatic deploy (GitHub Pages)
+
+This repo now includes a GitHub Actions workflow at:
+
+- `.github/workflows/deploy-pages.yml`
+
+Behavior:
+
+- deploys automatically when you push to the `main` branch
+- can also be run manually via **Actions → Deploy static site to GitHub Pages**
+
+One-time GitHub setup:
+
+1. Go to **Settings → Pages**.
+2. Set **Source** to **GitHub Actions**.
+3. Push/merge this branch into `main`.
+
+## Production readiness improvements included
+
+- SEO + social metadata (`description`, Open Graph, Twitter card, canonical, robots).
+- Structured data (JSON-LD `Person`) for richer search indexing.
+- Accessibility enhancements:
+  - skip-to-content link
+  - stronger focus-visible outlines
+  - reduced-motion support
+- Dead resume link replaced with a direct “Request Resume” mail action.
+- Contact section now includes a “Copy Email” helper button.
+- Footer now carries a visible last-updated date.
+
+## Customization checklist
+
+1. If you have a custom domain, add canonical/`og:url` values for that domain.
+2. Add a hosted resume link if you want direct download instead of request-by-email.
+3. Add a real dashboard screenshot at `assets/rates-dashboard.png` and uncomment the image line in `index.html`.
 
EOF
)
