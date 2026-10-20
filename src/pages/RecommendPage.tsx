interface Rec {
  tag: string
  accent: boolean
  title: string
  points: string[]
  footLabel: string
  amount: string
  warn?: boolean
}

const RESOURCE = 'ec2-t3-micro'

const recs: Rec[] = [
  {
    tag: '아키텍처', accent: false,
    title: 'Amazon S3 및 CloudFront 기반 정적 호스팅 전환',
    points: [
      '개인 블로그 운영 특성상 단독 EC2 운영보다 S3와 CloudFront를 활용한 정적 호스팅이 구조적으로 단순하고 비용 효율적임',
      'EC2 사용률이 5% 미만인 유휴 상태이므로 서버리스 정적 웹 아키텍처 전환 시 고정비 절감 가능',
    ],
    footLabel: '예상 월 절감', amount: '$6.50',
  },
  {
    tag: '절감', accent: true,
    title: '1년 Compute Savings Plans 적용',
    points: [
      'EC2 인스턴스를 지속 유지할 경우 1년 약정 Savings Plans 적용으로 약 35% 이상의 비용 절감 가능',
      '월 $7.59의 고정 비용을 $4.80 수준으로 단축',
    ],
    footLabel: '예상 월 절감', amount: '$2.80',
  },
  {
    tag: '확장성', accent: true,
    title: 'Amazon CloudFront CDN 도입으로 에지 캐싱 및 보안 강화',
    points: [
      '글로벌 Edge Network를 활용해 블로그 이미지 및 정적 콘텐츠 전달 속도 개선',
      'EC2 서버로의 직접적인 Web 트래픽 부하 경감 및 기본 DDoS 방어(AWS Shield Standard) 효과 제공',
    ],
    footLabel: '비용 변동', amount: '±0',
  },
  {
    tag: '보안', accent: false,
    title: '보안 그룹 최소 권한 원칙 적용 및 SSH 포트 제한',
    points: [
      '개인 블로그 관리용 SSH(22번) 포트에 대한 불특정 다수(0.0.0.0/0) 접근을 특정 IP로 제한 필요',
      '웹 트래픽(80/443) 외 불필요한 인바운드 포트를 차단하여 웹 서버 보안성 향상',
    ],
    footLabel: '비용 변동', amount: '±0',
  },
  {
    tag: '안정성', accent: true,
    title: 'AWS Backup을 이용한 정기 EBS 스냅샷 자동화',
    points: [
      '단일 EC2 인스턴스 구성 환경에서 서버 장애 시 블로그 데이터 보호를 위한 스냅샷 백업 정책 필요',
      '일일 백업 및 보관 주기 설정을 통해 가용성 및 복구 시점 목표(RPO) 확보',
    ],
    footLabel: '예상 추가 비용', amount: '-$0.50', warn: true,
  },
]

const table = [
  ['Amazon S3 및 CloudFront 기반 정적 호스팅 전환', '아키텍처', '$6.50'],
  ['1년 Compute Savings Plans 적용', '절감', '$2.80'],
  ['Amazon CloudFront CDN 도입으로 에지 캐싱 및 보안 강화', '확장성', '$0.00'],
  ['보안 그룹 최소 권한 원칙 적용 및 SSH 포트 제한', '보안', '$0.00'],
  ['AWS Backup을 이용한 정기 EBS 스냅샷 자동화', '안정성', '-$0.50'],
]

const details: [string, string, string][] = [
  ['1) [아키텍처] Amazon S3 및 CloudFront 기반 정적 호스팅 전환',
    '사용률 5% 미만의 유휴 EC2 인스턴스를 해제하고, Amazon S3와 CloudFront를 조합한 서버리스 정적 웹 아키텍처로 전환합니다.',
    '개인 블로그 운영 특성상 서버 사이드 연산이 최소화되므로 정적 호스팅으로의 전환이 구조적으로 단순하며, 고정비를 줄여 월 $6.50의 비용 절감 효과를 기대할 수 있습니다.'],
  ['2) [비용 절감] 1년 Compute Savings Plans 적용',
    'EC2 인스턴스를 지속 유지해야 하는 환경일 경우, 1년 약정 Compute Savings Plans를 체결합니다.',
    '약정 적용 시 약 35% 이상의 할인율이 제공되어 월 $7.59의 고정 비용을 약 $4.80 수준으로 낮춰 월 $2.80의 절감이 가능합니다.'],
  ['3) [확장성] Amazon CloudFront CDN 도입으로 에지 캐싱 및 보안 강화',
    '글로벌 Edge Network인 CloudFront CDN을 전면에 배치합니다.',
    '블로그 내 이미지 및 정적 콘텐츠 전달 속도를 향상시키고, EC2 서버 직접 트래픽 부하를 경감시킵니다. 추가 비용 부담 없이($0.00) AWS Shield Standard를 통한 기본 DDoS 방어 효과를 확보합니다.'],
  ['4) [보안] 보안 그룹 최소 권한 원칙 적용 및 SSH 포트 제한',
    'EC2 인스턴스의 보안 그룹 인바운드 규칙을 재설정합니다.',
    '현재 불특정 다수(0.0.0.0/0)에 열려있을 수 있는 관리용 SSH(22번) 포트 접근을 특정 IP로 제한하고, 웹 트래픽(80/443) 외 불필요한 포트를 차단하여 보안 위험을 제거합니다.'],
  ['5) [안정성] AWS Backup을 이용한 정기 EBS 스냅샷 자동화',
    'AWS Backup 서비스를 활용해 정기적인 EBS 스냅샷 백업 정책을 수립합니다.',
    '단일 EC2 인스턴스 환경에서 발생할 수 있는 데이터 손실 및 서버 장애에 대비해 일일 백업 및 보관 주기를 설정함으로써 복구 시점 목표(RPO)를 확보합니다. (월 -$0.50 소요)'],
]

export default function RecommendPage() {
  return (
    <div className="c-wrap narrow">
      <h1 className="c-title" style={{ marginBottom: 32 }}>절감 추천</h1>
      <div className="c-card c-ai">
        <h2 style={{ fontSize: 18 }}>AI 절감 분석</h2>
        <div>
          <span className="c-chip">· 완료 (5건)</span>
          <button type="button" className="c-btn primary">AI 분석 실행</button>
        </div>
      </div>
      <div className="c-stats">
        <div className="c-stat"><small>후보 발견</small><div className="n">5건</div><em>1건 투자형 제안</em></div>
        <div className="c-stat"><small>현재 비용</small><div className="n">$7.59</div><em>예산 한도 $200.00</em></div>
        <div className="c-stat hot"><small>예상 절감</small><div className="n">$9.30</div><em>절감 합산 · 전부 적용 시 $0.00</em></div>
      </div>

      {recs.map((r, i) => (
        <article className="c-rec" key={r.title}>
          <div className="c-rec-top">
            <span className="c-no">{String(i + 1).padStart(2, '0')}</span>
            {RESOURCE}
            <span className={`c-tag${r.accent ? ' o' : ''}`}>{r.tag}</span>
          </div>
          <h3>{r.title}</h3>
          <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <div className="c-rec-foot">
            <span style={r.warn ? { color: '#7a5a00' } : undefined}>{r.footLabel}</span>
            <b className={r.warn ? 'warn' : undefined}>{r.amount}</b>
          </div>
        </article>
      ))}

      <section className="c-report">
        <header><span>AI 보고서</span></header>
        <h1>클라우드 아키텍처 개선 보고서</h1>
        <h2>1. 요약</h2>
        <p>본 보고서는 "개인 블로그 서비스 운영"을 목적으로 사용 중인 AWS 클라우드 아키텍처의 리소스 효율성, 비용, 보안 및 안정성을 평가하고 개선 방안을 제시합니다.</p>
        <p>현재 월 예산 한도($200.00) 대비 예상 비용은 $7.59로 예산 범위 내에서 안정적으로 관리되고 있으나, 운영 중인 <code>{RESOURCE}</code> 인스턴스의 사용률이 5% 미만으로 대부분 유휴 상태입니다. 개인 블로그라는 서비스 목적을 고려할 때 단독 EC2 운영은 리소스 사양이 과도하고 고정비가 발생하는 구조입니다. 따라서 Amazon S3 및 CloudFront 기반의 정적 호스팅으로의 아키텍처 전환을 최우선 과제로 제안하며, EC2 유지 시 비용 절감 및 보안·안정성 강화를 위한 대안 조치를 함께 검토합니다.</p>
        <h2>2. 비용·아키텍처 현황</h2>
        <ul>
          <li><p><b>월 예산 한도</b>: $200.00</p></li>
          <li><p><b>현재 예상 비용</b>: $7.59</p></li>
          <li><p><b>운영 목적으로서의 적절성 평가</b>:</p></li>
          <li><p><b>사용 용도</b>: 개인 블로그 서비스 운영</p></li>
          <li><p><b>운영 리소스</b>: <code>{RESOURCE}</code> (730시간 continuous run)</p></li>
          <li><p><b>리소스 평가</b>: CPU 사용률이 5% 미만인 유휴 상태로, 단독 EC2 인스턴스를 월 730시간 전량 가동하는 것은 개인 블로그 용도 대비 리소스가 과다 할당되어 있습니다. 중복 리소스는 없으나, 단순 정적 콘텐츠 전달 목적에 비해 불필요한 서버 관리 오버헤드와 고정 비용이 발생하고 있습니다.</p></li>
        </ul>
        <h2>3. 개선 제안</h2>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>제안내용</th><th>유형</th><th>대상 리소스</th><th>비용 영향 USD</th></tr></thead>
            <tbody>
              {table.map(([t, k, c]) => (
                <tr key={t}><td>{t}</td><td>{k}</td><td>{RESOURCE}</td><td>{c}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>4. 세부 검토</h2>
        {details.map(([h, a, b]) => (
          <div key={h}>
            <h4>{h}</h4>
            <p className="d"><b>검토 내용</b>: {a}</p>
            <p className="d"><b>근거</b>: {b}</p>
          </div>
        ))}
        <h2>5. 실행 계획</h2>
        <h4>[권장 권고안] 정적 웹 아키텍처 전환 (최우선)</h4>
        <ol><li>S3 버킷 생성</li></ol>
        <h2>6. 결론</h2>
        <p>절감 제안을 모두 적용하면 월 최대 <b>$9.30</b> 절감되어, 예상 비용이 <b>$0.00</b> 수준으로 낮아집니다.</p>
        <div className="pdf"><button type="button" className="c-btn primary">PDF 내보내기</button></div>
      </section>
    </div>
  )
}
