export type Tab = 'dashboard' | 'recommend'

interface Props {
  tab: Tab
  onTab: (tab: Tab) => void
  email: string
  onLogout: () => void
}

export default function Nav({ tab, onTab, email, onLogout }: Props) {
  return (
    <nav className="c-nav">
      <div className="c-tabs">
        <button type="button" className={`c-tab${tab === 'dashboard' ? ' on' : ''}`} onClick={() => onTab('dashboard')}>
          대시보드
        </button>
        <button type="button" className={`c-tab${tab === 'recommend' ? ' on' : ''}`} onClick={() => onTab('recommend')}>
          절감 추천
        </button>
      </div>
      <div className="c-user">
        <span>{email}</span>
        <button type="button" className="c-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </nav>
  )
}
