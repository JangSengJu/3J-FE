import { authedFetch, request } from './client'
import type { Budget } from '../data/catalog'
import type { Recommendation } from '../data/recommend'

const toInput = (b: Budget) => ({
  limit: b.limit,
  total: Math.round(b.resources.reduce((s, r) => s + r.cost, 0) * 100) / 100,
  purpose: b.purpose,
  resources: b.resources.map(({ id, name, type, cost, usage, need, meta }) => ({
    id, name, type, cost, usage, need, meta, note: b.notes[name] ?? '',
  })),
})

export async function fetchRecommendations(b: Budget): Promise<{ recommendations: Recommendation[]; fallback: boolean }> {
  const data = await request<{ recommendations?: Recommendation[]; fallback?: boolean }>(
    'POST', '/api/ai/recommend', { input: toInput(b) },
  )
  return { recommendations: data.recommendations ?? [], fallback: Boolean(data.fallback) }
}

// 청크는 {"delta":"..."} JSON, 아니면 원문 그대로
const chunkText = (data: string) => {
  try {
    const v: unknown = JSON.parse(data)
    if (v && typeof v === 'object' && 'delta' in v && typeof v.delta === 'string') return v.delta
  } catch { /* 일반 텍스트 */ }
  return data
}

// SSE(text/event-stream) 보고서를 청크 단위로 받아 onText 에 누적 텍스트를 전달
export async function streamReport(b: Budget, recs: Recommendation[], onText: (text: string) => void): Promise<void> {
  const res = await authedFetch('/api/ai/report', 'POST', { input: toInput(b), recommendations: recs })
  if (!res.ok || !res.body) throw new Error(`보고서 생성에 실패했어요 (${res.status})`)

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += value
    const events = buf.split(/\r?\n\r?\n/)
    buf = events.pop() ?? ''
    for (const ev of events) {
      const data = ev.split(/\r?\n/).filter((l) => l.startsWith('data:')).map((l) => l.slice(5).replace(/^ /, '')).join('\n')
      if (!data || data === '[DONE]') continue
      text += chunkText(data)
      onText(text)
    }
  }
}
