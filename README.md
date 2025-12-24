# JobFlow - Premium Job Application Tracker

A beautiful, local-first job application tracker with gamification. No signup required - your data stays on your device.

![JobFlow](https://img.shields.io/badge/status-MVP-blue)

## Features

### 📊 Dashboard
- Weekly/daily goal progress tracking
- Next actions queue (follow-ups, prep, applications)
- Stale applications alerts
- GitHub-style heatmap calendar
- XP, streaks, and level progression

### 🎯 Pipeline Board (Kanban)
- Drag-and-drop status updates
- Columns: Saved → Applied → Screen → Interview 1 → Interview 2 → Final → Offer → Rejected/Ghosted
- "Days in stage" tracking on each card
- Company logos, platform tags, and quick actions

### 📈 Analytics
- Response rate & interview rate
- Weekly activity trends
- Platform performance comparison
- Application funnel visualization

### ⚡ Quick Actions
- Command palette (⌘K) for fast navigation
- Add applications in seconds
- One-click outcomes (offer/rejected/ghosted)
- Smart URL parsing for company detection

### 🎮 Gamification
- XP for actions (not outcomes) - applying, following up, prepping
- Streak tracking with grace days
- Badges and milestones
- Level progression

### 🔧 Settings
- Configurable weekly/daily goals
- Follow-up reminder thresholds
- Export to CSV
- Dark/light mode

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: IndexedDB via Dexie (local-first)
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `N` | Add new application (from command palette) |

## Data Storage

All data is stored locally in your browser using IndexedDB. No data is sent to any server. You can export your data to CSV at any time from the Settings page.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── board/             # Kanban pipeline
│   ├── analytics/         # Analytics & insights
│   ├── settings/          # User settings
│   └── app/[id]/          # Application detail
├── components/            # React components
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── command-palette.tsx # ⌘K quick actions
│   ├── application-card.tsx # Card components
│   ├── heatmap-calendar.tsx # Activity heatmap
│   └── ...
└── lib/                   # Utilities & data layer
    ├── db.ts              # Dexie database
    ├── types.ts           # TypeScript types
    ├── hooks.ts           # React hooks
    └── utils.ts           # Helper functions
```

## License

MIT

