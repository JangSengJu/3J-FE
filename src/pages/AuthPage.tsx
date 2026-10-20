import { useState, type FormEvent } from 'react'

interface Props {
  onAuth: (email: string) => void
}

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

export default function AuthPage({ onAuth }: Props) {
  const [signUp, setSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const label = signUp ? '회원가입' : '로그인'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onAuth(email)
  }

  return (
    <div className="c-split">
      <Intro />
      <div className="c-side">
      <div className="c-authcard">
        <form onSubmit={submit}>
          <div>
            <label className="c-label" htmlFor="email">이메일</label>
            <input id="email" className="c-input" type="email" placeholder="이메일을 입력하세요" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="c-label" htmlFor="password">비밀번호</label>
            <input id="password" className="c-input" type="password" placeholder="비밀번호를 입력하세요" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {!signUp && (
            <div className="c-authrow">
              <label className="c-check">
                <input type="checkbox" /> 30일 동안 로그인 유지
              </label>
              <button type="button" className="c-link">비밀번호 찾기</button>
            </div>
          )}
          <button type="submit" className="c-btn primary">{label}</button>
        </form>
        <p className="c-switch">
          {signUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="c-link" onClick={() => setSignUp(!signUp)}>
            {signUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
      </div>
    </div>
  )
}
