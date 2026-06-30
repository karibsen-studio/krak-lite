# Contributing

Thanks for taking the time to contribute to krak-lite! 🪶

## Development

```bash
# 1. Fork & clone, then install dependencies (pnpm)
pnpm install

# 2. Generate type stubs for the module + playground
pnpm dev:prepare

# 3. Run the playground with hot reload
pnpm dev
```

Before opening a PR, make sure the checks pass locally:

```bash
pnpm lint        # ESLint
pnpm test        # Vitest
pnpm test:types  # vue-tsc type check
pnpm prepack     # build the module
```

## Submitting a pull request

1. Create a branch from `main` (e.g. `feat/outbound-links` or `fix/flush-race`).
2. Keep the change focused; add or update tests when it makes sense.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) for messages
   (`feat:`, `fix:`, `docs:`, `chore:`…) - the changelog is generated from them.
4. Open the PR against `main`, fill in the template, and make sure CI is green.

Questions or ideas? Open an issue first so we can discuss the approach.
