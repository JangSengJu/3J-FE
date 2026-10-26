import { useState, type FormEvent } from 'react'
import {
  CATALOG, DEFAULT_QTY, HOUR_PRESETS, NEED_OPTIONS, RESOURCE_TYPES, UNIT_LABEL, USAGE_OPTIONS,
  autoName, calcCost, isHourly, qtyLabel, uniqueName,
  type Resource, type ResourceType,
} from '../data/catalog'

interface Props {
  takenNames: string[]
  onAdd: (r: Resource) => void
  onClose: () => void
}

const fmt = (n: number) => `$${n.toFixed(2)}`

export default function AddResourceModal({ takenNames, onAdd, onClose }: Props) {
  const [type, setType] = useState<ResourceType>('EC2')
  const [optionIdx, setOptionIdx] = useState(0)
  const [qtyText, setQtyText] = useState('')
  const [hours, setHours] = useState<number>(HOUR_PRESETS[0].hours)
  const [usage, setUsage] = useState<string>(USAGE_OPTIONS[0])
  const [need, setNeed] = useState<string>(NEED_OPTIONS[0])
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const options = CATALOG[type]
  const opt = options[optionIdx] ?? options[0]
  const hourly = isHourly(opt.unit)

  const changeType = (t: ResourceType) => {
    setType(t)
    setOptionIdx(0)
    setQtyText(String(DEFAULT_QTY[CATALOG[t][0].unit]))
  }
  const changeOption = (i: number) => {
    setOptionIdx(i)
    setQtyText(String(DEFAULT_QTY[options[i].unit]))
  }

  const qty = hourly ? hours : Number(qtyText)
  const valid = hourly || (qtyText.trim() !== '' && Number.isFinite(qty) && qty >= 0)
  const cost = valid ? calcCost(opt.price, opt.unit, qty) : 0
  const base = autoName(type, opt.option)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return setError('수량을 0 이상의 숫자로 입력하세요')
    const typed = name.trim().slice(0, 120)
    const finalName = uniqueName(typed || base, takenNames)
    onAdd({
      id: crypto.randomUUID(),
      name: finalName,
      type,
      unit: opt.unit,
      cost,
      usage,
      need,
      meta: `${type} · ${opt.option} · ${hourly ? `${qty} 시간` : qtyLabel(opt.unit, qty)}`,
      option: opt.option,
      qty,
    })
  }

  return (
    <div className="d-modal" role="dialog" aria-modal="true" aria-label="리소스 추가" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="d-card d-form" onSubmit={submit}>
        <div className="d-cardhead">
          <div>
            <h2>리소스 추가</h2>
            <p>Add resource</p>
          </div>
          <button type="button" className="d-x" aria-label="닫기" onClick={onClose}>×</button>
        </div>

        <div className="d-fields">
          <label className="d-field">
            <span>유형</span>
            <select className="d-input" value={type} onChange={(e) => changeType(e.target.value as ResourceType)}>
              {RESOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>

          <label className="d-field">
            <span>옵션</span>
            <select className="d-input" value={optionIdx} onChange={(e) => changeOption(Number(e.target.value))}>
              {options.map((o, i) => (
                <option key={o.option} value={i}>
                  {o.option} — ${o.price} / {UNIT_LABEL[o.unit]}{o.note ? ` (${o.note})` : ''}
                </option>
              ))}
            </select>
          </label>

          {hourly ? (
            <label className="d-field">
              <span>사용 시간</span>
              <select className="d-input" value={hours} onChange={(e) => setHours(Number(e.target.value))}>
                {HOUR_PRESETS.map((h) => <option key={h.label} value={h.hours}>{h.label} ({h.hours}h)</option>)}
              </select>
            </label>
          ) : (
            <label className="d-field">
              <span>수량 ({UNIT_LABEL[opt.unit]})</span>
              <input
                className="d-input"
                inputMode="decimal"
                value={qtyText}
                onChange={(e) => setQtyText(e.target.value)}
              />
            </label>
          )}

          <label className="d-field">
            <span>사용률</span>
            <select className="d-input" value={usage} onChange={(e) => setUsage(e.target.value)}>
              {USAGE_OPTIONS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </label>

          <label className="d-field">
            <span>필요도</span>
            <select className="d-input" value={need} onChange={(e) => setNeed(e.target.value)}>
              {NEED_OPTIONS.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>

          <label className="d-field">
            <span>이름 (선택)</span>
            <input
              className="d-input"
              maxLength={120}
              placeholder={uniqueName(base, takenNames)}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="d-error">{error}</p>}

        <div className="d-sum">
          <span>월 예상 요금</span>
          <b>{fmt(cost)}</b>
        </div>
        <div className="d-inline d-actions">
          <button type="button" className="d-pill" onClick={onClose}>취소</button>
          <button type="submit" className="d-pill solid">추가</button>
        </div>
      </form>
    </div>
  )
}
