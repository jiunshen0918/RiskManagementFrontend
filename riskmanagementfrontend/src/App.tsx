import { useState } from 'react'
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, BookOpenCheck, BrainCircuit, Building2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck, FileBarChart2, LayoutDashboard, ListChecks, Menu, Plus, Search, Settings2, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import AiRiskAnalyzer from './components/AiRiskAnalyzer'
import RiskRegister from './components/RiskRegister'

const groups = [
  { title: '', items: [['Dashboard', LayoutDashboard]] },
  { title: 'RISK MANAGEMENT', items: [['Risk Register', ShieldAlert], ['Risk Assessment', SlidersHorizontal], ['AI Risk Analyzer', BrainCircuit], ['Mitigation Plans', ListChecks]] },
  { title: 'GOVERNANCE', items: [['Controls & Compliance', BookOpenCheck], ['ServiceNow IRM', Building2], ['Reports', FileBarChart2]] },
] as const
const metrics = [
  { label: 'Total risks', value: '128', note: 'Across 8 business units', icon: Shield, tone: 'blue', change: '+8.2%', up: true },
  { label: 'Critical risks', value: '08', note: '2 require immediate action', icon: AlertTriangle, tone: 'red', change: '−2 this month', up: false },
  { label: 'Mitigations on track', value: '76%', note: '42 of 55 actions completed', icon: ShieldCheck, tone: 'green', change: '+12.4%', up: true },
  { label: 'Controls effective', value: '92%', note: 'Across 6 frameworks', icon: BookOpenCheck, tone: 'violet', change: '+3.1%', up: true },
]
const severity = [['Critical', '8', '6%', 'critical'], ['High', '32', '25%', 'high'], ['Medium', '56', '44%', 'medium'], ['Low', '32', '25%', 'low']] as const

function App() {
  const [page, setPage] = useState('Dashboard')
  const [open, setOpen] = useState(false)
  return <div className="app-shell">
    {open && <button className="scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={20} /></div><div><b>Sentinel<span>.</span></b><small>RISK INTELLIGENCE</small></div><button className="icon-button close-nav" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>
      <button className="workspace"><i>N</i><span><b>Northstar Group</b><small>Enterprise workspace</small></span><ChevronDown size={15} /></button>
      <nav aria-label="Main navigation">{groups.map(group => <div className="nav-group" key={group.title || 'overview'}>{group.title && <div className="nav-title">{group.title}</div>}{group.items.map(([name, Icon]) => <button key={name} onClick={() => { setPage(name); setOpen(false) }} className={`nav-item ${page === name ? 'active' : ''}`}><Icon size={17} /><span>{name}</span>{name === 'Risk Register' && <small className="badge">24</small>}{name === 'AI Risk Analyzer' && <small className="ai-badge">AI</small>}</button>)}</div>)}<div className="nav-spacer" /><div className="nav-group bottom-links"><button onClick={() => setPage('Settings')} className={`nav-item ${page === 'Settings' ? 'active' : ''}`}><Settings2 size={17} /><span>Settings</span></button><button className="nav-item"><CircleHelp size={17} /><span>Help center</span><ChevronRight className="help-arrow" size={13} /></button></div></nav>
      <div className="sidebar-footer"><div className="plan"><Sparkles size={15} /><span><b>Enterprise plan</b><small>All systems operational</small></span><i /></div><div className="profile"><i>JD</i><span><b>Jordan Davis</b><small>Risk Administrator</small></span><b className="dots">•••</b></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="crumbs"><button className="icon-button menu-toggle" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><b>{page}</b></div><div className="top-actions"><button className="search"><Search size={16} /><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="icon-button bell" aria-label="Notifications"><Bell size={18} /><i /></button><div className="user-avatar">JD</div></div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow"><i /> {page === 'AI Risk Analyzer' ? 'OLLAMA-POWERED ANALYSIS' : 'MONDAY, OCTOBER 24, 2026'}</div><h1>{page === 'Dashboard' ? 'Good morning, Jordan' : page}</h1><p>{page === 'AI Risk Analyzer' ? 'Analyze a risk using the connected AI model and receive structured recommendations.' : 'Here’s what’s happening across your risk landscape today.'}</p></div>{page !== 'AI Risk Analyzer' && <div className="heading-actions"><button className="button secondary"><Activity size={15} /> Last 30 days <ChevronDown size={14} /></button><button className="button primary"><Plus size={16} /> Add new risk</button></div>}</div>
      {page === 'AI Risk Analyzer' ? <AiRiskAnalyzer /> : page === 'Risk Register' ? <RiskRegister /> : <>
      <section className="metric-grid" aria-label="Risk overview metrics">{metrics.map(({ label, value, note, icon: Icon, tone, change, up }) => <article className="metric-card" key={label}><div className="metric-top"><div className={`metric-icon ${tone}`}><Icon size={18} /></div><span className={`trend ${up ? 'up' : 'down'}`}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}</span></div><b className="metric-value">{value}</b><strong className="metric-label">{label}</strong><small className="metric-note">{note}</small></article>)}</section>
      <section className="dashboard-grid"><article className="panel risk-panel"><div className="panel-heading"><div><h2>Risk exposure</h2><p>Risk distribution by severity</p></div><button className="icon-button more" aria-label="More options">•••</button></div><div className="risk-chart"><div className="donut"><div><b>128</b><small>Total risks</small></div></div><div className="legend">{severity.map(([label, value, pct, color]) => <div className="legend-row" key={label}><i className={color} /><span>{label}</span><b>{value}</b><small>{pct}</small></div>)}</div></div><div className="panel-foot"><span><i>↗</i><b>12 new risks</b> identified this month</span><button onClick={() => setPage('Risk Register')}>View register <ChevronRight size={14} /></button></div></article>
      <article className="panel mitigation-panel"><div className="panel-heading"><div><h2>Mitigation progress</h2><p>Action plans across your organization</p></div><button className="select">This month <ChevronDown size={13} /></button></div><div className="progress-summary"><b>76<span>%</span></b><small><i><ArrowUpRight size={13} /> 12.4%</i> vs last month</small></div><div className="progress-track"><i /></div><div className="progress-labels"><span>42 completed</span><span>55 total actions</span></div><hr /><div className="status-breakdown"><span><i className="complete" />Completed <b>42</b></span><span><i className="inprogress" />In progress <b>9</b></span><span><i className="overdue" />Overdue <b>4</b></span></div><button className="panel-link" onClick={() => setPage('Mitigation Plans')}>View all action plans <ChevronRight size={14} /></button></article></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest updates from your risk team</p></div><button className="link-button">View all activity <ChevronRight size={14} /></button></div><div className="activity-empty"><div><ClipboardCheck size={18} /></div><span><b>You’re all caught up</b><small>New risk updates and team activity will appear here.</small></span><button>Refresh</button></div></section>
      <div className="demo-note"><Sparkles size={13} /> Demo workspace · Sample data for illustration</div>
      </>}
      </div></main>
  </div>
}
export default App
