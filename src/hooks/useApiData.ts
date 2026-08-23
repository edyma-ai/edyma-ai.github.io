import { useCallback, useEffect, useState } from 'react'
import { apiErrorMessage } from '@/lib/api'

export interface ApiData<T> {
  data: T | null
  loading: boolean
  error: string | null
  reload: () => void
}

interface Settled<T> {
  /** The loader (and retry count) this outcome belongs to. */
  source: () => Promise<T>
  attempt: number
  data: T | null
  error: string | null
}

/**
 * Loads one API resource into loading/error/data state, ignoring the outcome
 * of a superseded request. `load` must be memoised by the caller (useCallback)
 * so its identity is the dependency that triggers a refetch.
 *
 * The outcome carries the request it came from, so "loading" is derived rather
 * than set: a new loader or a retry is pending until its own result arrives.
 */
export function useApiData<T>(load: () => Promise<T>): ApiData<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    load()
      .then((data) => {
        if (!cancelled) setSettled({ source: load, attempt, data, error: null })
      })
      .catch((err: unknown) => {
        if (!cancelled) setSettled({ source: load, attempt, data: null, error: apiErrorMessage(err) })
      })
    return () => {
      cancelled = true
    }
  }, [load, attempt])

  const reload = useCallback(() => setAttempt((current) => current + 1), [])

  const current = settled && settled.source === load && settled.attempt === attempt ? settled : null

  return {
    data: current ? current.data : null,
    loading: current === null,
    error: current ? current.error : null,
    reload,
  }
}
