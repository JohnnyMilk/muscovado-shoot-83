# MUSCOVADO SHOOT⁸³

Editorial photography portfolio for **MUSCOVADO SHOOT⁸³** — beginning with
companion animals and extending to people, landscapes, cities, still life, and
everyday scenes. The site is static, dependency-free, and deploys directly to
GitHub Pages without Node.js or a build process.

## Pages

- [`index.html`](index.html) — brand story and THE 83 RULE
- [`gallery.html`](gallery.html) — progressively rendered current collection
- [`work.html`](work.html) — reusable detail view selected with `?id=XX`
- [`admin.html`](admin.html) — lightweight offline JSON collection editor

The gallery renders works in batches of 12. Gallery previews use dedicated
`-thumb.jpg` files with native lazy loading and asynchronous decoding; if a
thumbnail is absent, the browser falls back to the full photograph. The detail
view prioritises only its selected full-size image.

## Collection data

[`data/works.json`](data/works.json) is the single source of truth for titles,
order, copy, image paths, and editorial metadata. Each record contains:

```json
{
  "id": "13",
  "scene": "INDOOR / SOFT LIGHT",
  "category": "COMPANION",
  "year": "2026",
  "orientation": "portrait",
  "image": "assets/photo-13.jpg",
  "title": "聽見什麼",
  "alt": "客觀的圖片描述",
  "excerpt": "收藏頁故事引子",
  "story": "完整 editorial micro-story",
  "note": "攝影編輯觀點",
  "position": "center 44%"
}
```

Supported categories are `COMPANION`, `PORTRAIT`, `LANDSCAPE`, `CITY`,
`STILL LIFE`, and `ORIGIN`. Orientation is `portrait`, `landscape`, or `square`.
Records appear publicly in the same order as the JSON array and are capped at
83 entries.

## Collection Desk CMS

`admin.html` is an offline editor without a server, login, token, or API key:

1. Download `data/works.json` from GitHub.
2. Import it into Collection Desk.
3. Add, edit, delete, or reorder records.
4. Optionally give the copyable writing brief and photograph to an AI tool,
   then paste its JSON object into **AI JSON IMPORT**.
5. Review all properties and download the regenerated `works.json`.
6. Upload it back to `data/works.json` on GitHub.

The editor validates two-digit unique IDs, the 83-record limit, categories,
four-digit years, and orientations. It confirms destructive deletion, marks
unexported changes, and warns before closing a tab with changes that have not
been downloaded. Imported data never leaves the browser.

## Photography assets

Image paths are case-sensitive and live under `assets/`:

```text
assets/photo-01.jpg
assets/photo-01-thumb.jpg
…
assets/photo-83.jpg
assets/photo-83-thumb.jpg
```

Recommended export settings:

| Use | Long edge | JPEG quality | Target size |
| --- | ---: | ---: | ---: |
| Gallery thumbnail | 1200 px | 78–82% | 100–300 KB |
| Detail photograph | 1800–2200 px | 82–86% | 250–900 KB |

Export JPEGs in sRGB and remove unnecessary EXIF metadata. A missing thumbnail
falls back to the full photograph; if both files are absent, the public site
renders the editorial placeholder.

The About hero is deliberately separate from the 83-work rotation:

```text
assets/about-hero.jpg
```

The finished logo card is:

```text
assets/morandi_gray_logo.jpg
```

## Local preview

Because the collection is loaded with `fetch`, use a static server rather than
the `file://` protocol:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Useful routes include:

```text
http://localhost:8000/gallery.html
http://localhost:8000/work.html?id=13
http://localhost:8000/admin.html
```

## Deployment

Publish the repository root through GitHub Pages. Links and asset paths are
relative, while canonical and social metadata use the production URL:

```text
https://johnnymilk.github.io/muscovado-shoot-83/
```
