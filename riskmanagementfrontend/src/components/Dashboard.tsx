import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, Building2, ClipboardCheck, Shield, ShieldCheck } from 'lucide-react'
import { apiFetch } from '../services/apiAuth'

interface DashboardRisk {
  title: string
  category: string | null
  source: 'Local' | 'ServiceNow'
  status: string
  severity: string
  updated_at: string
}

interface Metrics {
  total: number
  critical: number
  open: number
  local: number
  servicenow: number
  severity_counts: Record<string, number>
  status_counts: Record<string, number>
  recent_risks: DashboardRisk[]
}

const severityRows = [
  ['Critical', 'critical'], ['High', 'high'], ['Medium', 'medium'], ['Low', 'low'], ['Unknown', 'unknown'],
] as const

async function getMetrics(): Promise<Metrics> {
  let response: Response
  try { response = await apiFetch('/api/v1/risks/metrics') }
  catch { throw new Error('Cannot reach the Risk Management API. Make sure the backend is running.') }
  const body = await response.json().catch(() => null) as { detail?: unknown } | Metrics | null
  if (!response.ok) {
    const detail = body && 'detail' in body && typeof body.detail === 'string' ? body.detail : 'Could not load dashboard metrics.'
    throw new Error(detail)
  }
  return body as Metrics
}

function Dashboard({ onViewRegister }: { onViewRegister: () => void }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void getMetrics().then(value => { if (active) { setMetrics(value); setError('') } })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load dashboard metrics.') })
    return () => { active = false }
  }, [])

  const count = (key: string) => metrics?.severity_counts[key] ?? 0
  const chartTotal = severityRows.reduce((sum, [label]) => sum + count(label), 0)
  let position = 0
  const gradient = chartTotal === 0 ? '#edf0f5' : severityRows.map(([label, color]) => {
    const start = position
    position += count(label) / chartTotal * 100
    return `var(--risk-${color}) ${start}% ${position}%`
  }).join(', ')

  const cards = [
    { label: 'Total risks', value: metrics?.total, note: 'Local and ServiceNow records', icon: Shield, tone: 'blue' },
    { label: 'Critical risks', value: metrics?.critical, note: 'Based on persisted risk scores', icon: AlertTriangle, tone: 'red' },
    { label: 'Open risks', value: metrics?.open, note: 'Not marked closed or retired', icon: ShieldCheck, tone: 'green' },
    { label: 'ServiceNow risks', value: metrics?.servicenow, note: `${metrics?.local ?? 0} locally managed`, icon: Building2, tone: 'violet' },
  ] as const

  return <>
    {error && <div className="register-message error" role="alert"><AlertTriangle size={15} />{error}</div>}
    <section className="metric-grid" aria-label="Risk overview metrics">{cards.map(({ label, value, note, icon: Icon, tone }) => <article className="metric-card" key={label}><div className="metric-top"><div className={`metric-icon ${tone}`}><Icon size={18} /></div><span className="trend">LIVE</span></div><b className="metric-value">{value ?? '—'}</b><strong className="metric-label">{label}</strong><small className="metric-note">{note}</small></article>)}</section>
    <section className="dashboard-grid">
      <article className="panel risk-panel"><div className="panel-heading"><div><h2>Risk exposure</h2><p>Distribution by calculated or imported severity</p></div><button className="icon-button more" aria-label="Refresh risk metrics" onClick={() => window.location.reload()}><Activity size={15} /></button></div>
        <div className="risk-chart"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}><div><b>{metrics?.total ?? '—'}</b><small>Total risks</small></div></div><div className="legend">{severityRows.map(([label, color]) => <div className="legend-row" key={label}><i className={color} /><span>{label}</span><b>{count(label)}</b><small>{chartTotal ? `${Math.round(count(label) / chartTotal * 100)}%` : '0%'}</small></div>)}</div></div>
        <div className="panel-foot"><span><b>{metrics?.local ?? '—'} local</b> · {metrics?.servicenow ?? '—'} from ServiceNow</span><button onClick={onViewRegister}>View register <ArrowUpRight size={14} /></button></div>
      </article>
      <article className="panel mitigation-panel"><div className="panel-heading"><div><h2>Risk status</h2><p>Current states from saved records</p></div></div>
        <div className="status-list">{metrics && Object.entries(metrics.status_counts).length ? Object.entries(metrics.status_counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([status, total]) => <div className="status-row" key={status}><span>{status}</span><b>{total}</b></div>) : <div className="status-empty">{error ? 'Status counts unavailable.' : 'No risk records yet.'}</div>}</div>
        <button className="panel-link" onClick={onViewRegister}>Manage risks <ArrowUpRight size={14} /></button>
      </article>
    </section>
    <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recently updated risks</h2><p>Latest records saved in the risk register</p></div><button className="link-button" onClick={onViewRegister}>View register <ArrowUpRight size={14} /></button></div>
      {metrics?.recent_risks.length ? <div className="recent-risk-list">{metrics.recent_risks.map((risk, index) => <div className="recent-risk-row" key={`${risk.source}-${risk.title}-${index}`}><div><b>{risk.title}</b><small>{risk.category || 'Uncategorized'} · {risk.source} · {risk.status}</small></div><span className={`ai-severity severity-${risk.severity.toLowerCase()}`}>{risk.severity}</span></div>)}</div> : <div className="activity-empty"><div><ClipboardCheck size={18} /></div><span><b>{error ? 'Risk activity unavailable' : 'No saved risks yet'}</b><small>{error ? 'Check the API connection and try again.' : 'Create a local risk or sync records from ServiceNow.'}</small></span><button onClick={onViewRegister}>Open register</button></div>}
    </section>
  </>
}

export default Dashboard
