// src/components/VitalsStrip.jsx
import Sparkline from './Sparkline';
import { getTrend, STATUS_COLORS, STATUS_LABELS } from '../utils/indicators';

// مفتاح السلسلة الزمنية المقابل لكل مؤشر (ضغط الدم نعرض الانقباضي).
const SERIES_KEYS = {
  heartRate: 'heartRate',
  bloodPressure: 'bpSys',
  bodyTemperature: 'bodyTemperature',
  sleep: 'sleep',
  muscleMass: 'muscleMass',
  radiation: 'radiation',
  commDelay: 'commDelay',
};

function VitalsStrip({ indicators, series }) {
  return (
    <div className="vitals-strip">
      {indicators.map((indicator) => {
        const trend = getTrend(indicator);
        const color = STATUS_COLORS[indicator.status] ?? 'var(--accent-cyan)';

        return (
          <article
            key={indicator.id}
            className={`mini-chart-card mini-${indicator.status}`}
            aria-label={`${indicator.label}: ${indicator.value} ${indicator.unit} — ${
              STATUS_LABELS[indicator.status]
            }`}
          >
            <div className="mini-chart-head">
              <div className="mini-chart-title">
                <span
                  className="mini-chart-dot"
                  style={{ background: color }}
                  aria-hidden="true"
                />
                <span className="mini-chart-label">{indicator.label}</span>
              </div>
              <div className="mini-chart-reading">
                <span className="mini-chart-value">{indicator.value}</span>
                <span className="mini-chart-unit">{indicator.unit}</span>
              </div>
            </div>

            <div className="mini-chart-canvas">
              <Sparkline
                values={series?.[SERIES_KEYS[indicator.id]]}
                color={color}
                height={58}
              />
            </div>

            <div className="mini-chart-foot">
              <span className="mini-chart-en">{indicator.labelEn}</span>
              <span
                className={`mini-trend trend-${trend?.direction ?? 'flat'}`}
                title="مقارنة بآخر قراءة"
              >
                {trend ? `${trend.icon} ${trend.text}` : '—'}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default VitalsStrip;
