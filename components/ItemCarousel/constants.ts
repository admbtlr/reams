export const BUFFER_LENGTH = 4

// Render window around the current slot: 1 slot before, current, 2 after.
// Slots outside the window render as stable empty Views (virtualized).
export const RENDER_WINDOW = { before: 1, after: 2 } as const

export const windowSize = () => RENDER_WINDOW.before + 1 + RENDER_WINDOW.after
