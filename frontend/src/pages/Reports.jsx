
import { useEffect, useState } from 'react'
import {
  Download,
  TrendingUp,
  Clock3,
  CheckCircle2,
  ClipboardList
} from 'lucide-react'
import StatCard from '../components/common/StatCard'

const API = 'http://127.0.0.1:8000/api'

export default function Reports() {
  const [data, setData] = useState({
    onboarding: [],
    offboarding: [],
    tasks: [],
    approvals: []
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadReports() {
      try {
        const endpoints = [
          'onboarding/',
          'offboarding/',
          'tasks/',
          'approvals/'
        ]

        const responses = await Promise.all(
          endpoints.map(endpoint => fetch(`${API}/${endpoint}`))
        )

        if (responses.some(response => !response.ok)) {
          throw new Error('Unable to fetch report data.')
        }

        const results = await Promise.all(
          responses.map(response => response.json())
        )

        setData({
          onboarding: results[0],
          offboarding: results[1],
          tasks: results[2],
          approvals: results[3]
        })
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const isCompleted = status =>
    ['completed', 'approved'].includes(status?.toLowerCase())

  const totalWorkflows =
    data.onboarding.length + data.offboarding.length

  const completedWorkflows = [
    ...data.onboarding,
    ...data.offboarding
  ].filter(item => isCompleted(item.status)).length

  const activeWorkflows = [
    ...data.onboarding,
    ...data.offboarding
  ].filter(item =>
    ['in_progress', 'in progress', 'active'].includes(
      item.status?.toLowerCase()
    )
  ).length

  const openTasks = data.tasks.filter(
    task => !isCompleted(task.status)
  ).length

  const pendingApprovals = data.approvals.filter(
    approval => approval.status?.toLowerCase() === 'pending'
  ).length

  const getRate = (items, completedStatuses = ['completed']) => {
    if (!items.length) return 0

    const completed = items.filter(item =>
      completedStatuses.includes(item.status?.toLowerCase())
    ).length

    return Math.round((completed / items.length) * 100)
  }

  const reportBars = [
    {
      name: 'Onboarding',
      value: getRate(data.onboarding)
    },
    {
      name: 'Offboarding',
      value: getRate(data.offboarding)
    },
    {
      name: 'Tasks',
      value: getRate(data.tasks)
    },
    {
      name: 'Approvals',
      value: getRate(data.approvals, ['approved'])
    }
  ]

  function exportReport() {
    const rows = [
      ['Report', 'Total', 'Completed', 'Open'],
      [
        'Onboarding',
        data.onboarding.length,
        getRate(data.onboarding) === 0
          ? 0
          : data.onboarding.filter(item =>
              isCompleted(item.status)
            ).length,
        data.onboarding.filter(item => !isCompleted(item.status)).length
      ],
      [
        'Offboarding',
        data.offboarding.length,
        data.offboarding.filter(item =>
          isCompleted(item.status)
        ).length,
        data.offboarding.filter(item => !isCompleted(item.status)).length
      ],
      [
        'Tasks',
        data.tasks.length,
        data.tasks.filter(item => isCompleted(item.status)).length,
        openTasks
      ],
      [
        'Approvals',
        data.approvals.length,
        data.approvals.filter(item =>
          item.status?.toLowerCase() === 'approved'
        ).length,
        pendingApprovals
      ]
    ]

    const csv = rows.map(row =>
      row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employee-lifecycle-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <p>Loading reports...</p>
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">INSIGHTS & ANALYTICS</div>
          <h1>Reports</h1>
          <p>
            Understand how your employee lifecycle workflows are performing.
          </p>
        </div>

        <button className="secondary-button" onClick={exportReport}>
          <Download size={15} /> Export report
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Workflows completed"
          value={completedWorkflows}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="Total workflows"
          value={totalWorkflows}
          icon={TrendingUp}
          tone="blue"
        />

        <StatCard
          label="Open tasks"
          value={openTasks}
          icon={ClipboardList}
          tone="violet"
        />

        <StatCard
          label="Pending approvals"
          value={pendingApprovals}
          icon={Clock3}
          tone="orange"
        />
      </div>

      <div className="panel report-panel">
        <div className="panel-header">
          <div>
            <h2>Workflow completion rates</h2>
            <p>
              Completion percentage based on current database records
            </p>
          </div>

          <span className="report-period">Current status</span>
        </div>

        <div className="report-bars">
          {reportBars.map(item => (
            <div className="report-bar-group" key={item.name}>
              <strong>{item.value}%</strong>

              <div className="report-track">
                <i style={{ height: `${item.value}%` }} />
              </div>

              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginTop: '20px', padding: '24px' }}>
        <div className="panel-header">
          <div>
            <h2>Workflow summary</h2>
            <p>Current employee lifecycle activity</p>
          </div>
        </div>

        <div className="stats-grid compact-stats">
          <div className="stat-card">
            <span className="simple-stat-label">Active workflows</span>
            <div className="stat-value">{activeWorkflows}</div>
          </div>

          <div className="stat-card">
            <span className="simple-stat-label">Onboarding cases</span>
            <div className="stat-value">{data.onboarding.length}</div>
          </div>

          <div className="stat-card">
            <span className="simple-stat-label">Offboarding cases</span>
            <div className="stat-value">{data.offboarding.length}</div>
          </div>

          <div className="stat-card">
            <span className="simple-stat-label">Total tasks</span>
            <div className="stat-value">{data.tasks.length}</div>
          </div>
        </div>
      </div>
    </>
  )
}
