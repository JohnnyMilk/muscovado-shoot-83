# MUSCOVADO SHOOT⁸³

Editorial pet photography portfolio for **MUSCOVADO SHOOT⁸³** — built as a
static, dependency-free website for GitHub Pages.

## Pages

- [`index.html`](index.html) — brand story and THE 83 RULE
- [`gallery.html`](gallery.html) — the current curated collection
- [`work.html`](work.html) — reusable master-detail story view, selected with
  `?id=01`, `?id=02`, or `?id=03`
- [`admin.html`](admin.html) — lightweight, browser-only collection publisher

Gallery photographs use native `loading="lazy"` and `decoding="async"`, so a
future 83-work collection does not request every full image on initial load.
Only the selected photograph is prioritised on the detail page. Work metadata
for that detail view lives in the small dependency-free [`script.js`](script.js).

## Collection Desk CMS

`admin.html` provides a private publishing workflow without a server or build
process. It compresses an uploaded image in the browser, converts it to JPEG,
collects all editorial properties, uploads the result through the GitHub
Contents API, and updates [`data/works.json`](data/works.json). The public gallery
and detail view both read that JSON file.

The publisher requires a fine-grained GitHub token with **Contents: read and
write** permission for this repository. The token is kept only in page memory:
it is not stored in local storage, source code, or the repository. Never commit
a token or place one in a deployed JavaScript file. Open the CMS at
`/admin.html`, connect, choose a photo, review the generated JPEG, complete the
properties, and publish.

The collection manifest is automatically capped at 83 records. Image conversion
uses browser-native Canvas APIs; uncommon formats such as HEIC depend on the
browser's decoding support. No OpenAI API is required for the current workflow.

## Local preview

No build step is required. Because the collection is loaded from a JSON file,
preview the repository with any static file server rather than the `file://`
protocol:

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
