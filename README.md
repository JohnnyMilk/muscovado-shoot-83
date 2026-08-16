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

The transparent logo is loaded from this exact case-sensitive path:

```text
assets/logo.png
```

The three portfolio photographs currently use fixed Lorem Picsum URLs in
`styles.css`; no local photo binaries are required. When final photography is
ready, replace those URLs with the desired hosted or local image paths.

## Deployment

Publish the repository root through GitHub Pages. All links and asset paths are
relative, so the site works from the project subdirectory without configuration.
