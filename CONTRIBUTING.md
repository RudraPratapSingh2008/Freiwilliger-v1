# 👥 Contributing to Freiwilliger

Thank you for considering contributing to Freiwilliger! This document explains how to get started.

## 🚀 Getting Started

### 1. Fork the repository

Click the "Fork" button on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/freiwilliger.git
cd freiwilliger
```

### 2. Set up locally

Follow the [README.md](./README.md) setup guide to install dependencies and configure environment variables.

### 3. Create a branch

```bash
git checkout -b feature/your-feature-name
```

## 🌿 Branch Naming

Use descriptive branch names with the appropriate prefix:

| Prefix | Use Case |
|--------|----------|
| `feature/` | New features (e.g., `feature/event-search-filters`) |
| `bugfix/` | Bug fixes (e.g., `bugfix/login-token-expiry`) |
| `hotfix/` | Urgent production fixes (e.g., `hotfix/crash-on-profile`) |
| `refactor/` | Code refactoring (e.g., `refactor/api-response-format`) |
| `docs/` | Documentation updates (e.g., `docs/api-endpoints`) |

## 💬 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description

[optional body]
```

**Types:**
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `style` — formatting, no logic change
- `refactor` — code restructuring
- `test` — adding/updating tests
- `chore` — build, tooling, config changes

**Examples:**
```
feat(events): add QR code check-in endpoint
fix(auth): handle expired refresh token gracefully
docs(api): document contact request flow
test(score): add unit tests for tier calculation
```

## 🔄 Pull Request Process

1. **Update your branch** with the latest `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run checks locally** before pushing:
   ```bash
   cd server && npm run lint && npm test
   cd ../client && npm run lint && npm run build
   ```

3. **Push your branch**:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Open a Pull Request** on GitHub:
   - Use a clear title (under 70 chars)
   - Describe what changed and why
   - Link any related issues
   - Include screenshots for UI changes

5. **Address review feedback** — push additional commits (don't force-push during review)

6. **Merge** — maintainers will squash-merge after approval

## 🎨 Code Style

### Server (Node.js / Express)

- **Module system:** CommonJS (`require` / `module.exports`)
- **Formatting:** 2-space indentation, semicolons, single quotes
- **File naming:** `kebab-case` for files (e.g., `auth.controller.js`, `User.model.js`)
- **Error handling:** Use `apiResponse.utils.js` helpers (`successResponse`, `errorResponse`)
- **Validation:** Use `express-validator` for request validation
- **Database:** Mongoose models with explicit schemas

### Client (React / Vite)

- **Module system:** ES Modules (`import` / `export`)
- **Formatting:** 2-space indentation, semicolons, single quotes
- **Components:** Functional components with hooks (no class components)
- **Styling:** Tailwind CSS utility classes. Use `shadcn/ui` for base components.
- **State:** Redux Toolkit for global state, RTK Query for server state
- **File naming:** `PascalCase` for components (e.g., `EventCard.jsx`), `camelCase` for utilities

### General

- No `console.log` in production code (use proper logging or remove)
- Keep functions small and focused (< 50 lines preferred)
- Add JSDoc comments for utility functions and services
- Use meaningful variable names (no single letters except loop counters)

## 🧪 Testing

- **Server:** Jest + Supertest for unit and integration tests
- **Client:** Vitest + React Testing Library
- Write tests for utility functions, middleware, and critical business logic
- Test files go in `__tests__/` directories mirroring the source structure

## 📁 File Organization

- Place new API slices in `client/src/api/`
- Place new features in `client/src/features/<feature-name>/`
- Place new controllers in `server/src/controllers/`
- Place shared utilities in the respective `utils/` directory
- Place new models in `server/src/models/`

## ❓ Questions?

Open a GitHub issue with the `question` label, or reach out to the maintainers.
