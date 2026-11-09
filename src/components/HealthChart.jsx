// src/components/HealthChart.jsx
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const METRICS = [
  {
    id: 'heartRate',
    label: 'النبض',
    unit: 'نبضة/دقيقة',
    axisTitle: 'معدل ضربات القلب (نبضة/دقيقة)',
    axis: { min: 50, max: 115, step: 10 },
    decimals: 0,
    lines: [{ key: 'heartRate', name: 'معدل ضربات القلب' }],
  },
  {
    id: 'bloodPressure',
    label: 'الضغط',
    unit: 'mmHg',
    axisTitle: 'ضغط الدم (mmHg)',
    axis: { min: 50, max: 150, step: 10 },
    decimals: 0,
    lines: [
      { key: 'bpSys', name: 'الانقباضي' },
      { key: 'bpDia', name: 'الانبساطي', dashed: true },
    ],
  },
  {
    id: 'bodyTemperature',
    label: 'الحرارة',
    unit: '°C',
    axisTitle: 'درجة حرارة الجسم (°C)',
    axis: { min: 35, max: 39, step: 0.5 },
    decimals: 1,
    lines: [{ key: 'bodyTemperature', name: 'درجة الحرارة' }],
  },
  {
    id: 'sleep',
    label: 'النوم',
    unit: 'ساعة',
    axisTitle: 'ساعات النوم (ساعة)',
    axis: { min: 3, max: 10, step: 1 },
    decimals: 1,
    lines: [{ key: 'sleep', name: 'ساعات النوم' }],
  },
  {
    id: 'muscleMass',
    label: 'العضلات',
    unit: '%',
    axisTitle: 'التغير في الكتلة العضلية (% من الأساس)',
    axis: { min: -10, max: 2, step: 2 },
    decimals: 1,
    lines: [{ key: 'muscleMass', name: 'الكتلة العضلية' }],
  },
  {
    id: 'radiation',
    label: 'الإشعاع',
    unit: 'mSv/يوم',
    axisTitle: 'التعرض للإشعاع (mSv/يوم)',
    axis: { min: 0, max: 12, step: 2 },
    decimals: 1,
    lines: [{ key: 'radiation', name: 'التعرض للإشعاع' }],
  },
  {
    id: 'commDelay',
    label: 'تأخر الاتصال',
    unit: 'دقيقة',
    axisTitle: 'تأخر الاتصال بالأرض (دقيقة)',
    axis: { min: 0, max: 25, step: 5 },
    decimals: 0,
    lines: [{ key: 'commDelay', name: 'تأخر الاتصال' }],
  },
];

function readColors() {
  const root = document.documentElement;
  const s = getComputedStyle(root);
  const get = (name, fallback) => s.getPropertyValue(name).trim() || fallback;
  const isLight = root.dataset.theme === 'daylight';
  const accent = get('--accent-cyan', '#4da6ff');

  return {
    metric: isLight
      ? {
          heartRate: accent,
          bloodPressure: '#7c3aed',
          bodyTemperature: '#d97706',
          sleep: '#059669',
          muscleMass: '#e11d48',
          radiation: '#ca8a04',
          commDelay: '#0891b2',
        }
      : {
          heartRate: accent,
          bloodPressure: '#38bdf8',
          bodyTemperature: '#f59e0b',
          sleep: '#34d399',
          muscleMass: '#fb7185',
          radiation: '#facc15',
          commDelay: '#22d3ee',
        },
    text: get('--text-main', '#e8ecf5'),
    muted: get('--text-muted', '#8a95b2'),
    grid: get('--border', 'rgba(37, 48, 80, 0.5)'),
    tooltipBg: get('--bg-card-hover', '#131a2e'),
    tooltipBorder: get('--border-bright', '#253050'),
  };
}

function withAlpha(color, alpha) {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function HealthChart({ labels, series }) {
  const [colors, setColors] = useState(readColors);
  const [selectedId, setSelectedId] = useState('heartRate');

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const metric = METRICS.find((m) => m.id === selectedId) ?? METRICS[0];
  const color = colors.metric[metric.id];
  const lastIndex = labels.length - 1;
  const isHeart = metric.id === 'heartRate';
  const hasTwoLines = metric.lines.length > 1;

  const datasets = metric.lines.map((line) => ({
    label: line.name,
    data: series[line.key] ?? [],
    borderColor: color,
    borderWidth: 2.5,
    borderDash: line.dashed ? [6, 4] : [],
    tension: isHeart ? 0.4 : 0,
    stepped: isHeart ? false : 'after',
    fill: !hasTwoLines,
    backgroundColor: (context) => {
      const { chart } = context;
      const { ctx, chartArea } = chart;
      if (!chartArea) return withAlpha(color, 0.25);
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, withAlpha(color, 0.35));
      g.addColorStop(1, withAlpha(color, 0));
      return g;
    },
    pointRadius: (ctx) => (ctx.dataIndex === lastIndex ? 5 : 0),
    pointHoverRadius: 6,
    pointHitRadius: 12,
    pointBackgroundColor: color,
    pointBorderColor: colors.text,
    pointBorderWidth: 2,
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 450, easing: 'linear' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: hasTwoLines,
        labels: { color: colors.text, usePointStyle: true, boxWidth: 8 },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        titleColor: colors.text,
        bodyColor: colors.text,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (item) => {
            const v = Number(item.parsed.y).toFixed(metric.decimals);
            return `${item.dataset.label}: ${v} ${metric.unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'الزمن (آخر 30 ثانية)',
          color: colors.muted,
          font: { size: 12, weight: '600' },
        },
        ticks: {
          color: colors.muted,
          maxRotation: 0,
          autoSkip: false,
          callback: (value, index) =>
            (lastIndex - index) % 5 === 0 ? labels[index] : '',
        },
        grid: { display: false },
      },
      y: {
        min: metric.axis.min,
        max: metric.axis.max,
        title: {
          display: true,
          text: metric.axisTitle,
          color: colors.muted,
          font: { size: 12, weight: '600' },
        },
        ticks: {
          color: colors.muted,
          stepSize: metric.axis.step,
          callback: (value) => Number(value).toFixed(metric.decimals),
        },
        grid: { color: colors.grid },
      },
    },
  };

  return (
    <div>
      <div className="series-picker">
        {METRICS.map((m) => {
          const active = m.id === selectedId;
          return (
            <button
              key={m.id}
              type="button"
              className={`series-chip ${active ? 'active' : ''}`}
              style={{ '--chip-color': colors.metric[m.id] }}
              onClick={() => setSelectedId(m.id)}
              aria-pressed={active}
            >
              <span className="series-chip-dot" />
              {m.label}
            </button>
          );
        })}
      </div>

      <div style={{ height: 340, position: 'relative' }}>
        <Line data={{ labels, datasets }} options={options} />
      </div>
    </div>
  );
}

export default HealthChart;