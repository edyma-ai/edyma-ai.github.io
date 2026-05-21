const DEFAULT_API_BASE_URL = 'https://api.edyma.in'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API_BASE_URL

export type TlmSection = {
  heading: string
  content: string
}

export type PresentationHostResponse = {
  session_id: string
  code: string
  expires_at: number
}

export type PresentationStatusResponse = {
  status: 'waiting' | 'connected' | 'ended'
  title?: string
  sections?: TlmSection[]
}

export async function createHostSession(): Promise<PresentationHostResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/presentations/host`, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.detail || 'Unable to start presentation display')
  }
  return res.json()
}

export async function getPresentationStatus(
  sessionId: string,
): Promise<PresentationStatusResponse> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/presentations/status/${encodeURIComponent(sessionId)}`,
  )
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.detail || 'Presentation not found')
  }
  return res.json()
}

export function presentationCodePayload(code: string): string {
  return `edyma://present?code=${code.trim().toUpperCase()}`
}
