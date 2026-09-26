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
fonts/                             Self-hosted Montserrat + Cormorant Garamond (woff2, OFL) and fonts.css
video/hero-loop.mp4                Short muted runway loop for the home page hero (desktop only)
styles/collection-template.css     Styles for collection pages
scripts/collection-template.js     Builds a collection page from its data.json
```

## Adding / editing collection content

Edit the relevant `collections/<name>/data.json`. Top level: `title`, `description`, optional
`video` (`youtubeId`, `title`) which renders the embedded player only when present, and
`imageWidth` (pixel width of the full-size photos). Each item needs `id`, `title`, `image`
(filename inside that folder's `images/`) and may carry `description`, `material`, `fabric`,
`craftsmanship` (empty values are hidden in the detail view) and `orientation: "landscape"`
for photos that are wider than tall.

To add a collection, copy an existing `collections/<name>/` folder, replace `data.json` and
`images/`, adjust the `<title>`, meta tags and `<h1>` in its `index.html`, and add the link to
the Collections menus (desktop, mobile, footer) on every page plus an entry in `sitemap.xml`.

## Images

Every collection photo exists in two sizes: `<n>.jpg` full size for the detail view (1600px wide
in Bulgarian broderie, 1400px in Summer 2026, recorded as `imageWidth` in `data.json`) and
`<n>-800.jpg` at 800x1200 for the grid. Landscape photos get an extra `<n>-1200.jpg` centre crop
at 1200x1800 because the grid frame is 2:3. When adding a photo, export both from the
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

## Fonts and hero film

Both font families are served from `fonts/` (latin subset, SIL Open Font License) so no font
request leaves the site. `fonts/fonts.css` holds the `@font-face` rules; every page links it before
its own stylesheet.

The home page hero shows `images/hero-poster.jpg` and, on screens wider than 768px without
reduced-motion or data-saver preferences, fades in `video/hero-loop.mp4` (about 18 seconds, muted,
looping, H.264 720p). To replace the loop, cut a new clip with ffmpeg, keep it under ~4 MB, export
its first frame as the poster, and keep the file names.

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
