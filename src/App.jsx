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
      <header>
        <h1>Second Opinion</h1>
        <p className="tagline">Your report, decoded. Your visit, prepared.</p>
      </header>

      <ReportInput value={report} onChange={setReport} onSubmit={analyze} loading={loading} />

      {error && <div className="error">{error}</div>}

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

      <footer>
        Preparation tool only. Not medical advice. In an emergency, call 911.
      </footer>
    </div>
  )
}
