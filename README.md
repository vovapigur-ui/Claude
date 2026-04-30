# Coach — Personal Trainer App

A single-page personal trainer web app powered by Claude. Chat with an AI coach,
log workouts, and track progress — all in your browser.

## Features

- **Chat with Coach** — context-aware AI trainer that knows your profile and recent workouts.
- **Workouts** — log sessions with exercises, sets, reps, weight, duration, and notes.
- **Progress** — weekly volume, 30-day frequency chart, and per-lift weight progression.
- **Profile** — goals, experience, equipment, injuries; the coach uses these to tailor advice.
- **Streak** — counts consecutive training days.
- **Local-first** — everything stored in `localStorage`. Export/import as JSON.

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Setup

1. Open the app and go to **Settings**.
2. Paste your Anthropic API key (`sk-ant-...`) and pick a model.
3. Fill out **Profile** so Coach can tailor advice.
4. Hit **Chat** and ask Coach to plan a workout.

## Notes

- Your API key is stored only in your browser and sent directly to Anthropic.
- Default model is Claude Sonnet 4.6; switch to Opus 4.7 for harder questions or Haiku 4.5 for speed.
