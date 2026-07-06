import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

const companies = ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Cognizant', 'Accenture', 'HCL', 'Capgemini']
const stats = [
  { value: '356+', label: 'Practice Questions' },
  { value: '6', label: 'Company Mock Tests' },
  { value: '9', label: 'Subjects Covered' },
  { value: '100%', label: 'Free Forever' },
]
const features = [
  {
    icon: '⚡',
    title: 'Randomized Practice',
    desc: 'Questions served in random order every time — no memorizing patterns.',
    color: '#f59e0b',
  },
  {
    icon: '🏢',
    title: 'Company Mock Tests',
    desc: 'Simulated tests for TCS, Infosys, Wipro, Amazon, Cognizant & Accenture.',
    color: '#3b82f6',
  },
  {
    icon: '📊',
    title: 'Smart Dashboard',
    desc: 'Track accuracy, streaks, weak topics, and progress across all subjects.',
    color: '#10b981',
  },
  {
    icon: '🏆',
    title: 'College Leaderboard',
    desc: 'Compete with peers from your college and across India.',
    color: '#059669',
  },
  {
    icon: '🎯',
    title: 'Adaptive Difficulty',
    desc: 'Filter by Easy / Medium / Hard and specific topics to target weak areas.',
    color: '#ef4444',
  },
  {
    icon: '📝',
    title: 'Detailed Explanations',
    desc: 'Every answer comes with a full explanation to learn from mistakes.',
    color: '#10b981',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: '64px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>⚡</div>
          <span style={{ fontWeight: '800', fontSize: '20px', color: 'var(--text-primary)' }}>
            Prep<span style={{ color: '#059669' }}>Edge</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent', border: '1px solid var(--border-hover)',
              color: 'var(--text-secondary)', borderRadius: '8px',
              padding: '8px 20px', fontSize: '14px', fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#059669'; e.target.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border-hover)'; e.target.style.color = 'var(--text-secondary)' }}
          >Log in</button>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              border: 'none', color: '#fff', borderRadius: '8px',
              padding: '8px 20px', fontSize: '14px', fontWeight: '600',
              boxShadow: '0 0 20px var(--accent-glow)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center', padding: '100px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(5,150,105,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--accent-dim)', border: '1px solid rgba(5,150,105,0.25)',
          borderRadius: '100px', padding: '6px 16px', marginBottom: '28px',
          fontSize: '13px', color: '#34d399',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          India's Premier Placement Prep Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 68px)',
          fontWeight: '800', lineHeight: '1.1',
          color: 'var(--text-primary)', maxWidth: '800px', margin: '0 auto 20px',
        }}>
          Crack Your Placement<br />
          <span style={{
            background: 'linear-gradient(135deg, #059669, #34d399)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>with Confidence</span>
        </h1>

        <p style={{
          fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '560px',
          margin: '0 auto 40px', lineHeight: '1.7',
        }}>
          Practice 356+ MCQs, take company-specific mock tests, and track your progress — built specifically for Indian engineering students.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              border: 'none', color: '#fff', borderRadius: '10px',
              padding: '14px 32px', fontSize: '16px', fontWeight: '700',
              boxShadow: '0 0 30px var(--accent-glow)',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Start Practicing Free →
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 32px', fontSize: '16px', fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            Sign in
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 24px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '24px',
              textAlign: 'center',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(5,150,105,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Companies */}
      <section style={{ padding: '0 24px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
          Mock Tests Available For
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {companies.map((c) => (
            <div key={c} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 18px',
              fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)',
            }}>{c}</div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 24px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Everything you need to get placed
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Built from the ground up for Indian engineering campus placements
          </p>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '24px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '50'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '10px',
                background: f.color + '15', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '22px', marginBottom: '14px',
              }}>{f.icon}</div>
              <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '80px 24px',
        borderTop: '1px solid var(--border)',
        background: 'linear-gradient(180deg, var(--bg-primary), rgba(5,150,105,0.04))',
      }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Ready to crack your placement?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
          Join thousands of students preparing smarter with PrepEdge.
        </p>
        <button
          onClick={() => navigate('/register')}
          style={{
            background: 'linear-gradient(135deg, #059669, #047857)',
            border: 'none', color: '#fff', borderRadius: '10px',
            padding: '14px 36px', fontSize: '16px', fontWeight: '700',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}
        >Create Free Account →</button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--text-muted)', fontSize: '13px',
      }}>
        <span>© 2026 PrepEdge. Built for Indian engineering students.</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['⚡', 'PrepEdge'].map((t, i) => <span key={i} style={{ color: i === 1 ? '#059669' : 'inherit' }}>{t}</span>)}
        </div>
      </footer>
    </div>
  )
}
