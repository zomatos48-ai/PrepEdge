import { useEffect, useState } from 'react'
import { getDashboardStats } from '../api/dashboardApi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function StatCard({ label, value, icon, color, bg, subtitle }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', padding: '20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: '14px',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: '9px',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
        }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontSize: '32px', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{subtitle}</div>}
      </div>
    </div>
  )
}

function TopicBar({ topic, isWeak }) {
  const pct = topic.accuracyPercentage
  const color = isWeak
    ? (pct < 30 ? '#ef4444' : '#f59e0b')
    : (pct > 85 ? '#10b981' : '#3b82f6')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{topic.topicName}</span>
        <span style={{
          fontSize: '12px', fontWeight: '700', color,
          background: color + '15', border: `1px solid ${color}30`,
          borderRadius: '5px', padding: '1px 8px',
        }}>{pct}%</span>
      </div>
      <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: '3px', transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
      <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 36, width: '40%' }} />
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const accuracy = stats?.overallAccuracy ?? 0
  const accuracyColor = accuracy >= 75 ? '#10b981' : accuracy >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ maxWidth: '1100px', animation: 'fadeIn 0.3s ease' }}>
      {/* Welcome header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(5,150,105,0.07), rgba(59,130,246,0.04))',
        border: '1px solid rgba(5,150,105,0.15)',
        borderRadius: '16px', padding: '24px 28px', marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 2px 12px rgba(5,150,105,0.08)',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {greeting()}, <span style={{ color: '#34d399' }}>{user?.username}</span> 👋
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {user?.college ? `🏛 ${user.college} · ` : ''}
            Your placement prep dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => navigate('/app/practice')}
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              border: 'none', color: '#fff', borderRadius: '9px',
              padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >Start Practice →</button>
          <button
            onClick={() => navigate('/app/mock-tests')}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', borderRadius: '9px',
              padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = '#34d399' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >Mock Tests</button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        {loading ? (
          [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Attempts" value={stats?.totalAttempts ?? 0} icon="📝" color="#059669" bg="rgba(5,150,105,0.12)" subtitle="Questions attempted" />
            <StatCard label="Correct Answers" value={stats?.correctAttempts ?? 0} icon="✅" color="#10b981" bg="rgba(16,185,129,0.12)" subtitle="Right first time" />
            <StatCard label="Accuracy" value={`${accuracy}%`} icon="🎯" color={accuracyColor} bg={accuracyColor + '18'} subtitle={accuracy >= 70 ? 'Excellent!' : accuracy >= 50 ? 'Keep going' : 'Needs work'} />
            <StatCard label="Tests Taken" value={stats?.totalTestsTaken ?? 0} icon="🏆" color="#3b82f6" bg="rgba(59,130,246,0.12)" subtitle="Practice sessions" />
          </>
        )}
      </div>

      {/* Topics + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {/* Weak Topics */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '7px', background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚠️</div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Weak Topics</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Focus here to improve</p>
            </div>
          </div>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 10, borderRadius: 6 }} />)
          ) : stats?.weakTopics?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📚</div>
              Practice more to identify weak areas
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats?.weakTopics?.slice(0, 5).map(t => <TopicBar key={t.topicName} topic={t} isWeak={true} />)}
            </div>
          )}
        </div>

        {/* Strong Topics */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '7px', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>💪</div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Strong Topics</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Your best performance areas</p>
            </div>
          </div>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 10, borderRadius: 6 }} />)
          ) : stats?.strongTopics?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌟</div>
              Keep practicing to build strengths
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats?.strongTopics?.slice(0, 5).map(t => <TopicBar key={t.topicName} topic={t} isWeak={false} />)}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '7px', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚡</div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Recent Activity</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Last 10 attempts</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/app/practice')}
            style={{
              background: 'var(--accent-glow)', border: '1px solid rgba(5,150,105,0.3)',
              color: '#34d399', borderRadius: '7px', padding: '6px 14px',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}
          >+ Practice Now</button>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 6 }} />)}
          </div>
        ) : stats?.recentActivity?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>No activity yet</div>
            <div>Start practicing to see your history here!</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                {['Question', 'Subject', 'Topic', 'Result'].map(h => (
                  <th key={h} style={{
                    padding: '10px 18px', textAlign: 'left', fontSize: '10px',
                    fontWeight: '700', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats?.recentActivity?.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 18px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '360px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.questionText}
                    </div>
                  </td>
                  <td style={{ padding: '12px 18px', fontSize: '12px', color: 'var(--text-muted)' }}>{a.subjectName}</td>
                  <td style={{ padding: '12px 18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{
                      background: 'var(--bg-hover)', border: '1px solid var(--border)',
                      borderRadius: '5px', padding: '2px 8px', fontSize: '11px',
                    }}>{a.topicName}</span>
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '5px',
                      background: a.correct ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: a.correct ? 'var(--green)' : 'var(--red)',
                      border: `1px solid ${a.correct ? '#10b98130' : '#ef444430'}`,
                    }}>
                      {a.correct ? '✓ Correct' : '✗ Wrong'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}