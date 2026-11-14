
import { useEffect, useState } from 'react'
import { Check, X, ShieldCheck } from 'lucide-react'

export default function Approvals() {
  const [approvals, setApprovals] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [approvalRes, employeeRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/approvals/'),
          fetch('http://127.0.0.1:8000/api/employees/')
        ])

        if (!approvalRes.ok || !employeeRes.ok) {
          throw new Error('Unable to load approval records.')
        }

        const approvalData = await approvalRes.json()
        const employeeData = await employeeRes.json()

        setApprovals(approvalData)
        setEmployees(employeeData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getEmployeeName = (id) => {
    const employee = employees.find((e) => e.id === id)
    return employee
      ? `${employee.first_name} ${employee.last_name}`
      : `Employee #${id}`
  }

  const updateApproval = async (id, status) => {
    setUpdatingId(id)
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/approvals/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update approval.')
      }

      const updated = await response.json()

      setApprovals((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, ...updated } : item
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKFLOW GOVERNANCE</div>
          <h1>Approvals</h1>
          <p>Review access, equipment, and workflow requests.</p>
        </div>
      </div>

      {error && <div className="empty-state">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading approvals...</div>
      ) : approvals.length === 0 ? (
        <div className="empty-state">No approval requests found.</div>
      ) : (
        <div className="approval-cards">
          {approvals.map((a) => {
            const status = (a.status || 'pending').toLowerCase()
            const request = (a.approval_type || 'General')
              .replaceAll('_', ' ')

            return (
              <article className="panel approval-card" key={a.id}>
                <div className="approval-icon">
                  <ShieldCheck size={20} />
                </div>

                <div className="approval-main">
                  <div className="approval-top">
                    <span className="eyebrow">
                      {request.toUpperCase()} REQUEST
                    </span>
                    <span className={`status ${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <h2>{request.charAt(0).toUpperCase() + request.slice(1)} Approval</h2>

                  <p>
                    For <strong>{getEmployeeName(a.employee_id)}</strong>
                    {' '}· Requested by {a.requested_by}
                  </p>

                  {a.comments && <p>{a.comments}</p>}

                  <span className="muted">
                    Submitted {new Date(a.created_at).toLocaleString('en-IN')}
                  </span>
                </div>

                {status === 'pending' && (
                  <div className="approval-actions">
                    <button
                      className="secondary-button"
                      disabled={updatingId !== null}
                      onClick={() => updateApproval(a.id, 'rejected')}
                    >
                      <X size={15} /> Reject
                    </button>

                    <button
                      className="primary-button"
                      disabled={updatingId !== null}
                      onClick={() => updateApproval(a.id, 'approved')}
                    >
                      <Check size={15} /> Approve
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
