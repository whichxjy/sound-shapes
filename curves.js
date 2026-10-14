// Cubic Hermite segments follow the sine trajectory and its tangent.
// 32 segments per fastest cycle keep interpolation error below a screen pixel.
export function intervalPoint(interval, phase, position, width, height) {
  const angle = 2 * Math.PI * position;
  const radiusX = Math.min(width * .38, height * .62);
  const radiusY = height * .37;
  return [width / 2 + Math.sin(angle * interval.lower) * radiusX,
    height / 2 - Math.sin(angle * interval.upper + phase) * radiusY];
}

export function intervalPath(interval, phase, width, height) {
  const steps = Math.max(128, interval.upper * 32);
  const radiusX = Math.min(width * .38, height * .62);
  const radiusY = height * .37;
  const tangent = position => [
    radiusX * 2 * Math.PI * interval.lower * Math.cos(2 * Math.PI * interval.lower * position),
    -radiusY * 2 * Math.PI * interval.upper * Math.cos(2 * Math.PI * interval.upper * position + phase),
  ];
  const format = point => point.map(value => value.toFixed(4)).join(',');
  let previous = intervalPoint(interval, phase, 0, width, height);
  let previousTangent = tangent(0);
  let path = `M${format(previous)}`;
  for (let index = 1; index <= steps; index++) {
    const position = index / steps;
    const current = intervalPoint(interval, phase, position, width, height);
    const currentTangent = tangent(position);
    const first = previous.map((value, axis) => value + previousTangent[axis] / (3 * steps));
    const second = current.map((value, axis) => value - currentTangent[axis] / (3 * steps));
    path += `C${format(first)} ${format(second)} ${format(current)}`;
    previous = current;
    previousTangent = currentTangent;
  }
  return `${path}Z`;
}
