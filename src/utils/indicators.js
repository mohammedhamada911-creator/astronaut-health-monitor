// src/utils/indicators.js
// أدوات مشتركة لعرض المؤشرات الصحية (الحالة، الاتجاه، القيم الرقمية).

export const STATUS_LABELS = {
  green: 'طبيعي',
  yellow: 'انتبه',
  red: 'خطر',
};

export const STATUS_COLORS = {
  green: 'var(--status-green)',
  yellow: 'var(--status-yellow)',
  red: 'var(--status-red)',
};

// تحويل قيمة المؤشر لرقم قابل للمقارنة (ضغط الدم نأخذ منه الانقباضي).
export function parseNumeric(id, value) {
  if (id === 'bloodPressure') {
    const [systolic] = String(value).split('/').map(Number);
    return Number.isFinite(systolic) ? systolic : NaN;
  }
  return Number(value);
}

// اتجاه آخر قراءتين: ارتفاع / انخفاض / استقرار.
export function getTrend(indicator) {
  const history = indicator?.history ?? [];
  if (history.length < 2) return null;

  const numeric = history
    .map((value) => parseNumeric(indicator.id, value))
    .filter((value) => Number.isFinite(value));

  if (numeric.length < 2) return null;

  const delta = numeric[numeric.length - 1] - numeric[numeric.length - 2];
  const decimals = ['bodyTemperature', 'sleep', 'muscleMass', 'radiation'].includes(
    indicator.id
  )
    ? 1
    : 0;

  if (Math.abs(delta) < 0.05) {
    return { direction: 'flat', delta: 0, icon: '→', text: 'مستقر' };
  }

  return {
    direction: delta > 0 ? 'up' : 'down',
    delta,
    icon: delta > 0 ? '↑' : '↓',
    text: Math.abs(delta).toFixed(decimals),
  };
}
