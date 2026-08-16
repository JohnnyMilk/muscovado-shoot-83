# MUSCOVADO SHOOT⁸³

Editorial pet photography portfolio for **MUSCOVADO SHOOT⁸³** — built as a
static, dependency-free website for GitHub Pages.

## Pages

- [`index.html`](index.html) — brand story and THE 83 RULE
- [`gallery.html`](gallery.html) — the current curated collection
- [`work.html`](work.html) — reusable master-detail story view, selected with
  `?id=01`, `?id=02`, or `?id=03`
- [`admin.html`](admin.html) — lightweight, offline JSON collection editor

Gallery photographs use native `loading="lazy"` and `decoding="async"`, so a
future 83-work collection does not request every full image on initial load.
Only the selected photograph is prioritised on the detail page. Work metadata
for that detail view lives in the small dependency-free [`script.js`](script.js).

## Collection Desk CMS

`admin.html` is an offline JSON editor without a server, login, token, or build
process. Download [`data/works.json`](data/works.json) from GitHub, import it into
the editor, add/delete/edit records, then download the regenerated `works.json`
and upload it back to the same repository path. Nothing is sent from the editor
to GitHub or another service.

The CMS also includes a copyable writing prompt. Submit that prompt and a work
photo to an AI tool, then paste the returned JSON object into **AI JSON IMPORT**.
The editor parses it into the property form for review; an existing ID is
updated and a new ID is added to the beginning. No AI API key is stored in or
required by this site.

Records can be added, edited, deleted, and moved forward/backward in the final
array order. The editor validates unique two-digit IDs and caps the collection
at 83 records. Image paths always live under `assets/`, so the form presents
that prefix as fixed, muted text and only asks for the filename.

Photo files are still uploaded manually to the path recorded in each JSON item.
If a manifest entry points to a missing photo, the public gallery and detail
page render an editorial colour-and-pattern placeholder until the asset arrives.

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
