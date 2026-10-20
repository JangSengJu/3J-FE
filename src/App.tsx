import { useState } from 'react'
import AuthPage from './pages/AuthPage'
import ResourceDashboard from './pages/ResourceDashboard'
import RecommendPage from './pages/RecommendPage'
import Nav, { type Tab } from './pages/Nav'

function App() {
  const [email, setEmail] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('dashboard')

  if (!email) return <AuthPage onAuth={setEmail} />

  return (
    <div className="c-page">
      <Nav tab={tab} onTab={setTab} email={email} onLogout={() => setEmail(null)} />
      {tab === 'dashboard' ? (
        <ResourceDashboard onAnalyze={() => setTab('recommend')} />
      ) : (
        <RecommendPage />
      )}
    </div>
  )
}

export default App
