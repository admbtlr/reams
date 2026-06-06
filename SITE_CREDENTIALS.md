# Site Credentials Feature Plan

## Background

Some RSS feeds only provide excerpts of articles — the full content lives behind a login wall on the originating site. Reams already supports fetching full-text content via the Mercury scraper (toggled per-feed via `isMercury`, or per-item via `showMercuryContent`). However, Mercury currently makes unauthenticated requests, so it receives the paywall/login-redirect version of the page rather than the full article.

The canonical use case is **Patreon newsletters**: a creator's RSS feed contains only an excerpt, and the full post is only accessible to subscribers. A user who is subscribed to that Patreon should be able to read the full article inside Reams.

The solution is to let users store credentials (specifically, browser session cookies) for specific sites, and then forward those cookies when the Mercury scraper fetches the full-text version of articles from those sites.

---

## How the Current Mercury Flow Works

1. When an item is decorated, `loadMercuryStuff` in `backends/index.js` fires.
2. It calls `GET EXPO_PUBLIC_API_URL/mercury?url=<item url>` — a server-side proxy to the Mercury parser.
3. The server fetches the target URL (unauthenticated), parses it with Mercury, and returns the result.
4. The parsed content is stored as `content_mercury` on the item.
5. The app switches to showing `content_mercury` when `showMercuryContent` is true (either because the user toggled it, or because `feed.isMercury` is set, or because the feed's `content_html` is just an excerpt).

**The problem:** Step 3 makes an unauthenticated request. For Patreon and similar sites, the server gets the public (excerpted or blocked) version of the page.

**The fix:** Pass the user's session cookies for that site through to the Mercury API request, so the server fetches the authenticated version.

---

## Architecture Overview

```
User enters cookies for patreon.com
        ↓
Stored on Feed object (feed.credentials.cookies)
        ↓
When loadMercuryStuff is called for an item from that feed:
        ↓
Cookies are forwarded to the Mercury API endpoint as a request header
        ↓
The API server forwards the cookies when fetching the target URL
        ↓
Mercury receives the full authenticated page and parses it
        ↓
Full content stored as item.content_mercury ✓
```

---

## Design Decisions

### 1. Credential Format: Cookies

For Patreon and most subscription sites, the simplest approach is **raw session cookies** — the user copies their cookies from their browser's developer tools and pastes them in. This:
- Works for any site without needing site-specific auth logic on the server
- Does not require storing a username/password
- Mirrors how tools like `curl -b "..."` work

A future iteration could support username/password for sites where we implement a server-side login flow, but cookies are the right starting point.

### 2. Where Credentials are Stored

Credentials are stored on the **Feed** object in the Redux store (which is persisted). The `credentials` field is keyed by **hostname** (e.g. `patreon.com`) rather than per-feed, so that:
- Multiple feeds from the same site share one set of credentials
- The user only has to enter their cookies once per site

Example shape:
```ts
// On the Feed object
credentials?: {
  [hostname: string]: {
    cookies: string  // raw Cookie header value, e.g. "session_id=abc123; __cf_bm=xyz"
  }
}
```

### 3. Security Considerations

Cookies stored in Redux are persisted to disk via `redux-persist`. For a first version this is acceptable, but a hardened implementation should migrate credentials to the **iOS Keychain / Android Keystore** via `expo-secure-store`. This is noted as a follow-up task in the checklist below.

### 4. Backend Changes Required

The Mercury proxy endpoint at `EXPO_PUBLIC_API_URL/mercury` needs to:
- Accept an optional `X-Scraper-Cookie` request header (or similar)
- Forward that value as the `Cookie` header when fetching the target URL

This is a small change on the server but is a **prerequisite** for the feature to work end-to-end.

---

## Implementation Plan

### Part 1: Data Model

**File:** `store/feeds/types.ts`

Add a `credentials` field to the `Feed` interface:

```ts
export interface FeedCredentials {
  cookies: string
}

export interface Feed extends Source {
  feedbinId?: number
  rootUrl: string
  credentials?: {
    [hostname: string]: FeedCredentials
  }
}
```

Add new Redux action types:

```ts
export const SET_FEED_CREDENTIALS = 'SET_FEED_CREDENTIALS'
export const CLEAR_FEED_CREDENTIALS = 'CLEAR_FEED_CREDENTIALS'

interface setFeedCredentialsAction {
  type: typeof SET_FEED_CREDENTIALS
  feedId: string
  hostname: string
  cookies: string
}

interface clearFeedCredentialsAction {
  type: typeof CLEAR_FEED_CREDENTIALS
  feedId: string
  hostname: string
}
```

**File:** `store/feeds/feeds.ts`

Handle the new actions in the `feeds` reducer:

```ts
case SET_FEED_CREDENTIALS:
  return {
    ...state,
    feeds: state.feeds.map(feed =>
      feed._id === action.feedId
        ? {
            ...feed,
            credentials: {
              ...feed.credentials,
              [action.hostname]: { cookies: action.cookies }
            }
          }
        : feed
    )
  }

case CLEAR_FEED_CREDENTIALS:
  return {
    ...state,
    feeds: state.feeds.map(feed => {
      if (feed._id !== action.feedId) return feed
      const { [action.hostname]: _, ...remaining } = feed.credentials ?? {}
      return { ...feed, credentials: remaining }
    })
  }
```

---

### Part 2: Pass Credentials to Mercury

**File:** `backends/index.js`

Modify `loadMercuryStuff` to accept and forward credentials:

```js
export async function loadMercuryStuff(item) {
  const url = getMercuryUrl(item)
  const headers = {}

  // If the item's feed has stored credentials for this URL's hostname,
  // pass them through to the Mercury scraper API.
  if (item.feed_credentials) {
    try {
      const hostname = new URL(item.url).hostname
      const creds = item.feed_credentials[hostname]
      if (creds?.cookies) {
        headers['X-Scraper-Cookie'] = creds.cookies
      }
    } catch (e) {
      // invalid URL, skip
    }
  }

  try {
    const response = await fetch(url, { headers })
    if (response.ok) {
      return response.json()
    }
    log(`${response.url}: ${response.status} ${response.statusText}`)
    return
  } catch (e) {
    log('loadMercuryStuff', e)
  }
}
```

`item.feed_credentials` needs to be set when the item is prepared for decoration. This happens in `sagas/decorate-items.ts` where items are inflated before `loadMercuryStuff` is called — the feed's `credentials` should be merged onto the item at that point.

**File:** `sagas/decorate-items.ts`

When assembling the item for decoration, include the feed's credentials:

```ts
// In assembleBasicDecoration, after inflating the item:
const feed = yield select(state => 
  state.feeds.feeds.find(f => f._id === item.feed_id)
)
const itemWithCredentials = {
  ...item,
  feed_credentials: feed?.credentials
}
// then pass itemWithCredentials to loadMercuryStuff
```

---

### Part 3: UI — Feed Credentials Entry

**File:** `components/FeedDetails.js`

Add a "Site Credentials" section to the feed detail screen, below the existing toggles (Mercury, Mute, Like). It shows the hostname derived from the feed's URL and a field for pasting cookies.

```jsx
// Determine the hostname for this feed
const feedHostname = (() => {
  try { return new URL(feed.url).hostname } catch { return null }
})()

// Get any existing credentials for this hostname
const existingCookies = feed.credentials?.[feedHostname]?.cookies ?? ''
const [cookieInput, setCookieInput] = useState(existingCookies)
const [isEditing, setIsEditing] = useState(false)

const saveCredentials = () => {
  if (cookieInput.trim()) {
    dispatch({
      type: SET_FEED_CREDENTIALS,
      feedId: feed._id,
      hostname: feedHostname,
      cookies: cookieInput.trim()
    })
  } else {
    dispatch({
      type: CLEAR_FEED_CREDENTIALS,
      feedId: feed._id,
      hostname: feedHostname
    })
  }
  setIsEditing(false)
}
```

The UI section itself (inside the FeedDetails render):

```jsx
{feedHostname && (
  <View style={credentialsSection}>
    <SwitchRow
      label={`Credentials for ${feedHostname}`}
      help="Paste your browser cookies to allow Reams to fetch paywalled articles"
      icon={<KeyIcon />}
      value={!!existingCookies || isEditing}
      onValueChange={(val) => {
        if (val) {
          setIsEditing(true)
        } else {
          setCookieInput('')
          dispatch({ type: CLEAR_FEED_CREDENTIALS, feedId: feed._id, hostname: feedHostname })
        }
      }}
    />
    {(isEditing || existingCookies) && (
      <TextInput
        multiline
        placeholder='Paste cookies here, e.g. "session_id=abc; __cf_bm=xyz"'
        value={cookieInput}
        onChangeText={setCookieInput}
        onBlur={saveCredentials}
        style={credentialsInputStyle}
        autoCapitalize="none"
        autoCorrect={false}
      />
    )}
    {existingCookies && !isEditing && (
      <Text style={credentialsSetStyle}>✓ Credentials saved for {feedHostname}</Text>
    )}
  </View>
)}
```

---

### Part 4: Backend (Server-Side)

The Mercury proxy endpoint needs updating to forward cookies. Pseudocode for the change:

```js
// In the /mercury route handler on the server:
app.get('/mercury', async (req, res) => {
  const url = req.query.url
  const scraperCookie = req.headers['x-scraper-cookie']

  const fetchOptions = scraperCookie
    ? { headers: { Cookie: scraperCookie } }
    : {}

  const result = await Mercury.parse(url, { fetchOptions })
  res.json(result)
})
```

---

## How to Get Cookies from a Browser

Instructions to show users (in the app's help text or onboarding):

1. Log in to the site in **Safari** (or any browser) on your computer
2. Open **Developer Tools** → **Network** tab
3. Reload the page and click on any request to that site
4. Find the **`Cookie`** header in the request headers
5. Copy the entire value and paste it into Reams

Or using the browser console:
```js
// Paste in browser console while on the site:
copy(document.cookie)
```

---

## Implementation Checklist

### Client

- [ ] Add `FeedCredentials` type and update `Feed` interface in `store/feeds/types.ts`
- [ ] Add `SET_FEED_CREDENTIALS` and `CLEAR_FEED_CREDENTIALS` action types
- [ ] Handle new actions in `store/feeds/feeds.ts` reducer
- [ ] Merge `feed.credentials` onto items before decoration in `sagas/decorate-items.ts`
- [ ] Update `loadMercuryStuff` in `backends/index.js` to forward `X-Scraper-Cookie` header
- [ ] Add credentials UI section to `components/FeedDetails.js`
- [ ] Add `SET_FEED_CREDENTIALS` / `CLEAR_FEED_CREDENTIALS` to `store/feeds/types.ts` `FeedActionTypes` union
- [ ] Test with a Patreon feed end-to-end

### Server

- [ ] Update `/mercury` endpoint to accept and forward `X-Scraper-Cookie` header

### Follow-up / Hardening

- [ ] Move credentials storage from Redux/AsyncStorage to `expo-secure-store` (iOS Keychain / Android Keystore)
- [ ] Add a cookie validity check — attempt a fetch and warn the user if the cookies appear to be expired
- [ ] Consider supporting multiple credential formats (username/password for sites with a simple login API)
- [ ] Strip credentials from any analytics/logging on the server

---

## Files Changed

| File | Change |
|------|--------|
| `store/feeds/types.ts` | Add `FeedCredentials` type, `SET_FEED_CREDENTIALS`, `CLEAR_FEED_CREDENTIALS` actions |
| `store/feeds/feeds.ts` | Handle new actions in reducer |
| `backends/index.js` | Forward cookies in `loadMercuryStuff` |
| `sagas/decorate-items.ts` | Attach `feed_credentials` to items before decoration |
| `components/FeedDetails.js` | Add credentials entry UI |
| `server/routes/mercury.js` | *(server)* Forward `X-Scraper-Cookie` to fetched URL |

---

## Notes

- Cookies expire. Users will need to refresh them periodically (typically every few weeks for session cookies). A future improvement could detect 401/403 responses and prompt the user to update their credentials.
- This approach works for **any** site that uses cookie-based authentication — not just Patreon. Substack, Ghost, and other membership platforms should work the same way once credentials are stored.
- The `isMercury` feed toggle should still be set to `true` for feeds where you want full-text fetching — the credentials only change *whether the fetch succeeds*, not whether it's attempted.
