export const employees = [
  { id: 'EMP-1042', name: 'Aarav Sharma', role: 'Product Designer', department: 'Design', manager: 'Priya Mehta', status: 'Active', joined: '12 Nov 2026', email: 'aarav.sharma@peopleflow.demo' },
  { id: 'EMP-1041', name: 'Ananya Reddy', role: 'Software Engineer', department: 'Engineering', manager: 'Rahul Verma', status: 'Active', joined: '10 Nov 2026', email: 'ananya.reddy@peopleflow.demo' },
  { id: 'EMP-1040', name: 'Ishaan Patel', role: 'Data Analyst', department: 'Data', manager: 'Kavya Rao', status: 'Onboarding', joined: '08 Nov 2026', email: 'ishaan.patel@peopleflow.demo' },
  { id: 'EMP-1039', name: 'Diya Nair', role: 'Talent Partner', department: 'People', manager: 'Neha Kapoor', status: 'Active', joined: '04 Nov 2026', email: 'diya.nair@peopleflow.demo' },
  { id: 'EMP-1038', name: 'Kabir Singh', role: 'QA Engineer', department: 'Engineering', manager: 'Rahul Verma', status: 'Offboarding', joined: '21 Oct 2026', email: 'kabir.singh@peopleflow.demo' },
]

export const tasks = [
  { title: 'Complete employment agreement', owner: 'People team', employee: 'Ishaan Patel', due: 'Today', status: 'In progress', priority: 'High' },
  { title: 'Provision development laptop', owner: 'IT team', employee: 'Ishaan Patel', due: 'Today', status: 'Pending', priority: 'High' },
  { title: 'Schedule team introduction', owner: 'Rahul Verma', employee: 'Aarav Sharma', due: 'Tomorrow', status: 'Completed', priority: 'Medium' },
  { title: 'Revoke repository access', owner: 'IT team', employee: 'Kabir Singh', due: '15 Nov 2026', status: 'Pending', priority: 'High' },
  { title: 'Collect access card', owner: 'Facilities', employee: 'Kabir Singh', due: '16 Nov 2026', status: 'In progress', priority: 'Medium' },
]

export const approvals = [
  { request: 'GitHub organisation access', employee: 'Ishaan Patel', requestedBy: 'Rahul Verma', date: '14 Nov 2026', status: 'Pending' },
  { request: 'Laptop allocation', employee: 'Ishaan Patel', requestedBy: 'People team', date: '13 Nov 2026', status: 'Pending' },
  { request: 'CRM access removal', employee: 'Kabir Singh', requestedBy: 'Neha Kapoor', date: '13 Nov 2026', status: 'Approved' },
]

export const assets = [
  { asset: 'MacBook Pro 14-inch', tag: 'AST-0081', assigned: 'Aarav Sharma', type: 'Laptop', status: 'Assigned' },
  { asset: 'Dell Latitude 5440', tag: 'AST-0080', assigned: 'Ishaan Patel', type: 'Laptop', status: 'Reserved' },
  { asset: 'Keychron K2 Keyboard', tag: 'AST-0047', assigned: 'Ananya Reddy', type: 'Accessory', status: 'Assigned' },
  { asset: 'Access card #219', tag: 'AST-0019', assigned: 'Unassigned', type: 'Access card', status: 'Available' },
]
