import { useState, type FormEvent } from 'react'
import { Bell, BookOpenCheck, BrainCircuit, Building2, ChevronDown, ChevronRight, CircleHelp, FileBarChart2, LayoutDashboard, ListChecks, Menu, Plus, Search, Settings2, ShieldAlert, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import AiRiskAnalyzer from './components/AiRiskAnalyzer'
import Dashboard from './components/Dashboard'
import RiskRegister from './components/RiskRegister'
import { clearApiCredentials, verifyApiCredentials } from './services/apiAuth'

const groups = [
  { title: '', items: [['Dashboard', LayoutDashboard]] },
  { title: 'RISK MANAGEMENT', items: [['Risk Register', ShieldAlert], ['Risk Assessment', SlidersHorizontal], ['AI Risk Analyzer', BrainCircuit], ['Mitigation Plans', ListChecks]] },
  { title: 'GOVERNANCE', items: [['Controls & Compliance', BookOpenCheck], ['ServiceNow IRM', Building2], ['Reports', FileBarChart2]] },
] as const
function App() {
  const [page, setPage] = useState('Dashboard')
  const [open, setOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authenticating, setAuthenticating] = useState(false)
  const [createRequested, setCreateRequested] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthenticating(true)
    setAuthError('')
    try {
      await verifyApiCredentials(username.trim(), password)
      setPassword('')
      setAuthenticated(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.')
    } finally { setAuthenticating(false) }
  }

  function logout() {
    clearApiCredentials()
    setAuthenticated(false)
    setPage('Dashboard')
  }

  if (!authenticated) return <main className="auth-shell"><form className="panel auth-card" onSubmit={handleLogin}>
    <div className="brand-mark"><ShieldCheck size={20} /></div><div><span className="auth-eyebrow">SENTINEL · RISK INTELLIGENCE</span><h1>Sign in to your workspace</h1><p>Use the API operator account configured in the backend environment.</p></div>
    <label className="ai-field"><span>Username</span><input autoComplete="username" maxLength={128} required value={username} onChange={event => setUsername(event.target.value)} /></label>
    <label className="ai-field"><span>Password</span><input type="password" autoComplete="current-password" maxLength={256} required value={password} onChange={event => setPassword(event.target.value)} /></label>
    {authError && <div className="ai-error" role="alert">{authError}</div>}
    <button className="button primary auth-submit" type="submit" disabled={authenticating}>{authenticating ? 'Checking…' : 'Sign in'}</button>
    <small className="auth-note">Credentials stay in memory for this browser session and are sent only to the configured Risk Management API.</small>
  </form></main>

  return <div className="app-shell">
    {open && <button className="scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><ShieldCheck size={20} /></div><div><b>Sentinel<span>.</span></b><small>RISK INTELLIGENCE</small></div><button className="icon-button close-nav" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>
      <button className="workspace"><i>N</i><span><b>Northstar Group</b><small>Enterprise workspace</small></span><ChevronDown size={15} /></button>
      <nav aria-label="Main navigation">{groups.map(group => <div className="nav-group" key={group.title || 'overview'}>{group.title && <div className="nav-title">{group.title}</div>}{group.items.map(([name, Icon]) => <button key={name} onClick={() => { setPage(name); setOpen(false) }} className={`nav-item ${page === name ? 'active' : ''}`}><Icon size={17} /><span>{name}</span>{name === 'AI Risk Analyzer' && <small className="ai-badge">AI</small>}</button>)}</div>)}<div className="nav-spacer" /><div className="nav-group bottom-links"><button onClick={() => setPage('Settings')} className={`nav-item ${page === 'Settings' ? 'active' : ''}`}><Settings2 size={17} /><span>Settings</span></button><button className="nav-item"><CircleHelp size={17} /><span>Help center</span><ChevronRight className="help-arrow" size={13} /></button></div></nav>
      <div className="sidebar-footer"><div className="plan"><Sparkles size={15} /><span><b>Enterprise plan</b><small>All systems operational</small></span><i /></div><div className="profile"><i>JD</i><span><b>Jordan Davis</b><small>Risk Administrator</small></span><b className="dots">•••</b></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="crumbs"><button className="icon-button menu-toggle" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><span>Workspace</span><ChevronRight size={14} /><b>{page}</b></div><div className="top-actions"><button className="search"><Search size={16} /><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="icon-button bell" aria-label="Notifications"><Bell size={18} /><i /></button><button className="button secondary sign-out" onClick={logout}>Sign out</button></div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow"><i /> {page === 'AI Risk Analyzer' ? 'OLLAMA-POWERED ANALYSIS' : page === 'Dashboard' ? 'LIVE RISK OVERVIEW' : 'RISK MANAGEMENT'}</div><h1>{page === 'Dashboard' ? 'Risk overview' : page}</h1><p>{page === 'AI Risk Analyzer' ? 'Analyze a risk using the connected AI model and receive structured recommendations.' : page === 'Risk Register' ? 'Create and manage local risks alongside read-only ServiceNow records.' : 'Metrics are calculated from saved local and ServiceNow risk records.'}</p></div>{page === 'Dashboard' && <div className="heading-actions"><button className="button primary" onClick={() => { setPage('Risk Register'); setCreateRequested(true) }}><Plus size={16} /> Add local risk</button></div>}</div>
      {page === 'AI Risk Analyzer' ? <AiRiskAnalyzer /> : page === 'Risk Register' ? <RiskRegister createRequested={createRequested} onCreateRequestHandled={() => setCreateRequested(false)} /> : page === 'Dashboard' ? <Dashboard onViewRegister={() => setPage('Risk Register')} /> : <section className="panel feature-placeholder"><h2>{page}</h2><p>This workflow is not part of the current implementation.</p></section>}
      </div></main>
  </div>
}
export default App
