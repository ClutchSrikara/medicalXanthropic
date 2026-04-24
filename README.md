# Second Opinion

Your report, decoded. Your visit, prepared.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

The backend (port 8787) shells out to the local `claude` CLI — no API key needed. You must be logged in via `claude login`.

## Structure

```
server/
  index.js       Express API, /api/analyze spawns `claude -p` 4× (3 roles + synthesis)
  prompts.js     System prompts for Optimist / Skeptic / Systems Thinker / Synthesizer
src/
  App.jsx        Main page
  components/
    ReportInput.jsx
    AgentCard.jsx
    Synthesis.jsx
  styles.css
```

## Flow

1. Paste report text → click Analyze
2. Backend fires 3 `claude -p` calls in parallel (Optimist, Skeptic, Systems Thinker)
3. Synthesis call reconciles their JSON into summary + triage + ranked questions
4. UI renders 3 agent cards + synthesis card
