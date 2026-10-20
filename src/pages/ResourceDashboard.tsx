import { useState } from 'react'

const fmt = (n: number) => `$${n.toFixed(2)}`

interface Props {
  userId: string
  onAnalyze: () => void
}

export default function ResourceDashboard({ userId, onAnalyze }: Props) {
  const [purpose, setPurpose] = useState('개인 블로그 서비스 운영')
  const [budgetInput, setBudgetInput] = useState('200')
  const [budget, setBudget] = useState(200)
  const total = 0
  const left = budget - total
  const used = budget > 0 ? Math.min(100, (total / budget) * 100) : 0

  return (
    <div className="d-wrap">
      <header className="d-head">
        <h1>
          Welcome back, <span>{userId}</span>
        </h1>
        <button type="button" className="d-pill">
          <b>+</b> 리소스 추가
        </button>
      </header>

      <div className="d-grid">
        <section className="d-card d-hero">
          <div className="d-cardhead">
            <div>
              <h2>월 예상 요금</h2>
              <p>Monthly estimate</p>
            </div>
            <span className="d-badge light">안정</span>
          </div>
          <strong className="d-big">{fmt(total)}</strong>
          <div className="d-foot">
            <span>한도 {fmt(budget)}</span>
            <span>여유 {fmt(left)}</span>
          </div>
        </section>

        <section className="d-card">
          <div className="d-cardhead">
            <div>
              <h2>예산 한도</h2>
              <p>월 예산 한도 (USD)</p>
            </div>
          </div>
          <div className="d-inline">
            <input
              id="budget"
              className="d-input"
              inputMode="decimal"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            />
            <button
              type="button"
              className="d-pill solid"
              onClick={() => {
                const n = Number(budgetInput)
                if (Number.isFinite(n) && n >= 0) setBudget(n)
              }}
            >
              적용
            </button>
          </div>
          <div className="d-meter" aria-label={`예산 사용률 ${used.toFixed(0)}%`}>
            <i style={{ width: `${used}%` }} />
          </div>
          <p className="d-note">예산의 {used.toFixed(0)}% 사용 중</p>
        </section>

        <section className="d-card">
          <div className="d-cardhead">
            <div>
              <h2>사용 용도</h2>
              <p>Purpose</p>
            </div>
          </div>
          <textarea
            className="d-input d-area"
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </section>

        <section className="d-card d-wide">
          <div className="d-cardhead">
            <div>
              <h2>리소스 목록</h2>
              <p>0 items</p>
            </div>
          </div>
          <table className="d-table">
            <thead>
              <tr>
                <th>리소스</th>
                <th>유형 / 사양</th>
                <th>필요도</th>
                <th>월 예상 요금</th>
              </tr>
            </thead>
            <tbody>
              <tr className="empty">
                <td colSpan={4}>등록된 리소스가 없어요. 리소스를 추가해 보세요.</td>
              </tr>
            </tbody>
          </table>
          <div className="d-sum">
            <span>합계 (월 예상)</span>
            <b>{fmt(total)}</b>
          </div>
        </section>

        <section className="d-card d-cta">
          <div className="d-cardhead">
            <div>
              <h2>절감 분석</h2>
              <p>AI cost savings</p>
            </div>
          </div>
          <p className="d-desc">현재 리소스 구성을 분석해 예산 안에서 줄일 수 있는 비용을 찾아드려요.</p>
          <button type="button" className="d-pill solid full" onClick={onAnalyze}>
            절감 분석 실행
          </button>
        </section>
      </div>
    </div>
  )
}
