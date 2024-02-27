export const createSavedItem = (i: string): {
  title: string
  _id: string
  isSaved: boolean
  savedAt: number | undefined
  url: string
} => ({
  title: `Item ${i}`,
  _id: i,
  isSaved: true,
  savedAt: Math.round(new Date(`2024-02-${16 + Number.parseInt(i)} 15:59:01.232+00`).valueOf() / 1000),
  url: ''
})

