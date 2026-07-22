# Contributing to TrackWise

Thank you for your interest in contributing to TrackWise! Below are guidelines to help ensure quality contributions.

## 🚀 Getting Started

1. Fork the repository.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/TrackWise.git
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 📐 Coding Standards

- **Frontend**: Use functional React components, strict TypeScript interfaces (avoid `any`), and custom hooks for state management.
- **Backend**: Keep routes lightweight, delegate business logic to services, wrap async operations with `asyncHandler`, and use `AppError` for HTTP errors.
- **Commits**: Use clear conventional commit messages e.g., `feat(auth): add JWT token refresh endpoint` or `refactor(client): convert HoldingsTable to useAssets context`.

## 🧪 Submitting Pull Requests

1. Run local builds to ensure zero compilation or build errors:
   ```bash
   cd client && npm run build
   ```
2. Open a Pull Request against the `main` branch with a clear description of your changes.
