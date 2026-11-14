
import { useEffect, useState } from 'react'
import { Plus, UserRoundPlus } from 'lucide-react'

export default function Onboarding() {
  const [cases, setCases] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseResponse, employeeResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/onboarding/'),
          fetch('http://127.0.0.1:8000/api/employees/')
        ])

        if (!caseResponse.ok || !employeeResponse.ok) {
          throw new Error('Unable to load onboarding data.')
        }

        const caseData = await caseResponse.json()
        const employeeData = await employeeResponse.json()

        setCases(caseData)
        setEmployees(employeeData)
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getEmployee = (employeeId) =>
    employees.find((employee) => employee.id === employeeId)

  const getEmployeeName = (employee) =>
    `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim() || 'Unknown employee'

  const formatDate = (date) =>
    date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN') : '-'

  const activeCases = cases.filter(
    (item) => !['completed', 'cancelled'].includes(item.status?.toLowerCase())
  )

  const completedCases = cases.filter(
    (item) => item.status?.toLowerCase() === 'completed'
  )

  const overdueCases = activeCases.filter(
    (item) =>
      item.target_completion_date &&
      new Date(`${item.target_completion_date}T00:00:00`) < new Date(new Date().toDateString())
  )

  const getStatus = (status) => {
    const value = (status || 'unknown').toLowerCase()

    if (value === 'completed') {
      return { label: 'Completed', className: 'active' }
    }

    if (value === 'in_progress') {
      return { label: 'In progress', className: 'onboarding' }
    }

    if (value === 'not_started') {
      return { label: 'Not started', className: 'onboarding' }
    }

    return {
      label: value.replaceAll('_', ' '),
      className: 'onboarding'
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EMPLOYEE LIFECYCLE</div>
          <h1>Onboarding</h1>
          <p>Give every new team member a smooth and consistent start.</p>
        </div>
        <button className="primary-button">
          <Plus size={16} /> Start onboarding
        </button>
      </div>

      <div className="stats-grid compact-stats">
        <div className="stat-card">
          <span className="simple-stat-label">In progress</span>
          <div className="stat-value">{activeCases.length}</div>
          <span className="muted">Active onboarding cases</span>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Completed</span>
          <div className="stat-value">{completedCases.length}</div>
          <span className="muted">Completed onboarding cases</span>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Total cases</span>
          <div className="stat-value">{cases.length}</div>
          <span className="muted">All onboarding records</span>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Overdue cases</span>
          <div className="stat-value">{overdueCases.length}</div>
          <span className="muted">Past target completion date</span>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-header">
          <div>
            <h2>Onboarding cases</h2>
            <p>Track new joiners and their onboarding progress.</p>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Loading onboarding cases...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : cases.length === 0 ? (
            <div className="empty-state">No onboarding cases found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>ROLE</th>
                  <th>START DATE</th>
                  <th>TARGET DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {cases.map((item) => {
                  const employee = getEmployee(item.employee_id)
                  const status = getStatus(item.status)
                  const name = getEmployeeName(employee)

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="table-person">
                          <div className="avatar avatar-orange">
                            {name.split(' ').map((part) => part[0]).join('')}
                          </div>
                          <div>
                            <strong>{name}</strong>
                            <span>Case #{item.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{employee?.job_title || '-'}</td>
                      <td>{formatDate(item.start_date)}</td>
                      <td>{formatDate(item.target_completion_date)}</td>
                      <td>
                        <span className={`status ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="info-strip">
        <UserRoundPlus size={18} />
        <div>
          <strong>Make every first day count</strong>
          <p>Use reusable task templates to keep onboarding consistent across teams.</p>
        </div>
      </div>
    </>
  )
}
