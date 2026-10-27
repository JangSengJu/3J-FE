import { useState } from 'react'
import AddResourceModal from './AddResourceModal'
import { MAX_RESOURCES, type Budget, type Resource } from '../data/catalog'

const fmt = (n: number) => `$${n.toFixed(2)}`
const round2 = (n: number) => Math.round(n * 100) / 100

interface Props {
  userId: string
  budget: Budget
  onChange: (patch: Partial<Budget>) => void
  onAnalyze: () => void
}

function SummaryCard({ total, limit, count }: { total: number; limit: number; count: number }) {
  const over = total > limit
  const left = limit - total
  return (
    <section className={`d-card d-hero${over ? ' over' : ''}`}>
      <div className="d-cardhead">
        <div>
          <h2>월 예상 요금</h2>
          <p>Monthly estimate · {count} resources</p>
        </div>
        <span className="d-badge light">{over ? '위험' : '안정'}</span>
      </div>
      <strong className="d-big">{fmt(total)}</strong>
      <div className="d-foot">
        <span>한도 {fmt(limit)}</span>
        <span>{over ? `초과 ${fmt(-left)}` : `여유 ${fmt(left)}`}</span>
      </div>
    </section>
  )
}

function BudgetCard({ limit, total, onApply }: { limit: number; total: number; onApply: (n: number) => void }) {
  const [budgetInput, setBudgetInput] = useState(String(limit))
  const over = total > limit
  const used = limit > 0 ? Math.min(100, (total / limit) * 100) : 0

  const apply = () => {
    const n = Number(budgetInput)
    if (Number.isFinite(n) && n > 0) onApply(n)
    else setBudgetInput(String(limit))
  }

  return (
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
        <button type="button" className="d-pill solid" onClick={apply}>
          적용
        </button>
      </div>
      <div className="d-meter" aria-label={`예산 사용률 ${used.toFixed(0)}%`}>
        <i className={over ? 'over' : undefined} style={{ width: `${used}%` }} />
      </div>
      <p className="d-note">예산의 {used.toFixed(0)}% 사용 중</p>
    </section>
  )
}

interface TableProps {
  resources: Resource[]
  notes: Budget['notes']
  total: number
  onNote: (name: string, value: string) => void
  onRemove: (r: Resource) => void
}

function ResourceTable({ resources, notes, total, onNote, onRemove }: TableProps) {
  return (
    <section className="d-card d-wide">
      <div className="d-cardhead">
        <div>
          <h2>리소스 목록</h2>
          <p>{resources.length} items</p>
        </div>
      </div>
      <div className="d-scroll">
        <table className="d-table">
          <thead>
            <tr>
              <th>리소스</th>
              <th>유형 / 사양</th>
              <th>필요도</th>
              <th>AI 노트</th>
              <th>월 예상 요금</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr className="empty">
                <td colSpan={6}>등록된 리소스가 없어요. 리소스를 추가해 보세요.</td>
              </tr>
            ) : (
              resources.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.name}</b></td>
                  <td>{r.meta}<br /><span className="d-note">사용률 {r.usage}</span></td>
                  <td>{r.need}</td>
                  <td>
                    <input
                      className="d-input d-notein"
                      maxLength={500}
                      placeholder="분석용 코멘트"
                      value={notes[r.name] ?? ''}
                      onChange={(e) => onNote(r.name, e.target.value)}
                    />
                  </td>
                  <td>{fmt(r.cost)}</td>
                  <td>
                    <button type="button" className="d-link" onClick={() => onRemove(r)}>삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="d-sum">
        <span>합계 (월 예상)</span>
        <b>{fmt(total)}</b>
      </div>
    </section>
  )
}

export default function ResourceDashboard({ userId, budget, onChange, onAnalyze }: Props) {
  const { resources, limit, notes, purpose } = budget
  const [adding, setAdding] = useState(false)

  const total = round2(resources.reduce((s, r) => s + r.cost, 0))
  const over = total > limit

  const add = (r: Resource) => {
    onChange({ resources: [...resources, r] })
    setAdding(false)
  }
  const remove = (r: Resource) => {
    const { [r.name]: _drop, ...rest } = notes
    onChange({ resources: resources.filter((x) => x.id !== r.id), notes: rest })
  }
  const setNote = (name: string, value: string) => onChange({ notes: { ...notes, [name]: value } })

  return (
    <div className="d-wrap">
      <header className="d-head">
        <h1>
          Welcome back, <span>{userId}</span>
        </h1>
        <button
          type="button"
          className="d-pill"
          disabled={resources.length >= MAX_RESOURCES}
          onClick={() => setAdding(true)}
        >
          <b>+</b> 리소스 추가
        </button>
      </header>

      {over && (
        <div className="d-alert" role="alert">
          <b>예산 초과</b>
          <span>월 예상 요금이 한도를 {fmt(total - limit)} 초과했어요.</span>
          <button type="button" className="d-pill solid" onClick={onAnalyze}>절감 추천 확인</button>
        </div>
      )}

      <div className="d-grid">
        <SummaryCard total={total} limit={limit} count={resources.length} />
        <BudgetCard limit={limit} total={total} onApply={(n) => onChange({ limit: n })} />

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
            maxLength={1000}
            placeholder="예: 개인 블로그 서비스 운영"
            value={purpose}
            onChange={(e) => onChange({ purpose: e.target.value })}
          />
        </section>

        <ResourceTable resources={resources} notes={notes} total={total} onNote={setNote} onRemove={remove} />

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

      {adding && (
        <AddResourceModal
          takenNames={resources.map((r) => r.name)}
          onAdd={add}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  )
}