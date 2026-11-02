import { request } from './client'
import { emptyBudget, type Budget, type BillingUnit, type Resource } from '../data/catalog'

interface ResourceDto {
  id: string
  name: string
  type: string
  unit: string
  cost: number
  usage: string
  need: string
  meta: string
}

interface BudgetDto {
  resources: ResourceDto[]
  limit: number
  notes: Record<string, string>
  purpose: string
}

const toDto = (b: Budget): BudgetDto => ({
  limit: b.limit,
  notes: b.notes,
  purpose: b.purpose,
  resources: b.resources.map(({ id, name, type, unit, cost, usage, need, meta }) => ({ id, name, type, unit, cost, usage, need, meta })),
})

// 서버는 option/qty 를 저장하지 않으므로 meta("EC2 · t3.micro · 730 시간")에서 복원
const fromDto = (r: ResourceDto): Resource => {
  const [, option = '', qtyText = ''] = r.meta.split(' · ')
  return {
    ...r,
    unit: r.unit as BillingUnit,
    option,
    qty: Number(qtyText.split(' ')[0].replace(/,/g, '')) || 0,
  }
}

export async function fetchBudget(): Promise<Budget> {
  const { budget } = await request<{ budget?: BudgetDto }>('GET', '/api/budget')
  if (!budget) return emptyBudget()
  const base = emptyBudget()
  return {
    resources: (budget.resources ?? []).map(fromDto),
    limit: budget.limit ?? base.limit,
    notes: budget.notes ?? {},
    purpose: budget.purpose ?? '',
  }
}

export const saveBudget = (b: Budget) => request<unknown>('PUT', '/api/budget', toDto(b))
