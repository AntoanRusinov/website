# ivankaraykova.com

Static portfolio website for fashion designer Ivanka Raykova, hosted on **GitHub Pages**
(custom domain in `CNAME`). No build step — the deployed files are exactly the files in this repo.

## Run locally

The pages load content with `fetch()` (collection data and the legal/info Markdown),
so they must be served over HTTP — opening the HTML files directly via `file://` will not work.

From the project root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Edit any file and refresh the browser (hard refresh
with ⌘⇧R to bypass cache). No rebuild required.

### View on a phone

With the server running, find your Mac's LAN IP (`ipconfig getifaddr en0`) and open
`http://<that-ip>:8000` on a device on the same Wi-Fi.

## Project structure

```
index.html                         Home page
privacy-policy.html                Renders privacy_policy.md via marked.js
terms-and-conditions.html          Renders terms_and_conditions.md
sustainability.html                Renders sustainability.md
collections/<name>/index.html      Collection page (renders that folder's data.json)
collections/<name>/data.json       Collection content (title, description, items)
collections/<name>/images/         Collection images
images/                            Site-wide images (hero, about, etc.)
styles/main.css                    Shared styles for the home page
styles/legal.css                   Shared styles for the legal/info pages
styles/collection-template.css     Styles for collection pages
scripts/home-collection.js         Builds the home-page collection preview
scripts/collection-template.js     Builds a collection page from its data.json
```

## Adding / editing collection content

Edit the relevant `collections/<name>/data.json`. Each item needs:
`id`, `title`, `description`, `image` (filename inside that folder's `images/`),
`material`, `fabric`, `craftsmanship`.

## Images

Keep images at a sensible web resolution (long edge ~2560px is plenty for retina).
Oversized camera-original files bloat load times with no visible benefit.

## Deploy

Push to the default branch — GitHub Pages serves the repo as-is.
