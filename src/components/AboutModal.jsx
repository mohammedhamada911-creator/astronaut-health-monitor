// src/components/AboutModal.jsx
import { useEffect } from 'react';
import './AboutModal.css';

const HAZARDS = [
  {
    id: 'radiation',
    name: 'الإشعاع الفضائي',
    nameEn: 'Space Radiation',
    icon: '☢️',
    description:
      'خارج الغلاف الجوي، يتعرض رواد الفضاء لإشعاع كوني عالي الطاقة يمكن أن يسبب تلف الحمض النووي وزيادة خطر السرطان.',
  },
  {
    id: 'isolation',
    name: 'العزلة والحبس',
    nameEn: 'Isolation & Confinement',
    icon: '🧠',
    description:
      'البقاء في مساحة صغيرة مع نفس الأشخاص لشهور يمكن أن يسبب اكتئاب واضطرابات نوم وتدهور الأداء الإدراكي.',
  },
  {
    id: 'distance',
    name: 'المسافة من الأرض',
    nameEn: 'Distance from Earth',
    icon: '🌍',
    description:
      'في مهمة المريخ، تأخر الاتصال يصل إلى 22 دقيقة. لا يمكن للطبيب على الأرض المساعدة الفورية — يجب أن يكون رائد الفضاء مستقلًا.',
  },
  {
    id: 'gravity',
    name: 'مجالات الجاذبية',
    nameEn: 'Gravity Fields',
    icon: '🌌',
    description:
      'انعدام الجاذبية يسبب ضمور العضلات (1-2% شهريًا) وفقدان كثافة العظام. التمارين اليومية ضرورية للحفاظ على الجسم.',
  },
  {
    id: 'environment',
    name: 'البيئة المغلقة العدائية',
    nameEn: 'Hostile Closed Environments',
    icon: '🚀',
    description:
      'نظام دعم الحياة داخل المركبة قد يتعرض لأعطال. جودة الهواء، الحرارة، والضغط كلها عوامل حرجة.',
  },
];

const INDICATORS = [
  { icon: '❤️', name: 'معدل ضربات القلب', hazard: 'مجالات الجاذبية' },
  { icon: '🩸', name: 'ضغط الدم', hazard: 'مجالات الجاذبية' },
  { icon: '🌡️', name: 'درجة حرارة الجسم', hazard: 'البيئة المغلقة' },
  { icon: '😴', name: 'ساعات النوم', hazard: 'العزلة والحبس' },
  { icon: '💪', name: 'الكتلة العضلية', hazard: 'مجالات الجاذبية' },
  { icon: '☢️', name: 'التعرض للإشعاع', hazard: 'الإشعاع الفضائي' },
  { icon: '📡', name: 'تأخر الاتصال بالأرض', hazard: 'المسافة من الأرض' },
];

function AboutModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-close" onClick={onClose} aria-label="إغلاق">
          ✕
        </button>

        <div className="about-header">
          <div className="about-badge">NASA SPACE APPS CHALLENGE</div>
          <h2>🚀 Astronaut Health Monitor</h2>
          <p className="about-tagline">
            أداة تقييم صحي مرئية لرواد الفضاء في المهام الطويلة
          </p>
        </div>

        <div className="about-section">
          <h3>🎯 المشكلة</h3>
          <p className="about-text">
            مع تزايد طموح المهام الفضائية (Artemis للقمر، والمريخ مستقبلًا)،
            سيتعرض رواد الفضاء لبيئة قاسية لفترات أطول. حدد برنامج NASA Human
            Research Program <strong>خمسة مخاطر رئيسية</strong> تهدد صحة الطاقم:
          </p>

          <div className="hazards-grid">
            {HAZARDS.map((h) => (
              <div key={h.id} className="hazard-card">
                <span className="hazard-icon">{h.icon}</span>
                <div>
                  <h4>{h.name}</h4>
                  <p>{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <h3>💡 الحل</h3>
          <p className="about-text">
            أداة تفاعلية تُمكّن رائد الفضاء من{' '}
            <strong>تقييم حالته الصحية بنفسه</strong> أثناء المهمة — بدون
            الحاجة لطبيب على الأرض. تعرض 7 مؤشرات صحية حيوية، وتقدم توجيهات
            فورية قابلة للتنفيذ.
          </p>

          <div className="indicators-map">
            <h4 className="indicators-map-title">المؤشرات المراقبة:</h4>
            {INDICATORS.map((ind, i) => (
              <div key={i} className="indicator-map-item">
                <span className="ind-icon">{ind.icon}</span>
                <span className="ind-name">{ind.name}</span>
                <span className="ind-hazard">← {ind.hazard}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section">
          <h3>✨ الميزات الرئيسية</h3>
          <ul className="features-list">
            <li>
              📊 <strong>لوحة تحكم مرئية</strong> — 7 مؤشرات بتلوين فوري
              (أخضر/أصفر/أحمر)
            </li>
            <li>
              📈 <strong>رسم بياني مباشر</strong> — يتتبع المؤشرات على مدار 30
              ثانية
            </li>
            <li>
              ⚡ <strong>نبض المؤشرات</strong> — رسم مصغّر لكل مؤشر مع اتجاه
              القراءة
            </li>
            <li>
              📥 <strong>تصدير التقرير</strong> — تنزيل الحالة الحالية كملف CSV
              يدعم العربية
            </li>
            <li>
              ↺ <strong>إعادة الضبط</strong> — العودة للقراءات الأساسية في أي
              وقت
            </li>
            <li>
              🧍 <strong>خريطة جسم تفاعلية</strong> — اضغط على أي عضو لمعرفة
              المخاطر المرتبطة
            </li>
            <li>
              ⚡ <strong>توجيهات فورية</strong> — توصيات قابلة للتنفيذ لكل مؤشر
              غير طبيعي
            </li>
            <li>
              🎬 <strong>3 سيناريوهات محاكاة</strong> — Nominal / EVA /
              Emergency
            </li>
            <li>
              🔊 <strong>إنذار صوتي</strong> — تنبيه فوري عند وجود خطر
            </li>
            <li>
              🎨 <strong>ثلاثة ثيمات</strong> — Deep Space / Galaxy / Daylight
            </li>
          </ul>
        </div>

        <div className="about-section">
          <h3>⌨️ اختصارات سريعة</h3>
          <p className="about-text">
            <strong>R</strong> قراءة جديدة · <strong>A</strong> التحديث التلقائي
            · <strong>M</strong> كتم الصوت · <strong>T</strong> تبديل الثيم ·{' '}
            <strong>?</strong> عن المشروع
          </p>
        </div>

        <div className="about-section about-sources">
          <h3>📚 المصادر</h3>
          <ul className="sources-list">
            <li>
              <strong>NASA Human Research Program (HRP)</strong> — إطار المخاطر
              الخمسة
            </li>
            <li>
              <strong>NASA Open Science Data Repository (OSDR)</strong> — بيانات
              فضائية مفتوحة
            </li>
            <li>
              <strong>NASA Bio-Monitor</strong> — جهاز مراقبة حيوية على ISS
            </li>
          </ul>
        </div>

        <div className="about-footer">
          <p>صُمم لتحدي NASA Space Apps Challenge 🚀</p>
          <button className="about-cta" onClick={onClose}>
            ابدأ الاستخدام ←
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;