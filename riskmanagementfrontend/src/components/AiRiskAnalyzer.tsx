import { useState, type FormEvent } from 'react'
import { AlertCircle, BrainCircuit, CheckCircle2, Clock3, LoaderCircle, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { analyzeRisk, type RiskAnalysisResponse } from '../services/aiRiskApi'

const analysisSections = [
  { key: 'potential_causes', title: 'Potential causes' },
  { key: 'potential_consequences', title: 'Potential consequences' },
  { key: 'recommended_mitigations', title: 'Recommended mitigations' },
  { key: 'preventive_controls', title: 'Preventive controls' },
  { key: 'detection_methods', title: 'Detection methods' },
  { key: 'residual_risk_considerations', title: 'Residual risk considerations' },
  { key: 'assumptions_and_uncertainty', title: 'Assumptions and uncertainty' },
] as const

type AssessmentField = 'likelihood' | 'impact'

function AnalysisCard({ title, items }: { title: string; items: string[] }) {
  return <section className="ai-result-card">
    <h3>{title}</h3>
    <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul>
  </section>
}

function AiRiskAnalyzer() {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [likelihood, setLikelihood] = useState('')
  const [impact, setImpact] = useState('')
  const [context, setContext] = useState('')
  const [result, setResult] = useState<RiskAnalysisResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const analysis = await analyzeRisk({
        description: description.trim(),
        ...(category && { category }),
        ...(likelihood && impact && { likelihood: Number(likelihood), impact: Number(impact) }),
        ...(context.trim() && { context: context.trim() }),
      })
      setResult(analysis)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="ai-analyzer-layout">
    <form className="panel ai-form" onSubmit={handleSubmit}>
      <div className="ai-form-heading">
        <div className="ai-title-icon"><BrainCircuit size={19} /></div>
        <div><h2>Describe the risk</h2><p>Provide the known facts. Do not include confidential personal information.</p></div>
      </div>

      <label className="ai-field">
        <span>Risk description <b>Required</b></span>
        <textarea value={description} onChange={event => setDescription(event.target.value)} minLength={10} maxLength={4000} required rows={5} placeholder="Describe the risk event, what may be affected, and the known circumstances…" />
        <small>{description.length}/4,000 characters · At least 10 characters</small>
      </label>

      <label className="ai-field">
        <span>Risk category <small>Optional</small></span>
        <input value={category} onChange={event => setCategory(event.target.value)} maxLength={120} placeholder="e.g. Third-party security, Operational resilience" />
      </label>

      <div className="ai-field-row">
        {(['likelihood', 'impact'] as const).map((field: AssessmentField) => <label className="ai-field" key={field}>
          <span>{field === 'likelihood' ? 'Likelihood' : 'Impact'} <small>Optional · 1–5</small></span>
          <select value={field === 'likelihood' ? likelihood : impact} onChange={event => field === 'likelihood' ? setLikelihood(event.target.value) : setImpact(event.target.value)}>
            <option value="">Select a rating</option>
            {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} — {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'][value - 1]}</option>)}
          </select>
        </label>)}
      </div>
      {(likelihood && !impact) || (!likelihood && impact) ? <div className="ai-inline-hint"><AlertCircle size={14} /> Select both likelihood and impact to calculate the official application score.</div> : null}

      <label className="ai-field">
        <span>Additional context <small>Optional</small></span>
        <textarea value={context} onChange={event => setContext(event.target.value)} maxLength={2000} rows={3} placeholder="Relevant business context, existing controls you have verified, or known information gaps…" />
        <small>{context.length}/2,000 characters</small>
      </label>

      {error && <div className="ai-error" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}

      <div className="ai-form-footer">
        <span><Clock3 size={14} /> Analysis may take up to two minutes</span>
        <button className="button primary ai-submit" type="submit" disabled={loading || description.trim().length < 10}>
          {loading ? <><LoaderCircle className="ai-spinner" size={15} /> Analyzing…</> : <><Send size={15} /> Analyze risk</>}
        </button>
      </div>
    </form>

    <aside className="panel ai-info-card">
      <div className="ai-info-badge"><Sparkles size={15} /> AI-ASSISTED</div>
      <h2>Evidence-aware analysis</h2>
      <p>The model suggests possible causes, impacts, controls, and actions based on the information you provide.</p>
      <div className="ai-info-point"><ShieldCheck size={16} /><span><b>Application scoring stays authoritative</b><small>Likelihood × impact is calculated by the application, separately from AI commentary.</small></span></div>
      <div className="ai-info-point"><AlertCircle size={16} /><span><b>Recommendations need review</b><small>AI suggestions are not verified controls, legal advice, or guaranteed outcomes.</small></span></div>
      <div className="ai-simulated-note"><i /> Connected to the real Ollama model through the backend</div>
    </aside>

    {loading && <section className="panel ai-loading-state" aria-live="polite"><LoaderCircle className="ai-spinner" size={22} /><div><b>Analyzing the supplied risk</b><span>Ollama is preparing the structured analysis. This can take a little while.</span></div></section>}

    {result && <section className="ai-results" aria-live="polite">
      <div className="ai-results-heading"><div><div className="ai-live-label"><CheckCircle2 size={14} /> REAL MODEL RESPONSE</div><h2>Risk analysis</h2></div><span className="ai-generated-badge"><BrainCircuit size={14} /> {result.simulated ? 'Simulated' : 'Ollama analysis'}</span></div>

      <div className="panel ai-summary-card">
        <div><span className="ai-section-kicker">APPLICATION ASSESSMENT</span><h3>Official risk score</h3><p>Calculated by the application, independently of the AI recommendations.</p></div>
        {result.application_assessment ? <div className="ai-score-display"><b>{result.application_assessment.risk_score}<small>/25</small></b><span className={`ai-severity severity-${result.application_assessment.severity.toLowerCase()}`}>{result.application_assessment.severity}</span><small>L {result.application_assessment.likelihood} × I {result.application_assessment.impact}</small></div> : <div className="ai-score-missing">Provide both likelihood and impact to calculate a score.</div>}
      </div>

      <div className="panel ai-qualitative-card"><span className="ai-section-kicker">AI QUALITATIVE ASSESSMENT</span><p>{result.ai_analysis.qualitative_assessment}</p><div className="ai-summary"><b>Risk summary</b><span>{result.ai_analysis.risk_summary}</span></div></div>

      <div className="ai-results-grid">{analysisSections.map(section => <AnalysisCard key={section.key} title={section.title} items={result.ai_analysis[section.key]} />)}</div>
      <p className="ai-results-disclaimer"><AlertCircle size={14} /> AI-generated recommendations are suggestions for qualified human review. The analysis is not saved to the database.</p>
    </section>}
  </div>
}

export default AiRiskAnalyzer
