# npm and package.json (M4.12, M4.13)

## Commands used in this repo

| Command | What it does |
|---|---|
| `npm init -y` | creates a `package.json` |
| `npm install <pkg>` | adds to `dependencies`, updates the lockfile |
| `npm install -D <pkg>` | adds to `devDependencies` |
| `npm install -w backend <pkg>` | installs into one workspace |
| `npm ci` | clean install exactly from `package-lock.json`; fails if it disagrees with `package.json`; used in CI and on Render |
| `npm ls -w backend` | the dependency tree of one workspace |
| `npm outdated` | current vs wanted vs latest versions |
| `npm audit` / `npm audit --audit-level=high` | known vulnerabilities; the CI gate |
| `npx <tool>` | runs a package binary without installing it globally |
| `npm run <script> -w <workspace>` | runs a script in one workspace |

## dependencies vs devDependencies

`dependencies` are needed at runtime (`express`, `sequelize`). `devDependencies` are only for building and testing (`jest`, `eslint`, `vite`). A production install with `npm ci --omit=dev` skips the dev ones.

## Semver

`MAJOR.MINOR.PATCH`: breaking change, new feature, bug fix.

| Range | Allows |
|---|---|
| `1.4.2` | exactly 1.4.2 (what `.npmrc` `save-exact=true` writes) |
| `~1.4.2` | `>=1.4.2 <1.5.0` (patches) |
| `^1.4.2` | `>=1.4.2 <2.0.0` (minor and patches) |

## Lockfile

`package-lock.json` records the exact resolved version and integrity hash of every package. It is committed so every machine and CI run installs the same tree. There is one lockfile at the repo root for all workspaces.

## Workspaces

The root `package.json` lists `"workspaces": ["frontend", "backend", "database"]`. One `npm ci` at the root installs all three and links `@finsight/database` into `node_modules`, so `backend` can `import ... from '@finsight/database'`.

## Fields worth knowing

| Field | Used for |
|---|---|
| `"type": "module"` | `.js` files are ES modules |
| `"private": true` | refuses `npm publish` |
| `"engines": { "node": ">=22" }` | with `engine-strict=true` in `.npmrc`, installs fail on an older Node |
| `"scripts"` | named commands for `npm run` |
| `"workspaces"` | the monorepo members |

## Demo

```bash
npm ci
npm ls --workspaces
npm audit
npm view express versions --json | tail
```
