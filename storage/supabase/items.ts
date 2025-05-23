import { doQuery, getUserId, supabase } from '.'
import { Item } from '../../store/items/types'
import { pgTimestamp } from '../../utils'

export const getSavedItems = async (currentItems: {
  _id: string
  url: string
  title: string
  savedAt: number | undefined
  isSaved?: boolean | undefined
}[]) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('User_SavedItem')
    .select('item_id, saved_at')
    .eq('user_id', userId)
  let result = await doQuery(fn)
  const { data, error } = result ?? {
    data: undefined,
    error: undefined
  }
  console.log('saved items', data)
  if (error) {
    throw error
  }
  const allSavedIds = data as { item_id: string, saved_at: string }[]
  const newIds = (allSavedIds?.map(d => d.item_id) || []).filter(id => !currentItems.find(i => i._id === id))
  if (newIds.length === 0) {
    return currentItems
  }

  const fn2 = async () => await supabase
    .from('Item')
    .select()
    .in('_id', newIds)
  result = await doQuery(fn2)
  const { data: newItems, error: newItemsError }: { data: any, error: any } = result ?? {
    data: undefined,
    error: undefined
  }
  if (newItemsError) {
    throw newItemsError
  }
  const completeNewItems = newItems?.map((i: Item) => ({
    _id: i._id,
    url: i.url,
    title: i.title,
    feed_id: i.feed_id,
    savedAt: Math.round(new Date((allSavedIds
      ?.find(asi => asi?.item_id === i._id)
      ?.saved_at || 0))
      .valueOf() / 1000),
    isSaved: true
  }))

  // add all the current items whose ids were returned from the database
  // this keeps all the fields on the existing items, but removes any that were remotely deleted
  const undeletedCurrentItems = currentItems.filter(i => allSavedIds.find(d => d.item_id === i._id) !== undefined)
  const savedItems = [
    ...completeNewItems,
    ...undeletedCurrentItems
  ]
  return savedItems.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
}

export const getReadItems = async (newerThan = 0) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  console.log('Calling supabase, newerThan = ' + newerThan)
  const fn = async () => await supabase
    .from('User_ReadItem')
    .select('Item(*)')
    .eq('user_id', userId)
    .gte('created_at', pgTimestamp(new Date(newerThan)))
  let result = await doQuery(fn)
  const { data, error }: { data: any, error: any } = result ?? { data: undefined, error: undefined }
  console.log('Got some data, length: ' + data?.length)
  if (error) {
    throw error
  }
  return data === null ? [] : data.map((d: { Item: any }) => d.Item === null ? null : ({
    _id: d.Item._id,
    url: d.Item.url,
    title: d.Item.title
  })) as Item[]
}

export const addReadItems = async (items: Item[]) => {
  const itemssToUpsert = items.map(item => ({
    _id: item._id,
    url: item.url,
    title: item.title,
  }))
  const fn = async () => await supabase
    .from('Item')
    .upsert(itemssToUpsert, { onConflict: '_id' })
    .select()
  let result = await doQuery(fn)
  const { error }: { error: any } = result ?? { error: undefined }
  if (error) {
    throw error
  }
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn2 = async () => await supabase
    .from('User_ReadItem')
    .upsert(items.map(item => ({ item_id: item._id, user_id: userId })), { onConflict: 'item_id,user_id' })
  result = await doQuery(fn2)
  const { error: readItemError } = result ?? { error: undefined }
  if (readItemError) {
    throw readItemError
  }
}

export const addSavedItem = async (item: Item) => {
  const fn = async () => await supabase
    .from('Item')
    .upsert({ _id: item._id, url: item.url, title: item.title, feed_id: item.feed_id }, { onConflict: '_id,url' })
    .select()
  let result = await doQuery(fn)
  let { data, error }: { data: any, error: any } = result ?? { data: undefined, error: undefined }
  if (error) {
    throw error
  }
  const savedId = data[0]._id
  const fn2 = async () => await supabase
    .from('User_SavedItem')
    .insert({
      item_id: savedId,
      saved_at: new Date().toISOString(),
      user_id: await getUserId()
    })
  result = await doQuery(fn2)
  const { error: savedItemError } = result ?? { data: undefined, error: undefined }
  if (savedItemError) {
    throw savedItemError
  }
}

export const removeSavedItem = async (item: Item) => {
  // let error
  // let data
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('User_SavedItem')
    .delete()
    .eq('item_id', item._id)
    .eq('user_id', userId)
  let result = await doQuery(fn)
  const { error: userSavedItemError } = result ?? { data: undefined, error: undefined }
  if (userSavedItemError) {
    throw userSavedItemError
  }
  const fn2 = async () => await supabase
    .from('User_ReadItem')
    .select()
    .eq('item_id', item._id)
  result = await doQuery(fn2)
  const { data: uriData, error: uriError }: { data: any, error: any } = result ?? { data: undefined, error: undefined }
  const fn3 = async () => await supabase
    .from('User_SavedItem')
    .select()
    .eq('item_id', item._id)
  result = await doQuery(fn3)
  const { data: usiData, error: usiError }: { data: any, error: any } = result ?? { data: undefined, error: undefined }
  if (usiError) {
    throw usiError
  }
  if (uriError) {
    throw uriError
  }
  if (usiData?.length === 0 && uriData?.length === 0) {
    const fn4 = async () => await supabase
      .from('Item')
      .delete()
      .eq('_id', item._id)
    result = await doQuery(fn4)
    const { error: itemError }: { error: any } = result ?? { error: undefined }
    if (itemError) {
      throw itemError
    }
  }
}

export const upsertSavedItems = async (items: Item[]) => { }
