
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskResponse, employeeResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/tasks/'),
          fetch('http://127.0.0.1:8000/api/employees/')
        ])

        if (!taskResponse.ok || !employeeResponse.ok) {
          throw new Error('Unable to load tasks.')
        }

        const taskData = await taskResponse.json()
        const employeeData = await employeeResponse.json()

        setTasks(taskData)
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

  const formatStatus = (status) => {
    const value = (status || 'pending').toLowerCase()

    if (value === 'in_progress') return 'In progress'
    if (value === 'completed') return 'Completed'
    if (value === 'pending') return 'Pending'

    return value.replaceAll('_', ' ')
  }

  const formatDate = (date) =>
    date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN') : '-'

  const rows = tasks.filter((task) => {
    const employee = getEmployee(task.employee_id)
    const employeeName = employee
      ? `${employee.first_name} ${employee.last_name}`
      : ''

    const status = formatStatus(task.status)

    return (
      (filter === 'All' || status.toLowerCase() === filter.toLowerCase()) &&
      `${task.title} ${employeeName} ${task.assigned_to || ''} ${task.category || ''}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  })

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORK MANAGEMENT</div>
          <h1>Tasks</h1>
          <p>Track and coordinate work across employee lifecycle workflows.</p>
        </div>
        <button className="primary-button">＋ Create task</button>
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks..."
            />
          </label>

          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Pending</option>
            <option>In progress</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Loading tasks...</div>
          ) : error ? (
            <div className="empty-state">
              {error}
              <br />
              Check that the backend is running and the Tasks API is available.
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>TASK</th>
                    <th>EMPLOYEE</th>
                    <th>ASSIGNEE</th>
                    <th>DUE DATE</th>
                    <th>CATEGORY</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((task) => {
                    const employee = getEmployee(task.employee_id)
                    const employeeName = employee
                      ? `${employee.first_name} ${employee.last_name}`
                      : `Employee #${task.employee_id}`

                    const status = formatStatus(task.status)

                    return (
                      <tr key={task.id}>
                        <td>
                          <strong>{task.title}</strong>
                        </td>
                        <td>{employeeName}</td>
                        <td>{task.assigned_to || '-'}</td>
                        <td>{formatDate(task.due_date)}</td>
                        <td>{task.category || '-'}</td>
                        <td>
                          <span
                            className={`status ${
                              status === 'Completed'
                                ? 'active'
                                : status === 'Pending'
                                  ? 'pending'
                                  : 'onboarding'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {rows.length === 0 && (
                <div className="empty-state">No tasks found.</div>
              )}

              <div className="table-footer">
                Showing {rows.length} of {tasks.length} tasks
                <span>Page 1 of 1</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
