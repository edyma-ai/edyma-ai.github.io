// Minimal fetch client for the authenticated teacher area. Tokens live in
// localStorage, a 401 triggers one shared refresh, and the retried request is
// the only retry: anything still failing is surfaced to the caller.
import { API_BASE_URL } from '@/lib/config'

const ACCESS_TOKEN_KEY = 'edyma_site_access'
const REFRESH_TOKEN_KEY = 'edyma_site_refresh'

/** Paths whose 401 is a real answer (wrong password, dead code), not an expired session. */
const REFRESH_EXEMPT_PATHS = ['/auth/login', '/auth/refresh', '/auth/link']

export interface ApiFetchOptions {
  method?: string
  body?: unknown
  /** Send the bearer token and refresh on 401. Defaults to true. */
  auth?: boolean
  /** Let the request outlive the page (used to flush annotations on unload). */
  keepalive?: boolean
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function getAccessToken(): string | null {
  return readStored(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return readStored(REFRESH_TOKEN_KEY)
}

export function setTokens(access: string, refresh: string): void {
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access)
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  } catch {
    // Private-mode storage failures leave the session in memory only.
  }
}

export function clearTokens(): void {
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}

let authExpiredHandler: (() => void) | null = null

/** Called once the stored tokens are known to be dead, so the app can drop the user. */
export function setAuthExpiredHandler(handler: () => void): void {
  authExpiredHandler = handler
}

function endSession(): void {
  clearTokens()
  if (authExpiredHandler) authExpiredHandler()
}

/** True only for a definitive 401/403: a network error or a 5xx must not sign anyone out. */
export function isAuthRejection(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

/** Human-readable message for anything thrown by `apiFetch`. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) return 'Could not reach Edyma. Check your connection and try again.'
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong'
}

/** OS family for the session label the backend stores against this browser. */
function deviceOs(): string {
  const ua = navigator.userAgent
  if (/Windows NT/.test(ua)) return 'Windows'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/.test(ua)) return 'iOS'
  if (/CrOS/.test(ua)) return 'ChromeOS'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Linux/.test(ua)) return 'Linux'
  return 'Unknown'
}

/** Browser name, ordered so the impostor user agents (Edge, Opera, Chrome on iOS) win first. */
function deviceModel(): string {
  const ua = navigator.userAgent
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\//.test(ua)) return 'Opera'
  if (/SamsungBrowser/.test(ua)) return 'Samsung Internet'
  if (/CriOS/.test(ua)) return 'Chrome'
  if (/FxiOS|Firefox/.test(ua)) return 'Firefox'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Browser'
}

function isRefreshExempt(path: string): boolean {
  return REFRESH_EXEMPT_PATHS.some((exempt) => path.indexOf(exempt) === 0)
}

function sendRequest(path: string, options: ApiFetchOptions, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-App-Platform': 'web',
    'X-Device-Os': deviceOs(),
    'X-Device-Model': deviceModel(),
  }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  return fetch(`${API_BASE_URL}/api/v1${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    keepalive: options.keepalive,
  })
}

// The API answers an HTTPException as `{status: 'FAIL', errorData: {errorCode, message}}`
// (its exception middleware) and a validation failure as FastAPI's `{detail: [...]}`;
// a bare `{detail: '...'}` is kept for completeness.
async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as { detail?: unknown; errorData?: { message?: unknown } } | null
  const message = body?.errorData?.message
  if (typeof message === 'string' && message) return new ApiError(response.status, message)
  const detail = body?.detail
  if (typeof detail === 'string' && detail) return new ApiError(response.status, detail)
  if (Array.isArray(detail)) {
    const joined = detail
      .map((item) => (item as { msg?: string }).msg)
      .filter(Boolean)
      .join(', ')
    if (joined) return new ApiError(response.status, joined)
  }
  return new ApiError(response.status, `Request failed (${response.status})`)
}

// Parallel 401s share one refresh: the first racer fires it, the rest await it.
let refreshInFlight: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight

  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    endSession()
    return Promise.resolve(null)
  }

  refreshInFlight = sendRequest('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken }, auth: false }, null)
    .then(async (response) => {
      if (!response.ok) {
        // Only a rejected refresh token ends the session; a 5xx or a network
        // error leaves the tokens in place so a later request can retry.
        if (response.status === 401 || response.status === 403) endSession()
        return null
      }
      const tokens = (await response.json()) as { access_token: string; refresh_token: string }
      setTokens(tokens.access_token, tokens.refresh_token)
      return tokens.access_token
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

/** Call `${API_BASE_URL}/api/v1<path>` and decode the JSON body (204 resolves to undefined). */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const withAuth = options.auth !== false
  let response = await sendRequest(path, options, withAuth ? getAccessToken() : null)

  if (response.status === 401 && withAuth && !isRefreshExempt(path)) {
    const refreshed = await refreshAccessToken()
    if (refreshed) response = await sendRequest(path, options, refreshed)
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
