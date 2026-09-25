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
404.html                           Not-found page served by GitHub Pages
privacy-policy.html                Renders privacy_policy.md via marked.js
terms-and-conditions.html          Renders terms_and_conditions.md
sustainability.html                Renders sustainability.md
robots.txt, sitemap.xml            Crawler hints
collections/<name>/index.html      Collection page (renders that folder's data.json)
collections/<name>/data.json       Collection content (title, description, items)
collections/<name>/images/         Collection images: <n>.jpg (1600px wide) + <n>-800.jpg (thumbnail)
images/                            Site-wide images: hero, about, og-image, favicon, touch icon
styles/main.css                    Shared styles for the home page
styles/legal.css                   Shared styles for the legal/info and 404 pages
styles/collection-template.css     Styles for collection pages
scripts/collection-template.js     Builds a collection page from its data.json
```

## Adding / editing collection content

Edit the relevant `collections/<name>/data.json`. Each item needs:
`id`, `title`, `description`, `image` (filename inside that folder's `images/`),
`material`, `fabric`, `craftsmanship`.

## Images

Every collection photo exists in two sizes: `<n>.jpg` at 1600px wide (detail view) and
`<n>-800.jpg` at 800px wide (grid thumbnails). When adding a photo, export both from the
original, JPEG quality around 80, and strip camera metadata. Oversized camera-original files
bloat load times with no visible benefit. A quick way to produce both from an original:

```bash
python3 -c "
from PIL import Image; import sys
src, n = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); w, h = im.size
for width, suffix, q in ((1600, '', 82), (800, '-800', 80)):
    im.resize((width, round(h*width/w)), Image.LANCZOS).save(f'collections/bulgarian-broderie/images/{n}{suffix}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
" /path/to/original.jpg 14
```

`images/og-image.jpg` (1200x630) is the link preview used by social networks and messengers.

## Third-party assets

Font Awesome (cdnjs) and marked (jsDelivr) are pinned to exact versions with Subresource
Integrity hashes. When upgrading either, update the `integrity` attribute on every page that
loads it; the browser refuses a file whose hash does not match.

## Legal pages

`privacy_policy.md` and `terms_and_conditions.md` describe what the site actually does
(static pages, no cookies, YouTube embed through the privacy-enhanced player). Update them and
the `Last Updated` line whenever a third-party service, form, or tracking is added.

## Deploy

Push to the default branch — GitHub Pages serves the repo as-is.
