const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export interface RiskAnalysisRequest {
  description: string
  category?: string
  likelihood?: number
  impact?: number
  context?: string
}

export interface RiskAssessmentDetails {
  likelihood: number
  impact: number
  risk_score: number
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
}

export interface AIAnalysis {
  qualitative_assessment: string
  risk_summary: string
  potential_causes: string[]
  potential_consequences: string[]
  recommended_mitigations: string[]
  preventive_controls: string[]
  detection_methods: string[]
  residual_risk_considerations: string[]
  assumptions_and_uncertainty: string[]
}

export interface RiskAnalysisResponse {
  application_assessment: RiskAssessmentDetails | null
  ai_analysis: AIAnalysis
  simulated: boolean
}

export async function analyzeRisk(input: RiskAnalysisRequest): Promise<RiskAnalysisResponse> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/ai/analyze-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error('Cannot reach the Risk Management API. Make sure the backend is running at the configured API URL.')
  }

  const body = await response.json().catch(() => null) as { detail?: unknown } | null
  if (!response.ok) {
    const message = typeof body?.detail === 'string'
      ? body.detail
      : 'The analysis request failed. Please review the inputs and try again.'
    throw new Error(message)
  }

  return body as RiskAnalysisResponse
}
