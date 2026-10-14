// Run from any directory with: node docs/images/generate.mjs
// README figures use the app's geometry; SVG keeps lines and text sharp.
import { writeFile } from 'node:fs/promises';
import { intervalPath } from '../../curves.js';
import { chords, chordPoint, projectPoint, pairRatio } from '../../chords.js';

const ink = '#292923', muted = '#74736c', blue = '#5363ac';
const text = (x, y, value, size = 14, color = ink, anchor = 'middle') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${value}</text>`;
const svg = (width, height, title, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
<title id="title">${title}</title>
<rect width="100%" height="100%" fill="#f4f1e9"/>
<g font-family="Helvetica Neue, Arial, sans-serif">${content}</g>
</svg>\n`;

const intervals = [
  ['D♭','Minor second',16,15], ['D','Major second',9,8],
  ['E♭','Minor third',6,5], ['E','Major third',5,4],
  ['F','Perfect fourth',4,3], ['F♯','Tritone',45,32],
  ['G','Perfect fifth',3,2], ['A♭','Minor sixth',8,5],
  ['A','Major sixth',5,3], ['B♭','Minor seventh',9,5],
  ['B','Major seventh',15,8], ['C','Octave',2,1],
];
let overview = text(32, 42, 'Twelve intervals', 22, ink, 'start');
intervals.forEach(([note, name, upper, lower], index) => {
  const x = 24 + (index % 4) * 228, y = 66 + Math.floor(index / 4) * 180;
  overview += `<g transform="translate(${x} ${y})"><path d="${intervalPath({upper,lower},0,216,116)}" fill="none" stroke="${blue}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>${text(108,140,`C + ${note}`,16)}${text(108,162,`${name} · ${upper}:${lower}`,13,muted)}</g>`;
});
await writeFile(new URL('./intervals.svg', import.meta.url), svg(960, 620, 'Twelve musical intervals and their frequency ratios', overview));

const chord = chords[0], phases = [0,0,0], yaw = -.55, tilt = .45;
const project = (point) => {
  const p = projectPoint(point,yaw,tilt);
  return [480+p[0]*112, 270-p[1]*112, p[2]];
};
const path = (points) => points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(3)},${p[1].toFixed(3)}`).join('');
let study = text(480,44,'Three notes, one shape.',24) + text(480,76,'C major · C + E + G · 4:5:6',15,muted);
const corners = Array.from({length:8},(_,i)=>[0,1,2].map(axis=>i & (1<<axis) ? 1 : -1));
const edges=[];
corners.forEach((corner,i)=>{for(let axis=0;axis<3;axis++){if(i & (1<<axis))continue;const a=project(corner), b=project(corners[i|(1<<axis)]);edges.push({a,b,depth:(a[2]+b[2])/2});}});
edges.sort((a,b)=>a.depth-b.depth).forEach(({a,b,depth})=>{study+=`<path d="${path([a,b])}" fill="none" stroke="#74736c" stroke-opacity="${depth<0?.13:.27}" stroke-width=".8"/>`;});
chord.notes.forEach((note,i)=>{const a=[0,0,0],b=[0,0,0];a[i]=-1.25;b[i]=1.4;const end=project(b);study+=`<path d="${path([project(a),end])}" fill="none" stroke="#dedbd3"/>`+text(end[0]+8,end[1],`${['X','Y','Z'][i]} · ${note}`,13,muted,'start');});
const steps = 900;
for(let i=1;i<=steps;i++){
  const a=project(chordPoint(chord,(i-1)/steps,phases)), b=project(chordPoint(chord,i/steps,phases));
  study+=`<path d="${path([a,b])}" fill="none" stroke="#263fba" stroke-opacity="${(.5+(b[2]+1.8)/7).toFixed(3)}" stroke-width="1.6"/>`;
}
study+=text(480,455,'Three projections of the same chord',14,muted);
[[0,1],[0,2],[1,2]].forEach(([first,second],i)=>{
  const center=200+i*280;
  const points=Array.from({length:steps+1},(_,j)=>{const p=chordPoint(chord,j/steps,phases);return [center+p[first]*70,555-p[second]*70];});
  study+=`<path d="${path(points)}Z" fill="none" stroke="${blue}" stroke-width="1.1" stroke-linejoin="round"/>`+text(center,656,`${chord.notes[first]}–${chord.notes[second]} · ${pairRatio(chord,first,second).join(':')}`,14,muted);
});
await writeFile(new URL('./chords.svg', import.meta.url), svg(960,688,'C major three-dimensional trajectory and three pairwise projections',study));
