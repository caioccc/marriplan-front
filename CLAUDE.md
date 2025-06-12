# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
npm run dev              # Start dev server with .env.dev (http://localhost:3000)
npm run build            # Build for production with .env.prod
npm run build:sandbox    # Build for sandbox environment
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Testing
```bash
npm run cypress          # Open Cypress GUI for E2E tests
npm run cypress:headless # Run E2E tests in Chrome headless mode
npm run cypress:ci       # Run E2E tests for CI with Electron
```

**Important**: Backend must be running for tests to work. Check `environments/.env.dev` for backend URL configuration.

### Environment Configuration
- Environment files are in `environments/` directory (.env.dev, .env.sandbox, .env.prod)
- Backend URL is configured via `NEXT_PUBLIC_BASE_URL` environment variable
- Default development backend: `http://localhost:8000`

## Architecture Overview

### Tech Stack
- **Next.js 15.1.4** with React 19 and TypeScript 5
- **UI Components**: ShadCN UI (components.json), Mantine, Radix UI primitives
- **Styling**: Tailwind CSS with styled-components
- **Forms**: React Hook Form with Zod/Yup validation
- **API**: Axios with custom interceptors
- **i18n**: next-i18next (supports pt, en, es)
- **Auth**: Token-based with localStorage, 2FA support

### Project Structure
```
src/
├── components/       # Reusable UI components (ShadCN UI in ui/)
├── pages/           # Next.js pages (file-based routing)
├── presentation/    # Page-specific component logic
├── services/        # API service layer
├── contexts/        # React contexts (Auth, Settings)
├── hooks/           # Custom React hooks
├── interfaces/      # TypeScript interfaces
└── translate/       # i18n configuration and translations
```

### API Architecture
- **Base Service**: All API calls go through `services/base.service.ts` which wraps axios methods
- **API Configuration**: `services/api.ts` sets up axios interceptors:
  - Automatic token injection from localStorage
  - Language header based on browser locale
  - Auto-redirect to login on 401 (except login/register pages)
  - 403 and 500 error page redirects
- **Service Pattern**: Each feature has its own service file (e.g., `services/chat/`, `services/login/`)

### Authentication Flow
1. Token stored in localStorage after login
2. Axios interceptor adds `Authorization: Token {token}` header
3. AuthContext manages user state
4. 2FA support via `/2fa` page with QR code generation

### Key Features
- **Chat**: Real-time chat functionality
- **Reports**: Reporting system
- **User Management**: Profile, settings, session management
- **Auth**: Login, register, password reset, 2FA
- **i18n**: Multi-language support with language picker

### Testing Strategy
- E2E tests with Cypress (no unit tests configured)
- Test files in `cypress/e2e/`
- Interceptors and routines for test automation
- Long timeouts (120s) and retries (5) for stability

### Development Notes
- TypeScript path alias: `@/*` maps to `./src/*`
- No implicit any allowed (but `noImplicitAny: false` in tsconfig)
- Docker support available for containerized development
- Next.js middleware configured (middleware.ts)