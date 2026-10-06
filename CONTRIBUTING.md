# Contributing

Thank you for improving PRISM.

1. Create a focused branch from the default branch.
2. Never commit environment files, credentials, personal data, scraped
   articles, or proprietary assets.
3. Run **npm ci**, **npm run check**, and **python -m pytest -q**.
4. Add regression tests for security or behavior changes.
5. Open a pull request that explains the user impact and verification.

For vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of opening a
public issue. Unless explicitly stated otherwise, submitted contributions are
provided under the Apache License 2.0.

The frontend uses Vite 8, React plugin 6, and Tailwind CSS 4. Theme tokens
live in `src/index.css`; Tailwind runs through `@tailwindcss/postcss`.
Keep related toolchain updates together so installation and CSS generation
can be verified in one PR. Dependabot groups these updates, and also groups
CodeQL `init` and `analyze` to keep their action versions aligned.

For frontend changes, check the landing page and workspace on desktop and
mobile. The supported browser baseline is Chrome/Edge 111+, Safari 16.4+,
and Firefox 128+.
