// Curriculum media lives in a private bucket, so every key is exchanged for a
// presigned URL (valid 1 hour). Resolutions are memoised per key for the life
// of the page; pass `refresh` when an expired URL needs replacing.
import { apiFetch } from '@/lib/api'

const presignedUrls = new Map<string, string>()

export async function resolveS3Url(key: string, options: { refresh?: boolean } = {}): Promise<string> {
  if (!options.refresh) {
    const cached = presignedUrls.get(key)
    if (cached) return cached
  }
  const response = await apiFetch<{ download_url: string }>(`/files/download-url?key=${encodeURIComponent(key)}`)
  presignedUrls.set(key, response.download_url)
  return response.download_url
}
