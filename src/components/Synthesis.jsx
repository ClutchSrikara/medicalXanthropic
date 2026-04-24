export default function Synthesis({ data }) {
  if (!data) return null
  if (data._raw) {
    return (
      <section className="synthesis">
        <h2>Summary</h2>
        <pre className="raw">{data._raw}</pre>
      </section>
    )
  }

  const triage = data.triage || 'Watchful'
  const triageClass = triage.toLowerCase().replace(/\s+/g, '-')

  return (
    <section className="synthesis">
      <div className="synthesis-header">
        <h2>Summary</h2>
        <span className={`triage triage-${triageClass}`}>{triage}</span>
      </div>
      <p className="plain">{data.plain_summary}</p>
      {data.triage_reason && <p className="muted">{data.triage_reason}</p>}

      {data.ranked_questions?.length > 0 && (
        <>
          <h3>Questions to ask your doctor</h3>
          <ol>{data.ranked_questions.map((q, i) => <li key={i}>{q}</li>)}</ol>
        </>
      )}

      {data.terms_defined?.length > 0 && (
        <>
          <h3>Terms</h3>
          <dl>
            {data.terms_defined.map((t, i) => (
              <div key={i}>
                <dt>{t.term}</dt>
                <dd>{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </section>
  )
}
