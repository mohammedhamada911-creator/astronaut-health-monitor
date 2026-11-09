// src/components/TrafficLightDashboard.jsx
import {
  getTrend,
  STATUS_COLORS as statusColors,
  STATUS_LABELS as statusLabels,
} from '../utils/indicators';

function TrafficLightDashboard({ indicators }) {
  return (
    <div className="dashboard-grid">
      {indicators.map((ind) => {
        const trend = getTrend(ind);

        return (
          <div
            key={ind.id}
            className="indicator-card"
            aria-label={`${ind.label}: ${ind.value} ${ind.unit} — ${statusLabels[ind.status]}`}
          >
            <div className="card-header">
              <span className="indicator-label">{ind.label}</span>
              <span
                className="status-dot"
                style={{ background: statusColors[ind.status] }}
                aria-hidden="true"
              />
            </div>

            <div className="card-value">
              <span className="value-number">{ind.value}</span>
              <span className="value-unit">{ind.unit}</span>
            </div>

            <div className="card-meta">
              <span
                className="status-label"
                style={{ color: statusColors[ind.status] }}
              >
                {statusLabels[ind.status]}
              </span>

              {trend && (
                <span
                  className={`card-trend trend-${trend.direction}`}
                  title="مقارنة بآخر قراءة"
                >
                  <span className="trend-arrow" aria-hidden="true">
                    {trend.icon}
                  </span>
                  {trend.text}
                </span>
              )}
            </div>

            {ind.history && ind.history.length > 0 && (
              <div className="card-history">
                <span className="history-label">آخر القراءات:</span>
                {ind.history.slice(-4).map((h, i, arr) => (
                  <span key={i} className="history-item">
                    {h}
                    {i < arr.length - 1 && (
                      <span className="history-arrow">←</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TrafficLightDashboard;
