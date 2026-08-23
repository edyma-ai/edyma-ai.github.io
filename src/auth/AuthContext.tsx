import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from '@/auth/useAuth'
import {
  apiErrorMessage,
  clearTokens,
  getAccessToken,
  isAuthRejection,
  setAuthExpiredHandler,
  setTokens,
} from '@/lib/api'
import { fetchCurrentUser, login as requestLogin, logoutSession, type AuthUser, type TokenResponse } from '@/lib/auth'

const TEACHER_ONLY_MESSAGE = 'Only teachers can use the classroom board'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // Without a stored token there is nothing to restore, so the first paint is
  // the sign-in page rather than a spinner.
  const [loading, setLoading] = useState(() => getAccessToken() !== null)
  const [error, setError] = useState<string | null>(null)
  const [signOutReason, setSignOutReason] = useState<string | null>(null)

  const endSession = useCallback((reason: string | null) => {
    clearTokens()
    setUser(null)
    setError(null)
    setSignOutReason(reason)
    setLoading(false)
  }, [])

  const acceptUser = useCallback(
    (me: AuthUser) => {
      if (me.role !== 'teacher') {
        endSession(TEACHER_ONLY_MESSAGE)
        return
      }
      setUser(me)
      setError(null)
      setSignOutReason(null)
      setLoading(false)
    },
    [endSession],
  )

  const failRestore = useCallback(
    (err: unknown) => {
      // Only a definitive 401/403 destroys the session; a network error or a
      // 5xx keeps the tokens and surfaces a retryable error instead.
      if (isAuthRejection(err)) {
        endSession(null)
        return
      }
      setError(apiErrorMessage(err))
      setLoading(false)
    },
    [endSession],
  )

  const restoreSession = useCallback(async () => {
    if (!getAccessToken()) {
      endSession(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      acceptUser(await fetchCurrentUser())
    } catch (err) {
      failRestore(err)
    }
  }, [acceptUser, endSession, failRestore])

  useEffect(() => {
    setAuthExpiredHandler(() => endSession(null))
  }, [endSession])

  // Restore on mount. The state updates happen in the promise callbacks, so a
  // reload never cascades renders through the effect body.
  useEffect(() => {
    if (!getAccessToken()) return
    let cancelled = false
    fetchCurrentUser()
      .then((me) => {
        if (!cancelled) acceptUser(me)
      })
      .catch((err: unknown) => {
        if (!cancelled) failRestore(err)
      })
    return () => {
      cancelled = true
    }
  }, [acceptUser, failRestore])

  const adoptTokens = useCallback(
    (tokens: TokenResponse) => {
      if (tokens.user.role !== 'teacher') {
        endSession(TEACHER_ONLY_MESSAGE)
        throw new Error(TEACHER_ONLY_MESSAGE)
      }
      setTokens(tokens.access_token, tokens.refresh_token)
      acceptUser(tokens.user)
    },
    [acceptUser, endSession],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      let tokens: TokenResponse
      try {
        tokens = await requestLogin(email, password)
      } catch (err) {
        throw new Error(apiErrorMessage(err))
      }
      adoptTokens(tokens)
    },
    [adoptTokens],
  )

  const logout = useCallback(async () => {
    try {
      await logoutSession()
    } catch {
      // The server session may already be gone; the local tokens go either way.
    }
    endSession(null)
  }, [endSession])

  const value = useMemo(
    () => ({ user, loading, error, signOutReason, login, adoptTokens, logout, restoreSession }),
    [user, loading, error, signOutReason, login, adoptTokens, logout, restoreSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
