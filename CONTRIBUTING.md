# Contributing to ResPlus.Multi.Tool

Thank you for contributing! This document describes the recommended workflow and expectations.

Getting started
1. Fork the repo or create a branch if you have push access:
   git checkout -b feat/short-description
2. Install dependencies:
   npm ci
3. Run dev server and tests while developing:
   npm run dev
   npm test

Branch naming
- feat/<short-description> — new features
- fix/<short-description> — bug fixes
- chore/<short-description> — maintenance, CI, tooling

Code style
- Format with Prettier (npm run format)
- Lint with ESLint (npm run lint)
- TypeScript: add types for new modules, avoid any unless necessary

Testing
- Add unit tests for new logic
- Tests must pass before opening a PR

Pull requests
- Base branch: main (or repository default)
- PR title: concise summary; body: what, why, how
- Link to relevant issues
- Ensure CI (if present) passes

Commit messages
- Use Conventional Commits: feat, fix, docs, chore, refactor, test
- Example: feat(auth): add session timeout handling

Review process
- Provide clear description and testing notes
- Be responsive to review comments
- Maintain backward compatibility where possible

Thank you for helping make ResPlus.Multi.Tool better!
