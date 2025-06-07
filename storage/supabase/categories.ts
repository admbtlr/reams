import { doQuery, getUserId, supabase } from '.'
import { Category } from '../../store/categories/types'
import { Source } from '../../store/feeds/types'
import { Item } from '../../store/items/types'
import { id as createId, pgTimestamp } from '../../utils'

export const getCategories = async (): Promise<Category[]> => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category')
    .select('*')
    .eq('user_id', userId)
  const { data, error } = await doQuery(fn)
  if (error) {
    throw error
  }
  const categories = data === null ? [] : data as Category[]
  for (const category of categories) {
    const sourceIds = await getSourceIdsForCategory(category)
    // For now, treat all sourceIds as feedIds since we don't have separate tables
    category.feedIds = await getFeedIdsForCategory(category)
    category.newsletterIds = await getNewsletterIdsForCategory(category)
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
  let fn = async () => await supabase
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

  // remove all item, feed and newsletter references and reinsert
  fn = async () => await supabase
    .from('Category_Feed')
    .delete()
    .eq('category_id', category._id)
  const { error: deleteError } = await doQuery(fn)
  if (deleteError) {
    throw deleteError
  }

  await setFeedIdsForCategory(category)
  await setNewsletterIdsForCategory(category)
  await setItemIdsForCategory(category)
  return category
}

export const removeSourceFromCategory = async (sourceId: string, category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category_Feed')
    .delete()
    .eq('category_id', category._id)
    .eq('feed_id', sourceId)
  const { error } = await doQuery(fn)
  if (error) {
    throw error
  }
}

export const addSourceToCategory = async (sourceId: string, category: Category) => {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('Category_Feed')
    .insert({
      category_id: category._id,
      feed_id: sourceId
    })
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
    .eq('category_id', category._id)
    .eq('item_id', item._id)
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
  if (category.feedIds.length > 0) {
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

export const setNewsletterIdsForCategory = async (category: Category) => {
  if (category.newsletterIds.length > 0) {
    const fn = async () => await supabase
      .from('Category_Feed')
      .insert(category.newsletterIds.map(newsletter_id => ({ category_id: category._id, newsletter_id })))
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

export const getNewsletterIdsForCategory = async (category: Category) => {
  const fn = async () => await supabase
    .from('Category_Feed')
    .select('newsletter_id')
    .eq('category_id', category._id)
  const { data, error } = await doQuery(fn)
  if (error) {
    throw error
  }
  return data === null || !Array.isArray(data) ? [] : data.map(d => d.newsletter_id) as string[]
}
