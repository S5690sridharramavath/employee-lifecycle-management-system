# PeopleFlow – Employee Lifecycle Frontend

A frontend-only React application for managing employee onboarding and offboarding workflows. It currently uses local mock data; no backend or database is required to preview the UI.

## Included screens

- Dashboard
- Employees
- Onboarding
- Offboarding
- Tasks
- Approvals
- Assets
- Reports

## Requirements

- Node.js 18 or newer (Node.js 20 LTS recommended)
- npm (included with Node.js)

## Setup on Windows

1. Extract this ZIP file.
2. Open the extracted **PeopleFlow-Frontend** folder in VS Code.
3. In VS Code, select **Terminal → New Terminal**.
4. Confirm the terminal is in the project folder. It should contain `package.json`.
5. Run:

   ```powershell
   node --version
   npm --version
   npm install
   npm run dev
   ```

6. Open the local URL printed by Vite, usually `http://localhost:5173/`.

If `node --version` or `npm --version` returns no output, repair/reinstall Node.js LTS from the official Node.js website, restart VS Code, and open a new terminal. Do not run npm from a deleted folder.

## Production build

```powershell
npm run build
npm run preview
```

## Project structure

```text
PeopleFlow-Frontend/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── components/
    │   ├── common/
    │   └── layout/
    ├── data/
    ├── pages/
    ├── App.jsx
    ├── main.jsx
    ├── App.css
    └── index.css
```

## Notes

- This is the frontend stage only.
- Buttons and workflow actions are visual/demo elements unless explicitly implemented in the UI.
- Data is sample data in `src/data/mockData.js`.
- Backend API and database integration will be added after the frontend is reviewed and approved.
