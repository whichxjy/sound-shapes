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
  drawCurve(canvas, intervals[selectedIndex], phase, frame / 720);
}

function resizeCanvases() {
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
  document.querySelector("#play-text").textContent = "Play both notes";
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
    masterGain.gain.setTargetAtTime(.065, audioContext.currentTime, .06);
    masterGain.connect(audioContext.destination);
    oscillators = [baseFrequency, upperFrequency(intervals[selectedIndex])].map(frequency => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(masterGain);
      oscillator.start();
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
document.querySelector("#previous").addEventListener("click", () => updateSelection((selectedIndex + intervals.length - 1) % intervals.length));
document.querySelector("#next").addEventListener("click", () => updateSelection((selectedIndex + 1) % intervals.length));
function updateMotion() {
  motionButton.setAttribute("aria-pressed", String(tracing));
  motionButton.textContent = tracing ? "Pause tracing" : "Resume tracing";
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
    frame = (frame + elapsed * .06) % 720;
    drawDetail();
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
