import { useEffect, useState } from 'react'
import { getLeaderboard } from '../api/leaderboardApi'
import { useAuth } from '../context/AuthContext'

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }
const rankColor = r => r === 1 ? '#f59e0b' : r === 2 ? '#94a3b8' : r === 3 ? '#cd7c2f' : 'var(--text-muted)'
const avatarColors = ['#059669', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#10b981', '#ec4899']
const getAvatarColor = name => avatarColors[(name?.charCodeAt(0) ?? 0) % avatarColors.length]

function AccuracyBar({ pct }) {
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '72px', height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: '3px',
        }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: '600', color }}>{pct}%</span>
    </div>
  )
}

export default function Leaderboard() {
  const [data, setData] = useState(null)
  const [filter, setFilter] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchData = async (col) => {
    setLoading(true)
    try {
      const res = await getLeaderboard(col)
      setData(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData('') }, [])

  const handleFilter = () => { setFilter(inputVal); fetchData(inputVal) }
  const handleReset = () => { setInputVal(''); setFilter(''); fetchData('') }

  const cur = data?.currentUserEntry
  const curAccColor = cur ? (cur.accuracyPercentage >= 70 ? '#10b981' : cur.accuracyPercentage >= 45 ? '#f59e0b' : '#ef4444') : '#059669'

  return (
    <div style={{ maxWidth: '960px', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
          🏆 Leaderboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Top performers {filter ? `from "${filter}"` : 'across all colleges'}
        </p>
      </div>

      {/* My Rank Card */}
      {cur && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(4,120,87,0.08))',
          border: '1px solid rgba(5,150,105,0.3)',
          borderRadius: '14px', padding: '20px 24px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: `linear-gradient(135deg, #059669, #047857)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '800', color: 'white',
              boxShadow: '0 0 20px var(--accent-glow)',
            }}>{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Your Ranking
              </div>
              <div style={{ fontSize: '12px', color: '#34d399' }}>
                {cur.college || 'No college set'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '28px' }}>
            {[
              { label: 'Rank', value: `#${cur.rank}`, color: cur.rank <= 3 ? rankColor(cur.rank) : '#059669' },
              { label: 'Score', value: cur.score, color: '#059669' },
              { label: 'Accuracy', value: `${cur.accuracyPercentage}%`, color: curAccColor },
              { label: 'Attempted', value: cur.totalAttempts, color: 'var(--text-primary)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px 18px', marginBottom: '16px',
        display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Filter by college name (e.g. IIT, NIT, VIT)..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFilter()}
            style={{
              width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-hover)',
              borderRadius: '8px', padding: '9px 14px 9px 36px', fontSize: '13px',
              color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-hover)'}
          />
        </div>
        <button
          onClick={handleFilter}
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)', border: 'none',
            color: '#fff', borderRadius: '8px', padding: '9px 20px',
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          }}
        >Search</button>
        {filter && (
          <button
            onClick={handleReset}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', borderRadius: '8px', padding: '9px 16px',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#ef444460'; e.target.style.color = '#ef4444' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
          >✕ Clear</button>
        )}
      </div>

      {/* Rankings table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {filter ? `Results for "${filter}"` : 'Global Rankings'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {data?.totalUsers ?? 0} users ranked
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton" style={{ height: 52, marginBottom: 8, borderRadius: 8 }} />
            ))}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.015)' }}>
                {['Rank', 'Student', 'College', 'Score', 'Correct', 'Accuracy'].map(h => (
                  <th key={h} style={{
                    padding: '11px 18px', textAlign: 'left', fontSize: '10px',
                    fontWeight: '700', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.entries?.map((entry) => {
                const isTop3 = entry.rank <= 3
                const aColor = getAvatarColor(entry.username)
                return (
                  <tr
                    key={entry.rank}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: entry.isCurrentUser ? 'rgba(5,150,105,0.06)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!entry.isCurrentUser) e.currentTarget.style.background = 'var(--bg-hover)' }}
                    onMouseLeave={e => { if (!entry.isCurrentUser) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Rank */}
                    <td style={{ padding: '14px 18px' }}>
                      {isTop3 ? (
                        <span style={{ fontSize: '20px' }}>{MEDAL[entry.rank]}</span>
                      ) : (
                        <span style={{
                          fontSize: '13px', fontWeight: '700',
                          color: entry.isCurrentUser ? '#34d399' : 'var(--text-muted)',
                          background: entry.isCurrentUser ? 'var(--accent-glow)' : 'transparent',
                          border: entry.isCurrentUser ? '1px solid rgba(5,150,105,0.3)' : 'none',
                          borderRadius: '5px', padding: entry.isCurrentUser ? '2px 8px' : '0',
                        }}>#{entry.rank}</span>
                      )}
                    </td>

                    {/* Student */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${aColor}, ${aColor}88)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: '800', color: 'white',
                          boxShadow: entry.isCurrentUser ? `0 0 10px ${aColor}40` : 'none',
                        }}>{entry.username?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                            {entry.username}
                            {entry.isCurrentUser && (
                              <span style={{
                                fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em',
                                background: '#059669', color: 'white',
                                padding: '2px 7px', borderRadius: '4px',
                              }}>YOU</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* College */}
                    <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {entry.college ? (
                        <span style={{
                          background: 'var(--bg-hover)', border: '1px solid var(--border)',
                          borderRadius: '5px', padding: '2px 8px', fontSize: '11px',
                        }}>{entry.college}</span>
                      ) : '—'}
                    </td>

                    {/* Score */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: '15px', fontWeight: '800',
                        color: isTop3 ? rankColor(entry.rank) : '#059669',
                      }}>{entry.score}</span>
                    </td>

                    {/* Correct */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--green)' }}>
                        {entry.correctAttempts}
                      </span>
                    </td>

                    {/* Accuracy */}
                    <td style={{ padding: '14px 18px' }}>
                      <AccuracyBar pct={entry.accuracyPercentage} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!loading && data?.entries?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏁</div>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-secondary)' }}>
              {filter ? `No results for "${filter}"` : 'No rankings yet'}
            </div>
            <div>Start practicing to appear on the leaderboard!</div>
          </div>
        )}
      </div>
    </div>
  )
}