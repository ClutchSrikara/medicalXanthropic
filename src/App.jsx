import { useState } from 'react'
import ReportInput from './components/ReportInput.jsx'
import AgentCard from './components/AgentCard.jsx'
import Synthesis from './components/Synthesis.jsx'

const ROLE_META = {
  optimist: { label: 'The Optimist', blurb: 'What looks normal and stable' },
  skeptic: { label: 'The Skeptic', blurb: 'What deserves follow-up' },
  systems: { label: 'The Systems Thinker', blurb: 'How findings connect' }
}

export default function App() {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function analyze() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ report })
      })
      if (!res.ok) throw new Error((await res.json()).error || res.statusText)
      setResult(await res.json())
    } catch (e) {
      setError(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
        <div className="grain" />
      </div>

      <nav className="nav">
        <div className="brand">
          <span className="brand-mark">◐</span>
          <span className="brand-name">Second Opinion</span>
        </div>
        <div className="nav-meta">
          <span className="pill pill-soft">Anthropic × UMD · 2026</span>
        </div>
      </nav>

      <header className="hero">
        <span className="eyebrow">Health & Wellbeing</span>
        <h1 className="hero-title">
          Your report, <em>decoded.</em>
          <br />Your visit, prepared.
        </h1>
        <p className="hero-sub">
          Three specialist agents debate your medical report. A fourth reconciles
          them into the questions you should actually bring to your doctor.
        </p>
        <div className="hero-badges">
          <span className="badge">◇ Optimist</span>
          <span className="badge">◈ Skeptic</span>
          <span className="badge">◉ Systems Thinker</span>
          <span className="badge badge-accent">✦ Synthesis</span>
        </div>
      </header>

      <ReportInput value={report} onChange={setReport} onSubmit={analyze} loading={loading} />

      {error && <div className="error">{error}</div>}

      {loading && (
        <div className="loading-strip">
          <div className="spark" /><div className="spark" /><div className="spark" />
          <span>Three specialists are reviewing your report…</span>
        </div>
      )}

      {result && (
        <>
          <section className="agents">
            {Object.keys(ROLE_META).map((k) => (
              <AgentCard
                key={k}
                role={k}
                meta={ROLE_META[k]}
                data={result.agents[k]}
              />
            ))}
          </section>
          <Synthesis data={result.synthesis} />
        </>
      )}

      <footer className="footer">
        <div className="footer-line">
          Preparation tool only. Not medical advice. In an emergency, call <strong>911</strong>.
        </div>
        <div className="footer-meta">
          Built for internal use only <span className="mono">localhost:5173</span>
        </div>
      </footer>
    </div>
  )
}