# Product brief

## Purpose

Sound Shapes is a small interactive exhibit about musical intervals, three-note chords, and Lissajous curves. A visitor can compare interval drawings, hear two or three pitches together, and explore their mathematical relationships without treating geometry as a verdict on consonance.

The site is in English. It is intended to be public on GitHub and usable as a static website. It does not require the original video, an account, a microphone, or external media.

## Audience and primary journey

The intended visitor is curious about music or geometric diagrams, but may not know music theory. The first screen presents a centered curve, note pair, interval name, ratio, and playback. Previous and next controls invite exploration. Phase controls and tracing pause live in an expandable “Adjust the drawing” area. A compact collection below shows all twelve intervals side by side. Selecting a specimen updates the study without scrolling; a separate link returns to it.

The visitor should leave with three ideas:

1. Two periodic signals can be plotted against each other to form a Lissajous curve.
2. Small whole-number frequency ratios create paths that repeat after relatively few cycles.
3. Visual complexity alone does not determine perceived consonance. The appearance can change with phase while the audible frequencies stay fixed.

## Current experience

The Chords mode replaces the interval collection with one rotatable three-signal trajectory. Major / Minor compares C–E–G and C–E♭–G during playback, changing only the middle pitch. Switching study modes stops playback. A faint reference cube is shown by default and can be toggled in “Adjust the drawing.” Major / Minor sits below the study heading, while Pure / Soft sits below the centered playback button. Two visual phase controls and three pairwise projections stay inside expandable sections with aligned, left-justified summaries. Tuning and model details are in [the chord study](triads.md).

- Show all twelve chosen intervals above C4 in ascending pitch order. This order is musical position, not a consonance ranking.
- Use one base pitch, C4 at approximately 261.63 Hz, and sample just-intonation ratios for the upper pitches.
- Display each interval in an overview grid. Card selection updates the larger drawing, ratio, note labels, and frequency readout.
- Let the visitor vary the relative phase from 0° to 360°. Phase changes the drawing and does not change the oscillator frequencies.
- Play both pitches quietly with the selected timbre on explicit user action. Stop on a second click, page hide, or window blur.
- Offer Pure and Soft (default) timbres in both modes. Switching timbre during playback keeps pitches fixed; curves continue to represent fundamental sine signals.
- Explain the model and its limits in visible page copy, with a link for further reading.

## Visual direction

The page should feel quiet and minimal: warm paper, cobalt curves, one type family, and generous whitespace. One centered drawing is the focal point. Keep headings small, remove decorative numbering and unnecessary axes, and show secondary controls and detailed explanations only on expansion. The compact collection shows comparable drawings at a baseline phase of 0°, in ascending pitch order, not a ranking. Avoid dashboard panels, decorative status indicators, stock imagery, and gradients.

## Acceptance criteria

- The initial desktop view offers immediate playback; visual phase adjustment is available through “Adjust the drawing.” All twelve interval drawings are available in a collection without opening a selector. On a narrow phone, cards remain legible and the page has no horizontal overflow.
- Phase presets provide 0°, 90°, and 180° starting points. Tracing can be paused independently of audio, and starts paused when reduced motion is requested.
- Each card is keyboard reachable; the active card is visibly and programmatically identified.
- Selecting a card updates all labels, frequencies, and the large curve. If audio is already playing, its upper oscillator moves to the new frequency.
- Phase adjustment redraws the large curve while the numeric frequencies stay the same.
- Audio starts only after a user gesture, remains at a modest level, and can be stopped.
- The page does not imply that curve complexity measures pleasantness or that a Lissajous curve traces the physical path of sound.
- The site works from a basic static HTTP server without installing packages.
- The 3D view rotates through pointer input and keyboard arrows, resets through Home or Reset view, and offers a reference-cube toggle. The cube and labeled axes provide subtle orientation guides within the minimal visual style.
- Chord projections derive from the same three signals, visual phases, and tracing time as the main view. Camera rotation does not change those projections.

## Out of scope for this version

No consonance score, automatic good/bad labels, waveform upload, microphone access, recording, or faithful reproduction of the source video's diagrams. Additional timbres, tuning systems, chord types, and controlled listening comparisons may be explored later, with their assumptions stated clearly.
