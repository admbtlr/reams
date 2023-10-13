import { id } from "utils"

export const mergeItems = (oldItems, newItems, currentItem) => {
  let items = mergeDedupe(oldItems, newItems).map(item => {
    return {
      ...item,
      _id: item._id ? item._id : id(item)
    }
  })

  if (currentItem) {
    let includesCurrent = items.find(item => item._id === currentItem._id)
    if (!includesCurrent) {
      items.push(currentItem)
    }
  }

  items.sort((a, b) => a.date_published - b.date_published)
  const extracted = extractReadItems(items)
  return extracted
}

function mergeDedupe (oldItems, newItems) {
  let items = [ ...oldItems ]
  newItems.forEach(newItem => {
    let match = false
    oldItems.forEach(oldItem => {
      if (newItem.id === oldItem.id) {
        match = true
      }
    })
    if (!match) {
      items.push(newItem)
    }
  })
  return items
}

function extractReadItems (items) {
  const unread = items.filter(item => !item.readAt)
  const read = items.filter(item => !!item.readAt)
  return { read, unread }
}
