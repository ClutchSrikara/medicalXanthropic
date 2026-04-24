import express from 'express'
import cors from 'cors'
import { spawn } from 'node:child_process'
import { ROLES } from './prompts.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

function runClaude({ system, user }) {
  return new Promise((resolve, reject) => {
    const args = ['-p', user, '--append-system-prompt', system, '--output-format', 'json']
    const proc = spawn('claude', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => (stdout += d.toString()))
    proc.stderr.on('data', (d) => (stderr += d.toString()))
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code !== 0) return reject(new Error(`claude exited ${code}: ${stderr}`))
      try {
        const env = JSON.parse(stdout)
        const text = env.result ?? env.output ?? stdout
        resolve(text)
      } catch {
        resolve(stdout)
      }
    })
  })
}

function extractJson(text) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fence ? fence[1] : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1) return { _raw: text }
  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return { _raw: text }
  }
}

app.post('/api/analyze', async (req, res) => {
  const report = (req.body?.report ?? '').trim()
  if (!report) return res.status(400).json({ error: 'report is required' })

  try {
    const roleKeys = ['optimist', 'skeptic', 'systems']
    const roleResults = await Promise.all(
      roleKeys.map(async (k) => {
        const raw = await runClaude({
          system: ROLES[k].system,
          user: `MEDICAL REPORT:\n\n${report}`
        })
        return [k, extractJson(raw)]
      })
    )
    const agents = Object.fromEntries(roleResults)

    const synthUser = `MEDICAL REPORT:\n\n${report}\n\nSPECIALIST JSON OUTPUTS:\n${JSON.stringify(agents, null, 2)}`
    const synthRaw = await runClaude({ system: ROLES.synthesizer.system, user: synthUser })
    const synthesis = extractJson(synthRaw)

    res.json({ agents, synthesis })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: String(err.message || err) })
  }
})

const PORT = 8787
app.listen(PORT, () => console.log(`api: http://localhost:${PORT}`))
