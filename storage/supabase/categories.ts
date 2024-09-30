import { doQuery, getUserId, supabase } from '.'
import { Category } from '../../store/categories/types'
import { Feed } from '../../store/feeds/types'
import { Item } from '../../store/items/types'
import { id as createId, pgTimestamp} from '../../utils'

export const getCategories = async (): Promise<Category[]> => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category')
    .select('*')
    .eq('user_id', userId) 
  const {data, error} = await doQuery(fn)
  if (error) {
    throw error
  }
  const categories = data === null ? [] : data as Category[]
  for (const category of categories) {
    category.feedIds = await getFeedIdsForCategory(category)
    category.itemIds = await getItemIdsForCategory(category)
  }
  return categories
}

export const addCategory = async (category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category')
    .insert({ 
      _id: category._id,
      name: category.name,
      user_id: userId
    })
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
  return category
}

export const removeCategory = async (category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category')
    .delete()
    .eq('_id', category._id)
    .eq('user_id', userId)
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
}

export const updateCategory = async (category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category')
    .update({ 
      name: category.name,
      user_id: userId
    })
    .eq('_id', category._id)
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
  await setFeedIdsForCategory(category)
  await setItemIdsForCategory(category)
  return category
}

export const addFeedToCategory = async (feed: Feed, category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category_Feed')
    .insert({ 
      category_id: category._id,
      feed_id: feed._id
    })
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
}

export const removeFeedFromCategory = async (feed: Feed, category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category_Feed')
    .delete()
    .eq('category_id', category)
    .eq('feed_id', feed)
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
}

export const addItemToCategory = async (item: Item, category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category_Item')
    .insert({ 
      category_id: category._id,
      item_id: item._id
    })
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
}

export const removeItemFromCategory = async (item: Item, category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category_Item')
    .delete()
    .eq('category_id', category)
    .eq('item_id', item)
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
}

export const getItemIdsForCategory = async (category: Category) => {
  const fn = async () => await supabase
    .from('Category_Item')
    .select('item_id')
    .eq('category_id', category._id)
  const { data, error } = await doQuery(fn)
  if (error) {
    throw error
  }
  return data === null || !Array.isArray(data) ? [] : data.map(d => d.item_id) as string[]
}

export const setItemIdsForCategory = async (category: Category) => {
  const fn = async () => await supabase
    .from('Category_Item')
    .delete()
    .eq('category_id', category._id)
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
  if (category.itemIds) {
    const fn = async () => await supabase
      .from('Category_Item')
      .insert(category.itemIds.map(item_id => ({ category_id: category._id, item_id })))
    const { error: insertError } = await doQuery(fn)
    if (insertError) {
      throw insertError
    }
  }
  return category
}

export const setFeedIdsForCategory = async (category: Category) => {
  const fn = async () => await supabase
    .from('Category_Feed')
    .delete()
    .eq('category_id', category._id)
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
  if (category.feedIds) {
    const fn = async () => await supabase
      .from('Category_Feed')
      .insert(category.feedIds.map(feed_id => ({ category_id: category._id, feed_id })))
    const { error: insertError } = await doQuery(fn)
    if (insertError) {
      throw insertError
    }
  }
  return category
}

export const getFeedIdsForCategory = async (category: Category) => {
  const fn = async () => await supabase
    .from('Category_Feed')
    .select('feed_id')
    .eq('category_id', category._id)
  const { data, error } = await doQuery(fn)
  if (error) {
    throw error
  }
  return data === null || !Array.isArray(data) ? [] : data.map(d => d.feed_id) as string[]
}
