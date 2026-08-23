const DEFAULT_API_BASE_URL = 'https://api.edyma.in'

/** Backend origin, without a trailing slash. Override with VITE_API_BASE_URL. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API_BASE_URL
