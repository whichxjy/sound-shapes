export const chords = [
  { name: "C major", notes: ["C", "E", "G"], ratios: [4, 5, 6] },
  { name: "C minor", notes: ["C", "E♭", "G"], ratios: [10, 12, 15] },
];

export function chordPoint(chord, position, phases) {
  return chord.ratios.map((ratio, index) => Math.sin(2 * Math.PI * ratio * position + phases[index]));
}

export function projectPoint(point, yaw, tilt) {
  const horizontal = point[0] * Math.cos(yaw) + point[2] * Math.sin(yaw);
  const depth = -point[0] * Math.sin(yaw) + point[2] * Math.cos(yaw);
  return [horizontal, point[1] * Math.cos(tilt) - depth * Math.sin(tilt), point[1] * Math.sin(tilt) + depth * Math.cos(tilt)];
}

export function pairRatio(chord, first, second) {
  let numerator = chord.ratios[second];
  let denominator = chord.ratios[first];
  while (denominator) {
    const remainder = numerator % denominator;
    numerator = denominator;
    denominator = remainder;
  }
  return [chord.ratios[second] / numerator, chord.ratios[first] / numerator];
}

export function drawChord(target, chord, phases, progress, yaw, tilt, pair, showFrame = false) {
  const drawing = target.getContext("2d");
  const width = target.clientWidth;
  const height = target.clientHeight;
  if (!width || !height) return;
  drawing.clearRect(0, 0, width, height);
  const scale = Math.min(width, height) * (pair ? .36 : .24);
  const screen = point => {
    const projected = pair ? [point[pair[0]], point[pair[1]], 0] : projectPoint(point, yaw, tilt);
    return [width / 2 + projected[0] * scale, height / 2 - projected[1] * scale, projected[2]];
  };
  if (!pair) {
    if (showFrame) {
      const corners = Array.from({ length: 8 }, (_, index) => [0, 1, 2].map(axis => index & (1 << axis) ? 1 : -1));
      const edges = [];
      corners.forEach((corner, index) => {
        for (let axis = 0; axis < 3; axis++) {
          if (index & (1 << axis)) continue;
          const start = screen(corner);
          const end = screen(corners[index | (1 << axis)]);
          edges.push({ start, end, depth: (start[2] + end[2]) / 2 });
        }
      });
      edges.sort((first, second) => first.depth - second.depth);
      drawing.lineWidth = .8;
      for (const { start, end, depth } of edges) {
        drawing.strokeStyle = `rgba(116, 115, 108, ${depth < 0 ? .13 : .27})`;
        drawing.beginPath();
        drawing.moveTo(start[0], start[1]);
        drawing.lineTo(end[0], end[1]);
        drawing.stroke();
      }
    }
    drawing.strokeStyle = "#dedbd3";
    drawing.lineWidth = 1;
    chord.notes.forEach((note, index) => {
      const start = [0, 0, 0];
      const end = [0, 0, 0];
      start[index] = -1.25;
      end[index] = 1.4;
      const [startX, startY] = screen(start);
      const [endX, endY] = screen(end);
      drawing.beginPath();
      drawing.moveTo(startX, startY);
      drawing.lineTo(endX, endY);
      drawing.stroke();
      drawing.fillStyle = "#74736c";
      drawing.font = "11px Arial";
      drawing.fillText(`${["X", "Y", "Z"][index]} · ${note}`, endX + 6, endY);
    });
  }
  const steps = Math.max(900, Math.max(...chord.ratios) * 100);
  let previous = screen(chordPoint(chord, 0, phases));
  drawing.lineWidth = pair ? 1 : 1.6;
  for (let index = 1; index <= steps; index++) {
    const current = screen(chordPoint(chord, index / steps, phases));
    drawing.strokeStyle = pair ? "#5363ac" : `rgba(38, 63, 186, ${.5 + (current[2] + 1.8) / 7})`;
    drawing.beginPath();
    drawing.moveTo(previous[0], previous[1]);
    drawing.lineTo(current[0], current[1]);
    drawing.stroke();
    previous = current;
  }
  const [pointX, pointY] = screen(chordPoint(chord, progress, phases));
  drawing.fillStyle = "#bf4928";
  drawing.beginPath();
  drawing.arc(pointX, pointY, pair ? 2 : 3, 0, 2 * Math.PI);
  drawing.fill();
}
