import { chords, drawChord, pairRatio } from "./chords.js";

const intervals = [
  { note: "D♭4", name: "Minor second", upper: 16, lower: 15 },
  { note: "D4", name: "Major second", upper: 9, lower: 8 },
  { note: "E♭4", name: "Minor third", upper: 6, lower: 5 },
  { note: "E4", name: "Major third", upper: 5, lower: 4 },
  { note: "F4", name: "Perfect fourth", upper: 4, lower: 3 },
  { note: "F♯4", name: "Tritone", upper: 45, lower: 32 },
  { note: "G4", name: "Perfect fifth", upper: 3, lower: 2 },
  { note: "A♭4", name: "Minor sixth", upper: 8, lower: 5 },
  { note: "A4", name: "Major sixth", upper: 5, lower: 3 },
  { note: "B♭4", name: "Minor seventh", upper: 9, lower: 5 },
  { note: "B4", name: "Major seventh", upper: 15, lower: 8 },
  { note: "C5", name: "Octave", upper: 2, lower: 1 },
];

const baseFrequency = 261.625565;
const canvas = document.querySelector("#curve");
const grid = document.querySelector("#interval-grid");
const phaseInput = document.querySelector("#phase");
const playButton = document.querySelector("#play");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const cards = [];
const curvePaths = new WeakMap();
const motionButton = document.querySelector("#motion");

let selectedIndex = 6;
let phase = 0;
let frame = 0;
let audioContext;
let oscillators = [];
let masterGain;
let playing = false;
let audioStarting = false;
let audioRequest = 0;
let tracing = !reducedMotion.matches;
let detailVisible = true;
let lastTime;
let mode = "intervals";
let selectedChord = 0;
let yaw = -.55;
let tilt = .45;
let dragPosition;
let showFrame = true;
const chordPhases = [0, 0, 0];
const pairs = [[0, 1], [0, 2], [1, 2]];
const pairCanvases = pairs.map((pair, index) => document.querySelector(`#pair-${index}`));

function frequencies() {
  if (mode === "chords") {
    const ratios = chords[selectedChord].ratios;
    return ratios.map(ratio => baseFrequency * ratio / ratios[0]);
  }
  return [baseFrequency, upperFrequency(intervals[selectedIndex])];
}

function idlePlayText() {
  return mode === "chords" ? "Play chord" : "Play both notes";
}

function updateChord() {
  const chord = chords[selectedChord];
  document.querySelector("#interval-title").textContent = chord.notes.join(" + ");
  document.querySelector("#interval-name").textContent = chord.name;
  document.querySelector("#ratio").textContent = chord.ratios.join(" : ");
  document.querySelector("#chord-frequencies").textContent = frequencies().map(frequency => `${frequency.toFixed(1)} Hz`).join(" + ");
  document.querySelector("#selected-summary").textContent = `Selected: ${chord.name}, ${chord.notes.join(", ")}`;
  canvas.setAttribute("aria-label", `Rotatable three-dimensional signal trajectory for ${chord.name}. X: ${chord.notes[0]}, Y: ${chord.notes[1]}, Z: ${chord.notes[2]}`);
  document.querySelectorAll("[data-chord]").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.chord) === selectedChord)));
  pairs.forEach(([first, second], index) => {
    const ratio = pairRatio(chord, first, second);
    const label = `${chord.notes[first]}–${chord.notes[second]} · ${ratio.join(":")}`;
    pairCanvases[index].setAttribute("aria-label", `Pairwise projection ${label}`);
    pairCanvases[index].nextElementSibling.textContent = label;
  });
  if (playing) frequencies().forEach((frequency, index) => oscillators[index].frequency.setTargetAtTime(frequency, audioContext.currentTime, .025));
  drawDetail();
}

function setMode(nextMode) {
  stopAudio();
  dragPosition = undefined;
  mode = nextMode;
  document.body.classList.toggle("chord-mode", mode === "chords");
  document.querySelectorAll("[data-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
  document.querySelectorAll("#chord-view-controls, #chord-switch, #chord-caption, #chord-extras").forEach(element => { element.hidden = mode !== "chords"; });
  document.querySelector(".drawing-options").hidden = mode === "chords";
  document.querySelector(".overview").hidden = mode === "chords";
  document.querySelector("#detail").setAttribute("aria-label", mode === "chords" ? "Selected chord visualizer" : "Selected interval visualizer");
  document.querySelector("#intro-description").textContent = mode === "chords" ? "Three notes, one shape. Listen to the whole relationship." : "Two notes, one shape. Explore the space between them.";
  document.querySelector("#previous").setAttribute("aria-label", mode === "chords" ? "Previous chord" : "Previous interval");
  document.querySelector("#next").setAttribute("aria-label", mode === "chords" ? "Next chord" : "Next interval");
  canvas.tabIndex = mode === "chords" ? 0 : -1;
  document.querySelector("#play-text").textContent = idlePlayText();
  if (mode === "chords") updateChord();
  else updateSelection(selectedIndex);
  resizeCanvases();
}

function shortNote(note) {
  return note.slice(0, -1);
}

function upperFrequency(interval) {
  return baseFrequency * interval.upper / interval.lower;
}

function sizeCanvas(target) {
  const pixelRatio = Math.min(devicePixelRatio || 1, 2);
  const width = target.clientWidth;
  const height = target.clientHeight;
  if (!width || !height) return false;
  target.width = Math.round(width * pixelRatio);
  target.height = Math.round(height * pixelRatio);
  target.getContext("2d").setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return true;
}

function drawCurve(target, interval, relativePhase, progress, preview = false) {
  const drawing = target.getContext("2d");
  const width = target.clientWidth;
  const height = target.clientHeight;
  if (!width || !height) return;

  drawing.clearRect(0, 0, width, height);

  const radiusX = Math.min(width * .38, height * .62);
  const radiusY = height * .37;
  const steps = preview ? Math.max(800, interval.upper * 32) : Math.max(1200, interval.upper * 96);
  const point = position => {
    const angle = 2 * Math.PI * position;
    return [
      width / 2 + Math.sin(angle * interval.lower) * radiusX,
      height / 2 - Math.sin(angle * interval.upper + relativePhase) * radiusY,
    ];
  };

  const pathKey = `${width}/${height}/${interval.upper}/${interval.lower}/${relativePhase}`;
  let cached = curvePaths.get(target);
  if (cached?.key !== pathKey) {
    const path = new Path2D();
    for (let index = 0; index <= steps; index++) {
      const [pointX, pointY] = point(index / steps);
      if (index === 0) path.moveTo(pointX, pointY);
      else path.lineTo(pointX, pointY);
    }
    cached = { key: pathKey, path };
    curvePaths.set(target, cached);
  }
  drawing.strokeStyle = preview ? "#5363ac" : "#263fba";
  drawing.lineWidth = preview ? 1 : 1.8;
  drawing.stroke(cached.path);

  if (progress === undefined) return;
  const [x, y] = point(progress);
  drawing.fillStyle = "rgba(213, 92, 52, .13)";
  drawing.beginPath();
  drawing.arc(x, y, 10, 0, 2 * Math.PI);
  drawing.fill();
  drawing.fillStyle = "#bf4928";
  drawing.beginPath();
  drawing.arc(x, y, 3, 0, 2 * Math.PI);
  drawing.fill();
}

function drawDetail() {
  if (mode === "chords") {
    const progress = frame / (720 * chords[selectedChord].ratios[0]);
    drawChord(canvas, chords[selectedChord], chordPhases, progress, yaw, tilt, undefined, showFrame);
    if (document.querySelector("#pair-details").open) {
      pairs.forEach((pair, index) => drawChord(pairCanvases[index], chords[selectedChord], chordPhases, progress, yaw, tilt, pair));
    }
    return;
  }
  drawCurve(canvas, intervals[selectedIndex], phase, frame / 720);
}

function resizeCanvases() {
  pairCanvases.forEach(sizeCanvas);
  if (sizeCanvas(canvas)) drawDetail();
  cards.forEach((card, index) => {
    const preview = card.querySelector("canvas");
    if (sizeCanvas(preview)) drawCurve(preview, intervals[index], 0, undefined, true);
  });
}

function updateSelection(index) {
  selectedIndex = index;
  const interval = intervals[index];
  const note = shortNote(interval.note);
  cards.forEach((card, cardIndex) => {
    card.setAttribute("aria-pressed", String(cardIndex === index));
  });
  document.querySelector("#interval-name").textContent = interval.name;
  document.querySelector("#selected-summary").textContent = `Selected: C + ${note}, ${interval.name}, ratio ${interval.upper} to ${interval.lower}`;
  document.querySelector("#interval-title").textContent = `C + ${note}`;
  document.querySelector("#ratio").textContent = `${interval.upper} : ${interval.lower}`;
  document.querySelector("#frequencies").textContent = `${baseFrequency.toFixed(1)} Hz + ${upperFrequency(interval).toFixed(1)} Hz`;
  canvas.setAttribute("aria-label", `Lissajous curve for C4 and ${interval.note}, ${interval.name}`);
  if (playing) {
    oscillators[1].frequency.setTargetAtTime(upperFrequency(interval), audioContext.currentTime, .025);
  }
  drawDetail();

}

function makeCard(interval, index) {
  const card = document.createElement("button");
  const preview = document.createElement("canvas");
  card.type = "button";
  card.className = "interval-card";
  card.setAttribute("aria-label", `C4 and ${interval.note}, ${interval.name}, ratio ${interval.upper} to ${interval.lower}`);
  card.setAttribute("aria-pressed", "false");
  card.innerHTML = `<span class="card-bottom"><strong>C + ${shortNote(interval.note)}</strong><span class="interval-label">${interval.name}</span></span>`;
  preview.className = "card-canvas";
  preview.setAttribute("aria-hidden", "true");
  card.insertBefore(preview, card.querySelector(".card-bottom"));
  card.addEventListener("click", () => updateSelection(index));
  return card;
}

function stopAudio() {
  audioRequest++;
  audioStarting = false;
  if (!playing) return;
  const gainToStop = masterGain;
  gainToStop.gain.setTargetAtTime(0, audioContext.currentTime, .012);
  oscillators[0].onended = () => gainToStop.disconnect();
  oscillators.forEach(oscillator => oscillator.stop(audioContext.currentTime + .05));
  oscillators = [];
  playing = false;
  playButton.setAttribute("aria-pressed", "false");
  document.querySelector("#play-text").textContent = idlePlayText();
  document.querySelector("#play-symbol").textContent = "▶";
}

async function toggleAudio() {
  if (playing || audioStarting) {
    stopAudio();
    return;
  }
  audioStarting = true;
  const request = ++audioRequest;
  try {
    audioContext ??= new AudioContext();
    await audioContext.resume();
    if (request !== audioRequest) return;
    audioStarting = false;
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.gain.setTargetAtTime(.13 / frequencies().length, audioContext.currentTime, .06);
    masterGain.connect(audioContext.destination);
    const startTime = audioContext.currentTime;
    oscillators = frequencies().map(frequency => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(masterGain);
      oscillator.start(startTime);
      return oscillator;
    });
    playing = true;
    playButton.setAttribute("aria-pressed", "true");
    document.querySelector("#play-text").textContent = "Stop playback";
    document.querySelector("#play-symbol").textContent = "■";
  } catch {
    if (request !== audioRequest) return;
    audioStarting = false;
    document.querySelector("#play-text").textContent = "Audio unavailable";
  }
}

intervals.forEach((interval, index) => {
  const card = makeCard(interval, index);
  cards.push(card);
  grid.append(card);
});
updateSelection(selectedIndex);
function updatePhase() {
  phase = Number(phaseInput.value) * Math.PI / 180;
  document.querySelector("#phase-value").textContent = `${phaseInput.value}°`;
  document.querySelectorAll("[data-phase]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.phase === phaseInput.value));
  });
  drawDetail();
}
phaseInput.addEventListener("input", updatePhase);
document.querySelectorAll("[data-phase]").forEach(button => {
  button.addEventListener("click", () => {
    phaseInput.value = button.dataset.phase;
    updatePhase();
  });
});
function navigate(direction) {
  if (mode === "chords") {
    selectedChord = (selectedChord + direction + chords.length) % chords.length;
    updateChord();
  } else updateSelection((selectedIndex + direction + intervals.length) % intervals.length);
}
document.querySelector("#previous").addEventListener("click", () => navigate(-1));
document.querySelector("#next").addEventListener("click", () => navigate(1));
function updateMotion() {
  motionButton.setAttribute("aria-pressed", String(tracing));
  motionButton.textContent = tracing ? "Pause tracing" : "Resume tracing";
  document.querySelector("#chord-motion").setAttribute("aria-pressed", String(tracing));
  document.querySelector("#chord-motion").textContent = motionButton.textContent;
}
motionButton.addEventListener("click", () => {
  tracing = !tracing;
  updateMotion();
});
reducedMotion.addEventListener("change", () => {
  tracing = !reducedMotion.matches;
  updateMotion();
});
updateMotion();
document.querySelector("#chord-motion").addEventListener("click", () => { tracing = !tracing; updateMotion(); });
document.querySelector("#show-frame").addEventListener("change", event => {
  showFrame = event.target.checked;
  drawDetail();
});
document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
document.querySelectorAll("[data-chord]").forEach(button => button.addEventListener("click", () => { selectedChord = Number(button.dataset.chord); updateChord(); }));
["middle", "high"].forEach((name, index) => {
  document.querySelector(`#${name}-phase`).addEventListener("input", event => {
    chordPhases[index + 1] = Number(event.target.value) * Math.PI / 180;
    document.querySelector(`#${name}-phase-value`).textContent = `${event.target.value}°`;
    drawDetail();
  });
});
document.querySelector("#pair-details").addEventListener("toggle", resizeCanvases);
document.querySelector("#reset-view").addEventListener("click", () => { yaw = -.55; tilt = .45; drawDetail(); });
canvas.addEventListener("pointerdown", event => {
  if (mode !== "chords") return;
  dragPosition = [event.clientX, event.clientY];
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", event => {
  if (!dragPosition || mode !== "chords") return;
  yaw += (event.clientX - dragPosition[0]) * .008;
  tilt = Math.max(-1.4, Math.min(1.4, tilt + (event.clientY - dragPosition[1]) * .008));
  dragPosition = [event.clientX, event.clientY];
  drawDetail();
});
canvas.addEventListener("lostpointercapture", () => { dragPosition = undefined; });
canvas.addEventListener("keydown", event => {
  if (mode !== "chords" || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
  event.preventDefault();
  if (event.key === "Home") { yaw = -.55; tilt = .45; }
  else if (event.key === "ArrowLeft") yaw -= .12;
  else if (event.key === "ArrowRight") yaw += .12;
  else tilt = Math.max(-1.4, Math.min(1.4, tilt + (event.key === "ArrowDown" ? .12 : -.12)));
  drawDetail();
});
playButton.addEventListener("click", toggleAudio);
window.addEventListener("blur", stopAudio);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAudio();
});
const resizeObserver = new ResizeObserver(resizeCanvases);
resizeObserver.observe(grid);
resizeObserver.observe(canvas);
resizeCanvases();
const visibilityObserver = new IntersectionObserver(entries => {
  detailVisible = entries[0].isIntersecting;
});
visibilityObserver.observe(canvas);

function animate(timestamp) {
  const elapsed = lastTime === undefined ? 0 : Math.min(timestamp - lastTime, 50);
  lastTime = timestamp;
  if (tracing && detailVisible && !document.hidden) {
    const duration = mode === "chords" ? 720 * chords[selectedChord].ratios[0] : 720;
    frame = (frame + elapsed * .06) % duration;
    drawDetail();
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
