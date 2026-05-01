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

## Release Flow

`package.json` is the source of truth for the release version. `manifest.config.ts` reads that version when CRXJS generates `dist/manifest.json`.

Chrome requires `manifest.version` to be one to four dot-separated integers, so prerelease labels are stripped from `manifest.version` and preserved in `manifest.version_name`.

Example:

```txt
package.json version: 0.1.1-beta.1
manifest.version: 0.1.1
manifest.version_name: 0.1.1-beta.1
```

To create a GitHub Release:

1. Update `package.json` version.
2. Commit and merge the change.
3. Create a matching tag:

```txt
v<package.json version>
```

Example:

```txt
v0.1.0
```

Pushing the tag runs GitHub Actions. The workflow verifies that the tag matches `package.json`, builds the extension, packages the contents of `dist/`, and uploads `tufe-v<version>.zip` to the GitHub Release.

Versions containing a prerelease suffix, such as `0.1.1-beta.1`, are marked as GitHub pre-releases automatically.
