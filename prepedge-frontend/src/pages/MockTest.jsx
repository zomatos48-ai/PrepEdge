import { useEffect, useState } from 'react'
import { getCompanies, getMockTests, startMockTest } from '../api/mockTestApi'
import { useNavigate } from 'react-router-dom'

const companyColors = {
  tcs: '#0052cc', infosys: '#007cc3', wipro: '#6c2d91',
  amazon: '#ff9900', cognizant: '#0033a0', accenture: '#a100ff',
  default: '#059669',
}

function CompanyInitial({ name }) {
  const slug = name.toLowerCase().split(' ')[0]
  const color = companyColors[slug] || companyColors.default
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '10px', flexShrink: 0,
      background: color + '18', border: `1px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '18px', fontWeight: '800', color: color,
    }}>{name[0]}</div>
  )
}

export default function MockTest() {
  const [companies, setCompanies] = useState([])
  const [tests, setTests] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [loading, setLoading] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getCompanies().then(r => setCompanies(r.data))
    getMockTests().then(r => setTests(r.data))
  }, [])

  const handleCompanyClick = (company) => {
    const next = selectedCompany?.id === company.id ? null : company
    setSelectedCompany(next)
    getMockTests(next?.id).then(r => setTests(r.data))
  }

  const handleStart = async (testId) => {
    setLoading(testId)
    try {
      const res = await startMockTest(testId)
      navigate(`/app/mock-tests/${res.data.mockTestAttemptId}/exam`, { state: { attemptData: res.data } })
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start test')
    } finally { setLoading(null) }
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Company Mock Tests
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Simulate real placement exam patterns from top MNCs and service companies
        </p>
      </div>

      {/* Company filter pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={() => { setSelectedCompany(null); getMockTests().then(r => setTests(r.data)) }}
          style={{
            padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer',
            border: !selectedCompany ? '1px solid #059669' : '1px solid var(--border)',
            background: !selectedCompany ? 'var(--accent-glow)' : 'var(--bg-card)',
            color: !selectedCompany ? '#34d399' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
        >All Companies</button>
        {companies.map(c => (
          <button
            key={c.id}
            onClick={() => handleCompanyClick(c)}
            style={{
              padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer',
              border: selectedCompany?.id === c.id ? '1px solid #059669' : '1px solid var(--border)',
              background: selectedCompany?.id === c.id ? 'var(--accent-glow)' : 'var(--bg-card)',
              color: selectedCompany?.id === c.id ? '#34d399' : 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
          >{c.name}</button>
        ))}
      </div>

      {/* Test cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {tests.map(t => (
          <div
            key={t.id}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '22px',
              display: 'flex', flexDirection: 'column', gap: '14px',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(5,150,105,0.35)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <CompanyInitial name={t.companyName} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: '11px', fontWeight: '700', color: '#34d399',
                  background: 'var(--accent-glow)', border: '1px solid rgba(5,150,105,0.2)',
                  padding: '2px 8px', borderRadius: '4px',
                }}>{t.companyName}</span>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px', lineHeight: '1.3' }}>
                  {t.title}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {t.description}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'var(--bg-hover)', borderRadius: '6px', padding: '5px 10px',
                fontSize: '12px', color: 'var(--text-secondary)',
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                {t.durationMinutes} min
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'var(--bg-hover)', borderRadius: '6px', padding: '5px 10px',
                fontSize: '12px', color: 'var(--text-secondary)',
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                {t.totalQuestions} questions
              </div>
            </div>

            <button
              onClick={() => handleStart(t.id)} disabled={loading === t.id}
              style={{
                background: loading === t.id ? 'var(--bg-hover)' : 'linear-gradient(135deg, #059669, #047857)',
                color: loading === t.id ? 'var(--text-muted)' : '#fff',
                border: 'none', borderRadius: '9px', padding: '11px',
                fontSize: '13px', fontWeight: '700', cursor: loading === t.id ? 'not-allowed' : 'pointer',
                marginTop: 'auto', boxShadow: loading === t.id ? 'none' : '0 0 16px var(--accent-glow)',
                transition: 'all 0.2s',
              }}
            >{loading === t.id ? '⏳ Starting...' : 'Start Test →'}</button>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          color: 'var(--text-muted)', fontSize: '14px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontWeight: '600', marginBottom: '6px' }}>No mock tests available</div>
          <div>Check back soon — new company tests are added regularly.</div>
        </div>
      )}
    </div>
  )
}