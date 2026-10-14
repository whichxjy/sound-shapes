# Scientific model and limits

## What the curve is

For a selected interval, the drawing uses two sine signals:

```text
x(t) = A sin(2π q t)
y(t) = B sin(2π p t + φ)
```

Here `p:q` is the upper-to-base frequency ratio, `φ` is the displayed relative phase, and `t` runs through one complete repeat of the ratio. The axes represent two signal values, not position in air. The figure is a parametric plot. For rational ratios, the path closes; ratios with larger integers generally need more oscillations to complete it. The exact appearance also depends on phase and axis scaling. Interval drawings use SVG cubic segments with analytic sine tangents, sampled at least 32 times per fastest cycle, to closely approximate this trajectory without scaling a bitmap.

The base frequency is C4 = 261.625565 Hz. The upper frequency is calculated as `base × p / q`. These are illustrative **just-intonation** choices. Some do not match the same named note on an equal-tempered piano: for example, the selected 5:3 major sixth is about 436.0 Hz, rather than the piano's A4 = 440 Hz. The names identify approximate musical intervals, not a claim that every tuning system uses those frequencies.

## Included interval set

| Upper note | Interval | Ratio |
| --- | --- | ---: |
| D♭4 | Minor second | 16:15 |
| D4 | Major second | 9:8 |
| E♭4 | Minor third | 6:5 |
| E4 | Major third | 5:4 |
| F4 | Perfect fourth | 4:3 |
| F♯4 | Tritone | 45:32 |
| G4 | Perfect fifth | 3:2 |
| A♭4 | Minor sixth | 8:5 |
| A4 | Major sixth | 5:3 |
| B♭4 | Minor seventh | 9:5 |
| B4 | Major seventh | 15:8 |
| C5 | Octave | 2:1 |

The list is ordered by ascending pitch. It is not ordered by harmonic complexity, consonance, or preference.

## What the sound is

Web Audio plays two or three oscillators at the displayed fundamental frequencies. Pure uses sine waves without upper harmonics. Soft, the default timbre, uses a custom periodic waveform with relative sine coefficients 1, 0.12, and 0.035 for the fundamental, second, and third harmonics. Its 160 ms attack reaches a lower peak and fades to 55% of that level over 1.6 seconds, then sustains until stopped. It is a synthesized listening option, not a piano simulation. Loudness is not perceptually matched between timbres.

The curves always depict sine signals at the fundamental frequencies; they do not depict Soft’s complete waveform or amplitude envelope. Visual phase controls do not change audio phase. Timbre can be switched during playback without changing pitch, and the choice persists across study modes. The playback is a demonstration, not a controlled psychoacoustic experiment.

## What cannot be concluded

Neither the number of lobes, number of line crossings, nor visual density is a validated measure of dissonance. Perceived consonance depends on the spectrum and level of each sound, register, tuning, musical context, culture, and listener. Research discusses several mechanisms, including beating or roughness among nearby partials, harmonicity, and familiarity. These mechanisms do not reduce to one visual complexity score. In particular, comparing these pure-tone examples with rich instrumental chords requires care.

The curve is also not a picture of a sound wave moving through a room, nor a physical trajectory of a vibrating object. It is a mathematical view of signal values.

## Three-note model

Chords use `r(t) = (sin(2π a t), sin(2π b t + φ₂), sin(2π c t + φ₃))`. C major uses 4:5:6; C minor uses 10:12:15. Each audible frequency is `C4 × coefficient / root coefficient`. All three tones play together. The two visual phase controls do not change their audio phases.

The 3D trajectory is shown through an orthographic camera. Camera rotation changes its outline without changing the underlying signals. A reference cube bounds each signal from −1 to +1; it is a coordinate guide, not a room or physical enclosure. The expandable XY, XZ, and YZ plots use the same signal phases and mathematical time. Their reduced ratios are derived from the chord coefficients.

Whole-chord perception cannot be inferred solely from pairwise drawings or the apparent regularity of the 3D shape. See [the chord study](triads.md) for the ratios and interaction details.

## Reading

- [Wolfram MathWorld: Lissajous Curve](https://mathworld.wolfram.com/LissajousCurve.html) — mathematical definition and examples.
- [Plomp and Levelt (1965), *Tonal consonance and critical bandwidth*](https://doi.org/10.1121/1.1909741) — classic study of roughness and pure tones.
- [McDermott, Schultz, Undurraga, and Godoy (2016), *Indifference to dissonance in native Amazonians reveals cultural variation in music perception*](https://doi.org/10.1038/nature18635) — evidence that preference is not culturally fixed.

These references inform the interpretation; the site does not reproduce their experiments or claim that any one theory fully explains consonance.
