import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMockTestHistory } from '../api/mockTestApi'
import { getTestHistory } from '../api/questionApi'

/* ── helpers ───────────────────────────────────────────── */
const companyColors = {
  tcs: '#0052cc', infosys: '#007cc3', wipro: '#6c2d91',
  amazon: '#ff9900', cognizant: '#0033a0', accenture: '#a100ff',
  default: '#059669',
}
function compColor(slug) {
  return companyColors[slug?.toLowerCase().split(' ')[0]] || companyColors.default
}
function scoreColor(pct) {
  return pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
}

/* ── small components ──────────────────────────────────── */
function Ring({ pct, size = 60 }) {
  const col = scoreColor(pct)
  const r = size / 2 - 7
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-hover)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size < 70 ? '12px' : '14px', fontWeight: '800', color: col }}>{pct}%</span>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '18px 22px',
      display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '140px',
    }}>
      <div style={{ width: 42, height: 42, borderRadius: '11px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '22px', fontWeight: '800', color }}>{value}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  )
}

/* ── subject colour palette ────────────────────────────── */
const subjectColors = ['#059669', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']
function subjectColor(name, idx) {
  return subjectColors[idx % subjectColors.length]
}

/* ══════════════════════════════════════════════════════════
   MOCK TEST HISTORY TAB
══════════════════════════════════════════════════════════ */
function MockTestTab({ navigate }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMockTestHistory().then(r => setHistory(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading mock test history…" />

  const completed = history.filter(h => h.status !== 'IN_PROGRESS')
  const avgScore = completed.length
    ? Math.round(completed.reduce((s, h) => s + h.percentage, 0) / completed.length) : 0
  const bestScore = completed.length
    ? Math.round(Math.max(...completed.map(h => h.percentage))) : 0

  // company aggregation
  const companyStats = {}
  completed.forEach(h => {
    if (!companyStats[h.companyName]) companyStats[h.companyName] = { total: 0, tests: 0, slug: h.companySlug }
    companyStats[h.companyName].total += h.percentage
    companyStats[h.companyName].tests += 1
  })

  const statusLabel = {
    SUBMITTED: { text: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    TIMED_OUT: { text: 'Timed Out', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    IN_PROGRESS: { text: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  }

  if (history.length === 0) return (
    <Empty icon="📝" title="No mock tests taken yet" sub="Take your first mock test to see your history here"
      action={() => navigate('/app/mock-tests')} actionLabel="Start a Mock Test →" />
  )

  return (
    <>
      {/* stats */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <StatCard icon="📋" label="Total Taken" value={history.length} color="var(--text-primary)" bg="var(--bg-hover)" />
        <StatCard icon="✅" label="Completed" value={completed.length} color="#10b981" bg="rgba(16,185,129,0.1)" />
        <StatCard icon="📈" label="Avg Score" value={`${avgScore}%`} color={scoreColor(avgScore)} bg={`${scoreColor(avgScore)}18`} />
        <StatCard icon="🏆" label="Best Score" value={`${bestScore}%`} color="#f59e0b" bg="rgba(245,158,11,0.1)" />
      </div>

      {/* company bar chart */}
      {Object.keys(companyStats).length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', marginBottom: '22px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Performance by Company</div>
          {Object.entries(companyStats).map(([company, stats]) => {
            const avg = Math.round(stats.total / stats.tests)
            const cc = compColor(stats.slug)
            return (
              <div key={company} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div style={{ width: 30, height: 30, borderRadius: '8px', background: cc + '18', border: `1px solid ${cc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: cc, flexShrink: 0 }}>{company[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{company}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stats.tests} test{stats.tests > 1 ? 's' : ''} · avg {avg}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${avg}%`, background: scoreColor(avg), borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* attempt list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>All Attempts</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{history.length} attempt{history.length !== 1 ? 's' : ''}</div>
        </div>
        {history.map((h, idx) => {
          const pct = Math.round(h.percentage)
          const cc = compColor(h.companySlug)
          const st = statusLabel[h.status] || statusLabel.SUBMITTED
          const isCompleted = h.status !== 'IN_PROGRESS'
          const date = new Date(h.submittedAt || h.startedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          return (
            <div key={h.attemptId}
              onClick={() => isCompleted && navigate(`/app/mock-results/${h.attemptId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 22px', borderBottom: idx < history.length - 1 ? '1px solid var(--border)' : 'none', cursor: isCompleted ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={e => isCompleted && (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: cc + '18', border: `1px solid ${cc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: cc, flexShrink: 0 }}>{h.companyName[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.mockTestTitle}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.companyName}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{date}</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: st.color, background: st.bg, border: `1px solid ${st.color}40`, borderRadius: '5px', padding: '1px 6px' }}>{st.text}</span>
                </div>
              </div>
              {isCompleted ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: scoreColor(pct) }}>{h.score}/{h.totalQuestions}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>correct</div>
                  </div>
                  <Ring pct={pct} size={54} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>›</div>
                </div>
              ) : (
                <button onClick={e => { e.stopPropagation(); navigate(`/app/mock-tests/${h.attemptId}/exam`) }}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}>
                  Resume →
                </button>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   TOPIC PRACTICE HISTORY TAB
══════════════════════════════════════════════════════════ */
function TopicPracticeTab({ navigate }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState(null)

  useEffect(() => {
    getTestHistory().then(r => setHistory(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading practice history…" />

  const completed = history.filter(h => h.status === 'SUBMITTED')

  if (history.length === 0) return (
    <Empty icon="📚" title="No topic practice sessions yet" sub="Go to MCQ Practice and take a topic test to see your history here"
      action={() => navigate('/app/practice')} actionLabel="Start Practising →" />
  )

  // Stats
  const totalQs = completed.reduce((s, h) => s + h.totalQuestions, 0)
  const totalCorrect = completed.reduce((s, h) => s + (h.score || 0), 0)
  const overallAcc = totalQs ? Math.round(totalCorrect * 100 / totalQs) : 0

  // Group by subject
  const subjectGroups = {}
  history.forEach(h => {
    const sub = h.subjectName || 'General'
    if (!subjectGroups[sub]) subjectGroups[sub] = []
    subjectGroups[sub].push(h)
  })

  // Subject stats
  const subjectStats = Object.entries(subjectGroups).map(([sub, attempts], idx) => {
    const done = attempts.filter(a => a.status === 'SUBMITTED')
    const qs = done.reduce((s, a) => s + a.totalQuestions, 0)
    const correct = done.reduce((s, a) => s + (a.score || 0), 0)
    const acc = qs ? Math.round(correct * 100 / qs) : 0
    return { name: sub, attempts: attempts.length, done: done.length, qs, correct, acc, color: subjectColor(sub, idx), list: attempts }
  })

  const displaySubject = activeSubject || subjectStats[0]?.name

  return (
    <>
      {/* top stats */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <StatCard icon="📚" label="Sessions Taken" value={history.length} color="var(--text-primary)" bg="var(--bg-hover)" />
        <StatCard icon="❓" label="Questions Done" value={totalQs} color="#3b82f6" bg="rgba(59,130,246,0.1)" />
        <StatCard icon="✅" label="Correct Answers" value={totalCorrect} color="#10b981" bg="rgba(16,185,129,0.1)" />
        <StatCard icon="🎯" label="Overall Accuracy" value={`${overallAcc}%`} color={scoreColor(overallAcc)} bg={`${scoreColor(overallAcc)}18`} />
      </div>

      {/* subject accuracy bars */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', marginBottom: '22px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Accuracy by Subject</div>
        {subjectStats.map(ss => (
          <div key={ss.name} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ss.color, flexShrink: 0 }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{ss.name}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ss.correct}/{ss.qs} correct · {ss.acc}%</span>
            </div>
            <div style={{ height: 7, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${ss.acc}%`, background: ss.color, borderRadius: 4, transition: 'width 1.2s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* subject tabs + attempt list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* subject filter pills */}
        <div style={{ display: 'flex', gap: '8px', padding: '16px 22px', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
          {subjectStats.map(ss => (
            <button key={ss.name}
              onClick={() => setActiveSubject(ss.name)}
              style={{
                background: displaySubject === ss.name ? ss.color : 'var(--bg-hover)',
                color: displaySubject === ss.name ? 'white' : 'var(--text-muted)',
                border: `1px solid ${displaySubject === ss.name ? ss.color : 'var(--border)'}`,
                borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
              {ss.name} <span style={{ opacity: 0.7 }}>({ss.attempts})</span>
            </button>
          ))}
        </div>

        {/* attempt rows */}
        {(subjectGroups[displaySubject] || []).map((h, idx) => {
          const pct = h.totalQuestions ? Math.round((h.score || 0) * 100 / h.totalQuestions) : 0
          const isCompleted = h.status === 'SUBMITTED'
          const date = new Date(h.submittedAt || h.startedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          const list = subjectGroups[displaySubject] || []
          const activeColor = subjectStats.find(s => s.name === displaySubject)?.color || '#059669'
          return (
            <div key={h.testAttemptId}
              onClick={() => isCompleted && navigate(`/app/results/${h.testAttemptId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '15px 22px', borderBottom: idx < list.length - 1 ? '1px solid var(--border)' : 'none', cursor: isCompleted ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={e => isCompleted && (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* topic badge */}
              <div style={{ width: 36, height: 36, borderRadius: '9px', background: activeColor + '18', border: `1px solid ${activeColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>📖</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {h.topicName || h.subjectName || 'Practice Session'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {h.topicName && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.subjectName}</span>}
                  {h.topicName && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>·</span>}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{date}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>· {h.totalQuestions} questions</span>
                  {isCompleted
                    ? <span style={{ fontSize: '10px', fontWeight: '600', color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '5px', padding: '1px 6px' }}>Completed</span>
                    : <span style={{ fontSize: '10px', fontWeight: '600', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '5px', padding: '1px 6px' }}>In Progress</span>
                  }
                </div>
              </div>
              {isCompleted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: scoreColor(pct) }}>{h.score}/{h.totalQuestions}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>correct</div>
                  </div>
                  <Ring pct={pct} size={50} />
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>›</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ── shared tiny components ────────────────────────────── */
function Loader({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 22, height: 22, border: '2px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
        {text}
      </div>
    </div>
  )
}
function Empty({ icon, title, sub, action, actionLabel }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '56px', textAlign: 'center' }}>
      <div style={{ fontSize: '44px', marginBottom: '14px' }}>{icon}</div>
      <div style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '22px' }}>{sub}</div>
      <button onClick={action} style={{ background: 'linear-gradient(135deg,#059669,#047857)', color: 'white', border: 'none', borderRadius: '10px', padding: '11px 26px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>{actionLabel}</button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function MockTestAnalysis() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('mock') // 'mock' | 'topic'

  const tabStyle = active => ({
    background: 'none', border: 'none',
    borderBottom: active ? '2.5px solid #059669' : '2.5px solid transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    padding: '11px 4px', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s',
  })

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          📊 My Analysis
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '5px 0 0' }}>
          Your complete performance history across mock tests and topic practice
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button style={tabStyle(tab === 'mock')} onClick={() => setTab('mock')}>
          🏢 Mock Test History
        </button>
        <button style={tabStyle(tab === 'topic')} onClick={() => setTab('topic')}>
          📚 Topic Practice History
        </button>
      </div>

      {/* Tab content */}
      {tab === 'mock'
        ? <MockTestTab navigate={navigate} />
        : <TopicPracticeTab navigate={navigate} />
      }
    </div>
  )
}
