# Sound Shapes

A small, dependency-free website for seeing and hearing musical intervals and three-note chords. Intervals pair a large Lissajous curve with a twelve-interval collection. Chords offer a rotatable three-dimensional signal trajectory, simultaneous three-note playback, major/minor comparison, and expandable pairwise projections. Visual phase controls change the drawings without changing the pitches.

The project brief, scientific boundaries, and implementation notes live in [docs](docs/README.md). They are the source of context for future development; the original video is not needed.

## Run locally

Serve this directory with any static HTTP server, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What the visual means

In Intervals, the base note controls the horizontal axis and the upper note controls the vertical axis. In Chords, the root, third, and fifth control X, Y, and Z. The reference cube is shown by default and can be turned off in “Adjust the drawing.” Drag or use arrow keys to rotate; Reset view or Home restores the camera.

These curves represent frequency relationships, not the physical path of sound or a measure of harmony. Changing visual phase or camera angle changes the drawing without changing the pitches. The included ratios are examples of just intonation; most modern pianos use equal temperament. The interval collection is arranged by pitch, not by consonance.

All code, layout, and visual assets in this project were made for this project. No third-party runtime packages or media assets are included.

Before publishing, choose a license for the repository. Public visibility alone does not grant permission to reuse the code.
