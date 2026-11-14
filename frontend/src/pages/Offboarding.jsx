
import { useEffect, useState } from 'react'
import { Plus, ShieldCheck, Laptop, KeyRound } from 'lucide-react'

export default function Offboarding() {
  const [cases, setCases] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caseResponse, employeeResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/offboarding/'),
          fetch('http://127.0.0.1:8000/api/employees/')
        ])

        if (!caseResponse.ok || !employeeResponse.ok) {
          throw new Error('Unable to load offboarding data.')
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

  const upcomingExits = cases.filter((item) => {
    if (!item.exit_date) return false

    const days = (new Date(`${item.exit_date}T00:00:00`) - new Date()) / 86400000
    return days >= 0 && days <= 30
  })

  const getStatus = (status) => {
    const value = (status || 'unknown').toLowerCase()

    return {
      label: value.replaceAll('_', ' '),
      className: value === 'completed' ? 'active' : 'offboarding'
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EMPLOYEE LIFECYCLE</div>
          <h1>Offboarding</h1>
          <p>Manage employee exits, access removal, and asset recovery.</p>
        </div>
        <button className="primary-button">
          <Plus size={16} /> Start offboarding
        </button>
      </div>

      <div className="stats-grid compact-stats">
        <div className="stat-card">
          <span className="simple-stat-label">Active cases</span>
          <div className="stat-value">{activeCases.length}</div>
          <span className="muted">Currently in progress</span>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Upcoming exits</span>
          <div className="stat-value">{upcomingExits.length}</div>
          <span className="muted">Next 30 days</span>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Total cases</span>
          <div className="stat-value">{cases.length}</div>
          <span className="muted">All offboarding records</span>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Completed</span>
          <div className="stat-value">
            {cases.filter((item) => item.status?.toLowerCase() === 'completed').length}
          </div>
          <span className="muted">Completed exits</span>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-header">
          <div>
            <h2>Offboarding cases</h2>
            <p>Keep exit activities coordinated and auditable.</p>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Loading offboarding cases...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : cases.length === 0 ? (
            <div className="empty-state">No offboarding cases found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DEPARTMENT</th>
                  <th>LAST WORKING DAY</th>
                  <th>REASON</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {cases.map((item) => {
                  const employee = getEmployee(item.employee_id)
                  const name = getEmployeeName(employee)
                  const status = getStatus(item.status)

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="table-person">
                          <div className="avatar avatar-green">
                            {name.split(' ').map((part) => part[0]).join('')}
                          </div>
                          <div>
                            <strong>{name}</strong>
                            <span>Case #{item.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {employee?.department_id
                          ? `Department ${employee.department_id}`
                          : '-'}
                      </td>

                      <td>{formatDate(item.exit_date)}</td>
                      <td>{item.reason || '-'}</td>

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

      <div className="feature-row">
        <div className="feature-card">
          <ShieldCheck />
          <strong>Access revocation</strong>
          <p>Track system access removal and approvals.</p>
        </div>

        <div className="feature-card">
          <Laptop />
          <strong>Asset recovery</strong>
          <p>Record equipment return and condition.</p>
        </div>

        <div className="feature-card">
          <KeyRound />
          <strong>Exit checklist</strong>
          <p>Coordinate final steps across teams.</p>
        </div>
      </div>
    </>
  )
}
