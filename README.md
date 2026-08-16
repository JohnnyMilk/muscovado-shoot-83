# MUSCOVADO SHOOT⁸³

Editorial pet photography portfolio for **MUSCOVADO SHOOT⁸³** — built as a
static, dependency-free website for GitHub Pages.

## Pages

- [`index.html`](index.html) — brand story and THE 83 RULE
- [`gallery.html`](gallery.html) — the current curated collection

## Local preview

No build step is required. Open `index.html` directly, or serve the repository
with any static file server:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Photography assets

Add the final, web-optimised JPG files using these exact case-sensitive paths:

```text
Assets/logo.jpg
Assets/photo-01.jpg
Assets/photo-02.jpg
Assets/photo-03.jpg
```

Until those files are supplied, the site displays designed editorial
placeholders. The image paths are already connected in `styles.css`, so adding
the files requires no HTML or layout changes. Recommended: use sRGB images,
export at roughly 2400 px on the longest edge, and keep each file below 1.5 MB.

## Deployment

Publish the repository root through GitHub Pages. All links and asset paths are
relative, so the site works from the project subdirectory without configuration.
