# DSH dev environment — setup notes

Configured on 2026‑09‑23 for this workspace (`D:\myyan\Yandex.Disk\www-yandex\romka-and-babushka`).
Plugins come from the community registry at <https://github.com/topics/dsh-plugin>
(catalog: <https://awesome-dsh-plugin.com>, market inside DSH: **Settings → Plugin Market**).

## 1. pnpm

The machine had **no pnpm** and `dsh plugin` forwards everything to `pnpm` in the profile
directory, so plugin management was impossible. `corepack` and a global `npm i -g pnpm`
both fail here (`EPERM` on `%LOCALAPPDATA%\node`, and the DSH profile dir is outside the
agent sandbox). Instead pnpm was installed *inside this workspace*:

- binary: `.dsh-tools/node_modules/@pnpm/exe.win32-x64/pnpm.exe` (pnpm 12.5.1)
- shim:   `.dsh-tools/bin/pnpm.cmd` — also points `PNPM_HOME`, the store and the npm cache at
  `.dsh-tools/`, so nothing is written to `%LOCALAPPDATA%`.

Put it on `PATH` before using `dsh plugin`:

```pwsh
$env:PATH = "D:\myyan\Yandex.Disk\www-yandex\romka-and-babushka\.dsh-tools\bin;$env:PATH"
```

## 2. Installed plugins (web profile)

Profile: `C:\Users\win\.dsh\profiles\web` — 18 bundles total (2 official + 16 community).

| Plugin | What it gives you |
| --- | --- |
| `dshmarket` | Plugin Market inside Settings: browse/search 4100+ plugins, one‑click install, themes, updates, disable/enable, diagnostics, backup. |
| `dsh-better-sidebar` | VS Code‑style workbench in the right sidebar: file tree, editor, terminal, Git, browser preview, split panes. |
| `dsh-classic-coding` | Inline Monaco editor + lazy file tree over the conversation, so the workspace can be edited without leaving the GUI. |
| `dsh-file-explorer-kit` | Session‑scoped **Files** tab: browse the active workspace with breadcrumbs, preview Markdown/images/text/PDF. |
| `dsh-quick-open` | `Ctrl+P` fuzzy file palette over the workspace index, `dir:`/`file:` prefixes, `:line` jumps, `Ctrl+Enter` drops a file reference into the draft. |
| `dsh-open-with` | Header button to open the current workspace in VS Code / terminal / Explorer. |
| `dsh-edit-diff` | Re‑renders `edit`/`write` tool cards as compact line‑level diffs (true changed lines only, intra‑line highlight). |
| `dsh-tool-autoexpand` | New tool‑call cards expand automatically; tri‑state toggle (no‑op / expand / collapse). |
| `dsh-turn-outline` | Sidebar tab folding a session into user turns (input, tool steps, output) with jump‑back. |
| `dsh-code-collector` | Composer‑side panel collecting every code block of the session — by language/file, version history, copy/download (`Alt+Shift+C`). |
| `dsh-skill-manager` | Browse/manage installed skills. |
| `dsh-mcp-manager` | **Installed but not loaded** (see caveat) — visual MCP server manager. |
| `dsh-prompt-history` | Up/Down in an empty composer cycles previously sent prompts; the draft is restored at the end. |
| `dsh-always-status-bar` | Always‑visible per‑message status: timestamp, duration, TTFT, tok/s. |
| `dsh-favicon-status` | Tab favicon shows session state (spinning = working, amber = waiting on you, green = done). |
| `dsh-keep-awake` | **Installed but not loaded** (see caveat) — wake lock while agents/subagents/jobs run. |
| `dsh-settings-hub` | Groups third‑party plugin settings under one collapsible nav entry. |
| `dsh-update-status` | Sidebar chip with the running DSH version, npm channels, upgrade command. |

## 3. Caveats

- `dsh-mcp-manager@0.6.0` declares no `dsh.bundle` manifest, so DSH installed it as a plain
  dependency and did **not** activate it. It stays in `package.json` for a later release that
  gains a bundle.
- `dsh-keep-awake` is installed and pinned in `dependencies`, but was removed from
  `dsh.profile.bundles` on purpose: its `engines.node` is `>=22.0.0` and the DSH `enabled()`
  gate compares plain semver, so a possible `engines.dsh` value would be rejected
  (`>=22.0.0` is not a valid DSH range) and could stop the whole profile from booting.
  To enable it, add `"dsh-keep-awake"` back to `dsh.profile.bundles` and restart — the value
  above was the conservative choice.
- The DSH web profile is booted in this GUI session; profile changes only take effect on
  **restart**, unless the plugin is client‑only and DSH's live patch reload picks it up.

## 4. Verification performed

- `dsh --profile web --dump-config` composes the full tree with all 16 community bundles.
- A throwaway host was booted on `http://127.0.0.1:3131` (separate from the GUI on 3080),
  the UI answered `HTTP 200`, and the market's host route `/dsh-market/status` answered
  `HTTP 200` with `{"active":false,...}` — i.e. the plugins load.
- The temporary host was stopped afterwards; the GUI on port 3080 was left untouched.

## 5. Useful commands

```pwsh
$env:PATH = "D:\myyan\Yandex.Disk\www-yandex\romka-and-babushka\.dsh-tools\bin;$env:PATH"
$dsh = "C:\Users\win\AppData\Local\npm-cache\_npx\1e7f6d9597241db0\node_modules\@deepseek-ai\dsh\lib\bin.js"

node $dsh plugin --profile web add <package>       # install
node $dsh plugin --profile web remove <package>    # uninstall
node $dsh plugin --profile web update              # update all
node $dsh plugin --profile web list                # installed tree
node $dsh --profile web --dump-config              # check the tree composes
```

Prefer the in‑GUI **Plugin Market** once the host has been restarted — it does the same
thing with a UI, including one‑click disable/enable without a restart.