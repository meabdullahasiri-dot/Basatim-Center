import { encode } from 'uqr';

/** رمز QR كرسم SVG من الخادم (بدون innerHTML). */
export function QrCode({ value, size = 120, label }: { value: string; size?: number; label: string }) {
  const { data } = encode(value, { ecc: 'M', border: 1 });
  const n = data.length;
  const rects: React.ReactElement[] = [];
  data.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }),
  );
  return (
    <svg role="img" aria-label={label} width={size} height={size} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      <g fill="#0f1115">{rects}</g>
    </svg>
  );
}
