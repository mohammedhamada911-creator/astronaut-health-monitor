// src/App.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { healthIndicators, heartRateTimeSeries } from './data/mockHealthData';
import TrafficLightDashboard from './components/TrafficLightDashboard';
import HealthChart from './components/HealthChart';
import BodyMap from './components/BodyMap';
import ActionableGuidance from './components/ActionableGuidance';
import VitalsStrip from './components/VitalsStrip';
import AboutModal from './components/AboutModal';
import { STATUS_LABELS } from './utils/indicators';
import './App.css';
import './space-theme.css';

const THEMES = [
  { id: 'deep-space', label: 'Deep Space', icon: '🌌' },
  { id: 'galaxy', label: 'Galaxy', icon: '✨' },
  { id: 'daylight', label: 'Daylight', icon: '☀️' },
];

const PRESETS = [
  {
    id: 'nominal',
    label: 'الحالة القياسية المستقرة',
    subLabel: 'Nominal Baseline',
    icon: '🛡️',
    values: {
      heartRate: 72,
      bloodPressure: '118/76',
      bodyTemperature: 36.8,
      sleep: 7.8,
      muscleMass: 0.2,
      radiation: 2.4,
      commDelay: 3,
    },
  },
  {
    id: 'eva',
    label: 'مهمة سير فضائي (EVA)',
    subLabel: 'High Physical Exertion',
    icon: '👨\u200D🚀',
    values: {
      heartRate: 98,
      bloodPressure: '136/86',
      bodyTemperature: 37.9,
      sleep: 6.2,
      muscleMass: -1.5,
      radiation: 6.5,
      commDelay: 8,
    },
  },
  {
    id: 'emergency',
    label: 'إنذار طبي حرج',
    subLabel: 'Critical Bio-Anomaly',
    icon: '🚨',
    values: {
      heartRate: 118,
      bloodPressure: '85/55',
      bodyTemperature: 39.3,
      sleep: 3.2,
      muscleMass: -6.4,
      radiation: 9.5,
      commDelay: 22,
    },
  },
];

const AUTO_SECONDS = 10;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const nextValue = (prev, step, min, max, decimals = 0) => {
  const base = Number.isFinite(prev) ? prev : (min + max) / 2;
  const moved = clamp(base + (Math.random() * 2 - 1) * step, min, max);
  return +moved.toFixed(decimals);
};

const parseBP = (v) => {
  const [s, d] = String(v).split('/').map(Number);
  return [Number.isFinite(s) ? s : 120, Number.isFinite(d) ? d : 80];
};

const initSeries = () => {
  const n = heartRateTimeSeries.data.length;
  const fill = (v) => Array(n).fill(v);
  const get = (id) => healthIndicators.find((i) => i.id === id)?.value;
  const [sys, dia] = parseBP(get('bloodPressure'));
  return {
    heartRate: [...heartRateTimeSeries.data],
    bpSys: fill(sys),
    bpDia: fill(dia),
    bodyTemperature: fill(Number(get('bodyTemperature'))),
    sleep: fill(Number(get('sleep'))),
    muscleMass: fill(Number(get('muscleMass'))),
    radiation: fill(Number(get('radiation'))),
    commDelay: fill(Number(get('commDelay'))),
  };
};

function computeStatus(id, value) {
  if (id === 'heartRate') {
    if (value > 100 || value < 55) return 'red';
    if (value > 90 || value < 60) return 'yellow';
    return 'green';
  }
  if (id === 'bloodPressure') {
    const [sys, dia] = Array.isArray(value) ? value : parseBP(value);
    if (sys > 140 || sys < 90 || dia > 90 || dia < 60) return 'red';
    if (sys > 130 || sys < 100 || dia > 85 || dia < 65) return 'yellow';
    return 'green';
  }
  if (id === 'bodyTemperature') {
    if (value > 39 || value < 35) return 'red';
    if (value > 37.5 || value < 36) return 'yellow';
    return 'green';
  }
  if (id === 'sleep') {
    if (value < 4) return 'red';
    if (value < 7) return 'yellow';
    return 'green';
  }
  if (id === 'muscleMass') {
    if (value < -5) return 'red';
    if (value < 0) return 'yellow';
    return 'green';
  }
  if (id === 'radiation') {
    if (value > 8) return 'red';
    if (value > 5) return 'yellow';
    return 'green';
  }
  if (id === 'commDelay') {
    if (value > 20) return 'red';
    if (value > 10) return 'yellow';
    return 'green';
  }
  return 'green';
}

// محتوى شريط الحالة العامة حسب أسوأ حالة بين المؤشرات
const OVERALL_CONTENT = {
  nominal: {
    icon: '✅',
    title: 'جميع الأنظمة تعمل بشكل طبيعي',
    detail: 'المؤشرات الحيوية ضمن النطاق الآمل — استمر في المهمة الحالية.',
  },
  warning: {
    icon: '⚠️',
    title: 'حالة الطاقم: تحتاج انتباه',
    detail: 'يوجد مؤشرات خارج النطاق الطبيعي — راجع التوجيهات وطبّق الإجراءات الموصى بها.',
  },
  critical: {
    icon: '🚨',
    title: 'حالة الطاقم: حرجة',
    detail: 'يوجد مؤشرات خطيرة — اتبع بروتوكول الطوارئ فورًا وأبلغ مركز المهمة.',
  },
};

function App() {
  const [indicators, setIndicators] = useState(healthIndicators);
  const [series, setSeries] = useState(initSeries);
  const [autoMode, setAutoMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activePreset, setActivePreset] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const audioCtxRef = useRef(null);
  const isPlayingAlarmRef = useRef(false);
  const simulateRef = useRef(null);
  const pushRef = useRef(null);
  const shortcutsRef = useRef({});
  const seriesRef = useRef(series);
  const indicatorsRef = useRef(indicators);
  const [countdown, setCountdown] = useState(AUTO_SECONDS);

  const markUpdated = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return THEMES.some((t) => t.id === saved) ? saved : 'galaxy';
    } catch {
      return 'galaxy';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtxRef.current = new AC();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playAlarm = () => {
    if (isPlayingAlarmRef.current) return;
    const ctx = getAudioCtx();
    if (!ctx) return;

    isPlayingAlarmRef.current = true;
    const beepDuration = 0.15;
    const beepInterval = 0.25;
    const totalBeeps = 8;

    for (let i = 0; i < totalBeeps; i++) {
      const offset = i * beepInterval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + offset + beepDuration
      );
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + beepDuration);
    }

    setTimeout(() => {
      isPlayingAlarmRef.current = false;
    }, totalBeeps * beepInterval * 1000);
  };

  const pushChartPoint = useCallback(() => {
    const prev = seriesRef.current;
    const latest = nextValue(Number(prev.heartRate[prev.heartRate.length - 1]), 2, 55, 110);

    const current = indicatorsRef.current ?? [];
    const valueOf = (id) => current.find((i) => i.id === id)?.value;
    const [sys, dia] = parseBP(valueOf('bloodPressure'));
    const push = (arr, v) => [...arr.slice(1), v];

    const next = {
      heartRate: push(prev.heartRate, latest),
      bpSys: push(prev.bpSys, sys),
      bpDia: push(prev.bpDia, dia),
      bodyTemperature: push(prev.bodyTemperature, Number(valueOf('bodyTemperature'))),
      sleep: push(prev.sleep, Number(valueOf('sleep'))),
      muscleMass: push(prev.muscleMass, Number(valueOf('muscleMass'))),
      radiation: push(prev.radiation, Number(valueOf('radiation'))),
      commDelay: push(prev.commDelay, Number(valueOf('commDelay'))),
    };
    seriesRef.current = next;
    setSeries(next);
    markUpdated();

    setIndicators((current) =>
      current.map((ind) =>
        ind.id === 'heartRate'
          ? { ...ind, value: latest, status: computeStatus('heartRate', latest) }
          : ind
      )
    );
  }, [markUpdated]);

  const simulateReading = useCallback(() => {
    setActivePreset(null);
    const updated = indicators.map((ind) => {
      if (ind.id === 'heartRate') {
        const lastPoint = Number(seriesRef.current.heartRate.at(-1));
        const v = Number.isFinite(lastPoint)
          ? Math.round(lastPoint)
          : nextValue(Number(ind.value), 4, 55, 110);
        return { ...ind, value: v, status: computeStatus('heartRate', v), history: [...ind.history.slice(-4), v] };
      }
      if (ind.id === 'bloodPressure') {
        const [prevSys, prevDia] = parseBP(ind.value);
        const sys = nextValue(prevSys, 4, 100, 145);
        const dia = nextValue(prevDia, 3, 60, 90);
        const v = `${sys}/${dia}`;
        return { ...ind, value: v, status: computeStatus('bloodPressure', [sys, dia]), history: [...ind.history.slice(-4), v] };
      }
      if (ind.id === 'bodyTemperature') {
        const v = nextValue(Number(ind.value), 0.2, 35.5, 38.5, 1);
        return { ...ind, value: v, status: computeStatus('bodyTemperature', v), history: [...ind.history.slice(-4), v] };
      }
      if (ind.id === 'sleep') {
        const v = nextValue(Number(ind.value), 0.4, 3.5, 9, 1);
        return { ...ind, value: v, status: computeStatus('sleep', v), history: [...ind.history.slice(-4), v] };
      }
      if (ind.id === 'muscleMass') {
        const v = nextValue(Number(ind.value), 0.5, -8, 1, 1);
        return { ...ind, value: v, status: computeStatus('muscleMass', v), history: [...ind.history.slice(-4), v] };
      }
      if (ind.id === 'radiation') {
        const v = nextValue(Number(ind.value), 0.3, 0.5, 10, 1);
        return { ...ind, value: v, status: computeStatus('radiation', v), history: [...ind.history.slice(-4), v] };
      }
      if (ind.id === 'commDelay') {
        const v = nextValue(Number(ind.value), 0.5, 1, 25, 0);
        return { ...ind, value: v, status: computeStatus('commDelay', v), history: [...ind.history.slice(-4), v] };
      }
      return ind;
    });

    setIndicators(updated);
    markUpdated();

    if (soundEnabled && updated.some((i) => i.status === 'red')) {
      playAlarm();
    }
  }, [indicators, soundEnabled, markUpdated]);

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    const { values } = preset;
    const [sys, dia] = parseBP(values.bloodPressure);

    const updated = indicators.map((ind) => {
      const newVal = values[ind.id] ?? ind.value;
      const status =
        ind.id === 'bloodPressure'
          ? computeStatus('bloodPressure', [sys, dia])
          : computeStatus(ind.id, Number(newVal));
      return {
        ...ind,
        value: newVal,
        status,
        history: [...ind.history.slice(-4), newVal],
      };
    });

    setIndicators(updated);

    const prev = seriesRef.current;
    const push = (arr, v) => [...arr.slice(1), v];
    const next = {
      heartRate: push(prev.heartRate, values.heartRate),
      bpSys: push(prev.bpSys, sys),
      bpDia: push(prev.bpDia, dia),
      bodyTemperature: push(prev.bodyTemperature, values.bodyTemperature),
      sleep: push(prev.sleep, values.sleep),
      muscleMass: push(prev.muscleMass, values.muscleMass),
      radiation: push(prev.radiation, values.radiation),
      commDelay: push(prev.commDelay, values.commDelay),
    };
    seriesRef.current = next;
    setSeries(next);
    markUpdated();

    if (soundEnabled && updated.some((i) => i.status === 'red')) {
      playAlarm();
    }
  };

  useEffect(() => {
    indicatorsRef.current = indicators;
  }, [indicators]);

  useEffect(() => {
    simulateRef.current = simulateReading;
    pushRef.current = pushChartPoint;
  }, [simulateReading, pushChartPoint]);

  const handleManualReading = useCallback(() => {
    pushChartPoint();
    simulateReading();
  }, [pushChartPoint, simulateReading]);

  const toggleAutoMode = useCallback(() => {
    setCountdown(AUTO_SECONDS);
    setAutoMode((prev) => !prev);
  }, []);

  const resetToBaseline = () => {
    setIndicators(
      healthIndicators.map((indicator) => ({
        ...indicator,
        history: [...indicator.history],
      }))
    );
    const baselineSeries = initSeries();
    seriesRef.current = baselineSeries;
    setSeries(baselineSeries);
    setActivePreset(null);
    setAutoMode(false);
    setCountdown(AUTO_SECONDS);
    markUpdated();
  };

  // اختصارات لوحة المفاتيح لتشغيل سريع أثناء العرض التقديمي.
  useEffect(() => {
    shortcutsRef.current = { handleManualReading, toggleAutoMode };
  }, [handleManualReading, toggleAutoMode]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (showAbout) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'r') {
        event.preventDefault();
        shortcutsRef.current.handleManualReading?.();
      } else if (key === 'a') {
        event.preventDefault();
        shortcutsRef.current.toggleAutoMode?.();
      } else if (key === 'm') {
        event.preventDefault();
        setSoundEnabled((enabled) => !enabled);
      } else if (key === 't') {
        event.preventDefault();
        setTheme((current) => {
          const index = THEMES.findIndex((item) => item.id === current);
          return THEMES[(index + 1) % THEMES.length].id;
        });
      } else if (key === '?') {
        event.preventDefault();
        setShowAbout(true);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [showAbout]);

  useEffect(() => {
    if (!autoMode) return;

    let remaining = AUTO_SECONDS;

    const interval = setInterval(() => {
      remaining -= 1;
      pushRef.current?.();

      if (remaining <= 0) {
        simulateRef.current?.();
        remaining = AUTO_SECONDS;
      }
      setCountdown(remaining);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [autoMode]);

  // ===== الحالة الإجمالية للمهمة (أسوأ حالة بين المؤشرات) =====
  const redCount = indicators.filter((i) => i.status === 'red').length;
  const yellowCount = indicators.filter((i) => i.status === 'yellow').length;
  const greenCount = indicators.length - redCount - yellowCount;
  const overallStatus = redCount > 0 ? 'critical' : yellowCount > 0 ? 'warning' : 'nominal';
  const overall = OVERALL_CONTENT[overallStatus];

  // تصدير تقرير CSV يفتح مباشرة في Excel مع دعم العربية.
  const exportReport = () => {
    const statusText = {
      nominal: 'طبيعي',
      warning: 'تحذير',
      critical: 'حرج',
    }[overallStatus];

    const escapeCell = (cell) =>
      `"${String(cell).replace(/"/g, '""')}"`;

    const rows = [
      ['المؤشر', 'القيمة', 'الوحدة', 'الحالة'],
      ...indicators.map((ind) => [
        ind.label,
        ind.value,
        ind.unit,
        STATUS_LABELS[ind.status],
      ]),
    ].map((row) => row.map(escapeCell).join(','));

    const header = [
      escapeCell('Astronaut Health Monitor — تقرير الحالة'),
      `${escapeCell('التاريخ')},${escapeCell(lastUpdated.toLocaleString('en-GB'))}`,
      `${escapeCell('الحالة العامة')},${escapeCell(statusText)}`,
      `${escapeCell('طبيعي')},${greenCount}`,
      `${escapeCell('تحذير')},${yellowCount}`,
      `${escapeCell('خطر')},${redCount}`,
    ].join('\r\n');

    const blob = new Blob(
      [`\uFEFF${header}\r\n\r\n${rows.join('\r\n')}`],
      { type: 'text/csv;charset=utf-8;' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astronaut-health-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  useEffect(() => {
    document.title = `${overall.icon} Astronaut Health Monitor`;
  }, [overall.icon]);

  return (
    <div className="app-container theme-space">
      <header className="app-header">
        <h1>
          <span className="rocket-emoji">🚀</span>
          <span className="title-text">Astronaut Health Monitor</span>
        </h1>
        <p className="app-subtitle">
          Health Assessment System — NASA Space Apps Challenge
        </p>

        <div
          className={`mission-status-banner status-${overallStatus}`}
          role="status"
          aria-live="polite"
        >
          <span className="mission-status-icon" role="img" aria-label="حالة المهمة">
            {overall.icon}
          </span>
          <div className="mission-status-content">
            <span className="mission-status-title">{overall.title}</span>
            <span className="mission-status-detail">{overall.detail}</span>
          </div>

          <div
            className="status-summary"
            aria-label={`${greenCount} طبيعي، ${yellowCount} تحذير، ${redCount} خطر`}
          >
            <span className="status-pill pill-green" title="مؤشرات طبيعية">
              ✅ {greenCount}
            </span>
            <span className="status-pill pill-yellow" title="مؤشرات تحتاج انتباه">
              ⚠️ {yellowCount}
            </span>
            <span className="status-pill pill-red" title="مؤشرات خطرة">
              🚨 {redCount}
            </span>
          </div>
          {activePreset && (
            <button
              className="mission-preset-tag"
              onClick={() => setActivePreset(null)}
              title="إيقاف وضع السيناريو والعودة للمحاكاة الحية"
            >
              ↩️ العودة للمحاكاة الحية
            </button>
          )}
        </div>

        <div className="button-group">
          <button
            type="button"
            className="btn-refresh"
            onClick={handleManualReading}
            title="محاكاة قراءة جديدة (R)"
          >
            🔄 محاكاة قراءة جديدة
          </button>
          <button
            type="button"
            className={`btn-auto ${autoMode ? 'active' : ''}`}
            onClick={toggleAutoMode}
            aria-pressed={autoMode}
            title="تشغيل/إيقاف التحديث التلقائي (A)"
          >
            {autoMode ? '⏸️ إيقاف التلقائي' : '▶️ تشغيل التلقائي'}
          </button>
          <button
            type="button"
            className="btn-reset"
            onClick={resetToBaseline}
            title="العودة إلى القراءات الأساسية"
          >
            ↺ إعادة الضبط
          </button>
          <button
            type="button"
            className="btn-export"
            onClick={exportReport}
            title="تنزيل تقرير الحالة بصيغة CSV"
          >
            📥 تصدير التقرير
          </button>
          <button
            type="button"
            className={`btn-sound ${soundEnabled ? '' : 'muted'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={`${soundEnabled ? 'كتم صوت الإنذار' : 'تشغيل صوت الإنذار'} (M)`}
            aria-label={soundEnabled ? 'كتم صوت الإنذار' : 'تشغيل صوت الإنذار'}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            className="btn-about"
            onClick={() => setShowAbout(true)}
            title="عن المشروع (?)"
            aria-label="عن المشروع"
          >
            ℹ️
          </button>
        </div>

        <div className="presets-bar">
          <div className="presets-header">
            <span className="presets-badge">MISSION SCENARIOS</span>
            <span className="presets-label">اختر وضع المحاكاة الحيوية لاختبار النظام:</span>
          </div>

          <div className="presets-chips">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`preset-chip preset-${p.id} ${activePreset === p.id ? 'active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                <span className="preset-icon">{p.icon}</span>
                <div className="preset-text">
                  <span className="preset-title">{p.label}</span>
                  <span className="preset-sub">{p.subLabel}</span>
                </div>
                <span className="preset-dot" />
              </button>
            ))}
          </div>
        </div>

        <div className="theme-picker">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-chip ${theme === t.id ? 'active' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <div className="header-meta">
          <span className="last-updated">
            🕐 آخر تحديث: {lastUpdated.toLocaleTimeString('en-GB', { hour12: false })}
          </span>
          {autoMode && (
            <div className="live-indicator">
              ● القراءة التالية بعد{' '}
              <span className="countdown-number">{countdown}</span> ث
            </div>
          )}
        </div>
      </header>

      <section className="section">
        <h2 className="section-title"> الحالة الصحية العامة  📊</h2>
        <TrafficLightDashboard indicators={indicators} />
      </section>

      <section className="section">
        <h2 className="section-title"> الرسم البياني المباشر 📈 — آخر 30 ثانية</h2>
        <div className="chart-container">
          <HealthChart labels={heartRateTimeSeries.labels} series={series} />
        </div>
      </section>

      <section className="section">
        <h2 className="section-title"> نبض المؤشرات الحيوية ⚡</h2>
        <VitalsStrip indicators={indicators} series={series} />
      </section>

      <section className="section">
        <h2 className="section-title"> خريطة الجسم التفاعلية  🧍</h2>
        <BodyMap indicators={indicators} />
      </section>

      <section className="section">
        <h2 className="section-title">  التوجيهات القابلة للتنفيذ 💡</h2>
        <ActionableGuidance indicators={indicators} />
      </section>

      <footer className="app-footer">
        <p>
          Developed by <span className="footer-name">Muhammad Yamany</span>
        </p>
        <p className="footer-sub">NASA Space Apps Challenge 🚀</p>
      </footer>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

export default App;
