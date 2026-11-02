// 공통 fetch 클라이언트: Bearer 액세스 토큰, 401 시 refresh 쿠키로 1회 재발급 후 재시도
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

interface Envelope<T> {
  success: boolean
  data?: T
  error?: unknown
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null
let refreshing: Promise<boolean> | null = null

export const setAccessToken = (t: string | null) => { accessToken = t }
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn }

const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message
  return fallback
}

const headers = (json: boolean): HeadersInit => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
})

const send = (path: string, method: string, body?: unknown) =>
  fetch(`${BASE}${path}`, {
    method,
    headers: headers(body !== undefined),
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

// 동시에 여러 요청이 401 이어도 refresh 는 한 번만 수행
export function refreshAccessToken(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (res) => {
      if (!res.ok) return false
      const json = (await res.json()) as Envelope<{ accessToken: string }>
      accessToken = json.data?.accessToken ?? null
      return Boolean(accessToken)
    })
    .catch(() => false)
    .finally(() => { refreshing = null })
  return refreshing
}

// 401 이면 refresh 후 재시도, 그래도 실패하면 로그아웃 처리
export async function authedFetch(path: string, method: string, body?: unknown): Promise<Response> {
  let res = await send(path, method, body)
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    if (await refreshAccessToken()) res = await send(path, method, body)
    else {
      accessToken = null
      onUnauthorized?.()
    }
  }
  return res
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await authedFetch(path, method, body)
  let json: Envelope<T> | null = null
  try { json = (await res.json()) as Envelope<T> } catch { /* 본문 없음 */ }
  if (!res.ok || !json?.success) {
    throw new ApiError(errorMessage(json?.error, `요청에 실패했어요 (${res.status})`), res.status)
  }
  return json.data as T
}
