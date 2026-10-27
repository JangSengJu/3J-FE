import { useState } from 'react'
import { KIND_LABEL, buildRecommendations, type Recommendation } from '../data/recommend'
import type { Budget } from '../data/catalog'

const fmt = (n: number) => `$${Math.abs(n).toFixed(2)}`
const signed = (n: number) => (n < 0 ? `-${fmt(n)}` : fmt(n))
const round2 = (n: number) => Math.round(n * 100) / 100
const targetLabel = (r: Recommendation) => r.target || '전체 리소스'

const foot = (s: number) =>
  s > 0 ? { label: '예상 월 절감', amount: signed(s), warn: false }
    : s < 0 ? { label: '예상 추가 비용', amount: signed(s), warn: true }
      : { label: '비용 변동', amount: '±0', warn: false }

interface Totals {
  total: number
  saving: number
  rest: number
}

function SummaryCards({ recs, limit, total, saving, rest }: Totals & { recs: Recommendation[]; limit: number }) {
  const invest = recs.filter((r) => r.savings < 0).length
  return (
    <div className="d-grid">
      <section className="d-card">
        <div className="d-cardhead"><div><h2>후보 발견</h2><p>Candidates</p></div></div>
        <div className="d-big">{recs.length}건</div>
        <p className="d-note">{invest}건 투자형 제안</p>
      </section>
      <section className="d-card">
        <div className="d-cardhead"><div><h2>현재 비용</h2><p>Current cost</p></div></div>
        <div className="d-big">{fmt(total)}</div>
        <p className="d-note">예산 한도 {fmt(limit)}</p>
      </section>
      <section className="d-card d-hero">
        <div className="d-cardhead"><div><h2>예상 절감</h2><p>Estimated savings</p></div></div>
        <div className="d-big">{signed(saving)}</div>
        <div className="d-foot"><span>절감 합산 · 전부 적용 시 {fmt(rest)}</span></div>
      </section>
    </div>
  )
}

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const f = foot(rec.savings)
  return (
    <article className="d-card d-rec">
      <div className="d-cardhead">
        <div>
          <h2>{rec.title}</h2>
          <p>{String(index + 1).padStart(2, '0')} · {targetLabel(rec)}</p>
        </div>
        <span className={`d-badge${rec.kind === 'cost' ? ' solid' : ''}`}>{KIND_LABEL[rec.kind]}</span>
      </div>
      <ul className="d-list">{rec.grounds.map((g) => <li key={g}>{g}</li>)}</ul>
      <div className="d-sum">
        <span>{f.label}</span>
        <b className={f.warn ? 'warn' : undefined}>{f.amount}</b>
      </div>
    </article>
  )
}

function Report({ budget, recs, total, saving, rest }: Totals & { budget: Budget; recs: Recommendation[] }) {
  const { resources, limit, purpose, notes } = budget
  return (
    <section className="d-card c-report d-report">
      <header><span>AI 보고서</span></header>
      <h1>클라우드 아키텍처 개선 보고서</h1>

      <h2>1. 요약</h2>
      <p>
        월 예산 한도({fmt(limit)}) 대비 현재 예상 비용은 {fmt(total)}로
        {total > limit ? ` ${fmt(total - limit)} 초과` : ' 예산 범위 내'}입니다.
        {purpose ? ` 사용 용도는 "${purpose}"입니다.` : ''}
        {' '}절감 제안을 모두 적용하면 월 최대 <b>{signed(saving)}</b> 절감되어 예상 비용이 <b>{fmt(rest)}</b> 수준이 됩니다.
      </p>

      <h2>2. 비용·아키텍처 현황</h2>
      <ul>
        <li><p><b>월 예산 한도</b>: {fmt(limit)}</p></li>
        <li><p><b>현재 예상 비용</b>: {fmt(total)}</p></li>
        {resources.map((r) => (
          <li key={r.id}>
            <p><b>{r.name}</b>: {r.meta} · 사용률 {r.usage} · {r.need} · {fmt(r.cost)}{notes[r.name] ? ` (노트: ${notes[r.name]})` : ''}</p>
          </li>
        ))}
      </ul>

      <h2>3. 개선 제안</h2>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>제안내용</th><th>유형</th><th>대상 리소스</th><th>비용 영향 USD</th></tr></thead>
          <tbody>
            {recs.map((r) => (
              <tr key={`${r.target}-${r.action}-${r.title}`}>
                <td>{r.title}</td><td>{KIND_LABEL[r.kind]}</td><td>{targetLabel(r)}</td><td>{signed(r.savings)}</td>
              </tr>
            ))}
            {recs.length === 0 && <tr><td colSpan={4}>제안 없음</td></tr>}
          </tbody>
        </table>
      </div>

      <h2>4. 세부 검토</h2>
      {recs.map((r, i) => (
        <div key={`${r.target}-${r.title}-d`}>
          <h4>{i + 1}) [{KIND_LABEL[r.kind]}] {r.title}</h4>
          {r.grounds.map((g) => <p className="d" key={g}><b>근거</b>: {g}</p>)}
        </div>
      ))}

      <h2>5. 실행 계획</h2>
      <ol>{recs.map((r) => <li key={`${r.title}-p`}>{r.title}</li>)}</ol>

      <h2>6. 결론</h2>
      <p>절감 제안을 모두 적용하면 월 최대 <b>{signed(saving)}</b> 절감되어, 예상 비용이 <b>{fmt(rest)}</b> 수준으로 낮아집니다.</p>
      <div className="pdf"><button type="button" className="d-pill solid" onClick={() => window.print()}>PDF 내보내기</button></div>
    </section>
  )
}

export default function RecommendPage({ budget }: { budget: Budget }) {
  const { resources, limit } = budget
  const [recs, setRecs] = useState<Recommendation[] | null>(null)

  const total = round2(resources.reduce((s, r) => s + r.cost, 0))
  const saving = recs ? recs.reduce((s, r) => s + r.savings, 0) : 0
  const rest = Math.max(0, round2(total - saving))

  const run = () => setRecs(buildRecommendations(resources))

  return (
    <div className="d-wrap">
      <div className="d-head">
        <h1>절감 추천 <span>Savings</span></h1>
        <div className="d-inline">
          {recs && <span className="d-pill">· 완료 ({recs.length}건)</span>}
          <button type="button" className="d-pill solid" onClick={run} disabled={resources.length === 0}>
            AI 분석 실행
          </button>
        </div>
      </div>

      {resources.length === 0 && (
        <section className="d-card"><p className="d-desc">등록된 리소스가 없어요. 대시보드에서 리소스를 추가한 뒤 분석을 실행해 보세요.</p></section>
      )}

      {resources.length > 0 && !recs && (
        <section className="d-card"><p className="d-desc">‘AI 분석 실행’을 누르면 등록한 {resources.length}개 리소스의 절감 후보를 찾아드려요.</p></section>
      )}

      {recs && (
        <>
          <p className="d-note d-fallback">AI 연동 전이라 규칙 기반 폴백 결과로 표시하고 있어요.</p>
          <SummaryCards recs={recs} limit={limit} total={total} saving={saving} rest={rest} />

          {recs.length === 0 ? (
            <section className="d-card" style={{ marginTop: 20 }}>
              <p className="d-desc">현재 구성에서는 규칙 기반으로 찾은 절감 후보가 없어요.</p>
            </section>
          ) : (
            <div className="d-grid d-recs">
              {recs.map((r, i) => (
                <RecommendationCard key={`${r.target}-${r.action}-${i}`} rec={r} index={i} />
              ))}
            </div>
          )}

          <Report budget={budget} recs={recs} total={total} saving={saving} rest={rest} />
        </>
      )}
    </div>
  )
}