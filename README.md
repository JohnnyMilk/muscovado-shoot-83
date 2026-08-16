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

The final portfolio photographs are loaded from the existing GitHub assets:

```text
assets/photo-01.jpg  # 黃花之間
assets/photo-02.jpg  # 那個眼神
assets/photo-03.jpg  # 紅色習作
```

All image paths are relative and case-sensitive for GitHub Pages.

## Deployment

Publish the repository root through GitHub Pages. All links and asset paths are
relative, so the site works from the project subdirectory without configuration.
