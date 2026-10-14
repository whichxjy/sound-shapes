# Three-note chord proposal

## Decision

Add a **Triads** mode after the current **Intervals** mode. The default explanation for three simultaneous notes will be three pairwise Lissajous views, one for each note pair. A rotatable 3D trajectory may be offered later as a clearly labeled alternate mathematical view. It should not replace the pairwise views or be described as the physical shape of a chord.

This is a design proposal; the triad feature is not implemented yet.

## Why three notes do not require a 3D interface

Three oscillations can form a trajectory in three mathematical coordinates:

```text
r(t) = (sin(2π f₁t + φ₁), sin(2π f₂t + φ₂), sin(2π f₃t + φ₃))
```

For rational frequency ratios this trajectory repeats. It can be rendered in 3D, but any view on a screen is a projection. Camera angle, perspective, and occlusion change the apparent complexity. The trajectory is a mathematical construction, not a sound wave moving in three spatial directions and not a measure of consonance.

The three coordinate-plane projections correspond to the three note pairs. They preserve the current site's familiar visual language and allow visitors to inspect which notes contribute to each curve. A three-panel arrangement also works on phones, needs no 3D library, and remains accessible when motion is reduced.

## First two examples

Use the same C4 base frequency and just-intonation convention as the interval study.

| Chord | Notes | Relative frequencies | Pairwise ratios |
| --- | --- | --- | --- |
| C major | C4, E4, G4 | 4:5:6 | C–E 5:4; C–G 3:2; E–G 6:5 |
| C minor | C4, E♭4, G4 | 10:12:15 | C–E♭ 6:5; C–G 3:2; E♭–G 5:4 |

These two examples use the same three pairwise interval classes in different positions. Their drawings should invite comparison without implying that matching pairwise shapes guarantee the same perceived chord quality. The sound is the combination of all three notes. Even for simple tones, a listener's response is not necessarily the sum of three independent interval judgments.

The relative frequencies specify a tuning choice. Note names alone do not uniquely specify a ratio. Future diminished and augmented triads need explicit tuning decisions before they are added.

## Proposed interaction

1. Keep the current interval atlas as the default. Add a clear **Intervals / Triads** mode switch.
2. Show triad cards with names, all three notes, and the whole-number frequency relationship. A card opens a detailed study.
3. In the detailed study, show three labeled pairwise plots in a stable order: low–middle, low–high, middle–high. Keep all three visible together on desktop and stack them on narrow screens.
4. Play or stop all three sine oscillators with one control. Use a lower per-oscillator gain than the current two-note playback so the combined level remains modest. Stop on blur or page hide as before.
5. Use two visual phase controls relative to the first note: middle-note phase and high-note phase. The phase in the middle–high plot is their difference. Keep the sound frequencies fixed as these visual controls move, and say so on the page.
6. State near the plots that the three views are pairwise projections of one three-signal model. Keep the scientific limitations visible.

## Data and rendering preparation

Represent a chord as an ordered list of three note objects with names and rational frequencies relative to the root. Derive each pair's reduced ratio from those values rather than entering three unrelated pairwise ratios. This guarantees that the three panels are mathematically consistent. A shared two-signal curve function can draw all panels and the current interval cards; the current interval dataset should remain independent.

If state management grows, separate musical data, mathematical curve generation, audio playback, and DOM interaction into modules before considering a framework. The proposed pairwise interface fits the existing static stack.

## Acceptance criteria for the future feature

- Switching modes preserves the current interval experience.
- Major and minor cards identify all three notes and their explicit tuning ratios.
- Selecting a triad shows exactly three labeled pairwise plots, derived from one coherent three-note dataset.
- Each visual phase control changes the relevant plots without changing any displayed frequency.
- Playback starts only on a user gesture, uses three oscillators, and stops cleanly.
- The interface never labels a curve or 3D shape as a consonance score or physical sound path.
- Keyboard access, reduced motion, and mobile layout remain usable.

## Later experiment: 3D

If a 3D view is added, treat it as an optional comparison: the same three signals rendered as a rotatable trajectory with labeled axes and a reset camera. Keep the three pairwise views alongside it. Do not infer chord quality from apparent knots, crossings, or visual density. A 3D dependency is justified only if this view proves educationally useful after testing with visitors.
