import { Bell, Search, ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': ['Overview', 'Here’s what’s happening across your employee lifecycle.'],
  '/employees': ['Employees', 'Manage your people, teams, and employee information.'],
  '/onboarding': ['Onboarding', 'Give every new team member a smooth start.'],
  '/offboarding': ['Offboarding', 'Coordinate employee exits and recover company assets.'],
  '/tasks': ['Tasks', 'Track work across onboarding and offboarding workflows.'],
  '/approvals': ['Approvals', 'Review and action pending access and asset requests.'],
  '/assets': ['Assets', 'Keep track of equipment and assigned company property.'],
  '/reports': ['Reports', 'Monitor workflow performance and operational health.'],
}

export default function Header() {
  const { pathname } = useLocation()
  const [title, subtitle] = titles[pathname] || titles['/']
  return (
    <header className="topbar">
      <div className="breadcrumb">PeopleFlow <span>/</span> <strong>{title}</strong></div>
      <div className="topbar-actions">
        <label className="search-box"><Search size={16} /><input placeholder="Search anything..." /><kbd>⌘ K</kbd></label>
        <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
        <button className="date-button">14 November 2026 <ChevronDown size={15} /></button>
      </div>
      <div className="mobile-page-heading"><h1>{title}</h1><p>{subtitle}</p></div>
    </header>
  )
}
