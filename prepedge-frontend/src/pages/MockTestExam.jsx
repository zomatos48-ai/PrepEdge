import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { submitMockTest } from '../api/mockTestApi'

export default function MockTestExam() {
  const { attemptId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const attemptData = state?.attemptData

  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!attemptData) { navigate('/app/mock-tests'); return }
    // Backend sends LocalDateTime (UTC) without timezone info.
    // Appending 'Z' forces the browser to parse it as UTC, not IST.
    const rawExpiry = attemptData.expiresAt
    const expiryStr = rawExpiry.endsWith('Z') ? rawExpiry : rawExpiry + 'Z'
    const expires = new Date(expiryStr).getTime()
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) handleSubmit(true)
    }
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const handleSubmit = async (auto = false) => {
    if (submitting) return
    clearInterval(timerRef.current)
    setSubmitting(true)
    const answerList = (attemptData?.questions || []).map(q => ({
      questionId: q.id, selectedOptionId: answers[q.id] ?? null,
    }))
    try {
      await submitMockTest(attemptId, { answers: answerList })
      navigate(`/app/mock-results/${attemptId}`)
    } catch {
      alert('Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  if (!attemptData) return null

  const questions = attemptData.questions || []
  const q = questions[current]
  const mm = String(Math.floor((timeLeft ?? 0) / 60)).padStart(2, '0')
  const ss = String((timeLeft ?? 0) % 60).padStart(2, '0')
  const isLow = timeLeft !== null && timeLeft < 300
  const isCritical = timeLeft !== null && timeLeft < 60
  const answered = Object.keys(answers).length
  const total = questions.length

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* Left: Question panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
          padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
              {attemptData.title}
            </span>
            <span style={{
              marginLeft: '10px', fontSize: '12px', color: 'var(--text-muted)',
              background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '5px',
            }}>{attemptData.companyName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Timer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: isCritical ? 'rgba(239,68,68,0.1)' : isLow ? 'rgba(245,158,11,0.1)' : 'var(--bg-hover)',
              border: `1px solid ${isCritical ? '#ef444440' : isLow ? '#f59e0b40' : 'var(--border)'}`,
              borderRadius: '8px', padding: '6px 14px',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={isCritical ? '#ef4444' : isLow ? '#f59e0b' : 'var(--text-secondary)'} strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '16px', fontWeight: '700',
                color: isCritical ? '#ef4444' : isLow ? '#f59e0b' : 'var(--text-primary)',
                letterSpacing: '0.05em',
              }}>{mm}:{ss}</span>
            </div>
            <button
              onClick={() => handleSubmit(false)} disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #059669, #047857)',
                border: 'none', color: '#fff', borderRadius: '8px',
                padding: '8px 20px', fontSize: '13px', fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 16px var(--accent-glow)',
              }}
            >{submitting ? 'Submitting…' : '✓ Submit'}</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'var(--border)', flexShrink: 0 }}>
          <div style={{
            height: '100%', width: `${((current + 1) / total) * 100}%`,
            background: 'linear-gradient(90deg, #059669, #34d399)',
            transition: 'width 0.3s',
          }} />
        </div>

        {/* Question */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{
                background: 'var(--accent-glow)', color: '#34d399',
                border: '1px solid rgba(5,150,105,0.3)',
                borderRadius: '6px', padding: '3px 10px', fontSize: '12px', fontWeight: '600',
              }}>Q{current + 1}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>of {total}</span>
            </div>

            <p style={{
              fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.75',
              marginBottom: '28px', whiteSpace: 'pre-wrap',
            }}>{q?.text}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {q?.options.map((opt, oi) => {
                const selected = answers[q.id] === opt.id
                const letter = ['A', 'B', 'C', 'D'][oi]
                return (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px',
                      padding: '14px 18px', borderRadius: '10px', cursor: 'pointer',
                      border: selected ? '1.5px solid #059669' : '1px solid var(--border)',
                      background: selected ? 'rgba(5,150,105,0.08)' : 'var(--bg-card)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-hover)' } }}
                    onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)' } }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '7px', flexShrink: 0,
                      background: selected ? '#059669' : 'var(--bg-hover)',
                      border: `1px solid ${selected ? '#059669' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700',
                      color: selected ? '#fff' : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}>{letter}</div>
                    <input type="radio" name={`q-${q.id}`} checked={selected}
                      onChange={() => setAnswers({ ...answers, [q.id]: opt.id })} style={{ display: 'none' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65', paddingTop: '3px' }}>{opt.text}</span>
                  </label>
                )
              })}
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                style={{
                  background: 'var(--bg-hover)', border: '1px solid var(--border)',
                  color: current === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                  borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600',
                  cursor: current === 0 ? 'not-allowed' : 'pointer',
                }}
              >← Previous</button>
              <button
                onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
                disabled={current === total - 1}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  border: 'none', color: '#fff', borderRadius: '8px',
                  padding: '9px 20px', fontSize: '13px', fontWeight: '600',
                  cursor: current === total - 1 ? 'not-allowed' : 'pointer',
                  opacity: current === total - 1 ? 0.4 : 1,
                }}
              >Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Question map sidebar */}
      <div style={{
        width: '210px', flexShrink: 0,
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--green-bg)', borderRadius: '8px', padding: '10px 4px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--green)' }}>{answered}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Done</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-hover)', borderRadius: '8px', padding: '10px 4px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-secondary)' }}>{total - answered}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Left</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>
            QUESTIONS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                  border: i === current ? '2px solid #059669' : '1px solid var(--border)',
                  background: i === current ? 'var(--accent-glow)' : answers[questions[i]?.id] ? 'var(--green-bg)' : 'var(--bg-primary)',
                  color: i === current ? '#34d399' : answers[questions[i]?.id] ? 'var(--green)' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
              >{i + 1}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { color: 'var(--accent)', bg: 'var(--accent-glow)', label: 'Current' },
            { color: 'var(--green)', bg: 'var(--green-bg)', label: 'Answered' },
            { color: 'var(--text-muted)', bg: 'var(--bg-primary)', label: 'Unanswered' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '3px', background: item.bg, border: `1px solid ${item.color}50` }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}