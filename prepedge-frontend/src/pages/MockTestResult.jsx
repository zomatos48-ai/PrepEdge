import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMockTestResult } from '../api/mockTestApi'

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

export default function MockTestResult() {
  const { attemptId } = useParams()
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('review') // 'review' | 'analysis'
  const navigate = useNavigate()

  useEffect(() => { getMockTestResult(attemptId).then(r => setResult(r.data)) }, [attemptId])

  if (!result) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 24, height: 24, border: '2px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        Loading results...
      </div>
    </div>
  )

  const pct = result.percentage ? Math.round(result.percentage) : 0
  const scoreColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'

  // Detailed Analysis calculations
  const subjectMap = {}
  result.questions?.forEach(q => {
    const subject = q.subjectName || 'General'
    const topic = q.topicName || 'General'
    
    if (!subjectMap[subject]) {
      subjectMap[subject] = { total: 0, correct: 0, incorrect: 0, unanswered: 0, topics: {} }
    }
    subjectMap[subject].total += 1
    if (q.selectedOptionId === null || q.selectedOptionId === undefined) {
      subjectMap[subject].unanswered += 1
    } else if (q.correct) {
      subjectMap[subject].correct += 1
    } else {
      subjectMap[subject].incorrect += 1
    }

    if (!subjectMap[subject].topics[topic]) {
      subjectMap[subject].topics[topic] = { total: 0, correct: 0, incorrect: 0, unanswered: 0 }
    }
    subjectMap[subject].topics[topic].total += 1
    if (q.selectedOptionId === null || q.selectedOptionId === undefined) {
      subjectMap[subject].topics[topic].unanswered += 1
    } else if (q.correct) {
      subjectMap[subject].topics[topic].correct += 1
    } else {
      subjectMap[subject].topics[topic].incorrect += 1
    }
  })

  // Time & Pace calculations
  let minutesTaken = result.durationMinutes
  let avgSecondsPerQuestion = 0
  let paceRating = 'N/A'
  let paceColor = 'var(--text-secondary)'
  let paceAdvice = ''

  if (result.startedAt && result.submittedAt) {
    const start = new Date(result.startedAt)
    const end = new Date(result.submittedAt)
    const elapsedMs = Math.max(1000, end - start)
    minutesTaken = Math.max(1, Math.round(elapsedMs / 60000))
    const elapsedSeconds = Math.round(elapsedMs / 1000)
    avgSecondsPerQuestion = Math.round(elapsedSeconds / (result.totalQuestions || 1))

    if (avgSecondsPerQuestion < 30) {
      paceRating = 'Very Fast'
      paceColor = '#3b82f6'
      paceAdvice = 'You finished very quickly! Ensure you doublecheck your work to minimize silly mistakes.'
    } else if (avgSecondsPerQuestion <= 90) {
      paceRating = 'Optimal (Placement Ready)'
      paceColor = 'var(--green)'
      paceAdvice = 'Excellent pacing! You balanced speed and accuracy perfectly.'
    } else {
      paceRating = 'Slow (Needs Improvement)'
      paceColor = 'var(--red)'
      paceAdvice = 'Taking longer than usual per question. Practice more timed mock tests to build speed.'
    }
  }

  // Identify Strengths and Weaknesses
  const weakTopics = []
  const strongTopics = []

  Object.keys(subjectMap).forEach(subName => {
    const sub = subjectMap[subName]
    Object.keys(sub.topics).forEach(topName => {
      const top = sub.topics[topName]
      const acc = top.total > 0 ? Math.round((top.correct / top.total) * 100) : 0
      const item = { name: topName, subject: subName, accuracy: acc, ...top }
      if (acc < 70) {
        weakTopics.push(item)
      } else {
        strongTopics.push(item)
      }
    })
  })

  return (
    <div style={{ maxWidth: '820px', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{result.mockTestTitle}</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {result.companyName} ·
            <span style={{
              marginLeft: '8px', background: 'var(--green-bg)', color: 'var(--green)',
              border: '1px solid #10b98130', borderRadius: '5px', padding: '1px 8px', fontSize: '11px', fontWeight: '600',
            }}>{result.status}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/app/mock-tests')}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: '8px',
            padding: '9px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#34d399' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >← Back to Tests</button>
      </div>

      {/* Score card */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '28px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '32px',
      }}>
        <ScoreRing pct={pct} />
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Score', value: `${result.score}/${result.totalQuestions}`, color: scoreColor, bg: `${scoreColor}15` },
            { label: 'Answered', value: result.answeredQuestions, color: 'var(--text-primary)', bg: 'var(--bg-hover)' },
            { label: 'Time Taken', value: `${minutesTaken}m`, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '22px', fontWeight: '800', color: s.color,
                background: s.bg, borderRadius: '10px', padding: '8px 16px', marginBottom: '6px',
              }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs Switcher ── */}
      <div style={{
        display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)'
      }}>
        <button
          onClick={() => setActiveTab('review')}
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'review' ? '2.5px solid #059669' : '2.5px solid transparent',
            color: activeTab === 'review' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 4px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Review Questions
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          style={{
            background: 'none', border: 'none',
            borderBottom: activeTab === 'analysis' ? '2.5px solid #059669' : '2.5px solid transparent',
            color: activeTab === 'analysis' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 4px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          Detailed Analysis & Insights
        </button>
      </div>

      {activeTab === 'review' ? (
        /* ── QUESTION REVIEW TAB ── */
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
      ) : (
        /* ── DETAILED ANALYSIS TAB ── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Column: Subject & Topic accuracy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Subject & Topic Breakdown</h3>
            
            {Object.keys(subjectMap).map(subName => {
              const sub = subjectMap[subName]
              const subAccuracy = sub.total > 0 ? Math.round((sub.correct / sub.total) * 100) : 0
              const subColor = subAccuracy >= 75 ? 'var(--green)' : subAccuracy >= 50 ? 'var(--yellow)' : 'var(--red)'

              return (
                <div key={subName} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '12px', padding: '20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{subName}</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: subColor }}>{subAccuracy}% Accuracy</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    {sub.correct} Correct · {sub.incorrect} Incorrect · {sub.unanswered} Unanswered
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ height: '6px', background: 'var(--bg-hover)', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ height: '100%', width: `${subAccuracy}%`, background: subColor, borderRadius: '3px' }} />
                  </div>

                  {/* Topics list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px', borderLeft: '2px solid var(--border)' }}>
                    {Object.keys(sub.topics).map(topName => {
                      const top = sub.topics[topName]
                      const topAccuracy = top.total > 0 ? Math.round((top.correct / top.total) * 100) : 0
                      const topColor = topAccuracy >= 75 ? 'var(--green)' : topAccuracy >= 50 ? 'var(--yellow)' : 'var(--red)'
                      
                      return (
                        <div key={topName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{topName}</span>
                          <span style={{ fontWeight: '600', color: topColor }}>{topAccuracy}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Time analysis & recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Pace Analysis Card */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>Speed & Pacing</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Avg. Pace per Question</span>
                <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{avgSecondsPerQuestion}s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pacing Rating</span>
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: paceColor,
                  background: `${paceColor}10`, padding: '3px 8px', borderRadius: '6px',
                }}>{paceRating}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '8px' }}>
                {paceAdvice}
              </p>
            </div>

            {/* Recommendations Card */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px' }}>Placement Insights</h3>
              
              {/* Weak areas list */}
              {weakTopics.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Areas of Focus</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {weakTopics.slice(0, 3).map(item => (
                      <div key={item.name} style={{ display: 'flex', gap: '8px', background: 'var(--red-bg)', border: '1px solid rgba(220,38,38,0.15)', padding: '8px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '14px' }}>⚠️</span>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          Review <strong>{item.name}</strong> ({item.accuracy}%). You got {item.incorrect + item.unanswered} wrong or skipped.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths list */}
              {strongTopics.length > 0 && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Strengths</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {strongTopics.slice(0, 3).map(item => (
                      <div key={item.name} style={{ display: 'flex', gap: '8px', background: 'var(--green-bg)', border: '1px solid rgba(5,150,105,0.15)', padding: '8px 12px', borderRadius: '8px' }}>
                        <span style={{ fontSize: '14px' }}>🌟</span>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                          Strong performance in <strong>{item.name}</strong> ({item.accuracy}% accuracy).
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}