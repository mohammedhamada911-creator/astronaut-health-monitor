// src/components/ActionableGuidance.jsx

function ActionableGuidance({ indicators }) {
  // فلتر المؤشرات اللي محتاجة انتباه
  const alerts = indicators.filter(
    (ind) => ind.status === 'yellow' || ind.status === 'red'
  );

  const statusColors = {
    green: 'var(--status-green)',
    yellow: 'var(--status-yellow)',
    red: 'var(--status-red)',
  };

  const statusLabels = {
    yellow: 'انتبه',
    red: 'خطر',
  };

  if (alerts.length === 0) {
    return (
      <div className="guidance-all-clear">
        <div className="all-clear-icon">✅</div>
        <div>
          <h3>كل المؤشرات طبيعية</h3>
          <p>استمر في الروتين الحالي — لا يوجد ما يستدعي تدخلًا.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guidance-container">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`guidance-card guidance-${alert.status}`}
          style={{ borderColor: statusColors[alert.status] }}
        >
          <div className="guidance-header">
            <span
              className="guidance-badge"
              style={{ background: statusColors[alert.status] }}
            >
              {statusLabels[alert.status]}
            </span>
            <h3>{alert.label}</h3>
            <span className="guidance-value">
              {alert.value} {alert.unit}
            </span>
          </div>

          <div className="guidance-body">
            <div className="guidance-section">
              <span className="guidance-icon">🩺</span>
              <div>
                <h4>المشكلة</h4>
                <p>{alert.explanation}</p>
              </div>
            </div>

            <div className="guidance-section guidance-action">
              <span className="guidance-icon">⚡</span>
              <div>
                <h4>الإجراء الفوري</h4>
                <p>{alert.advice}</p>
              </div>
            </div>

            <div className="guidance-section">
              <span className="guidance-icon">🕐</span>
              <div>
                <h4>إعادة الفحص</h4>
                <p>
                  {alert.status === 'red'
                    ? 'أعد الفحص فورًا. أبلغ طبيب الطيران على الأرض إذا استمر.'
                    : 'أعد الفحص بعد 24 ساعة. راقب الاتجاه.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActionableGuidance;