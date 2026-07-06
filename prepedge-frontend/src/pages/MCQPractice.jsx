import { useEffect, useState, useCallback } from 'react'
import { getSubjects, getTopics, getQuestionCount, startTest, submitTest } from '../api/questionApi'
import { useNavigate } from 'react-router-dom'

const difficultyColor = { EASY: '#10b981', MEDIUM: '#f59e0b', HARD: '#ef4444' }
const difficultyBg = { EASY: 'rgba(16,185,129,0.1)', MEDIUM: 'rgba(245,158,11,0.1)', HARD: 'rgba(239,68,68,0.1)' }

function DifficultyBadge({ d }) {
  if (!d) return null
  return (
    <span style={{
      background: difficultyBg[d], color: difficultyColor[d],
      border: `1px solid ${difficultyColor[d]}40`,
      borderRadius: '5px', padding: '2px 8px', fontSize: '11px', fontWeight: '600',
    }}>{d}</span>
  )
}

// ── Config Screen ─────────────────────────────────────────────────────────────
function ConfigScreen({ onStart }) {
  const [subjects, setSubjects] = useState([])
  const [topics, setTopics] = useState([])
  const [filters, setFilters] = useState({ subjectId: '', topicId: '', difficulty: '', count: 10 })
  const [availableCount, setAvailableCount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(false)

  useEffect(() => { getSubjects().then(r => setSubjects(r.data)) }, [])

  useEffect(() => {
    if (filters.subjectId) getTopics(filters.subjectId).then(r => setTopics(r.data))
    else { setTopics([]); setFilters(f => ({ ...f, topicId: '' })) }
  }, [filters.subjectId])

  // Fetch available count whenever filters change
  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filters.subjectId) params.subjectId = filters.subjectId
    if (filters.topicId) params.topicId = filters.topicId
    if (filters.difficulty) params.difficulty = filters.difficulty
    getQuestionCount(params)
      .then(r => setAvailableCount(r.data.count))
      .catch(() => setAvailableCount(null))
      .finally(() => setLoading(false))
  }, [filters.subjectId, filters.topicId, filters.difficulty])

  const cappedCount = availableCount !== null ? Math.min(Number(filters.count), availableCount) : Number(filters.count)

  const handleStart = useCallback(async () => {
    if (availableCount === 0) return
    setStarting(true)
    try {
      const res = await startTest({
        count: cappedCount,
        subjectId: filters.subjectId ? Number(filters.subjectId) : null,
        topicId: filters.topicId ? Number(filters.topicId) : null,
        difficulty: filters.difficulty || null,
      })
      onStart(res.data)
    } finally { setStarting(false) }
  }, [filters, cappedCount, availableCount])

  const inputStyle = {
    width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-hover)',
    borderRadius: '8px', padding: '10px 14px', fontSize: '14px',
    color: 'var(--text-primary)', outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ maxWidth: '540px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
          MCQ Practice
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Configure filters and start a randomized practice session
        </p>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '24px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Subject */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '7px', letterSpacing: '0.05em' }}>
              SUBJECT
            </label>
            <select
              value={filters.subjectId}
              onChange={e => setFilters({ ...filters, subjectId: e.target.value, topicId: '' })}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-hover)'}
            >
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '7px', letterSpacing: '0.05em' }}>
              TOPIC
            </label>
            <select
              value={filters.topicId}
              onChange={e => setFilters({ ...filters, topicId: e.target.value })}
              disabled={!filters.subjectId}
              style={{ ...inputStyle, opacity: filters.subjectId ? 1 : 0.5 }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-hover)'}
            >
              <option value="">All Topics</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.05em' }}>
              DIFFICULTY
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['', 'EASY', 'MEDIUM', 'HARD'].map(d => (
                <button
                  key={d}
                  onClick={() => setFilters({ ...filters, difficulty: d })}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                    border: filters.difficulty === d
                      ? `1px solid ${d ? difficultyColor[d] : '#059669'}`
                      : '1px solid var(--border)',
                    background: filters.difficulty === d
                      ? (d ? difficultyBg[d] : 'var(--accent-glow)')
                      : 'var(--bg-primary)',
                    color: filters.difficulty === d
                      ? (d ? difficultyColor[d] : '#34d399')
                      : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >{d || 'All'}</button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                NUMBER OF QUESTIONS
              </label>
              {loading ? (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Checking...</span>
              ) : availableCount !== null && (
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: availableCount === 0 ? 'var(--red)' : 'var(--green)',
                  background: availableCount === 0 ? 'var(--red-bg)' : 'var(--green-bg)',
                  border: `1px solid ${availableCount === 0 ? '#ef444430' : '#10b98130'}`,
                  borderRadius: '5px', padding: '2px 8px',
                }}>
                  {availableCount} available
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="number" min={1} max={availableCount || 100}
                value={filters.count}
                onChange={e => setFilters({ ...filters, count: Math.max(1, Number(e.target.value)) })}
                style={{ ...inputStyle, cursor: 'text' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-hover)'}
              />
              {availableCount !== null && Number(filters.count) > availableCount && availableCount > 0 && (
                <div style={{
                  marginTop: '7px', padding: '8px 12px', borderRadius: '7px',
                  background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
                  fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  ⚠️ Only {availableCount} question{availableCount > 1 ? 's' : ''} match this filter — will start with {availableCount}.
                </div>
              )}
              {availableCount === 0 && (
                <div style={{
                  marginTop: '7px', padding: '8px 12px', borderRadius: '7px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  ❌ No questions match this filter. Try changing subject, topic, or difficulty.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={starting || availableCount === 0}
            style={{
              background: availableCount === 0
                ? 'var(--bg-hover)'
                : 'linear-gradient(135deg, #059669, #047857)',
              color: availableCount === 0 ? 'var(--text-muted)' : '#fff',
              border: 'none', borderRadius: '10px', padding: '13px 24px',
              fontSize: '15px', fontWeight: '700', width: '100%',
              cursor: availableCount === 0 ? 'not-allowed' : 'pointer',
              boxShadow: availableCount !== 0 ? '0 0 24px var(--accent-glow)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {starting ? '⏳ Starting...' : availableCount === 0 ? 'No Questions Available' : `Start Practice → ${cappedCount > 0 ? `(${cappedCount} Questions)` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Exam Screen ───────────────────────────────────────────────────────────────
function ExamScreen({ test, onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const q = test.questions[current]
  const answered = Object.keys(answers).length
  const total = test.totalQuestions

  const handleSubmit = async () => {
    setSubmitting(true)
    const answerList = test.questions
      .map(q => ({ questionId: q.id, selectedOptionId: answers[q.id] ?? null }))
      .filter(a => a.selectedOptionId !== null)
    await submitTest(test.testAttemptId, { answers: answerList })
    onSubmit(test.testAttemptId)
  }

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)', animation: 'fadeIn 0.3s ease' }}>
      {/* Left Panel — Question Map */}
      <div style={{
        width: '200px', flexShrink: 0,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '16px', overflowY: 'auto',
      }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--green-bg)', borderRadius: '8px', padding: '8px 4px' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--green)' }}>{answered}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Done</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--bg-hover)', borderRadius: '8px', padding: '8px 4px' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-secondary)' }}>{total - answered}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Left</div>
          </div>
        </div>

        <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>
          QUESTION MAP
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
          {test.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                border: i === current ? '2px solid #059669' : '1px solid var(--border)',
                background: i === current ? 'var(--accent-glow)' : answers[test.questions[i].id] ? 'var(--green-bg)' : 'var(--bg-primary)',
                color: i === current ? '#34d399' : answers[test.questions[i].id] ? 'var(--green)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.1s',
              }}
            >{i + 1}</button>
          ))}
        </div>

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[{ c: 'var(--green)', bg: 'var(--green-bg)', label: 'Answered' }, { c: 'var(--text-muted)', bg: 'var(--bg-primary)', label: 'Unanswered' }].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '3px', background: item.bg, border: `1px solid ${item.c}40` }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Question Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
        {/* Header bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '12px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Question {current + 1} / {total}
            </span>
            <DifficultyBadge d={q.difficulty} />
            <span style={{
              fontSize: '11px', background: 'var(--bg-hover)', color: 'var(--text-muted)',
              borderRadius: '5px', padding: '2px 8px',
            }}>{q.topicName}</span>
          </div>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '120px', height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
              <div style={{ width: `${(answered / total) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {answered}/{total} done
            </span>
          </div>
        </div>

        {/* Question card */}
        <div style={{
          flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '28px', overflowY: 'auto',
        }}>
          <p style={{
            fontSize: '16px', color: 'var(--text-primary)', lineHeight: '1.75',
            marginBottom: '28px', whiteSpace: 'pre-wrap',
            fontFamily: q.text.includes('\n') ? 'var(--mono)' : 'inherit',
          }}>
            {q.text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === opt.id
              const letter = ['A', 'B', 'C', 'D'][oi]
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '14px 18px', borderRadius: '10px', cursor: 'pointer',
                    border: selected ? '1.5px solid #059669' : '1px solid var(--border)',
                    background: selected ? 'rgba(5,150,105,0.08)' : 'var(--bg-primary)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-hover)' } }}
                  onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-primary)' } }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '6px', flexShrink: 0,
                    background: selected ? '#059669' : 'var(--bg-hover)',
                    border: `1px solid ${selected ? '#059669' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                    color: selected ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}>{letter}</div>
                  <input
                    type="radio" name={`q-${q.id}`} value={opt.id}
                    checked={selected}
                    onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', fontFamily: 'inherit' }}>
                    {opt.text}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '12px 18px',
        }}>
          <button
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            style={{
              background: 'var(--bg-hover)', border: '1px solid var(--border)',
              color: current === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
              borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: '600',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >← Previous</button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-muted)', borderRadius: '8px', padding: '9px 16px',
                fontSize: '13px', cursor: 'pointer',
              }}
            >Cancel</button>
            {current === total - 1 ? (
              <button
                onClick={handleSubmit} disabled={submitting}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  border: 'none', color: '#fff', borderRadius: '8px',
                  padding: '9px 24px', fontSize: '13px', fontWeight: '700',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0 20px var(--accent-glow)',
                }}
              >{submitting ? 'Submitting...' : '✓ Submit Test'}</button>
            ) : (
              <button
                onClick={() => setCurrent(c => Math.min(total - 1, c + 1))}
                style={{
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  border: 'none', color: '#fff', borderRadius: '8px',
                  padding: '9px 20px', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer',
                }}
              >Next →</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Root Component ─────────────────────────────────────────────────────────────
export default function MCQPractice() {
  const [test, setTest] = useState(null)
  const navigate = useNavigate()

  if (test) {
    return (
      <ExamScreen
        test={test}
        onSubmit={(id) => navigate(`/app/results/${id}`)}
        onCancel={() => setTest(null)}
      />
    )
  }
  return <ConfigScreen onStart={setTest} />
}