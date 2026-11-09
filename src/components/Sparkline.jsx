// src/components/Sparkline.jsx
// رسم مصغّر خفيف (SVG) لآخر قراءات أحد المؤشرات — بدون مكتبات إضافية.

function Sparkline({ values, color = 'var(--accent-cyan)', height = 56 }) {
  const nums = Array.isArray(values)
    ? values.map((v) => Number(v)).filter((v) => Number.isFinite(v))
    : [];

  if (nums.length < 2) {
    return (
      <div
        className="sparkline-empty"
        style={{ height }}
        aria-hidden="true"
      />
    );
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const isFlat = max === min;
  const span = max - min || 1;
  const width = 100;
  const viewHeight = 32;
  const pad = 3;

  const points = nums.map((value, index) => {
    const x = (index / (nums.length - 1)) * width;
    const y = isFlat
      ? viewHeight / 2
      : viewHeight - pad - ((value - min) / span) * (viewHeight - pad * 2);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const [lastX, lastY] = points[points.length - 1].split(',');

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${viewHeight}`}
      preserveAspectRatio="none"
      style={{ height }}
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r="2.4" fill={color} />
    </svg>
  );
}

export default Sparkline;
