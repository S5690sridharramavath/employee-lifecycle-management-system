
import { useEffect, useState } from 'react'
import { Plus, Search, Download, MoreHorizontal } from 'lucide-react'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/employees/')

        if (!response.ok) {
          throw new Error('Unable to load employees from the backend.')
        }

        const data = await response.json()

        const formattedEmployees = data.map((employee) => ({
          id: employee.employee_code || employee.id,
          name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
          role: employee.job_title || '-',
          department: employee.department_id
            ? `Department ${employee.department_id}`
            : '-',
          manager: employee.manager_id
            ? `Manager #${employee.manager_id}`
            : '-',
          joined: employee.date_of_joining
            ? new Date(employee.date_of_joining).toLocaleDateString()
            : '-',
          status: employee.status
            ? employee.status.charAt(0).toUpperCase() + employee.status.slice(1)
            : 'Unknown'
        }))

        setEmployees(formattedEmployees)
        setError('')
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const filtered = employees.filter((employee) =>
    (filter === 'All' || employee.status.toLowerCase() === filter.toLowerCase()) &&
    `${employee.name} ${employee.role} ${employee.department} ${employee.id}`
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEOPLE DIRECTORY</div>
          <h1>Employees</h1>
          <p>View and manage everyone in your organisation.</p>
        </div>
        <button className="primary-button">
          <Plus size={16} /> Add employee
        </button>
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees..."
            />
          </label>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Onboarding</option>
            <option>Offboarding</option>
          </select>

          <button className="secondary-button">
            <Download size={15} /> Export
          </button>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Loading employees...</div>
          ) : error ? (
            <div className="empty-state">
              {error}
              <br />
              Check that your backend server is running.
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>EMPLOYEE ID</th>
                    <th>DEPARTMENT</th>
                    <th>MANAGER</th>
                    <th>JOINED DATE</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="table-person">
                          <div className="avatar avatar-blue">
                            {employee.name
                              .split(' ')
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div>
                            <strong>{employee.name}</strong>
                            <span>{employee.role}</span>
                          </div>
                        </div>
                      </td>

                      <td>{employee.id}</td>
                      <td>{employee.department}</td>
                      <td>{employee.manager}</td>
                      <td>{employee.joined}</td>

                      <td>
                        <span className={`status ${employee.status.toLowerCase()}`}>
                          {employee.status}
                        </span>
                      </td>

                      <td>
                        <button className="more-button">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="empty-state">
                  No employees match your search.
                </div>
              )}

              <div className="table-footer">
                Showing {filtered.length} of {employees.length} employees
                <span>Page 1 of 1</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
