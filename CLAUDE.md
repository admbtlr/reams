ZENITE=true (Rozenite Metro plugin)
yarn clear          # same, but clears Metro cache

# Platform shortcuts
yarn ios
yarn android

# Web
yarn deploy:web     # Vercel build + deploy

# Clean slate
yarn nuke           # rm node_modules, reinstall, reinstall pods
```

### Gulp asset server

Article bodies are rendered in embedded WebViews. In dev mode the injected CSS/JS is served by a local Gulp server (`gulpfile.js`). `yarn start` launches it automatically via `concurrently`. Without it, in-app article rendering will be broken.

### Environment

Copy `.env.example` to `.env`. Key variables:
- `EXPO_PUBLIC_API_URL` — URL of the reams-server (Next.js backend, hosted on Vercel)
- Supabase project URL + anon key
- Fastmail JMAP token + mailbox ID (for newsletters)

### External services required

1. **reams-server** — companion Next.js backend (separate repo), runs on Vercel
2. **Supabase** — database; schema in `supabase/schema.sql`
3. **Fastmail** (or any JMAP-compatible account) — newsletter ingestion

---

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | React Native 0.79 + Expo 53 |
| Language | TypeScript (`strict: true`, `allowJs: true`) — mix of `.ts`/`.tsx` and legacy `.js` |
| Navigation | `@react-navigation` v7 (Stack + NativeStack + Drawer) |
| State — global | Redux via RTK `configureStore` + `redux-persist` v5 |
| State — async | `redux-saga` (being gradually replaced by RTK thunks + listener middleware) |
| State — carousel | Zustand (`components/ItemCarousel/bufferedItemsStore.ts`) |
| Database | `expo-sqlite` with FTS5 (native) / IndexedDB via `idb` (web) |
| Styling | `StyleSheet.create` + named HSL colour system (`utils/colors.js`) |
| Article renderer | Embedded `react-native-webview` with injected JS + SCSS (served by Gulp) |
| Build | EAS (dev / preview / production profiles) + Fastlane for iOS |
| Tests | Jest + `jest-expo` + `@testing-library/react-native`; Detox for E2E |
| Analytics | Mixpanel + Sentry |
| Subscriptions | RevenueCat (`react-native-purchases`) |

---

## Project Structure

```
reams/
├── components/          # React components (screens, UI, article viewer)
│   ├── Item/            # Article reader (WebView wrapper + scroll handling)
│   ├── ItemCarousel/    # Swipeable article carousel + Zustand buffer
│   ├── ItemTitle/       # Per-article typographic title renderer
│   ├── onboarding/      # Onboarding flow
│   ├── web/             # Web-only navigation and layout
│   └── App.tsx          # Root navigator (Stack + Drawer)
├── containers/          # Legacy Redux connect() HOC wrappers
├── store/               # Redux store
│   ├── annotations/     # RTK slice ✓
│   ├── categories/      # RTK slice ✓ (+ dead legacy reducer — see below)
│   ├── config/          # Hand-written reducer + action types
│   ├── feeds/           # Hand-written reducer + action types
│   ├── hostColors/      # RTK slice ✓
│   ├── items/           # Hand-written reducers (unread / saved / meta)
│   ├── newsletters/     # RTK slice ✓
│   ├── ui/              # Hand-written reducer
│   ├── user/            # Hand-written reducer
│   ├── index.ts         # configureStore, persistor, sagaMiddleware setup
│   ├── listenerMiddleware.ts  # RTK listener — bridges bootstrap to new thunks
│   ├── migrations.ts    # 28 redux-persist migrations (v0–v27)
│   └── reducers.ts      # combineReducers + reduceReducers cross-slice handler
├── sagas/               # redux-saga side-effect workers
├── backends/            # API adapters (Feedbin, Reams/Supabase, Readwise, Fastmail)
├── storage/             # Platform storage facade (SQLite native / IndexedDB web)
├── hooks/               # useColor, useHeaderStyle
├── utils/               # Colours, dimensions, item style generation, etc.
├── webview/             # JS + SCSS injected into the article WebView
├── supabase/            # Supabase schema + edge functions
├── e2e/                 # Detox E2E tests
└── __tests__/           # Unit tests (backends, components, reducers, sagas, utils)
```

---

## State Management

This is the most complex part of the codebase and is **actively being migrated** from a legacy pattern to RTK. Understanding both patterns is essential.

### Store shape

```
configureStore (RTK)
  ├── downloadsListenerMiddleware  (prepended — RTK createListenerMiddleware)
  ├── sagaMiddleware               (prepended — redux-saga)
  └── RTK default middleware       (serializableCheck: false, immutableCheck: false)

persistReducer (redux-persist v5, current version: 27)
  └── reduceReducers(combineReducers(...), crossSliceReducer)
        ├── itemsUnread       ← hand-written switch reducer
        ├── itemsSaved        ← hand-written switch reducer
        ├── itemsMeta         ← hand-written switch reducer
        ├── feeds             ← hand-written switch reducer
        ├── feedsLocal        ← hand-written switch reducer
        ├── ui                ← hand-written switch reducer
        ├── remoteActionQueue ← hand-written switch reducer
        ├── config            ← hand-written switch reducer
        ├── user              ← hand-written switch reducer
        ├── categories        ← RTK createSlice ✓
        ├── annotations       ← RTK createSlice ✓
        ├── newsletters       ← RTK createSlice ✓
        └── hostColors        ← RTK createSlice ✓
```

The `crossSliceReducer` (in `store/reducers.ts`) handles the single cross-slice action `SORT_ITEMS`, which reads from both `feeds` and `newsletters` to re-sort `itemsUnread.items`. This is why `reduce-reducers` is used alongside `combineReducers`.

### Old pattern (hand-written slices)

- Action type string constants defined in a `types.ts` file (e.g. `export const ADD_FEED = 'ADD_FEED'`)
- Manual TypeScript interface per action type
- Plain `switch` reducer using spread operators — no Immer
- Async side-effects handled entirely by sagas

### New pattern (RTK slices)

- `createSlice` with Immer-powered mutations in reducers
- `createAsyncThunk` for each CRUD + fetch operation
- `createSelector` for memoised selectors, co-located in the slice file
- Old action string constants (e.g. `UNSET_BACKEND`) handled in new slices via `builder.addCase`
- Async side-effects as thunks; triggered at startup via the listener middleware

**When adding new features, use the new RTK pattern. When modifying existing hand-written slices, match the existing style in that file.**

### `store/categories/categories.ts` is dead code

`store/reducers.ts` imports from `categoriesSlice.ts`, not `categories.ts`. The old file has not been deleted but should be ignored.

### Listener middleware (`store/listenerMiddleware.ts`)

Listens for the `startDownloads` RTK action and dispatches three thunks:
- `fetchAnnotations()`
- `fetchCategories()`
- `fetchNewsletters()`

The saga root also listens for the legacy `START_DOWNLOADS` string constant and handles feeds/items. Both run concurrently — this is intentional. As domains migrate from sagas to RTK slices, their fetch logic moves from sagas into this listener.

### redux-persist

- Version 5 (old — migration to v6 is a future task)
- Storage: `FilesystemStorage` on native, `AsyncStorage` on web
- Two rehydration transforms:
  - `orientationTransform` — recalculates portrait/landscape from live screen dimensions
  - `messageQueueTransform` — clears the UI message queue on startup
- 28 migrations (v0–v27). v26–v27 moved `coverImageUrl` and `imageDimensions` out of Redux and into SQLite.

### serializableCheck and immutableCheck

Both are **disabled** in the middleware config. This was a performance decision but means non-serializable values in actions and accidental mutations in old reducers won't be caught automatically.

---

## Sagas

All sagas are registered in `sagas/index.ts` using `takeEvery` only (no `takeLatest`, debounce, or throttle). The goal is eventually to replace all sagas with RTK thunks, but this is a gradual process.

### Bootstrap sequence

1. `REHYDRATE` (redux-persist) → `init()` → `primeAllBackends()`
2. `START_DOWNLOADS` → `startDownloads()`:
   - `clearReadItems`
   - `fetchAllFeeds`
   - `fetchAllItems` (paginated, via `eventChannel`)
   - `pruneItems`
   - `decorateItems` (Mercury extraction, image analysis, TensorFlow face detection)
   - `executeRemoteActions`

### Key saga files

| File | Responsibility |
|------|----------------|
| `backend.ts` | Backend initialisation, Readwise/Feedbin priming |
| `fetch-items.js` | Paginated item fetching via `eventChannel` |
| `decorate-items.ts` | Item decoration pipeline (Mercury, image analysis, face detection) |
| `mark-read.js` | Mark items read, sync to backend |
| `prune-items.js` | Remove old/read items, deduplicate saved items |
| `feeds.ts` | Feed CRUD, favicon caching, mark-feed-read |
| `save-item.js` | Save/unsave item to backend |
| `external-items.js` | Save external URLs, decorate them |
| `annotations.ts` | Readwise highlight sync |
| `remote-action-queue.js` | Retry failed remote actions (uses `spawn` + infinite loop with backoff) |
| `reading-timer.js` | Track reading time — uses module-level mutable state (not in Redux) |
| `nudges.ts` | Supabase nudge pause/deactivate sync |
| `update-item.ts` | Persist item font size to SQLite |
| `categories.js` | Category CRUD → dispatches to remote action queue |

### Known bugs in sagas

Two annotation action type strings in `sagas/index.ts` have typos — these saga watchers silently never fire:

```ts
yield takeEvery('annotations/updateAnnotiation', updateAnnotation)  // "Annotiation" is wrong
yield takeEvery('annotations/deleteAnnotiation', deleteAnnotation)  // "Annotiation" is wrong
```

---

## Navigation

### Native (iOS / Android)

Defined in `components/App.tsx`. Structure:

```
AppStack (createStackNavigator)
  └── Drawer (createDrawerNavigator)
        ├── Feed      → FeedStack (createNativeStackNavigator)
        │     ├── Feed (FeedsScreen)
        │     ├── Library (FeedsScreen, isSaved=true)
        │     ├── NewFeedsList
        │     ├── FeedExpanded
        │     ├── Items (ItemsScreen)
        │     └── Modal
        ├── Library   → FeedStack (isSaved=true)
        ├── Highlights → HighlightStack
        ├── Accounts  → AccountStack
        └── Settings  → SettingsStack
```

The transition from the Feeds screen to the Items screen uses a custom `cardStyleInterpolator` that animates from the tapped feed card's exact position and size, expanding to fill the screen.

### Web

Completely separate code path in `components/web/Main.tsx`. Uses a permanent 55px icon sidebar for navigation instead of a drawer.

### Note on expo-router

`expo-router` is listed as a dependency and referenced in `app.json`, but the app uses `@react-navigation` directly. Expo Router is not actually used for routing.

---

## Article Rendering Pipeline

This is the core feature of the app.

### 1. Art direction (`utils/createItemStyles.js`)

When an item is decorated, `createItemStyles()` generates a random style object covering:
- Font pairing (heading + body fonts from a curated set)
- Colour scheme (using the feed's extracted colour via `react-native-image-colors`)
- Cover image treatment (multiply, screen, B&W, contain, inline)
- Title layout (uppercase, italic, centred, vertical, inverted background, etc.)

The style object is serialised and stored in SQLite. A compression map keeps the serialised size small.

### 2. Item inflation (Redux stubs → SQLite content)

Redux only stores lightweight item metadata (URL, title, feed ID, decoration flags, etc.). The full article content (`content_html`, `content_mercury`, `coverImageUrl`, `imageDimensions`, `styles`, etc.) lives in SQLite.

The `storage/` facade (`storage/index.ts`) provides `getItem`, `getItems`, `getItemsSync`, `setItems`, `updateItem`, `deleteItems`, and `searchItems`. On web, IndexedDB is used instead.

### 3. Carousel buffer (Zustand — `components/ItemCarousel/bufferedItemsStore.ts`)

A 5-item sliding window of inflated articles is maintained in Zustand, separate from Redux, for performance. `getItemsSync` is used (synchronous SQLite) to avoid async jank during swipes. The buffer expands as the user swipes forward, fetching new decorated items from Redux and inflating them on demand.

### 4. WebView renderer

Each article is displayed in a `react-native-webview`. The injected JavaScript (`webview/feed-item.js`) runs inside the WebView and:
- Cleans and restructures the HTML (removes empty elements, wraps orphans, converts divs to figures, etc.)
- Marks images, pull quotes, blockquotes, and short paragraphs with CSS classes
- Applies capitalisation and typography tweaks
- Initialises `rangy` for highlight serialisation/deserialisation
- Posts messages back to React Native for image taps, link taps, and highlight events

The injected SCSS (`webview/item-styles.scss`) is compiled by Gulp and served locally in dev mode.

---

## Backends

`backends/index.js` is a plain JS facade. Most write operations use a **dual-write pattern**: Feedbin + Reams/Supabase both receive the write.

| Backend | Auth | Used for |
|---------|------|---------|
| `reams.ts` | Supabase JWT | Primary backend — feeds, items, categories, annotations |
| `feedbin.ts` | HTTP Basic Auth | Optional secondary — feeds, items, read state |
| `readwise.ts` | Token Auth | Highlight sync only |
| `fastmail.ts` | JMAP token | Newsletter ingestion from email |
| `feedwrangler.js` | Token Auth | Legacy, largely unused |

Categories, newsletters, and annotations are Reams-only — Feedbin support for these is commented out.

---

## Storage Layer

`storage/index.ts` is a platform facade:

| Platform | Implementation |
|----------|----------------|
| Native | `expo-sqlite` (synchronous + async API) — `storage/sqlite.ts` |
| Web | IndexedDB via `idb` — `storage/idb-storage.ts` |

The SQLite schema has its own migration system (separate from redux-persist migrations) tracked via `PRAGMA user_version`. Full-text search uses an FTS5 virtual table (`items_search`) with an `after insert` trigger.

`searchItems` on web is not implemented (throws). The SQLite `searchItems` falls back to a `LIKE` query rather than FTS5 (the FTS5 table has had reliability issues — see comment in `sqlite.ts`).

---

## Colour System

All colours go through `utils/colors.js` → `hslString(name, modifier?, opacity?)`.

- Colour names are defined in `utils/colors.json` with light and dark mode values
- Dark mode is detected via `Appearance.getColorScheme()` and the Redux `config.isDarkMode` flag
- Feed accent colours are extracted from feed favicons using `react-native-image-colors` and stored in the `hostColors` RTK slice
- `useColor` hook (`hooks/useColor.ts`) provides reactive colour values in components

---

## Component Patterns

- **Functional components with hooks** throughout, except `ItemCarousel/index.tsx` which is a class component (for performance / fine-grained lifecycle control during swipes)
- **No styled-components** — `StyleSheet.create` or inline style objects everywhere
- **`containers/`** holds legacy `connect()` HOC wrappers for components that predate hooks; new components use `useSelector` / `useDispatch` directly
- **`withUseColorHOC.tsx`** wraps class components to give them access to the colour system

---

## Platform Differences

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Navigation header | Blur effect (`headerBlurEffect`) | Solid background | Permanent sidebar |
| Storage | SQLite | SQLite | IndexedDB |
| Auth | Apple Sign-In + Supabase | Supabase | Supabase |
| Subscriptions | RevenueCat | RevenueCat | Not implemented |
| Full-text search | SQLite FTS5 | SQLite FTS5 | Not implemented |
| Fonts | Loaded natively | Loaded natively | `WebFontsLoader` component |
| API calls | Direct | Direct | Via CORS proxy |
| Mocks | — | — | `web-mocks/` shims for RN-only modules |

---

## Testing

```bash
yarn test                  # Jest unit tests
```

Tests live in `__tests__/` mirroring the source structure:
- `__tests__/backends/` — backend adapter tests
- `__tests__/components/` — component render tests
- `__tests__/reducers/` — reducer unit tests
- `__tests__/sagas/` — saga tests
- `__tests__/storage/` — storage layer tests
- `__tests__/utils/` — utility function tests

Uses `jest-expo` preset, `babel-jest` for both `.js` and `.ts`, and `@testing-library/react-native`. Fake timers are enabled globally. `@shopify/react-native-skia` is mocked.

E2E tests use Detox (`e2e/`), targeting the iOS simulator.

---

## Build & Distribution

EAS profiles (`eas.json`):

| Profile | Purpose |
|---------|---------|
| `development` | Dev client build, internal distribution |
| `preview` | Internal distribution, APK for Android |
| `production` | Auto-increment build number, App Store / Play Store |

Node version is pinned to 20.18.0 (see `.node-version`, `.nvmrc`, `.tool-versions`).

Several packages require patches (applied via `patch-package` on `postinstall`):
- `react-native-webview` — custom patches for article rendering
- `react-native-share-menu` — iOS share extension fixes
- `@tensorflow/tfjs-react-native` — compatibility fixes
- `expo-gl`, `expo-device`, `expo-dev-menu` — Expo SDK compatibility

---

## Known Technical Debt

- **Sagas → RTK thunks**: The long-term goal is to replace all sagas with RTK `createAsyncThunk` + listener middleware. The four RTK slices (`annotations`, `categories`, `newsletters`, `hostColors`) are the template for how this should look.
- **redux-persist v5**: Should be upgraded to v6. The migration system and transforms would need updating.
- **`serializableCheck` / `immutableCheck` disabled**: Re-enabling these after fixing the old reducers would catch a class of bugs.

- **`store/categories/categories.ts`**: Dead code, can be deleted.
- **`.js` saga files**: Half the saga files are plain JS. Converting to TypeScript would improve safety.
- **No `.pending` / `.rejected` handlers in RTK thunks**: All async thunks silently ignore errors.
- **`reading-timer.js` module-level state**: Reading time is tracked via closure variables outside Redux, invisible to Redux DevTools.
- **Web full-text search**: Not implemented — `searchItems` throws on web.
