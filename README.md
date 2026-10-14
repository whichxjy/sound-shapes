# Sound Shapes

A small, dependency-free website for seeing and hearing musical intervals. Its opening atlas shows twelve Lissajous curves at once; selecting one opens a larger view with phase and playback controls.

The project brief, scientific boundaries, and implementation notes live in [docs](docs/README.md). They are the source of context for future development; the original video is not needed.

## Run locally

Serve this directory with any static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What the visual means

The base note controls the horizontal axis and the upper note controls the vertical axis. A curve is a mathematical representation of their frequency ratio, not the physical path of sound. Changing phase changes the curve without changing the pitch interval. The included ratios are examples of just intonation; most modern pianos use equal temperament. The atlas is arranged by pitch, not by consonance.

All code, layout, and visual assets in this project were made for this project. No third-party runtime packages or media assets are included.

Before publishing, choose a license for the repository. Public visibility alone does not grant permission to reuse the code.
