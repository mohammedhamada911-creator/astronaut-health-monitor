# Astronaut Health Monitor

أداة تفاعلية لتقييم صحة رواد الفضاء أثناء المهام الطويلة — NASA Space Apps Challenge.

## Live site

https://astronaut-health-monitor.vercel.app

## Source code

https://github.com/mohammedhamada911-creator/astronaut-health-monitor

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

The production build is generated in `dist/`.

## Deploy to Vercel

The project is already linked to Vercel as `astronaut-health-monitor`.

```bash
npx vercel deploy --prod --yes
```

## Features

- Live health dashboard for 7 vital indicators
- Realtime chart with per-indicator selection
- Sparkline overview for every vital sign
- Trend arrows and status summary counts
- Interactive body map and actionable guidance
- 3 mission scenarios (Nominal / EVA / Emergency)
- Auto simulation mode, sound alarm, and reset to baseline
- CSV report export
- 3 themes (Deep Space / Galaxy / Daylight)
- Keyboard shortcuts: `R` reading, `A` auto, `M` mute, `T` theme, `?` about
- Responsive layout and accessibility improvements
