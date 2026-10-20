import { useState } from 'react'

const fmt = (n: number) => `$${n.toFixed(2)}`

export default function ResourceDashboard({ onAnalyze }: { onAnalyze: () => void }) {
  const [purpose, setPurpose] = useState('개인 블로그 서비스 운영')
  const [budgetInput, setBudgetInput] = useState('200')
  const [budget, setBudget] = useState(200)
  const total = 0

  return (
    <div className="c-wrap">
      <div className="c-head">
        <h1 className="c-title">리소스 대시보드</h1>
        <button type="button" className="c-btn ghost">리소스 추가</button>
      </div>
      <div className="c-banner">
        <b>예산 안정</b>
        <span>한도 {fmt(budget)} · 여유 {fmt(budget - total)}</span>
      </div>
      <div className="c-grid">
        <section className="c-card">
          <div className="c-row">
            <h2>리소스 목록</h2>
            <span className="c-sm">0 items</span>
          </div>
          <div className="c-row c-th">
            <span>리소스 · 유형 / 사양</span>
            <span>필요도 &nbsp;&nbsp; 월 예상 요금</span>
          </div>
          <div className="c-total">
            <b className="c-sm" style={{ fontSize: 14 }}>합계 (월 예상)</b>
            <span>
              <span className="c-figure">{fmt(total)}</span>
              <span className="c-ok">안정</span>
            </span>
          </div>
        </section>
        <div className="c-stack">
          <section className="c-card">
            <h2>사용 용도</h2>
            <textarea
              className="c-input"
              rows={4}
              style={{ marginTop: 24, resize: 'vertical' }}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </section>
          <section className="c-card">
            <h2>예산 한도</h2>
            <label className="c-label" htmlFor="budget" style={{ marginTop: 28 }}>월 예산 한도 (USD)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="budget" className="c-input" inputMode="decimal" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} />
              <button
                type="button"
                className="c-btn primary"
                onClick={() => {
                  const n = Number(budgetInput)
                  if (Number.isFinite(n) && n >= 0) setBudget(n)
                }}
              >
                적용
              </button>
            </div>
          </section>
        </div>
      </div>
      <div className="c-foot">
        <button type="button" className="c-btn primary" onClick={onAnalyze}>절감 분석 실행</button>
      </div>
    </div>
  )
}
