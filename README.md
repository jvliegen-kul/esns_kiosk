# Info kiosk image carousel

A static, single-purpose website: full-screen, auto-advancing image
carousel with no chrome, buttons, or scrollbars. Built for an
unattended info-stand display.

## Folder layout

```
kiosk-carousel/
├── index.html
├── style.css
├── script.js
├── generate-manifest.py
└── images/
    ├── manifest.json   <- list of filenames to show, in order
    ├── photo1.jpg
    ├── photo2.jpg
    └── ...
```

## Adding / changing images

1. Drop your image files into `images/`.
2. Regenerate the list the carousel reads from:
   ```
   python3 generate-manifest.py
   ```
   This scans `images/` and writes `images/manifest.json` sorted in a
   natural order (`img2.jpg` before `img10.jpg`).
3. Reload the page (or restart the kiosk browser).

No build step, no server-side code — the site is just static files.
If you'd rather hand-edit the order or skip a file, edit
`images/manifest.json` directly instead of running the script; it's
just a plain JSON array of filenames, e.g.:

```json
["welcome.jpg", "menu.png", "hours.jpg"]
```

## Running it

Any static file server works. Locally, from this folder:

```
python3 -m http.server 8000
```

then open `http://localhost:8000`. For the actual kiosk you can:

- Serve the folder from any static host (nginx, Apache, Netlify,
  GitHub Pages, an S3 bucket, etc.), or
- Just open `index.html` directly in the kiosk browser — no images
  will fail to load doing it this way, but note some browsers block
  `fetch()` of local files under `file://`; serving over local
  `http://` avoids that entirely and is recommended.

## Setting up the actual kiosk display

Most "kiosk mode" setups boil down to launching a browser full-screen
with no address bar, pointed at your local server, and configured to
never sleep. For example with Chrome/Chromium on the kiosk machine:

```
chromium --kiosk --incognito --noerrdialogs --disable-translate \
  --no-first-run http://localhost:8000
```

Also worth doing on the kiosk machine itself:
- Disable screen sleep / screensaver.
- Set the browser (or OS) to auto-launch on boot, so it recovers
  from a power cut with no one on site.
- If the machine restarts unexpectedly, having the browser/OS start
  automatically means the carousel just comes back up on its own.

## Behavior notes

- Images are shown with `object-fit: contain`, so nothing gets
  cropped — mismatched aspect ratios just letterbox on black.
- Each image displays for 8 seconds (edit `slideDurationMs` in
  `script.js` to change), with a crossfade and a thin progress bar
  at the top.
- The cursor is hidden and the page requests fullscreen on first
  tap/click, as a fallback for setups not already launched in kiosk
  mode.
- If `images/manifest.json` is empty or missing, the page shows a
  plain on-screen message instead of a blank black screen, so it's
  obvious at a glance if something needs fixing.
