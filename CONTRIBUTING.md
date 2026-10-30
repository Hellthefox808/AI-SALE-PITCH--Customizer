# Contributing to PitchCraft AI

Thank you for your interest in contributing to PitchCraft AI! We welcome contributions that maintain our high standards for performance, security, and code quality.

## Development Workflow

1. **Fork & Branch**: Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Coding Standards**:
   - Both backend and frontend enforce **JavaScript Standard Style** (`standard`).
   - Run `npm run lint` in both directories before committing.
   - Run `npx standard --fix` to format automatically.
4. **Zero-Placeholder Law**:
   - Never commit `// TODO`, `...`, or stubbed functions. All logic must be complete and testable.
5. **Testing Requirements**:
   - Every bug fix or feature must include automated test coverage in `backend/tests/`.
   - Run all tests before submitting PRs:
     ```bash
     cd backend && npm test
     ```
6. **Commit Message Conventions**:
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(scope): description`
   - `fix(scope): description`
   - `test(scope): description`
   - `docs(scope): description`
   - `chore(scope): description`

