# React + TypeScript + Vite + Tailwind Template

A production-ready React starter with TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router, Formik, and a full set of reusable UI components.

## Features

- **React 18** with **TypeScript**
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with a custom theme system and dark mode
- **Redux Toolkit** with encrypted localStorage persistence
- **React Router** with protected routes and lazy-loaded pages
- **Formik + Yup** for form handling and validation
- **Axios** HTTP client with auth interceptors
- Pre-built pages: login, dashboard, users, settings, UI kit, and more

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm, yarn, or pnpm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

> **Important:** Never commit your `.env` file. It is listed in `.gitignore` so secrets stay local.

### 4. Start the development server

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Environment Variables

All client-side variables must be prefixed with `VITE_` so Vite exposes them to the app.

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `VITE_BASE_URL` | Yes | Backend API base URL used by the Axios HTTP client. Do not add a trailing slash. | `http://localhost:3001` |
| `VITE_PATH_PREFIX` | Yes | Route prefix for the application. All app routes are built from this value. | `/admin` |
| `VITE_CIPHER` | Yes | Secret key used to encrypt and decrypt Redux state stored in `localStorage`. Use a strong, unique value in production. | `my-secure-cipher-key` |

### Where each variable is used

| Variable | File(s) |
| --- | --- |
| `VITE_BASE_URL` | `src/services/http-service.ts` |
| `VITE_PATH_PREFIX` | `src/routes/routing.ts`, `src/components/ui/breadcrumbs/Breadcrumbs.tsx` |
| `VITE_CIPHER` | `src/utils/localStorage.ts` |

### Example `.env`

```env
VITE_BASE_URL=http://localhost:3001
VITE_PATH_PREFIX=/admin
VITE_CIPHER=your-secret-cipher-key
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 3000 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```text
src/
├── components/       # Reusable UI components and layout pieces
├── layout/           # Main, public, sidebar, and header layouts
├── models/           # TypeScript interfaces and types
├── pages/            # Route-level page components
├── routes/           # Routing config and protected route logic
├── services/         # API and HTTP service layer
├── shared/           # Constants, enums, and shared utilities
├── store/            # Redux store, slices, and state
├── theme/            # Global theme styles
├── utils/            # Helper functions
└── validation/       # Yup validation schemas
```

## Deploying to GitHub

### Push the project

1. Create a new repository on GitHub.
2. Initialize git locally (if you have not already):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Your `.env` file will **not** be pushed because it is in `.gitignore`. Other developers should copy `.env.example` to `.env` and add their own values.

### GitHub Pages (optional)

This project is configured to use a subpath base URL when built in GitHub Actions (`GITHUB_ACTIONS=true`). To deploy:

1. Add your environment variables as **Repository secrets** (Settings → Secrets and variables → Actions), or set them in your workflow file.
2. Create a GitHub Actions workflow that runs `npm ci`, `npm run build`, and uploads the `dist/` folder to GitHub Pages.
3. In repository settings, set **Pages** source to **GitHub Actions**.

For any hosted deployment, set `VITE_*` variables at **build time** — Vite inlines them into the bundle during `npm run build`.

## Security Notes

- Keep `VITE_CIPHER` private and unique per environment.
- Do not store sensitive server-side secrets in `VITE_*` variables — they are embedded in the client bundle and visible in the browser.
- Share `.env.example` with your team, not `.env`.

## License

This project is private by default. Add a license file if you plan to open-source it.
