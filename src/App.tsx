import { useState } from 'react'
import AuthPage from './pages/AuthPage'
import ResourceDashboard from './pages/ResourceDashboard'
import RecommendPage from './pages/RecommendPage'
import Nav, { type Tab } from './pages/Nav'

function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('dashboard')

  if (!userId) return <AuthPage onAuth={setUserId} />

  return (
    <div className={`c-page${tab === 'dashboard' ? ' dash' : ''}`}>
      <Nav tab={tab} onTab={setTab} userId={userId} onLogout={() => setUserId(null)} />
      {tab === 'dashboard' ? (
        <ResourceDashboard userId={userId} onAnalyze={() => setTab('recommend')} />
      ) : (
        <RecommendPage />
      )}
    </div>
  )
}

export default App
