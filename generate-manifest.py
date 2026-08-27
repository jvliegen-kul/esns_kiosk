#!/usr/bin/env python3
"""
Regenerate images/manifest.json from the contents of the images/ folder.

Run this any time you add, remove, or rename files in images/:

    python3 generate-manifest.py

It writes a JSON array of filenames (sorted naturally, so "img2" sorts
before "img10") that script.js reads to build the carousel.
"""
import json
import re
from pathlib import Path

IMAGES_DIR = Path(__file__).parent / "images"
MANIFEST_PATH = IMAGES_DIR / "manifest.json"
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"}


def natural_key(name: str):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", name)]


def main():
    if not IMAGES_DIR.exists():
        print(f"Error: {IMAGES_DIR} does not exist.")
        return

    files = [
        f.name
        for f in IMAGES_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in VALID_EXTENSIONS and f.name != "manifest.json"
    ]
    files.sort(key=natural_key)

    MANIFEST_PATH.write_text(json.dumps(files, indent=2) + "\n")

    if files:
        print(f"Wrote {len(files)} image(s) to {MANIFEST_PATH}:")
        for f in files:
            print(f"  - {f}")
    else:
        print(f"No images found in {IMAGES_DIR}. Wrote an empty manifest.")


if __name__ == "__main__":
    main()
