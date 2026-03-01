# Contributing to Daintune

Thank you for your interest in contributing! All contributions are welcome — bug reports, feature suggestions, and pull requests.

## Ground Rules

- Be respectful and constructive in all communication.
- Keep changes focused. One feature or fix per pull request.
- Follow the existing code style (TypeScript, functional React with Ink).

---

## How to Contribute

### 1. Fork and clone

```bash
git clone https://github.com/<your-username>/daintune.git
cd daintune
npm install
```

### 2. Create a branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-description
```

Branch naming convention:
- `feat/` — new feature
- `fix/` — bug fix
- `docs/` — documentation only
- `refactor/` — code change with no behavior change

### 3. Make your changes

- Keep commits small and descriptive.
- Test your changes manually before submitting (`npm run dev` or `node dist/index.js`).

### 4. Open a pull request

- Target the `main` branch.
- Fill in the PR description: what changed and why.
- PRs are reviewed and merged by the maintainer. Please allow some time for review.

---

## Development

```bash
npm run build   # compile TypeScript
npm run dev     # watch mode (if configured)
```

### Project structure

```
src/
  index.tsx          # App root, shared state
  pages/
    MenuPage.tsx
    SearchPage.tsx
    LibraryPage.tsx
    NowPlayingPage.tsx
    SettingsPage.tsx
  components/
    Header.tsx
    Footer.tsx
  player.ts          # mpv playback interface
  types.ts
```

---

## Reporting Issues

Open a [GitHub Issue](https://github.com/dain-p/daintune/issues) and include:
- OS and version
- Steps to reproduce
- Expected vs actual behavior

---

## Merge Policy

All pull requests must go through review before being merged into `main`. Direct pushes to `main` are restricted. This ensures code quality and project consistency.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
