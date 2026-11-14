import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Onboarding from './pages/Onboarding'
import Offboarding from './pages/Offboarding'
import Tasks from './pages/Tasks'
import Approvals from './pages/Approvals'
import Assets from './pages/Assets'
import Reports from './pages/Reports'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Header />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/offboarding" element={<Offboarding />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
