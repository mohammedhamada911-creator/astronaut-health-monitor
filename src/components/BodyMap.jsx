// src/components/BodyMap.jsx
import { useState } from 'react';

const bodyRegions = [
  {
    id: 'brain',
    name: 'الدماغ',
    icon: '🧠',
    hazard: 'العزلة والحبس + المسافة من الأرض',
    indicators: ['ساعات النوم', 'درجة حرارة الجسم', 'تأخر الاتصال بالأرض'],
    explanation:
      'العزلة والحبس والمسافة من الأرض يمكن أن تسبب اضطرابات نوم وتدهور الأداء الإدراكي. تأخر الاتصال يعني أن رائد الفضاء يجب أن يتخذ قرارات مستقلة.',
  },
  {
    id: 'lungs',
    name: 'الرئتان',
    icon: '🫁',
    hazard: 'الإشعاع الفضائي + البيئة المغلقة',
    indicators: ['التعرض للإشعاع'],
    explanation:
      'الرئتان من أكثر الأعضاء حساسية للإشعاع الكوني. خارج الغلاف الجوي، الإشعاع يخترق الجسم ويزيد خطر تلف الحمض النووي والسرطان.',
  },
  {
    id: 'heart',
    name: 'القلب',
    icon: '❤️',
    hazard: 'القلب والأوعية الدموية',
    indicators: ['معدل ضربات القلب', 'ضغط الدم'],
    explanation:
      'في الفضاء، يرتفع معدل ضربات القلب ويعمل بجهد أكبر. السوائل تتحرك لأعلى مما يؤثر على ضغط الدم.',
  },
  {
    id: 'muscle',
    name: 'العضلات',
    icon: '💪',
    hazard: 'مجالات الجاذبية',
    indicators: ['الكتلة العضلية'],
    explanation:
      'انعدام الجاذبية يسبب ضمور العضلات بمعدل 1-2% شهريًا. التمارين المقاومة اليومية ضرورية.',
  },
];

function BodyMap({ indicators }) {
  const [selected, setSelected] = useState(null);

  const relatedIndicators = selected
    ? indicators.filter((ind) => selected.indicators.includes(ind.label))
    : [];

  const getWorstStatus = (region) => {
    const related = indicators.filter((ind) =>
      region.indicators.includes(ind.label)
    );
    if (related.some((i) => i.status === 'red')) return 'red';
    if (related.some((i) => i.status === 'yellow')) return 'yellow';
    return 'green';
  };

  const statusColors = {
    green: 'var(--status-green)',
    yellow: 'var(--status-yellow)',
    red: 'var(--status-red)',
  };

  return (
    <div className="bodymap-container">
      <div className="bodymap-figure">
        <div className="bodymap-title">👤 اضغط على أي منطقة</div>
        <div className="bodymap-silhouette">
          {bodyRegions.map((region) => (
            <button
              key={region.id}
              className={`body-region ${
                selected?.id === region.id ? 'active' : ''
              }`}
              onClick={() =>
                setSelected(selected?.id === region.id ? null : region)
              }
            >
              <span className="region-icon">{region.icon}</span>
              <span className="region-name">{region.name}</span>
              <span
                className="region-status-dot"
                style={{ background: statusColors[getWorstStatus(region)] }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="bodymap-details">
        {!selected ? (
          <div className="bodymap-empty">
            <div className="empty-icon">🫁</div>
            <p>اختر منطقة من الجسم لعرض التفاصيل</p>
          </div>
        ) : (
          <div className="details-card">
            <div className="details-header">
              <span className="details-icon">{selected.icon}</span>
              <h3>{selected.name}</h3>
            </div>

            <div className="details-section">
              <h4>⚠️ الخطر المرتبط</h4>
              <p>{selected.hazard}</p>
            </div>

            <div className="details-section">
              <h4>📋 المؤشرات المرتبطة</h4>
              <ul className="indicator-list">
                {relatedIndicators.map((ind) => (
                  <li key={ind.id}>
                    <span
                      className="mini-dot"
                      style={{ background: statusColors[ind.status] }}
                    />
                    <span className="ind-label">{ind.label}:</span>
                    <span className="ind-value">
                      {ind.value} {ind.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="details-section">
              <h4>💡 الشرح</h4>
              <p className="explanation-text">{selected.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BodyMap;