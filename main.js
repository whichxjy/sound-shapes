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
const detail = document.querySelector("#detail");
const phaseInput = document.querySelector("#phase");
const playButton = document.querySelector("#play");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const cards = [];

let selectedIndex = 6;
let phase = 0;
let frame = 0;
let audioContext;
let oscillators = [];
let masterGain;
let playing = false;

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
  if (!preview) {
    drawing.strokeStyle = "rgba(174, 204, 179, .055)";
    drawing.lineWidth = 1;
    for (let index = 1; index < 10; index++) {
      const x = width * index / 10;
      const y = height * index / 10;
      drawing.beginPath();
      drawing.moveTo(x, 0);
      drawing.lineTo(x, height);
      drawing.moveTo(0, y);
      drawing.lineTo(width, y);
      drawing.stroke();
    }
    drawing.strokeStyle = "rgba(174, 204, 179, .14)";
    drawing.beginPath();
    drawing.moveTo(width / 2, 0);
    drawing.lineTo(width / 2, height);
    drawing.moveTo(0, height / 2);
    drawing.lineTo(width, height / 2);
    drawing.stroke();
  }

  const radiusX = Math.min(width * .38, height * .42);
  const radiusY = height * .37;
  const steps = preview ? Math.max(800, interval.upper * 32) : Math.max(1200, interval.upper * 96);
  const point = position => {
    const angle = 2 * Math.PI * position;
    return [
      width / 2 + Math.sin(angle * interval.lower) * radiusX,
      height / 2 - Math.sin(angle * interval.upper + relativePhase) * radiusY,
    ];
  };

  drawing.beginPath();
  for (let index = 0; index <= steps; index++) {
    const [x, y] = point(index / steps);
    if (index === 0) drawing.moveTo(x, y);
    else drawing.lineTo(x, y);
  }
  drawing.strokeStyle = preview ? "#a8cbb1" : "#b9dbc1";
  drawing.lineWidth = preview ? 1.25 : 1.7;
  if (!preview) {
    drawing.shadowColor = "rgba(166, 225, 184, .4)";
    drawing.shadowBlur = 12;
  }
  drawing.stroke();
  drawing.shadowBlur = 0;

  if (progress === undefined) return;
  const [x, y] = point(progress);
  drawing.fillStyle = "rgba(182, 230, 191, .17)";
  drawing.beginPath();
  drawing.arc(x, y, 10, 0, 2 * Math.PI);
  drawing.fill();
  drawing.fillStyle = "#e0f5dd";
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

function updateSelection(index, moveToDetail = false) {
  selectedIndex = index;
  const interval = intervals[index];
  const note = shortNote(interval.note);
  cards.forEach((card, cardIndex) => {
    card.setAttribute("aria-pressed", String(cardIndex === index));
  });
  document.querySelector("#selected-summary").textContent = `SELECTED / C + ${note}`;
  document.querySelector("#interval-title").textContent = `C + ${note}`;
  document.querySelector("#ratio").textContent = `${interval.upper} : ${interval.lower}`;
  document.querySelector("#upper-axis").textContent = note;
  document.querySelector("#frequencies").textContent = `${baseFrequency.toFixed(1)} Hz + ${upperFrequency(interval).toFixed(1)} Hz`;
  canvas.setAttribute("aria-label", `Lissajous curve for C4 and ${interval.note}, ${interval.name}`);
  if (playing) {
    oscillators[1].frequency.setTargetAtTime(upperFrequency(interval), audioContext.currentTime, .025);
  }
  drawDetail();

  if (moveToDetail) {
    document.querySelector("#interval-title").focus({ preventScroll: true });
    detail.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth" });
  }
}

function makeCard(interval, index) {
  const card = document.createElement("button");
  const preview = document.createElement("canvas");
  card.type = "button";
  card.className = "interval-card";
  card.setAttribute("aria-label", `C4 and ${interval.note}, ${interval.name}, ratio ${interval.upper} to ${interval.lower}`);
  card.setAttribute("aria-pressed", "false");
  card.innerHTML = `<span class="card-top"><span>${String(index + 1).padStart(2, "0")} / 12</span><span>${interval.upper} : ${interval.lower}</span></span><span class="card-bottom"><strong>C + ${shortNote(interval.note)}</strong><span>${interval.name}</span></span>`;
  preview.className = "card-canvas";
  preview.setAttribute("aria-hidden", "true");
  card.insertBefore(preview, card.querySelector(".card-bottom"));
  card.addEventListener("click", () => updateSelection(index, true));
  return card;
}

function stopAudio() {
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
  if (playing) {
    stopAudio();
    return;
  }
  try {
    audioContext ??= new AudioContext();
    await audioContext.resume();
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
    document.querySelector("#play-text").textContent = "Audio unavailable";
  }
}

intervals.forEach((interval, index) => {
  const card = makeCard(interval, index);
  cards.push(card);
  grid.append(card);
});
updateSelection(selectedIndex);
phaseInput.addEventListener("input", () => {
  phase = Number(phaseInput.value) * Math.PI / 180;
  document.querySelector("#phase-value").textContent = `${phaseInput.value}°`;
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

function animate() {
  if (!reducedMotion.matches && !document.hidden) {
    frame = (frame + 1) % 720;
    drawDetail();
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
