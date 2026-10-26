import { useEffect, useState } from 'react'
import AuthPage from './pages/AuthPage'
import ResourceDashboard from './pages/ResourceDashboard'
import RecommendPage from './pages/RecommendPage'
import Nav, { type Tab } from './pages/Nav'
import { emptyBudget, type Budget } from './data/catalog'

const key = (id: string) => `3j:budget:${id}`

const load = (id: string): Budget => {
  try {
    const raw = localStorage.getItem(key(id))
    if (raw) return { ...emptyBudget(), ...JSON.parse(raw) }
  } catch { /* 저장소 사용 불가 시 빈 예산으로 시작 */ }
  return emptyBudget()
}

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [budget, setBudget] = useState<Budget>(emptyBudget)

  // 사용자별 자동 저장 (400ms 디바운스)
  useEffect(() => {
    if (!userId) return
    const t = setTimeout(() => {
      try { localStorage.setItem(key(userId), JSON.stringify(budget)) } catch { /* ignore */ }
    }, 400)
    return () => clearTimeout(t)
  }, [userId, budget])

  const login = (id: string) => {
    setBudget(load(id))
    setUserId(id)
  }

  if (!userId) return <AuthPage onAuth={login} />

  return (
    <div className="c-page dash">
      <Nav tab={tab} onTab={setTab} userId={userId} onLogout={() => setUserId(null)} />
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
