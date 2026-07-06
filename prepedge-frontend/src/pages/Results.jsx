import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTestResult } from '../api/questionApi'

function ScoreRing({ pct }) {
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (pct / 100) * circumference
  return (
    <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r="36" fill="none" stroke="var(--bg-hover)" strokeWidth="7" />
        <circle cx="48" cy="48" r="36" fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color }}>{pct}%</span>
      </div>
    </div>
  )
}

export default function Results() {
  const { attemptId } = useParams()
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { getTestResult(attemptId).then(r => setResult(r.data)) }, [attemptId])

  if (!result) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        Loading results...
      </div>
    </div>
  )

  const correct = result.questions?.filter(q => q.correct).length ?? 0
  const total = result.questions?.length ?? 0
  const pct = total ? Math.round((correct / total) * 100) : 0
  const scoreColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ maxWidth: '820px', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Test Results</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Practice MCQ · Attempt #{attemptId}
          </p>
        </div>
        <button
          onClick={() => navigate('/app/practice')}
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            border: 'none', color: '#fff', borderRadius: '8px',
            padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 0 16px var(--accent-glow)',
          }}
        >Practice Again →</button>
      </div>

      {/* Score card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '28px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '32px',
      }}>
        <ScoreRing pct={pct} />
        <div style={{ display: 'flex', gap: '40px' }}>
          {[
            { label: 'Correct', value: correct, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Wrong', value: total - correct, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
            { label: 'Total', value: total, color: 'var(--text-primary)', bg: 'var(--bg-hover)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '28px', fontWeight: '800', color: s.color,
                background: s.bg, borderRadius: '10px', padding: '8px 18px', marginBottom: '6px',
              }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-question review */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {result.questions?.map((q, idx) => {
          const borderColor = q.correct ? 'rgba(16,185,129,0.3)' : q.selectedOptionId ? 'rgba(239,68,68,0.3)' : 'var(--border)'
          const bgColor = q.correct ? 'rgba(16,185,129,0.03)' : q.selectedOptionId ? 'rgba(239,68,68,0.03)' : 'var(--bg-card)'
          return (
            <div key={q.questionId} style={{
              background: bgColor, border: `1px solid ${borderColor}`,
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '6px', flexShrink: 0,
                  background: q.correct ? 'var(--green-bg)' : q.selectedOptionId ? 'var(--red-bg)' : 'var(--bg-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '800',
                  color: q.correct ? 'var(--green)' : q.selectedOptionId ? 'var(--red)' : 'var(--text-muted)',
                }}>
                  {q.correct ? '✓' : q.selectedOptionId ? '✗' : '–'}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px', fontWeight: '600' }}>Q{idx + 1}.</span>
                  {q.text}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginLeft: '38px' }}>
                {q.options?.map((opt, oi) => {
                  const isSelected = opt.id === q.selectedOptionId
                  const isCorrect = opt.id === q.correctOptionId
                  const letter = ['A', 'B', 'C', 'D'][oi]
                  return (
                    <div key={opt.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                      padding: '8px 12px', borderRadius: '8px',
                      background: isCorrect ? 'rgba(16,185,129,0.08)' : isSelected ? 'rgba(239,68,68,0.08)' : 'transparent',
                      border: `1px solid ${isCorrect ? '#10b98130' : isSelected ? '#ef444430' : 'transparent'}`,
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: '5px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: '700',
                        background: isCorrect ? 'var(--green-bg)' : isSelected ? 'var(--red-bg)' : 'var(--bg-hover)',
                        color: isCorrect ? 'var(--green)' : isSelected ? 'var(--red)' : 'var(--text-muted)',
                      }}>{letter}</span>
                      <span style={{
                        fontSize: '13px', lineHeight: '1.5',
                        color: isCorrect ? 'var(--green)' : isSelected ? 'var(--red)' : 'var(--text-secondary)',
                        fontWeight: isCorrect ? '600' : '400',
                      }}>
                        {opt.text}
                        {isCorrect && <span style={{ marginLeft: '6px', fontSize: '11px' }}>✓ Correct</span>}
                        {isSelected && !isCorrect && <span style={{ marginLeft: '6px', fontSize: '11px' }}>← Your answer</span>}
                      </span>
                    </div>
                  )
                })}
              </div>

              {q.explanation && (
                <div style={{
                  marginTop: '14px', marginLeft: '38px',
                  background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)',
                  borderRadius: '8px', padding: '10px 14px',
                  fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6',
                }}>
                  <span style={{ color: '#34d399', fontWeight: '600' }}>💡 Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}