import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MCQPractice from './pages/MCQPractice'
import MockTest from './pages/MockTest'
import MockTestExam from './pages/MockTestExam'
import Results from './pages/Results'
import MockTestResult from './pages/MockTestResult'
import MockTestAnalysis from './pages/MockTestAnalysis'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected app routes */}
          <Route path="/app" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="practice" element={<MCQPractice />} />
            <Route path="mock-tests" element={<MockTest />} />
            <Route path="mock-tests/:attemptId/exam" element={<MockTestExam />} />
            <Route path="results/:attemptId" element={<Results />} />
            <Route path="mock-results/:attemptId" element={<MockTestResult />} />
            <Route path="mock-analysis" element={<MockTestAnalysis />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>

          {/* Simple legacy redirects (no dynamic params) */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/practice" element={<Navigate to="/app/practice" replace />} />
          <Route path="/mock-tests" element={<Navigate to="/app/mock-tests" replace />} />
          <Route path="/leaderboard" element={<Navigate to="/app/leaderboard" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}