# Health in Social Media Dashboard

A static HTML dashboard with no build step and no dependencies to install.

## Run locally

```bash
git clone <repo-url>
cd health-in-social-media-dashboard
python3 -m http.server 8000
```

Then open http://localhost:8000.

If you have Node but not Python, use `npx serve .` instead.

Use a local server rather than opening `index.html` directly, because browsers block some icons on `file://` pages.
