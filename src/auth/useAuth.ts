// The auth context lives here rather than next to the provider so that
// `AuthContext.tsx` exports a component only and Fast Refresh keeps working.
import { createContext, useContext } from 'react'
import type { AuthUser, TokenResponse } from '@/lib/auth'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** Set when a session restore failed without invalidating the tokens: offer a retry. */
  error: string | null
  /** Why the last session ended, shown on the sign-in page (wrong role, revoked session). */
  signOutReason: string | null
  login: (email: string, password: string) => Promise<void>
  /** Adopts the token pair handed over by the phone after a QR link approval. */
  adoptTokens: (tokens: TokenResponse) => void
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
