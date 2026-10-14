# Implementation and future work

## Current architecture

The website uses plain HTML, CSS, and browser JavaScript modules. `index.html` provides the content and controls, `styles.css` defines the layout, and `main.js` holds the interval data, canvas drawing, state updates, and Web Audio playback. The overview previews and large drawing share the same curve formula. No build system or runtime dependency is needed for this scope.

The selected interval is one entry from the interval table. Collection cards select without moving the page; previous/next controls in the study wrap through the same list. The study contains an animated point and audio, with phase slider, presets, and tracing pause inside a native details element. Static collection drawings stay at 0° for comparison. There is one active group of two or three oscillators. Interval selection retunes the upper oscillator; major/minor chord selection retunes the middle oscillator. Switching study modes stops playback. Pending audio starts are invalidated on stop, blur, or page hide. Failed starts clean up any oscillators already created.

## Why no framework yet

This is one page with a small set of shared state: study mode, selected interval/chord, visual phases, camera orientation, reference-cube visibility, animation progress, and playback. A framework would add installation and build steps without simplifying the current implementation. Consider a typed component stack if future work adds routing, saved experiments, several synchronized visualizations, imported audio, or substantial state sharing. Keep the mathematical model separate from UI code if that transition happens.

The three-note mode uses a rotatable orthographic 3D canvas view and expandable pairwise projections within the existing static stack. `chords.js` contains the shared three-signal math and rendering. Its model and validation steps are in [the chord study](triads.md).

## Accessibility and performance

- Use real buttons for cards and playback, a labeled native range input for phase, and visible keyboard focus.
- Communicate selection with `aria-pressed` as well as visual styling. Do not rely on color alone.
- Render previews when the collection is created and when layout size changes. Cache interval curve geometry with Path2D; chord rendering projects the three-signal trajectory with depth-dependent opacity. Animate only the detailed point while its canvas is visible; honor reduced-motion preferences and provide an explicit pause control. Use elapsed time for consistent tracing speed across refresh rates.
- Cap canvas pixel density to avoid excessive work on high-resolution displays.
- Avoid audio autoplay. Stop audio when the page becomes hidden or loses focus.

Pure uses sine oscillators; Soft uses one custom periodic waveform per note and a lower, decaying gain envelope. Gain automation is held and cancelled before retimbre or stop so a scheduled decay cannot restore stopped audio. Browsers without cancelAndHoldAtTime use cancelScheduledValues and an explicit current gain value. Timbre persists across mode switches.

## Manual checks

1. Start a static server with `python3 -m http.server 8000` and open `http://localhost:8000`.
2. Verify the initial desktop view offers playback, expanding “Adjust the drawing” reveals phase controls, the collection displays twelve drawings, and the page adapts on a phone without horizontal scrolling.
3. Choose a minor second, perfect fifth, and octave; check the ratio, upper frequency, and enlarged curve.
4. Move phase from 0° to 90°; check that the curve changes while the frequency readout does not.
5. Start, switch intervals, and stop playback. Check the button state and listen at a low volume.
6. Navigate cards and controls by keyboard. Check phase presets, wrapping previous/next selection, and tracing pause/resume. Test with reduced motion if available.

7. Switch Pure / Soft before and during playback in both modes. Confirm pitches and drawings stay fixed, Soft settles to a quieter sustain, and stop or mode switching cancels the envelope.

Chord-specific checks, including rotation, projection consistency, and reference-cube visibility, are in [the chord study](triads.md).

## Public repository checklist

- Keep source code and documentation in English.
- Do not include the original video, third-party images, downloaded fonts, or private data.
- Choose and add a license before describing the repository as open source. Public visibility alone does not grant reuse rights.
- If third-party assets or packages are added later, record their source and license.
