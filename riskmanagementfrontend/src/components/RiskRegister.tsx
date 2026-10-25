import { useEffect, useState, type FormEvent } from 'react'
import { AlertTriangle, Building2, LoaderCircle, Pencil, Plus, RefreshCw, X } from 'lucide-react'
import { apiFetch } from '../services/apiAuth'

interface RiskRecord {
  id: string | null
  sys_id: string | null
  number: string | null
  title: string
  description: string | null
  category: string | null
  score: string | null
  risk_score: number | null
  severity: string
  likelihood: number | null
  impact: number | null
  status: string
  source: 'Local' | 'ServiceNow'
  updated_at: string
}

interface RiskForm {
  title: string
  description: string
  category: string
  likelihood: string
  impact: string
  status: 'Open' | 'In Progress' | 'Closed'
}
interface SyncSummary { imported: number; updated: number; skipped: number; total_received: number; message: string }

const blankForm: RiskForm = { title: '', description: '', category: '', likelihood: '', impact: '', status: 'Open' }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try { response = await apiFetch(path, init) }
  catch { throw new Error('Cannot reach the Risk Management API. Make sure the backend is running.') }
  const body = await response.json().catch(() => null) as { detail?: unknown } | null
  if (!response.ok) throw new Error(typeof body?.detail === 'string' ? body.detail : 'The risk request failed.')
  return body as T
}

function fetchRisks(): Promise<{ risks: RiskRecord[] }> {
  return request<{ risks: RiskRecord[] }>('/api/v1/risks')
}

export default function RiskRegister({ createRequested = false, onCreateRequestHandled }: { createRequested?: boolean; onCreateRequestHandled?: () => void }) {
  const [risks, setRisks] = useState<RiskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | null>(() => createRequested ? 'create' : null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<RiskForm>(blankForm)

  useEffect(() => {
    let active = true
    void fetchRisks().then(result => {
      if (active) { setRisks(result.risks); setError('') }
    }).catch(err => {
      if (active) setError(err instanceof Error ? err.message : 'Could not load the Risk Register.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  function closeEditor() {
    setEditorMode(null)
    setSelectedId(null)
    setForm(blankForm)
    onCreateRequestHandled?.()
  }

  function openCreate() {
    setSelectedId(null)
    setForm(blankForm)
    setEditorMode('create')
    setError('')
  }

  function openEdit(risk: RiskRecord) {
    if (risk.source !== 'Local' || !risk.id) return
    setSelectedId(risk.id)
    setForm({ title: risk.title, description: risk.description || '', category: risk.category || '', likelihood: String(risk.likelihood || ''), impact: String(risk.impact || ''), status: risk.status as RiskForm['status'] })
    setEditorMode('edit')
    setError('')
  }

  async function saveRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    const payload = { ...form, category: form.category.trim() || null, likelihood: Number(form.likelihood), impact: Number(form.impact) }
    try {
      await request<RiskRecord>(editorMode === 'edit' && selectedId ? `/api/v1/risks/${selectedId}` : '/api/v1/risks', {
        method: editorMode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNotice(editorMode === 'edit' ? 'Local risk updated successfully.' : 'Local risk created successfully.')
      closeEditor()
      const result = await fetchRisks()
      setRisks(result.risks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the local risk.')
    } finally { setSaving(false) }
  }

  async function sync() {
    setSyncing(true)
    setError('')
    setNotice('')
    try {
      const summary = await request<SyncSummary>('/api/v1/servicenow/sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      })
      setNotice(`${summary.message} ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped} skipped.`)
      const result = await fetchRisks()
      setRisks(result.risks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Synchronization failed.')
    } finally { setSyncing(false) }
  }

  return <section className="risk-register">
    <div className="risk-register-toolbar panel">
      <div><h2>Risk register</h2><p>Local risks can be edited here. ServiceNow risks are read-only and synchronized one way.</p></div>
      <div className="register-actions"><button className="button secondary" onClick={openCreate}><Plus size={15} /> Add local risk</button><button className="button primary" onClick={() => void sync()} disabled={syncing}>{syncing ? <LoaderCircle className="ai-spinner" size={15} /> : <RefreshCw size={15} />}{syncing ? 'Syncing…' : 'Sync from ServiceNow'}</button></div>
    </div>
    {error && <div className="register-message error" role="alert"><AlertTriangle size={15} />{error}</div>}
    {notice && <div className="register-message success" role="status">{notice}</div>}
    {editorMode && <form className="panel risk-editor" onSubmit={event => void saveRisk(event)}>
      <div className="risk-editor-heading"><div><h2>{editorMode === 'edit' ? 'Update local risk' : 'Create local risk'}</h2><p>Likelihood and impact determine the application score and severity.</p></div><button type="button" className="icon-button" aria-label="Close risk form" onClick={closeEditor}><X size={17} /></button></div>
      <label className="ai-field"><span>Risk title</span><input required minLength={3} maxLength={200} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label>
      <label className="ai-field"><span>Description</span><textarea required minLength={10} maxLength={4000} rows={3} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
      <div className="ai-field-row">
        <label className="ai-field"><span>Category <small>Optional</small></span><input maxLength={120} value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} /></label>
        <label className="ai-field"><span>Status</span><select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as RiskForm['status'] })}><option>Open</option><option>In Progress</option><option>Closed</option></select></label>
      </div>
      <div className="ai-field-row">
        <label className="ai-field"><span>Likelihood · 1–5</span><select required value={form.likelihood} onChange={event => setForm({ ...form, likelihood: event.target.value })}><option value="">Select</option>{[1,2,3,4,5].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="ai-field"><span>Impact · 1–5</span><select required value={form.impact} onChange={event => setForm({ ...form, impact: event.target.value })}><option value="">Select</option>{[1,2,3,4,5].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      </div>
      <div className="risk-editor-footer"><button type="button" className="button secondary" onClick={closeEditor}>Cancel</button><button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editorMode === 'edit' ? 'Save changes' : 'Create risk'}</button></div>
    </form>}
    {loading ? <div className="panel register-empty"><LoaderCircle className="ai-spinner" size={18} /><span>Loading risks…</span></div>
      : risks.length === 0 ? <div className="panel register-empty"><Building2 size={20} /><b>No risks saved yet</b><span>Create a local risk or synchronize ServiceNow records.</span></div>
      : <div className="panel register-table-wrap"><table className="register-table"><thead><tr><th>Risk</th><th>Description</th><th>Category</th><th>Score</th><th>Severity</th><th>Status</th><th>Source</th><th></th></tr></thead><tbody>{risks.map(risk => <tr key={risk.id || risk.sys_id}><td><b>{risk.title}</b><small>{risk.number || risk.sys_id || 'Local record'}</small></td><td>{risk.description || '—'}</td><td>{risk.category || '—'}</td><td>{risk.score || '—'}</td><td>{risk.severity}</td><td>{risk.status}</td><td><span className="source-pill">{risk.source}</span></td><td>{risk.source === 'Local' && <button className="icon-button" aria-label={`Edit ${risk.title}`} onClick={() => openEdit(risk)}><Pencil size={14} /></button>}</td></tr>)}</tbody></table></div>}
  </section>
}
