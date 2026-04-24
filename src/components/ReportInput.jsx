import { useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth/mammoth.browser'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

async function extractPdf(file) {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((it) => it.str).join(' ') + '\n\n'
  }
  return text.trim()
}

async function extractDocx(file) {
  const buf = await file.arrayBuffer()
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf })
  return value.trim()
}

export default function ReportInput({ value, onChange, onSubmit, loading }) {
  const [fileName, setFileName] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [fileError, setFileError] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    setFileName(file.name)
    setExtracting(true)
    try {
      const name = file.name.toLowerCase()
      let text = ''
      if (name.endsWith('.pdf')) {
        text = await extractPdf(file)
      } else if (name.endsWith('.docx')) {
        text = await extractDocx(file)
      } else if (name.endsWith('.txt')) {
        text = await file.text()
      } else {
        throw new Error('Unsupported file type. Upload PDF, DOCX, or TXT.')
      }
      onChange(text)
    } catch (err) {
      setFileError(String(err.message || err))
    } finally {
      setExtracting(false)
    }
  }

  return (
    <section className="report-input">
      <label htmlFor="report">Paste your medical report</label>

      <div className="upload-row">
        <input
          id="file"
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFile}
          disabled={extracting || loading}
        />
        {fileName && <span className="muted">{fileName}</span>}
        {extracting && <span className="muted">Extracting…</span>}
      </div>
      {fileError && <div className="error">{fileError}</div>}

      <textarea
        id="report"
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste lab results, blood panel, or radiology report text here — or upload a PDF/DOCX above."
      />
      <button onClick={onSubmit} disabled={loading || extracting || !value.trim()}>
        {loading ? 'Analyzing…' : 'Analyze'}
      </button>
    </section>
  )
}