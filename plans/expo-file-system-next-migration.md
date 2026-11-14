# Plan: migrate expo-file-system legacy → new File/Directory API (SDK 54)

SDK 54 made the new object-oriented `expo-file-system` API the default and moved the
old function-style API to `expo-file-system/legacy`. The legacy path is a stopgap —
Expo plans to remove it in SDK 55. This plan migrates all 9 files off `/legacy`.

## Current state

All source imports already point at `expo-file-system/legacy` (stopgap applied).
~20 call sites across 9 files. Test files mock `expo-file-system` directly.

## API mapping

| Legacy | New |
|---|---|
| `FileSystem.documentDirectory` | `Paths.document` (a `Directory`) |
| `FileSystem.cacheDirectory` | `Paths.cache` |
| `await getInfoAsync(uri)` → `.exists` | `file.exists` (sync property) |
| `await makeDirectoryAsync(uri, { intermediates: true })` | `dir.create({ intermediates: true })` |
| `await readAsStringAsync(uri)` | `await file.text()` (or `.bytes()`, `.base64()`) |
| `await readAsStringAsync(uri, { encoding: Base64 })` | `await file.base64()` |
| `await writeAsStringAsync(uri, s)` | `file.write(s)` |
| `await deleteAsync(uri)` | `file.delete()` / `dir.delete()` |
| `await downloadAsync(url, dest)` | `await File.downloadFileAsync(url, file)` |
| `await readDirectoryAsync(uri)` | `dir.list()` |
| `await copyAsync({from, to})` | `file.copy(dest)` |
| `await moveAsync({from, to})` | `file.move(dest)` |

Path building changes from string concat to object composition:

```ts
// legacy
`${FileSystem.documentDirectory}feed-icons/${id}.png`

// new
import { File, Directory, Paths } from 'expo-file-system'
new File(Paths.document, 'feed-icons', `${id}.png`).uri
```

## Gotchas

- `exists`, `size`, `list()` are **synchronous** now — no `await`.
- Don't cache `.exists` — it's a live property.
- Missing-file reads now **throw** typed errors instead of resolving `{exists: false}` — keep try/catch around reads that used to fail soft.
- `file.uri` gives the same `file://` string for interop with other native modules.
- Don't mix legacy and new imports in the same file.
- No `createDownloadResumable` usage in this codebase — plain `downloadAsync` only, so no task-object rewrite needed.

## Migration order (leaf → root)

1. **`utils/index.ts`** — central helpers everything funnels through:
   `getCachedCoverImagePath`, `getCachedFeedIconPath`, `getRenderedFeedIconPath`,
   `fileExists`. Convert path builders to `new File(Paths.document, ...)` and
   `fileExists` to sync `file.exists`.
2. **`components/Favicon.tsx`** — `makeDirectoryAsync` → `dir.create()`,
   `readDirectoryAsync` → `dir.list()`, `downloadAsync` → `File.downloadFileAsync()`.
3. **`components/FeedIcon.tsx`** — one `downloadAsync` call.
4. **`sagas/feeds.ts`** — `makeDirectoryAsync` + `downloadAsync` for feed icons.
5. **`sagas/decorate-items.ts`** — `getInfoAsync` + `downloadAsync` for cover images.
6. **`utils/face-detection.ts`** — `readAsStringAsync` with Base64 → `file.base64()`,
   `deleteAsync` → `file.delete()`.
7. **`utils/item-utils.js`** — `deleteAsync` → `file.delete()`.
8. **`components/OPMLImport.tsx`** — `readAsStringAsync` → `file.text()`.
9. **`hooks/useColor.ts`** — imports FileSystem but the only usage goes through
   `fileExists` from `utils`; likely just drops the import entirely.

## Guardrails

- Add ESLint `no-restricted-imports` rule banning `expo-file-system/legacy` so no
  new legacy usage sneaks in during migration.
- Update the two test mocks (`__tests__/components/FeedIcon.test.tsx`,
  `CardCoverImage.test.tsx`) from `jest.mock('expo-file-system')` to mock
  `expo-file-system` new API shape (`File`, `Paths`, `Directory`).
- Run `yarn test` after each file; full suite must stay green (currently 142 passing).
- Do one file per commit for easy review/revert.

## Done when

- Zero imports of `expo-file-system/legacy` in source.
- ESLint rule active.
- `yarn test` green, app manually verified on iOS simulator (favicon download,
  cover image caching, OPML import, face detection path).
