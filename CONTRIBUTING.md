# Contributing

## Branch Naming

Use a type-prefixed branch name.

Format:

```txt
<type>/<short-kebab-case-summary>
```

Common prefixes:

- `feat/`: feature work
- `fix/`: bug fixes
- `refactor/`: code structure changes
- `style/`: visual/UI-only changes
- `docs/`: documentation changes
- `chore/`: tooling, config, dependency, or maintenance changes

Examples:

```txt
feat/pass-video-drawer
fix/drawer-navbar-spacing
style/pass-spoiler-controls
docs/contributing-rules
chore/update-extension-metadata
```

## Commit Convention

Use Conventional Commits for all commit messages.

Format:

```txt
<type>: <short summary>
```

Common types:

- `feat`: user-facing feature
- `fix`: bug fix
- `refactor`: code structure change without behavior change
- `style`: visual/UI-only change
- `docs`: documentation-only change
- `chore`: tooling, config, dependency, or maintenance change

Examples:

```txt
feat: support TUF pass videos
fix: keep drawer content below navbar
style: refine pass spoiler controls
docs: add commit convention
chore: update extension manifest metadata
```
