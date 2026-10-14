# Three-note chord study

## Current experience

The Intervals / Chords switch preserves the interval collection and opens a three-note study. The chord mode uses one rotatable 3D trajectory as its main visual and plays all three tones together. Major / Minor buttons change the middle pitch during playback. Previous / next controls select the same two chords.

| Chord | Notes | Relative frequencies | Pairwise ratios |
| --- | --- | --- | --- |
| C major | C4, E4, G4 | 4:5:6 | C–E 5:4; C–G 3:2; E–G 6:5 |
| C minor | C4, E♭4, G4 | 10:12:15 | C–E♭ 6:5; C–G 3:2; E♭–G 5:4 |

Both use C4 = 261.625565 Hz and illustrative just intonation. These tuning choices differ from equal temperament.

## Mathematical view

The trajectory is `r(t) = (sin(2π a t), sin(2π b t + φ₂), sin(2π c t + φ₃))`, with integer coefficients from the selected chord. Each axis is a signal value, not a physical position of sound. Orthographic projection and depth-dependent ink opacity provide the screen view. Dragging rotates the camera; arrow keys rotate it when the canvas has focus, and Home or Reset view restores the initial orientation.

The outline depends on camera angle and visual phase. Neither its regularity nor its complexity measures harmony. Listening to the complete chord remains the primary comparison. A faint reference cube bounds signal values from −1 to +1 on each axis and rotates with the same camera; rear edges are lighter. It is shown by default, and its visibility can be toggled in “Adjust the drawing.”

## Secondary controls

“Adjust the drawing” exposes two visual phases relative to the root and a tracing pause control. These controls do not change audio phase or frequency. Tracing begins paused for reduced-motion preferences; the camera moves only on explicit input.

“See the three relationships” exposes XY, XZ, and YZ projections. They use the complete three-signal model at the same time and phase as the main view. Pair ratios are reduced from the chord coefficients, and the middle–high projection uses the two actual signal phases. Their geometry is independent of camera orientation. Playback continues to include all three notes.

## Implementation

`chords.js` contains chord data, signal points, orthographic rotation, ratio reduction, and canvas rendering. The existing static stack needs no 3D runtime dependency. Audio starts the oscillators at one shared time. Pure per-oscillator gain peaks at 0.13 divided by the number of notes. Soft peaks at 0.095 divided by the number of notes and fades to a quieter sustain; changing study mode stops playback and cancels any pending start.

Rendering is limited to the visible main study, and closed projection details do not animate. Tracing uses a slowed mathematical clock, not an attempt to animate the audible frequency in real time. Its root-axis speed is consistent between major and minor examples.

## Manual checks

1. Switch between Intervals and Chords; verify labels, controls, collection visibility, and stopped playback.
2. Play C major, switch to C minor during playback, and verify that only the middle frequency changes.
3. Drag the trajectory, rotate with the keyboard, and reset the camera. Toggle the reference cube off and on; verify it rotates with the trajectory and stays within the canvas.
4. Open the projections and verify major ratios 5:4, 3:2, 6:5 and minor ratios 6:5, 3:2, 5:4.
5. Change both visual phases; check that the corresponding projections change while pitches remain fixed.
6. Pause tracing, test reduced motion, and confirm phone layout has no horizontal overflow.

Additional chord types and inversions require explicit tuning choices before they are added.
