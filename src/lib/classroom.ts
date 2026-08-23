// Classroom Board data: the teacher's classes and subjects, master curriculum
// chapters with their sims and videos, shared TLM study guides, and the
// per-teacher annotations drawn over a guide.
import { apiFetch } from '@/lib/api'
import type { Stroke } from '@/lib/boards'
import type { TlmSection } from '@/lib/presentations'

export interface ClassroomSection {
  id: string
  label: string
  academic_year_id: string
}

export interface ClassroomSubject {
  id: string
  name: string
  code?: string | null
  order: number
}

export interface ClassroomClass {
  class_id: string
  class_name: string
  sections: ClassroomSection[]
  subjects: ClassroomSubject[]
}

export interface ChapterListItem {
  id: string
  subject_id: string
  name: string
  description?: string | null
  order: number
  condensed_notes_md?: string | null
  cheat_sheet_md?: string | null
}

/** A self-contained HTML sim, referenced from chapter markdown as `![](interactive://<id>)`. */
export interface InteractiveElementSummary {
  id: string
  title: string
  description?: string | null
  aspect_ratio: number
  order: number
}

export interface InteractiveElement {
  id: string
  chapter_id: string
  title: string
  html: string
  aspect_ratio: number
}

/** `s3` sources carry a bare object key; `youtube` sources carry a watch URL. */
export interface ChapterVideo {
  id: string
  title: string
  source: 's3' | 'youtube' | string
  url_or_key: string
  topic_id?: string | null
  duration_sec?: number | null
  thumbnail_key?: string | null
  order: number
}

export interface Chapter extends ChapterListItem {
  markdown_content?: string | null
  interactive_elements?: InteractiveElementSummary[] | null
  videos?: ChapterVideo[] | null
}

export interface StudyGuide {
  tlm_id: string
  title: string
  sections: TlmSection[]
  shared_at: number
}

export interface Annotations {
  tlm_id: string
  strokes: Stroke[]
  updated_at: number | null
}

export function fetchTeacherClassroom(): Promise<ClassroomClass[]> {
  return apiFetch<ClassroomClass[]>('/teacher/classroom')
}

export function fetchChapters(subjectId: string): Promise<ChapterListItem[]> {
  return apiFetch<ChapterListItem[]>(`/curriculum/subjects/${encodeURIComponent(subjectId)}/chapters`)
}

export function fetchChapter(chapterId: string): Promise<Chapter> {
  return apiFetch<Chapter>(`/curriculum/chapters/${encodeURIComponent(chapterId)}`)
}

export function fetchInteractiveElement(elementId: string): Promise<InteractiveElement> {
  return apiFetch<InteractiveElement>(`/curriculum/interactive/${encodeURIComponent(elementId)}`)
}

/** Empty for a plan without the TLM feature, so an empty list is a normal answer. */
export function fetchStudyGuides(chapterId: string): Promise<StudyGuide[]> {
  return apiFetch<StudyGuide[]>(`/tlm-modules/chapter/${encodeURIComponent(chapterId)}/study-guides`)
}

export function fetchAnnotations(tlmId: string): Promise<Annotations> {
  return apiFetch<Annotations>(`/tlm-modules/${encodeURIComponent(tlmId)}/annotations`)
}

export function saveAnnotations(tlmId: string, strokes: Stroke[], options: { keepalive?: boolean } = {}): Promise<Annotations> {
  return apiFetch<Annotations>(`/tlm-modules/${encodeURIComponent(tlmId)}/annotations`, {
    method: 'PUT',
    body: { strokes },
    keepalive: options.keepalive,
  })
}

/**
 * Privacy-preserving embed URL for a YouTube video, or null when no id can be
 * read out of the stored URL (the caller then offers a plain link).
 */
export function youtubeEmbedUrl(urlOrId: string): string | null {
  const fromUrl = /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/.exec(urlOrId)
  const id = fromUrl ? fromUrl[1] : /^[A-Za-z0-9_-]{11}$/.test(urlOrId.trim()) ? urlOrId.trim() : null
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
}

/** "8:05" / "1:02:30" for a video length, or null when the duration is unknown. */
export function formatDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const padded = (value: number) => (value < 10 ? `0${value}` : String(value))
  return hours > 0 ? `${hours}:${padded(minutes)}:${padded(secs)}` : `${minutes}:${padded(secs)}`
}
