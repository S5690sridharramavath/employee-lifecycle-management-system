import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserPlus, UserMinus, ListTodo, ClipboardCheck, Laptop, ChartNoAxesCombined, CircleHelp, Settings, Workflow } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Employees', to: '/employees', icon: Users },
  { label: 'Onboarding', to: '/onboarding', icon: UserPlus },
  { label: 'Offboarding', to: '/offboarding', icon: UserMinus },
  { label: 'Tasks', to: '/tasks', icon: ListTodo },
  { label: 'Approvals', to: '/approvals', icon: ClipboardCheck, count: '3' },
  { label: 'Assets', to: '/assets', icon: Laptop },
  { label: 'Reports', to: '/reports', icon: ChartNoAxesCombined },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Workflow size={21} /></div>
        <div><strong>PeopleFlow</strong><span>WORKFORCE OPERATIONS</span></div>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">
        {navItems.map(({ label, to, icon: Icon, count }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} /><span>{label}</span>{count && <small>{count}</small>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/reports" className="nav-link"><CircleHelp size={18} /><span>Help & support</span></NavLink>
        <button className="nav-link settings-link" type="button"><Settings size={18} /><span>Settings</span></button>
        <div className="profile-mini">
          <div className="avatar avatar-purple">SM</div>
          <div><strong>Sam Morgan</strong><span>People Admin</span></div>
          <span className="profile-dots">•••</span>
        </div>
      </div>
    </aside>
  )
}
