# Product brief

## Purpose

Sound Shapes is a small interactive exhibit about musical intervals and Lissajous curves. A visitor should be able to see several interval drawings at once, choose one, hear two pitches, and discover that a compelling geometric shape is not a verdict on how consonant the sounds are.

The site is in English. It is intended to be public on GitHub and usable as a static website. It does not require the original video, an account, a microphone, or external media.

## Audience and primary journey

The intended visitor is curious about music or geometric diagrams, but may not know music theory. The first screen presents a centered curve, note pair, interval name, ratio, and playback. Previous and next controls invite exploration. Phase controls and tracing pause live in an expandable “Adjust the drawing” area. A compact collection below shows all twelve intervals side by side. Selecting a specimen updates the study without scrolling; a separate link returns to it.

The visitor should leave with three ideas:

1. Two periodic signals can be plotted against each other to form a Lissajous curve.
2. Small whole-number frequency ratios create paths that repeat after relatively few cycles.
3. Visual complexity alone does not determine perceived consonance. The appearance can change with phase while the two frequencies stay fixed.

## Current experience

- Show all twelve chosen intervals above C4 in ascending pitch order. This order is musical position, not a consonance ranking.
- Use one base pitch, C4 at approximately 261.63 Hz, and sample just-intonation ratios for the upper pitches.
- Display each interval in an overview grid. Card selection updates the larger drawing, ratio, note labels, and frequency readout.
- Let the visitor vary the relative phase from 0° to 360°. Phase changes the drawing and does not change the oscillator frequencies.
- Play both pitches as quiet sine waves on explicit user action. Stop on a second click, page hide, or window blur.
- Explain the model and its limits in visible page copy, with a link for further reading.

## Visual direction

The page should feel quiet and minimal: warm paper, cobalt curves, one type family, and generous whitespace. One centered drawing is the focal point. Keep headings small, remove decorative numbering and axes, and show secondary controls and detailed explanations only on expansion. The compact collection shows comparable drawings at a baseline phase of 0°, in ascending pitch order, not a ranking. Avoid dashboard panels, decorative status indicators, stock imagery, and gradients.

## Acceptance criteria

- The initial desktop view offers immediate playback; visual phase adjustment is available through “Adjust the drawing.” All twelve interval drawings are available in a collection without opening a selector. On a narrow phone, cards remain legible and the page has no horizontal overflow.
- Phase presets provide 0°, 90°, and 180° starting points. Tracing can be paused independently of audio, and starts paused when reduced motion is requested.
- Each card is keyboard reachable; the active card is visibly and programmatically identified.
- Selecting a card updates all labels, frequencies, and the large curve. If audio is already playing, its upper oscillator moves to the new frequency.
- Phase adjustment redraws the large curve while the numeric frequencies stay the same.
- Audio starts only after a user gesture, remains at a modest level, and can be stopped.
- The page does not imply that curve complexity measures pleasantness or that a Lissajous curve traces the physical path of sound.
- The site works from a basic static HTTP server without installing packages.

## Out of scope for this version

No consonance score, automatic good/bad labels, waveform upload, microphone access, recording, or faithful reproduction of the source video's diagrams. Additional timbres, tuning systems, and controlled listening comparisons may be explored later, with their assumptions stated clearly.
