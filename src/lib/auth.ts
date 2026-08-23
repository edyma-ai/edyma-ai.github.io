// Teacher sign-in: password login, session restore, sign-out, and the QR
// device-link handshake the Edyma app approves from the phone.
import { apiFetch } from '@/lib/api'

export interface AuthUser {
  id: string
  email: string
  display_name: string
  role: string
  account_status: string
  created_at: number
  avatar_key?: string | null
  school_id?: string | null
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_at: number
  user: AuthUser
}

export interface LinkRequest {
  link_id: string
  code: string
  expires_at: number
}

export type LinkStatus = 'pending' | 'approved' | 'consumed' | 'rejected' | 'expired'

export interface LinkPoll {
  status: LinkStatus
  expires_at?: number
  /** Present exactly once, on the first poll that sees the approval. */
  tokens?: TokenResponse
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false })
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me')
}

/** Revokes this browser's session. Callers clear local tokens regardless of the result. */
export function logoutSession(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' })
}

export function createLinkRequest(): Promise<LinkRequest> {
  return apiFetch<LinkRequest>('/auth/link', { method: 'POST', auth: false })
}

export function pollLinkRequest(code: string): Promise<LinkPoll> {
  return apiFetch<LinkPoll>(`/auth/link/${encodeURIComponent(code)}`, { auth: false })
}

/** Payload encoded in the QR the phone scans to approve this browser. */
export function linkCodePayload(code: string): string {
  return `edyma://link?code=${code}`
}
