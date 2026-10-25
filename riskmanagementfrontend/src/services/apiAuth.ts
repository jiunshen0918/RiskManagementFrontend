const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
let authorizationHeader = ''

function basicHeader(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
  return `Basic ${btoa(binary)}`
}

export async function verifyApiCredentials(username: string, password: string): Promise<void> {
  const candidate = basicHeader(username, password)
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/auth/check`, {
      headers: { Authorization: candidate },
    })
  } catch {
    throw new Error('Cannot reach the Risk Management API. Make sure the backend is running.')
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: unknown } | null
    throw new Error(typeof body?.detail === 'string' ? body.detail : 'API authentication failed.')
  }
  authorizationHeader = candidate
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers)
  if (authorizationHeader) headers.set('Authorization', authorizationHeader)
  return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
}

export function clearApiCredentials(): void {
  authorizationHeader = ''
}
