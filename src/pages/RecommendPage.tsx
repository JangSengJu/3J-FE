import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { KIND_LABEL, buildRecommendations, type Recommendation } from '../data/recommend'
import type { Budget } from '../data/catalog'
import { fetchRecommendations, streamReport } from '../api/ai'

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

function AiReport({ text, loading, error }: { text: string; loading: boolean; error: boolean }) {
  if (!text && !loading && !error) return null
  return (
    <section className="d-card c-report d-report">
      <header><span>AI 보고서</span></header>
      {error && !text && <p className="d-desc">AI 보고서를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
      {text && <div style={{ overflowX: 'auto' }}><Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown></div>}
      {loading && <p className="d-note">생성 중…</p>}
      {text && !loading && (
        <div className="pdf"><button type="button" className="d-pill solid" onClick={() => window.print()}>PDF 내보내기</button></div>
      )}
    </section>
  )
}

export default function RecommendPage({ budget }: { budget: Budget }) {
  const { resources, limit } = budget
  const [recs, setRecs] = useState<Recommendation[] | null>(null)
  const [fallback, setFallback] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [reportText, setReportText] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState(false)

  const total = round2(resources.reduce((s, r) => s + r.cost, 0))
  const saving = recs ? recs.reduce((s, r) => s + r.savings, 0) : 0
  const rest = Math.max(0, round2(total - saving))

  const run = async () => {
    setRunning(true)
    setError('')
    setReportText('')
    setReportError(false)
    let result: Recommendation[]
    try {
      const res = await fetchRecommendations(budget)
      result = res.recommendations
      setFallback(res.fallback)
    } catch (e) {
      // 서버 호출 실패 시 로컬 규칙 기반 추천으로 대체
      result = buildRecommendations(resources)
      setFallback(true)
      setError(e instanceof Error ? e.message : '')
    }
    setRecs(result)
    setRunning(false)

    setReportLoading(true)
    try {
      await streamReport(budget, result, setReportText)
    } catch {
      setReportError(true)
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="d-wrap">
      <div className="d-head">
        <h1>절감 추천 <span>Savings</span></h1>
        <div className="d-inline">
          {recs && <span className="d-pill">· 완료 ({recs.length}건)</span>}
          <button type="button" className="d-pill solid" onClick={run} disabled={resources.length === 0 || running || reportLoading}>
            {running ? '분석 중…' : 'AI 분석 실행'}
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
          {fallback && <p className="d-note d-fallback">AI 분석을 사용할 수 없어 규칙 기반 폴백 결과로 표시하고 있어요.{error && ` (${error})`}</p>}
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

          <AiReport text={reportText} loading={reportLoading} error={reportError} />
        </>
      )}
    </div>
  )
}