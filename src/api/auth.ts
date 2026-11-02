import { request, setAccessToken, authedFetch, refreshAccessToken } from './client'

export interface ApiUser {
  id: string
  createdAt: string
}

export const signUp = (id: string, password: string) =>
  request<{ user: ApiUser }>('POST', '/api/auth/signup', { id, password })

export async function signIn(id: string, password: string) {
  const data = await request<{ accessToken: string; user: ApiUser }>('POST', '/api/auth/signin', { id, password })
  setAccessToken(data.accessToken)
  return data.user
}

export async function signOut() {
  try { await authedFetch('/api/auth/signout', 'POST') } finally { setAccessToken(null) }
}

// 새로고침 시 refresh 쿠키로 세션 복구
export async function restoreSession(): Promise<ApiUser | null> {
  if (!(await refreshAccessToken())) return null
  try { return (await request<{ user: ApiUser }>('GET', '/api/auth/me')).user } catch { return null }
}
