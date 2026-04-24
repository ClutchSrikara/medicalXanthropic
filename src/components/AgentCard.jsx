export default function AgentCard({ role, meta, data }) {
  if (data?._raw) {
    return (
      <article className={`card card-${role}`}>
        <h3>{meta.label}</h3>
        <p className="blurb">{meta.blurb}</p>
        <pre className="raw">{data._raw}</pre>
      </article>
    )
  }

  return (
    <article className={`card card-${role}`}>
      <h3>{meta.label}</h3>
      <p className="blurb">{meta.blurb}</p>

      {role === 'optimist' && (
        <>
          <ul>
            {(data.reassuring_findings || []).map((f, i) => (
              <li key={i}><strong>{f.finding}</strong> — {f.why_reassuring}</li>
            ))}
          </ul>
          {data.strengths?.length > 0 && (
            <>
              <h4>Strengths</h4>
              <ul>{data.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </>
          )}
        </>
      )}

      {role === 'skeptic' && (
        <>
          <ul>
            {(data.concerns || []).map((c, i) => (
              <li key={i}>
                <span className={`sev sev-${c.severity}`}>{c.severity}</span>{' '}
                <strong>{c.finding}</strong> — {c.why_flagged}
              </li>
            ))}
          </ul>
          {data.questions_to_ask_doctor?.length > 0 && (
            <>
              <h4>Ask your doctor</h4>
              <ul>{data.questions_to_ask_doctor.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </>
          )}
        </>
      )}

      {role === 'systems' && (
        <>
          <ul>
            {(data.connections || []).map((c, i) => (
              <li key={i}>
                <strong>{c.pattern}</strong>
                <div className="muted">Involves: {(c.findings_involved || []).join(', ')}</div>
                <div>{c.what_it_might_suggest}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {data.notes && <p className="notes">{data.notes}</p>}
    </article>
  )
}
