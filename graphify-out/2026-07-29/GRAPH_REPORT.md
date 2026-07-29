# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 122 nodes · 141 edges · 20 communities (11 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.7)
- Token cost: 522 input · 48 output

## Graph Freshness
- Built from commit: `17234ce7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Development and Linting Tools
- Change Request UI Components
- Core Runtime Dependencies
- Faculty Directory UI
- App.jsx
- package.json
- index.html
- vercel.json
- faculty_change_requests table
- faculty_members table
- profiles table
- Android Chrome Icon 192x192
- Android Chrome Icon 512x512
- Apple Touch Icon
- Favicon 16x16

## God Nodes (most connected - your core abstractions)
1. `supabase` - 6 edges
2. `scripts` - 5 edges
3. `DEPARTMENTS` - 5 edges
4. `ChangeRequestsPanel()` - 4 edges
5. `payloadEntries()` - 3 edges
6. `loadDismissedIds()` - 3 edges
7. `Main()` - 3 edges
8. `Pagination()` - 3 edges
9. `@supabase/supabase-js` - 2 edges
10. `@vercel/analytics` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Main()` --references--> `DEPARTMENTS`  [EXTRACTED]
  src/components/Main.jsx → src/constants/departments.js

## Import Cycles
- None detected.

## Communities (20 total, 9 thin omitted)

### Community 0 - "Development and Linting Tools"
Cohesion: 0.07
Nodes (27): autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies (+19 more)

### Community 1 - "Change Request UI Components"
Cohesion: 0.15
Nodes (16): ACTION_LABELS, ChangeRequestsPanel(), dismissedStorageKey(), FIELD_LABELS, HIDDEN_FIELDS, loadDismissedIds(), payloadEntries(), REQUEST_STATUS_STYLES (+8 more)

### Community 2 - "Core Runtime Dependencies"
Cohesion: 0.11
Nodes (19): framer-motion, fuse.js, dependencies, framer-motion, fuse.js, react, react-dom, react-icons (+11 more)

### Community 3 - "Faculty Directory UI"
Cohesion: 0.17
Nodes (11): Header(), AVATAR_GRADIENTS, FacultyCard(), getGradient(), Main(), STATUS_LABELS, STATUS_STYLES, getPages() (+3 more)

### Community 4 - "App.jsx"
Cohesion: 0.24
Nodes (5): App(), Footer(), ProtectedRoute(), Login(), supabase

### Community 5 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

## Knowledge Gaps
- **49 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Development and Linting Tools` to `package.json`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Core Runtime Dependencies` to `package.json`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _49 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Development and Linting Tools` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Change Request UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.14736842105263157 - nodes in this community are weakly interconnected._
- **Should `Core Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._