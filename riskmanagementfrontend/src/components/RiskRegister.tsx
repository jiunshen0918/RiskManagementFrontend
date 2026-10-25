import { useEffect, useState } from 'react'
import { AlertTriangle, Building2, LoaderCircle, RefreshCw } from 'lucide-react'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

interface RiskRecord {
  sys_id: string
  number: string | null
  name: string
  description: string | null
  score: string | null
  state: string | null
  category: string | null
  synced_at: string
}

interface SyncSummary { imported: number; updated: number; skipped: number; total_received: number; message: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch {
    throw new Error('Cannot reach the Risk Management API. Make sure the backend is running.')
  }
  const body = await response.json().catch(() => null) as { detail?: unknown } | null
  if (!response.ok) throw new Error(typeof body?.detail === 'string' ? body.detail : 'The ServiceNow request failed.')
  return body as T
}

function fetchSyncedRisks(): Promise<{ risks: RiskRecord[] }> {
  return request<{ risks: RiskRecord[] }>('/api/v1/servicenow/risks')
}

export default function RiskRegister() {
  const [risks, setRisks] = useState<RiskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    void fetchSyncedRisks().then(result => {
      if (active) { setRisks(result.risks); setError('') }
    }).catch(err => {
      if (active) setError(err instanceof Error ? err.message : 'Could not load the Risk Register.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  async function sync() {
    setSyncing(true)
    setError('')
    setNotice('')
    try {
      const summary = await request<SyncSummary>('/api/v1/servicenow/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      setNotice(`${summary.message} ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped} skipped.`)
      const result = await fetchSyncedRisks()
      setRisks(result.risks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Synchronization failed.')
    } finally { setSyncing(false) }
  }

  return <section className="risk-register">
    <div className="risk-register-toolbar panel">
      <div><h2>ServiceNow IRM risks</h2><p>Imported from ServiceNow and stored in PostgreSQL. Local records are not changed.</p></div>
      <button className="button primary" onClick={() => void sync()} disabled={syncing}>
        {syncing ? <LoaderCircle className="ai-spinner" size={15} /> : <RefreshCw size={15} />}
        {syncing ? 'Syncing…' : 'Sync from ServiceNow'}
      </button>
    </div>
    {error && <div className="register-message error" role="alert"><AlertTriangle size={15} />{error}</div>}
    {notice && <div className="register-message success" role="status">{notice}</div>}
    {loading ? <div className="panel register-empty"><LoaderCircle className="ai-spinner" size={18} /><span>Loading synchronized risks…</span></div>
      : risks.length === 0 ? <div className="panel register-empty"><Building2 size={20} /><b>No ServiceNow risks synchronized yet</b><span>Use “Sync from ServiceNow” to retrieve up to 10 records.</span></div>
      : <div className="panel register-table-wrap"><table className="register-table"><thead><tr><th>Risk</th><th>Description</th><th>Category</th><th>Score</th><th>State</th><th>Source</th></tr></thead><tbody>{risks.map(risk => <tr key={risk.sys_id}><td><b>{risk.name}</b><small>{risk.number || risk.sys_id}</small></td><td>{risk.description || '—'}</td><td>{risk.category || '—'}</td><td>{risk.score || '—'}</td><td>{risk.state || '—'}</td><td><span className="source-pill">ServiceNow</span></td></tr>)}</tbody></table></div>}
  </section>
}
