import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.username?.[0]?.toUpperCase() || '?'
  const colors = ['#059669', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const color = colors[initials.charCodeAt(0) % colors.length]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header style={{
      background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user?.college && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '4px 10px',
            fontSize: '12px', color: 'var(--text-secondary)',
          }}>
            <span style={{ fontSize: '13px' }}>🏛</span>
            <span>{user.college}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {user?.username}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--accent-light)', letterSpacing: '0.05em' }}>
            {user?.role?.replace('ROLE_', '')}
          </div>
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: '700', color: 'white',
          border: '2px solid rgba(255,255,255,0.1)',
          boxShadow: `0 0 12px ${color}40`,
        }}>{initials}</div>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent', border: '1px solid var(--border-hover)',
            color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '6px',
            fontSize: '12px', fontWeight: '500', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444' }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border-hover)'; e.target.style.color = 'var(--text-muted)' }}
        >Logout</button>
      </div>
    </header>
  )
}