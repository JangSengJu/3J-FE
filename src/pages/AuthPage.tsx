import { useState, type FormEvent, type ReactNode } from 'react'

interface Props {
  onAuth: (userId: string) => void
}

const ID_MIN = 4
const ID_MAX = 120
const PW_MIN = 8
const PW_MAX = 200 

function Intro() {
  return (
    <div className="c-art c-intro">
      <svg viewBox="0 0 640 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M0 800V480A320 320 0 0 1 320 800Z" fill="#000" fillOpacity=".16" />
        <path d="M640 0H320A320 320 0 0 0 640 320Z" fill="#fff" fillOpacity=".07" />
        <path d="M0 0H160L0 160Z" fill="#fff" fillOpacity=".09" />
        <rect x="320" y="320" width="160" height="160" fill="#fff" fillOpacity=".08" />
        <path d="M480 480H640V640Z" fill="#000" fillOpacity=".14" />
        <circle cx="560" cy="720" r="64" fill="#fff" fillOpacity=".1" />
        <circle cx="120" cy="560" r="56" fill="#fff" fillOpacity=".1" />
        <circle cx="400" cy="160" r="40" fill="#000" fillOpacity=".14" />
        <rect x="160" y="160" width="160" height="160" fill="#000" fillOpacity=".1" />
      </svg>
      <b className="c-brand">Costly</b>
      <div>
        <h2>클라우드 비용,<br />한눈에 보고 똑똑하게 줄이세요</h2>
        <p>AWS 리소스의 월 예상 요금을 한곳에서 확인하고, AI 절감 분석으로 예산 안에서 안정적으로 운영하세요.</p>
      </div>
    </div>
  )
}

function FormField({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label className="c-label" htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}

export default function AuthPage({ onAuth }: Props) {
  const [signUp, setSignUp] = useState(false)
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const label = signUp ? '회원가입' : '로그인'

  const toggleMode = () => {
    setSignUp(!signUp)
    setError('')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const id = userId.trim().toLowerCase()
    if (id.length < ID_MIN || id.length > ID_MAX) return setError(`아이디는 ${ID_MIN}~${ID_MAX}자로 입력하세요`)
    if (password.length < PW_MIN || password.length > PW_MAX) return setError(`비밀번호는 ${PW_MIN}~${PW_MAX}자로 입력하세요`)
    setError('')
    // 회원가입 성공 시 로그인 화면으로 이동 (백엔드 연동 전까지 로컬 처리)
    if (signUp) {
      setSignUp(false)
      setPassword('')
      return
    }
    onAuth(id)
  }

  return (
    <div className="c-split">
      <Intro />
      <div className="c-side">
        <div className="c-authcard">
          <h1 className="c-welcome">{signUp ? 'Create an account' : 'Welcome back'}</h1>
          <form onSubmit={submit}>
            <FormField id="userId" label="아이디">
              <input
                id="userId"
                className="c-input"
                type="text"
                autoComplete="username"
                placeholder="아이디를 입력하세요"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </FormField>
            <FormField id="password" label="비밀번호">
              <input
                id="password"
                className="c-input"
                type="password"
                placeholder="비밀번호를 입력하세요"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            {!signUp && (
              <div className="c-authrow">
                <label className="c-check">
                  <input type="checkbox" /> 30일 동안 로그인 유지
                </label>
                <button type="button" className="c-link">비밀번호 찾기</button>
              </div>
            )}
            {error && <p className="c-error" role="alert">{error}</p>}
            <button type="submit" className="c-btn primary">{label}</button>
          </form>
          <p className="c-switch">
            {signUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" className="c-link" onClick={toggleMode}>
              {signUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}