import { CATALOG, HOUR_PRESETS, calcCost, type Resource, type ResourceType } from './catalog'

export type Kind = 'cost' | 'performance' | 'reliability' | 'security' | 'scalability' | 'architecture' | 'other'
export type Action = 'downsizing' | 'deletion' | 'migration' | 'reserved' | 'consolidation' | 'scaleup' | 'tier' | 'rightsizing' | 'other'

export const KIND_LABEL: Record<Kind, string> = {
  cost: '절감', performance: '성능', reliability: '안정성', security: '보안',
  scalability: '확장성', architecture: '아키텍처', other: '기타',
}

export interface Recommendation {
  title: string
  target: string
  savings: number // 양수=절감, 음수=투자, 0=변동 없음
  grounds: string[]
  action: Action
  kind: Kind
}

const MAX_RECS = 15
const MAX_PER_ACTION = 3
const r2 = (n: number) => Math.round(n * 100) / 100

// AI 연동 전 규칙 기반 폴백 추천
export function buildRecommendations(resources: Resource[]): Recommendation[] {
  const out: Recommendation[] = []
  for (const r of resources) {
    const idle = r.need === '대부분 유휴'
    const options = CATALOG[r.type as ResourceType] ?? []
    const cur = options.find((o) => o.option === r.option)

    if (cur && r.unit === 'hour' && idle && r.usage !== '>20%') {
      const cheaper = options
        .filter((o) => o.unit === 'hour' && o.price < cur.price && !o.option.startsWith('노드') === !cur.option.startsWith('노드'))
        .sort((a, b) => b.price - a.price)[0]
      if (cheaper) {
        const next = calcCost(cheaper.price, 'hour', r.qty)
        out.push({
          title: `${r.name} 사양 축소 (${cur.option} → ${cheaper.option})`,
          target: r.name, savings: r2(r.cost - next), action: 'downsizing', kind: 'cost',
          grounds: [`사용률 ${r.usage} / 필요도 ${r.need} — 용도 대비 사양이 과함`, '한 단계 아래 사양으로 전환 시 요금 감소'],
        })
      }
    }
    if (r.unit === 'hour' && idle && r.qty >= 730) {
      const h = HOUR_PRESETS[1].hours
      out.push({
        title: `${r.name} 사용 시간 축소 (평일 9–18)`,
        target: r.name, savings: r2(r.cost * (1 - h / 730)), action: 'rightsizing', kind: 'cost',
        grounds: ['24시간 상시 가동이지만 대부분 유휴 상태', `사용 시간을 ${h}시간으로 줄이면 시간당 과금 비용이 비례해 감소`],
      })
    }
    if (r.unit === 'hour' && !idle && r.qty >= 730 && r.cost > 0) {
      out.push({
        title: `${r.name} 1년 약정(Savings Plans) 검토`,
        target: r.name, savings: r2(r.cost * 0.3), action: 'reserved', kind: 'cost',
        grounds: ['항상 필요한 상시 가동 리소스', '약정 할인 적용 시 약 30% 절감 가능 (추정치)'],
      })
    }
    if (r.type === 'S3' && r.option === 'Standard' && idle) {
      const ia = options.find((o) => o.option === 'Standard-IA')
      if (ia) {
        out.push({
          title: `${r.name} Standard-IA 로 스토리지 클래스 변경`,
          target: r.name, savings: r2(r.cost - calcCost(ia.price, 'gb_month', r.qty)), action: 'tier', kind: 'cost',
          grounds: ['접근이 드문 데이터는 저비용 클래스가 적합', 'Standard 대비 GB당 단가 약 50% 낮음'],
        })
      }
    }
  }

  const count: Partial<Record<Action, number>> = {}
  return out
    .sort((a, b) => b.savings - a.savings)
    .filter((x) => {
      const n = count[x.action] ?? 0
      if (n >= MAX_PER_ACTION) return false
      count[x.action] = n + 1
      return true
    })
    .slice(0, MAX_RECS)
}
