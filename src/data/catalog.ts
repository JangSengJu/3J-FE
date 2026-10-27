// 3J 리소스 카탈로그 — 서울 리전(ap-northeast-2) 온디맨드 참고가, USD

export type BillingUnit =
  | 'hour' | 'lcu_hour' | 'month' | 'gb_month'
  | 'gb_transfer' | 'gb_second' | 'million_requests' | 'request'

export const UNIT_LABEL: Record<BillingUnit, string> = {
  hour: '시간',
  lcu_hour: 'LCU·시간',
  month: '개',
  gb_month: 'GB·월',
  gb_transfer: 'GB',
  gb_second: 'GB-초',
  million_requests: '백만 건',
  request: '건',
}

export const RESOURCE_TYPES = [
  'EC2', 'EKS', 'RDS', 'S3', 'Lambda', 'ECS', 'ECR', 'DynamoDB', 'ElastiCache', 'VPC',
  'ALB', 'CloudFront', 'Route53', 'APIGateway', 'SQS', 'SNS', 'CloudWatch', 'CloudTrail',
  'IAM', 'SecretsManager',
] as const
export type ResourceType = (typeof RESOURCE_TYPES)[number]

export interface PriceOption {
  option: string
  price: number
  unit: BillingUnit
  note?: string
}

const p = (option: string, price: number, unit: BillingUnit, note?: string): PriceOption => ({ option, price, unit, note })

export const CATALOG: Record<ResourceType, PriceOption[]> = {
  EC2: [p('t3.micro', 0.0104, 'hour'), p('t3.small', 0.0208, 'hour'), p('t3.medium', 0.0416, 'hour'), p('m5.large', 0.096, 'hour'), p('c5.large', 0.085, 'hour')],
  EKS: [p('제어 플레인', 0.1, 'hour'), p('노드 t3.medium', 0.0416, 'hour'), p('노드 m5.large', 0.096, 'hour')],
  RDS: [p('db.t3.micro', 0.017, 'hour'), p('db.t3.small', 0.034, 'hour'), p('db.t4g.medium', 0.067, 'hour'), p('db.m5.large', 0.19, 'hour')],
  S3: [p('Standard', 0.023, 'gb_month'), p('Standard-IA', 0.0115, 'gb_month'), p('Glacier Instant', 0.004, 'gb_month'), p('데이터 전송', 0.126, 'gb_transfer')],
  Lambda: [p('요청', 0.2, 'million_requests'), p('GB-초', 0.0000166667, 'gb_second')],
  ECS: [p('Fargate vCPU', 0.04048, 'hour'), p('Fargate 메모리 GB', 0.004445, 'hour')],
  ECR: [p('프라이빗 저장소', 0.1, 'gb_month')],
  DynamoDB: [p('온디맨드 읽기', 0.25, 'million_requests'), p('온디맨드 쓰기', 1.25, 'million_requests'), p('스토리지', 0.25, 'gb_month')],
  ElastiCache: [p('cache.t3.micro', 0.017, 'hour'), p('cache.t3.small', 0.034, 'hour'), p('cache.m5.large', 0.127, 'hour')],
  VPC: [p('NAT Gateway', 0.062, 'hour'), p('NAT 데이터 처리', 0.052, 'gb_transfer')],
  ALB: [p('ALB', 0.0225, 'hour'), p('LCU', 0.008, 'lcu_hour')],
  CloudFront: [p('데이터 전송', 0.126, 'gb_transfer'), p('HTTP/HTTPS 요청', 1.0, 'million_requests')],
  Route53: [p('호스팅 영역', 0.5, 'month'), p('쿼리', 0.4, 'million_requests')],
  APIGateway: [p('REST 요청', 3.7, 'million_requests'), p('HTTP 요청', 1.0, 'million_requests'), p('API 캐시', 0.14, 'gb_month')],
  SQS: [p('요청', 0.4, 'million_requests', '1M 요청 무료')],
  SNS: [p('요청 · 배송', 0.5, 'million_requests')],
  CloudWatch: [p('커스텀 지표', 0.3, 'month'), p('로그 수집', 0.5, 'gb_month')],
  CloudTrail: [p('관리 이벤트', 2.0, 'million_requests')],
  IAM: [p('IAM (무료)', 0, 'month', '비용 없음')],
  SecretsManager: [p('시크릿', 0.4, 'month'), p('API 호출', 5.0, 'million_requests')],
}

// 계정 기준 무료 티어: 월 비용 = max(0, 수량 − 무료 티어) × 단가
export const FREE_TIER: Partial<Record<BillingUnit, number>> = {
  million_requests: 1,
  gb_second: 400_000,
  gb_transfer: 100,
}

export const HOUR_PRESETS = [
  { label: '24시간 상시', hours: 730 },
  { label: '평일 9–18', hours: 176 },
  { label: '야간 20–08', hours: 365 },
  { label: '주말만', hours: 209 },
] as const

export const isHourly = (u: BillingUnit) => u === 'hour' || u === 'lcu_hour'

export const USAGE_OPTIONS = ['<5%', '5~20%', '>20%'] as const
export const NEED_OPTIONS = ['대부분 유휴', '항상 필요'] as const
export type Usage = (typeof USAGE_OPTIONS)[number]
export type Need = (typeof NEED_OPTIONS)[number]

export const DEFAULT_LIMIT = 60
export const MAX_RESOURCES = 200

export const DEFAULT_QTY: Record<BillingUnit, number | ''> = {
  hour: '', lcu_hour: '', month: 1, gb_month: 50, gb_transfer: 10,
  million_requests: 1, request: 1000, gb_second: 1_000_000,
}

export interface Resource {
  id: string
  name: string
  type: string
  unit: BillingUnit
  cost: number
  usage: string
  need: string
  meta: string
  option: string
  qty: number
}

export interface Budget {
  resources: Resource[]
  limit: number
  notes: Record<string, string>
  purpose: string
}

export const emptyBudget = (): Budget => ({ resources: [], limit: DEFAULT_LIMIT, notes: {}, purpose: '' })

export const calcCost = (price: number, unit: BillingUnit, qty: number) => {
  const free = FREE_TIER[unit] ?? 0
  return Math.round(Math.max(0, qty - free) * price * 100) / 100
}

// 이름 미입력 시 `{유형 소문자}-{사양 소문자}`, 영숫자 외 문자는 `-`
export const autoName = (type: string, option: string) =>
  `${type}-${option}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export const uniqueName = (base: string, taken: string[]) => {
  if (!taken.includes(base)) return base
  let i = 2
  while (taken.includes(`${base}-${i}`)) i += 1
  return `${base}-${i}`
}

export const qtyLabel = (unit: BillingUnit, qty: number) =>
  `${qty.toLocaleString()} ${UNIT_LABEL[unit]}`
