# Plan: full-width virtualized carousel

Replace the 4-screen-wide buffer ScrollView (which moves `Item` components around
on every buffer rebuild) with a full-width ScrollView filled with stable empty
slot Views, rendering only a 4-item window of slots at a time.

Target layout while swiping:

```
••••••IVII••••
```

`•` = empty slot View (screen-width), `I` = rendered Item, `V` = current/visible slot.

## 1. `components/ItemCarousel/SwipeableViews.tsx` — stable full-width ScrollView

- Render the horizontal `Reanimated.ScrollView` with content width
  `numItems * screenWidth` (numItems from Redux via the container). Children =
  `numItems` stable empty `<View style={{ width: screenWidth }} />` **slots**,
  keyed by slot index (`slot-0` … `slot-N`). Slots never move or re-mount.
- Only slots in the window `[currentSlot-1, currentSlot, currentSlot+1,
  currentSlot+2]` (clamped at edges) render an `<ItemComponent>` inside their
  slot View. Key the Item by item `_id` so React mounts/unmounts it within the
  slot as the window slides — no ScrollView resize, no scroll re-anchoring on
  swipe.
- Scroll handling mostly unchanged: `snapToInterval={screenWidth}`;
  `onEndDrag`/`onMomentumEnd` compute `newSlot = Math.round(offset / screenWidth)`
  — now the slot index directly (no `bufferStartIndex` offset math).

## 2. `components/ItemCarousel/bufferedItemsStore.ts` — slot-based state

- Keep `seenItems` (display order == slot order, so `seenItems[slot]` is the item
  at slot `slot`) and lazy inflation via `getItemsSync`.
- Replace `bufferedItems` / `bufferStartIndex` / `bufferIndex` /
  `rebuildBufferFromSeen()` with:
  - `currentSlot`: position in the ScrollView.
  - Derived `renderedWindow`: item ids for slots
    `[currentSlot-1 … currentSlot+2]` (clamped).
- Next-item selection stays dynamic: when advancing past the end of `seenItems`,
  call `findNextDecoratedItems` (decorated-first, undecorated fallback) and
  append — slots are allocated at render time, not pre-mapped to the Redux list.
  Forward-looking only; already-displayed items are never re-picked.
- `setBufferIndex` → `setCurrentSlot`: dispatches `UPDATE_CURRENT_ITEM` with
  `seenItems[newSlot]._id`, fetches more decorated items near the end of
  `seenItems` (existing logic), but no longer rebuilds/moves anything.
- On filter/display-mode change (`seenItemsStillValid` check) or `clearBuffer`:
  reset to slot 0 and re-anchor scroll.

## 3. Scroll re-anchoring

- `useLayoutEffect`: `scrollTo({ x: currentSlot * screenWidth, animated: false })`
  whenever the item list is reset — replaces the current
  `bufferStartIndex === 0 ? 0 : 1` logic.

## 4. `components/ItemCarousel/AnimationContext.tsx` — shared values keyed by item id

- Replace fixed `BUFFER_LENGTH`-sized arrays with lazy entries in a
  `Map<string, SharedValue>` keyed by item `_id`, exposed via
  `getVerticalScroll(id)` / `getHeaderVisible(id)` / `getButtonsVisible(id)`.
- Only rendered items get entries (~4–6 live at a time); entries are cleaned up
  when an item leaves the window. No 1000+ shared values.

## 5. `components/Item/index.tsx`

- Accept a `slotIndex` prop (position in the ScrollView) alongside the item.
- Use it for `horizontalScroll` interpolation ranges (`pageWidth * slotIndex`)
  and for the animation Maps (keyed by `_id`). `isVisible` =
  `slotIndex === currentSlot`.

## 6. TopBars / ButtonSets / TopBar / ButtonSet

- `TopBars.tsx` / `ButtonSets.js`: render one TopBar/ButtonSet per **rendered
  window slot only** (≤4), not per buffered item.
- Position each at `left: slotIndex * screenWidth` inside a full-width absolute
  overlay; change all `interpolate(horizontalScroll, …)` input ranges from
  buffer-local indices to **slot indices**.
- Counter in `TopBar.tsx` becomes `slotIndex + 1 / numItems` (drop
  `bufferStartIndex`).
- Use the `_id`-keyed animation Maps for `headerVisibles` / `buttonsVisibles`.

## 7. Onboarding

- Migrate the onboarding branch into the same structure: onboarding pages become
  slots (2–3) in the same full-width ScrollView, with identical window logic.

## 8. Migration & verification steps

1. Add window constants: `{ before: 1, after: 2 }` in `constants.ts`.
2. Rework the store first (slot semantics), keeping old selectors as thin
   adapters so the app compiles.
3. SwipeableViews: slots + window rendering.
4. AnimationContext Map + consumer updates (`Item`, `TopBar`, `ButtonSet`).
5. Onboarding migration.
6. Verify: swipe through 1000+ items (no re-anchor jumps, TopBar/ButtonSet fade
   at window edges), filter change resets to slot 0, onboarding intact; run
   `__tests__/components/ItemCarousel/*`.

## Decisions (from discussion)

- Ordering: dynamic at render time (decorated-first when picking the *next*
  item), not a fixed pre-mapped list.
- Window: `[current-1, current, current+1, current+2]`, clamped at edges.
- Animation shared values: keyed by item `_id` in a Map, only for rendered items.
- TopBars/ButtonSets: rendered only for the ~4 rendered slots.
- Onboarding: migrated to the same scheme.
- List-change re-anchor: `scrollTo(currentSlot * screenWidth)`.
