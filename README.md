# Second Opinion

**Your report, decoded. Your visit, prepared.**

Built for the Anthropic x UMD Hackathon 2026 — Health & Wellbeing track.

Second Opinion is a patient preparation tool. Upload a lab panel, blood report, or radiology summary and three AI specialists review it from different angles. A fourth synthesis agent reconciles their debate into a plain-English brief, a ranked list of questions to bring to your doctor, and a triage stamp.

> It does not tell you what is wrong. It tells you what to ask.

---

## The Problem

Every day, millions of people receive medical reports they cannot read. They guess, they Google, they panic — or they dismiss something serious and wait too long. Medical knowledge is locked behind jargon, and most people navigate it alone.

This is especially true for students, uninsured individuals, and anyone without a doctor they can call.

## The Approach

Most health AI tools either **diagnose** (legally risky, often wrong) or **remind you to take pills** (useful but simple). Second Opinion occupies the gap between them: it helps patients walk into an appointment *prepared*, without pretending to be a doctor.

### Three specialists, one synthesis

| Agent | Role |
| --- | --- |
| **The Optimist** | Identifies what is normal, stable, and reassuring |
| **The Skeptic** | Flags values that deserve follow-up or clarification |
| **The Systems Thinker** | Connects findings to each other and to the bigger picture |
| **Synthesizer** | Reconciles the three into plain-English summary + ranked questions + triage |

A single AI call gives you one perspective. Three specialists that disagree with each other is closer to how real clinical review actually works — different failure modes get caught by different lenses.

---

## Quick Start

Prerequisites:
- **Node.js 20+**
- **Claude Code CLI** installed and logged in (`claude login`). The backend shells out to the `claude` binary — **no API key required**.

```bash
npm install
npm run dev
```

Then open **http://localhost:5173**.

The `dev` script runs both the Vite frontend (`:5173`) and the Express backend (`:8787`) in parallel. Vite proxies `/api/*` to the backend.

### Individual scripts
```bash
npm run web     # frontend only (Vite)
npm run api     # backend only (Express)
npm run build   # production build
npm run preview # preview the built bundle
```

---

## How It Works

1. **Input.** Paste the report into the textarea, or upload a PDF / DOCX / TXT. PDFs are parsed client-side with `pdfjs-dist`, DOCX with `mammoth`.
2. **Fan-out.** The frontend `POST`s `/api/analyze` with the extracted text. The server spawns three `claude -p` subprocesses in parallel (Optimist, Skeptic, Systems Thinker), each with a role-specific system prompt that forces **strict JSON output**.
3. **Synthesize.** Once all three return, a fourth `claude -p` call receives the original report plus the three specialists' JSON. It reconciles them into a single patient-facing brief.
4. **Render.** The UI shows three color-coded specialist cards and a synthesis card with:
   - Plain-English summary
   - Triage stamp (`Reassuring` / `Watchful` / `See Doctor Soon`)
   - Ranked questions to ask the doctor
   - Definitions for any medical terms used

All four prompts live in [`server/prompts.js`](server/prompts.js) and are tuned to never speculate on diagnosis.

---

## Project Structure

```
.
├── index.html                 Vite entry
├── vite.config.js             Vite config + /api proxy to :8787
├── package.json
│
├── server/
│   ├── index.js               Express API. /api/analyze spawns `claude -p` 4×
│   └── prompts.js             System prompts for the 4 agents
│
└── src/
    ├── main.jsx               React entry
    ├── App.jsx                Page layout, state, fetch call
    ├── styles.css             All styles (no UI library)
    └── components/
        ├── ReportInput.jsx    Textarea + PDF/DOCX/TXT upload
        ├── AgentCard.jsx      Renders one specialist's JSON
        └── Synthesis.jsx      Renders the final brief + triage pill
```

---

## Tech Stack

- **React 18** + **Vite** — frontend
- **Express** — thin backend that orchestrates the Claude CLI
- **Claude Code CLI** (`claude -p`) — local inference, no API key
- **pdfjs-dist** — client-side PDF text extraction
- **mammoth** — client-side DOCX text extraction
- **No external UI libraries** — plain CSS

---

## API

### `POST /api/analyze`

Request:
```json
{ "report": "string — the full text of the medical report" }
```

Response:
```json
{
  "agents": {
    "optimist":  { "reassuring_findings": [...], "strengths": [...], "notes": "..." },
    "skeptic":   { "concerns": [...], "questions_to_ask_doctor": [...], "notes": "..." },
    "systems":   { "connections": [...], "questions_to_ask_doctor": [...], "notes": "..." }
  },
  "synthesis": {
    "plain_summary": "...",
    "triage": "Reassuring | Watchful | See Doctor Soon",
    "triage_reason": "...",
    "ranked_questions": [ "..." ],
    "terms_defined": [ { "term": "...", "meaning": "..." } ]
  }
}
```

If any agent returns non-JSON, its card falls back to rendering the raw text — the response is never dropped.

---

## Troubleshooting

- **`claude: command not found`** — Install Claude Code and run `claude login`.
- **Upload fails on a scanned PDF** — `pdfjs-dist` only extracts text from PDFs with a real text layer. Image-only PDFs need OCR (not yet wired up).
- **One agent card shows raw text** — the model returned prose instead of JSON. The UI falls back gracefully; refresh to retry.
- **Port conflict on 5173 or 8787** — change the ports in `vite.config.js` and `server/index.js`.

---

## Disclaimer

Second Opinion is a **preparation tool only**. It does not provide medical diagnoses, treatment recommendations, or replace professional medical advice. Always discuss your results with a qualified healthcare provider. **In an emergency, call 911.**