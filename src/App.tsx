import { useCallback, useEffect, useRef, useState } from 'react'
import AuthPage from './pages/AuthPage'
import ResourceDashboard from './pages/ResourceDashboard'
import RecommendPage from './pages/RecommendPage'
import Nav, { type Tab } from './pages/Nav'
import { emptyBudget, type Budget } from './data/catalog'
import { restoreSession, signOut } from './api/auth'
import { fetchBudget, saveBudget } from './api/budget'
import { setUnauthorizedHandler } from './api/client'

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [budget, setBudget] = useState<Budget>(emptyBudget)
  const [saveError, setSaveError] = useState(false)
  // 서버에서 예산을 불러온 뒤에만 저장해, 빈 상태로 덮어쓰는 일을 막는다
  const loaded = useRef(false)

  const enter = useCallback(async (id: string) => {
    loaded.current = false
    try { setBudget(await fetchBudget()); loaded.current = true } catch { setBudget(emptyBudget()) }
    setUserId(id)
  }, [])

  const leave = useCallback(() => {
    loaded.current = false
    setUserId(null)
    setBudget(emptyBudget())
    setTab('dashboard')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(leave)
    restoreSession()
      .then((user) => (user ? enter(user.id) : undefined))
      .finally(() => setBooting(false))
    return () => setUnauthorizedHandler(null)
  }, [enter, leave])

  // 서버 자동 저장 (400ms 디바운스)
  useEffect(() => {
    if (!userId || !loaded.current) return
    const t = setTimeout(() => {
      saveBudget(budget).then(() => setSaveError(false), () => setSaveError(true))
    }, 400)
    return () => clearTimeout(t)
  }, [userId, budget])

  const logout = async () => {
    await signOut().catch(() => undefined)
    leave()
  }

  if (booting) return null
  if (!userId) return <AuthPage onAuth={enter} />

  return (
    <div className="c-page dash">
      <Nav tab={tab} onTab={setTab} userId={userId} onLogout={logout} />
      {saveError && <div className="d-alert" role="alert"><b>저장 실패</b><span>변경 사항을 서버에 저장하지 못했어요. 잠시 후 다시 시도됩니다.</span></div>}
      {tab === 'dashboard' ? (
        <ResourceDashboard
          userId={userId}
          budget={budget}
          onChange={(patch) => setBudget((b) => ({ ...b, ...patch }))}
          onAnalyze={() => setTab('recommend')}
        />
      ) : (
        <RecommendPage budget={budget} />
      )}
    </div>
  )
}

export default App
