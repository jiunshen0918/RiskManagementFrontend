# AI-Powered Risk Management System — Frontend

React and TypeScript user interface for the [Risk Management System backend](https://github.com/jiunshen0918/RiskManagementBackend). The application provides database-backed risk dashboard metrics, a local risk create/update workflow, AI analysis, and a read-only view of ServiceNow IRM records with synchronization controls.

## Features

- Dashboard metrics loaded from persisted backend data rather than fixed sample values.
- Local risk creation and update forms with title, description, category, status, likelihood, and impact.
- Risk severity and score are calculated by the backend.
- AI risk analysis through the backend API.
- ServiceNow risk list and one-way synchronization, with imported records read-only in the UI.
- Runtime API sign-in. The frontend holds the API Basic authorization header in memory for the current page session.

## Architecture and data flow

```text
React frontend → FastAPI backend → PostgreSQL
                                → Ollama Cloud (AI analysis)
                                → ServiceNow IRM (risk synchronization)
```

The browser calls FastAPI; database access and outbound Ollama/ServiceNow credentials remain on the backend. The backend repository documents its API and configuration: [RiskManagementBackend](https://github.com/jiunshen0918/RiskManagementBackend).

## Repository layout

```text
riskmanagementfrontend/
├── src/
│   ├── components/       # Dashboard, risk register, and UI components
│   ├── services/         # Authenticated API and AI request helpers
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
└── .gitignore
```

## Requirements and installation

- Windows 10/11, Node.js and npm.
- The separate FastAPI backend repository; PostgreSQL for persisted metrics and risks.
- Ollama Cloud configuration for AI analysis and a ServiceNow IRM OAuth configuration for synchronization. These external integrations are optional when demonstrating only the UI/API and local risk workflows.

From this repository's `riskmanagementfrontend` folder:

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Vite listens on `http://127.0.0.1:60190` as configured in `vite.config.ts`. The backend defaults to `http://127.0.0.1:8000`; optional `VITE_API_BASE_URL` can override it. If you change the API origin, configure the backend CORS allowlist to match. Do not put backend credentials in any `VITE_*` variable because Vite variables are browser-visible.

Sign in using the backend API username and password. The backend `.env` configuration, PostgreSQL setup, Ollama/ServiceNow setup, and full local demo procedure are in the backend repository's [LOCAL_DEMO.md](https://github.com/jiunshen0918/RiskManagementBackend/blob/master/LOCAL_DEMO.md).

## Quality checks

```powershell
npm run lint
npm run build
```

The production bundle is written to `dist/`; this repository does not include deployment configuration.

## Security and known limitations

- This frontend never needs ServiceNow OAuth secrets, Ollama credentials, or PostgreSQL credentials. Configure those only in the backend environment.
- API Basic credentials are entered at runtime and retained in page memory until reload/close or sign out. Do not use shared/public devices for the local demo.
- The backend API is designed for a local single-operator demo; it is not a multi-user identity/role system and must not be exposed publicly as-is.
- ServiceNow records are read-only here; synchronization refreshes the application's local snapshot. Local risk deletion is not implemented.
- AI analysis depends on the backend and configured Ollama service/model.

## Related repository

- Backend: [RiskManagementBackend](https://github.com/jiunshen0918/RiskManagementBackend)
