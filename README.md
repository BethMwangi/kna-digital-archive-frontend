# Urithi Digital Archive Frontend

Frontend for the Urithi Digital Archive, built with [TanStack Start](https://tanstack.com/start), Vite, React 19, and Tailwind CSS.

## Prerequisites

- **Node.js `22.12.0`** (required — this project uses TanStack Start, which needs Node >= 22.12.0). Older versions (e.g. Node 12/16/18) will fail with confusing syntax or module errors.
- **npm** (comes with Node)
- [nvm](https://github.com/nvm-sh/nvm) is recommended for managing Node versions. This repo includes an `.nvmrc` file pinning the correct version.

## Setup

1. Clone the repo and move into it:

   ```bash
   git clone <repo-url>
   cd kna-digital-archive-frontend
   ```

2. Use the correct Node version:

   ```bash
   nvm use
   ```

   If you don't have Node `22.12.0` installed yet:

   ```bash
   nvm install
   nvm use
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Running the project

Start the dev server:

```bash
npm run dev
```

The app will be available at [http://localhost:8080](http://localhost:8080).

## Other scripts

| Command             | Description                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start the local dev server            |
| `npm run build`      | Build for production                  |
| `npm run build:dev`  | Build in development mode             |
| `npm run preview`    | Preview the production build locally  |
| `npm run lint`       | Run ESLint                            |
| `npm run format`     | Format code with Prettier             |

## Troubleshooting

- **`SyntaxError` or `module not found` errors on `npm run dev`**: Almost always caused by an outdated Node version. Run `node --version` and confirm it matches `22.12.0`. Fix with `nvm use` (or `nvm install` if that version isn't installed yet).
- **Stale or broken `node_modules`**: Do a clean reinstall:

  ```bash
  rm -rf node_modules package-lock.json
  nvm use
  npm install
  ```
