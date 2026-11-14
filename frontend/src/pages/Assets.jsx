
import { useEffect, useState } from 'react'
import { Laptop, Plus, Search } from 'lucide-react'

const API = 'http://127.0.0.1:8000/api'

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [assetResponse, employeeResponse] = await Promise.all([
          fetch(`${API}/assets/`),
          fetch(`${API}/employees/`)
        ])

        if (!assetResponse.ok || !employeeResponse.ok) {
          throw new Error('Unable to load asset information.')
        }

        const assetData = await assetResponse.json()
        const employeeData = await employeeResponse.json()

        setAssets(assetData)
        setEmployees(employeeData)
      } catch (err) {
        setError(err.message || 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const employeeMap = Object.fromEntries(
    employees.map(employee => [
      employee.id,
      employee.full_name || employee.name || employee.first_name || `Employee #${employee.id}`
    ])
  )

  const assigned = assets.filter(
    asset => asset.status?.toLowerCase() === 'assigned'
  ).length

  const available = assets.filter(
    asset => asset.status?.toLowerCase() === 'available'
  ).length

  const attention = assets.filter(
    asset => ['maintenance', 'damaged', 'lost'].includes(
      asset.status?.toLowerCase()
    )
  ).length

  const filteredAssets = assets.filter(asset =>
    [
      asset.name,
      asset.asset_tag,
      asset.asset_type,
      asset.status,
      employeeMap[asset.assigned_employee_id]
    ].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">IT & FACILITIES</div>
          <h1>Assets</h1>
          <p>Manage company equipment and employee assignments.</p>
        </div>

        <button className="primary-button" disabled>
          <Plus size={16} /> Add asset
        </button>
      </div>

      <div className="stats-grid compact-stats">
        <div className="stat-card">
          <span className="simple-stat-label">Total assets</span>
          <div className="stat-value">{assets.length}</div>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Assigned</span>
          <div className="stat-value">{assigned}</div>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Available</span>
          <div className="stat-value">{available}</div>
        </div>

        <div className="stat-card">
          <span className="simple-stat-label">Needs attention</span>
          <div className="stat-value">{attention}</div>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-header">
          <div>
            <h2>Asset inventory</h2>
            <p>Current equipment and assignment status</p>
          </div>

          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ padding: '20px' }}>Loading assets...</p>
        ) : error ? (
          <p style={{ padding: '20px', color: 'red' }}>{error}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ASSET</th>
                  <th>ASSET TAG</th>
                  <th>TYPE</th>
                  <th>ASSIGNED TO</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map(asset => (
                    <tr key={asset.id}>
                      <td>
                        <div className="asset-name">
                          <div className="asset-icon">
                            <Laptop size={17} />
                          </div>
                          <strong>{asset.name}</strong>
                        </div>
                      </td>

                      <td>{asset.asset_tag}</td>
                      <td>{asset.asset_type}</td>
                      <td>
                        {employeeMap[asset.assigned_employee_id] || 'Unassigned'}
                      </td>

                      <td>
                        <span className={`status ${
                          asset.status?.toLowerCase() === 'assigned'
                            ? 'active'
                            : asset.status?.toLowerCase() === 'available'
                              ? 'completed'
                              : 'pending'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '25px' }}>
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
