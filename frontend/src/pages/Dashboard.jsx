
import { useEffect, useState } from 'react'
import {
  Users,
  UserRoundPlus,
  ClipboardList,
  Clock3,
  ArrowUpRight,
  ArrowRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/common/StatCard'

export default function Dashboard() {
  const [employees, setEmployees] = useState([])
  const [onboarding, setOnboarding] = useState([])
  const [offboarding, setOffboarding] = useState([])
  const [tasks, setTasks] = useState([])
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const endpoints = [
          'employees/',
          'onboarding/',
          'offboarding/',
          'tasks/',
          'approvals/'
        ]

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`http://127.0.0.1:8000/api/${endpoint}`)
          )
        )

        if (responses.some((response) => !response.ok)) {
          throw new Error('Unable to load dashboard data.')
        }

        const [
          employeeData,
          onboardingData,
          offboardingData,
          taskData,
          approvalData
        ] = await Promise.all(responses.map((response) => response.json()))

        setEmployees(employeeData)
        setOnboarding(onboardingData)
        setOffboarding(offboardingData)
        setTasks(taskData)
        setApprovals(approvalData)
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getEmployeeName = (id) => {
    const employee = employees.find((item) => item.id === id)

    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : `Employee #${id}`
  }

  const formatDate = (date) =>
    date
      ? new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN')
      : '-'

  const activeEmployees = employees.filter(
    (employee) => employee.status?.toLowerCase() === 'active'
  )

  const activeOnboarding = onboarding.filter(
    (item) => !['completed', 'cancelled'].includes(item.status?.toLowerCase())
  )

  const activeOffboarding = offboarding.filter(
    (item) => !['completed', 'cancelled'].includes(item.status?.toLowerCase())
  )

  const openTasks = tasks.filter(
    (task) => task.status?.toLowerCase() !== 'completed'
  )

  const pendingApprovals = approvals.filter(
    (approval) => approval.status?.toLowerCase() === 'pending'
  )

  const recentWorkflows = [
    ...onboarding.map((item) => ({
      id: `onboarding-${item.id}`,
      name: getEmployeeName(item.employee_id),
      action: 'onboarding workflow',
      date: item.start_date,
      status: item.status,
      type: 'Onboarding'
    })),
    ...offboarding.map((item) => ({
      id: `offboarding-${item.id}`,
      name: getEmployeeName(item.employee_id),
      action: 'offboarding workflow',
      date: item.exit_date,
      status: item.status,
      type: 'Offboarding'
    }))
  ]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 4)

  const recentEmployees = [...employees]
    .sort((a, b) =>
      (b.date_of_joining || '').localeCompare(a.date_of_joining || '')
    )
    .slice(0, 3)

  const maxWorkflow = Math.max(
    activeOnboarding.length,
    activeOffboarding.length,
    1
  )

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  if (loading) {
    return <div className="empty-state">Loading dashboard...</div>
  }

  if (error) {
    return <div className="empty-state">{error} Please check your backend.</div>
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{today.toUpperCase()}</div>
          <h1>Good evening <span>✦</span></h1>
          <p>Here's what's happening across your employee lifecycle.</p>
        </div>
        <Link to="/employees" className="primary-button">
          <UserRoundPlus size={16} /> View employees
        </Link>
      </div>

      <section className="stats-grid">
        <StatCard
          label="Total employees"
          value={employees.length}
          change={`${activeEmployees.length} active`}
          note="Current employees"
          icon={Users}
          tone="violet"
        />

        <StatCard
          label="Onboarding"
          value={activeOnboarding.length}
          change={`${onboarding.length} total`}
          note="Active onboarding cases"
          icon={UserRoundPlus}
          tone="blue"
        />

        <StatCard
          label="Open tasks"
          value={openTasks.length}
          change={`${tasks.length} total`}
          note="Tasks needing attention"
          icon={ClipboardList}
          tone="orange"
        />

        <StatCard
          label="Pending approvals"
          value={pendingApprovals.length}
          change={`${approvals.length} total`}
          note="Awaiting review"
          icon={Clock3}
          tone="green"
        />
      </section>

      <section className="dashboard-grid">
        <div className="panel workflow-panel">
          <div className="panel-header">
            <div>
              <h2>Workflow overview</h2>
              <p>Current employee lifecycle activity</p>
            </div>
          </div>

          <div className="workflow-summary">
            <div className="workflow-number">
              <strong>{activeOnboarding.length + activeOffboarding.length}</strong>
              <span>Active workflows</span>
            </div>

            <div className="workflow-legend">
              <span>
                <i className="dot violet-dot" />
                Onboarding <b>{activeOnboarding.length}</b>
              </span>
              <span>
                <i className="dot orange-dot" />
                Offboarding <b>{activeOffboarding.length}</b>
              </span>
            </div>
          </div>

          <div className="bar-chart" aria-label="Current workflow counts">
            {[activeOnboarding.length, activeOffboarding.length].map(
              (count, index) => (
                <div className="bar-column" key={index}>
                  <div
                    className={`bar ${index === 0 ? 'bar-current' : ''}`}
                    style={{
                      height: `${Math.max((count / maxWorkflow) * 100, 4)}%`
                    }}
                  />
                </div>
              )
            )}
          </div>

          <div className="chart-labels">
            <span>Onboarding</span>
            <span>Offboarding</span>
          </div>
        </div>

        <div className="panel tasks-panel">
          <div className="panel-header">
            <div>
              <h2>Tasks that need attention</h2>
              <p>Stay on top of your team's work</p>
            </div>
            <Link to="/tasks" className="text-link">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="attention-list">
            {openTasks.slice(0, 4).map((task) => (
              <div className="attention-item" key={task.id}>
                <div className="task-check" />
                <div className="attention-copy">
                  <strong>{task.title}</strong>
                  <span>
                    {getEmployeeName(task.employee_id)} · {task.assigned_to || 'Unassigned'}
                  </span>
                </div>
                <span className="priority">
                  {task.category || 'General'}
                </span>
              </div>
            ))}

            {openTasks.length === 0 && (
              <div className="empty-state">No pending tasks.</div>
            )}
          </div>

          <Link to="/tasks" className="panel-bottom-link">
            Go to task management <ArrowRight size={15} />
          </Link>
        </div>

        <div className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Recent workflow activity</h2>
              <p>Latest onboarding and offboarding cases</p>
            </div>
          </div>

          <div className="activity-list">
            {recentWorkflows.map((item) => (
              <div className="activity-item" key={item.id}>
                <div
                  className={`avatar ${
                    item.type === 'Onboarding'
                      ? 'avatar-orange'
                      : 'avatar-green'
                  }`}
                >
                  {item.name.split(' ').map((part) => part[0]).join('')}
                </div>

                <div className="activity-copy">
                  <p>
                    <strong>{item.name}</strong> {item.action} started
                  </p>
                  <span>
                    {item.type} · {formatDate(item.date)}
                  </span>
                </div>
              </div>
            ))}

            {recentWorkflows.length === 0 && (
              <div className="empty-state">No workflow activity yet.</div>
            )}
          </div>
        </div>

        <div className="panel new-joiners-panel">
          <div className="panel-header">
            <div>
              <h2>New team members</h2>
              <p>Recently added to your organisation</p>
            </div>
            <Link to="/employees" className="text-link">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentEmployees.map((person, index) => {
            const name = `${person.first_name} ${person.last_name}`

            return (
              <div className="joiner-item" key={person.id}>
                <div
                  className={`avatar ${
                    ['avatar-blue', 'avatar-purple', 'avatar-orange'][index]
                  }`}
                >
                  {name.split(' ').map((part) => part[0]).join('')}
                </div>

                <div>
                  <strong>{name}</strong>
                  <span>{person.job_title || '-'}</span>
                </div>

                <span className="joiner-date">
                  {formatDate(person.date_of_joining)}
                </span>
              </div>
            )
          })}

          {recentEmployees.length === 0 && (
            <div className="empty-state">No employees added yet.</div>
          )}
        </div>
      </section>
    </>
  )
}
  