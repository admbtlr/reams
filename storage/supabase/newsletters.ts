import { SourceDB, doQuery, getUserId, supabase } from '.'
import { getFeedMeta } from '../../backends'
import { NUDGE_FREQUENCY } from '../../components/Nudge'
import { Source } from '../../store/feeds/types'
import { Newsletter } from '../../store/newsletters/types'
import { id as createId, pgTimestamp } from '../../utils'

interface NewsletterDB extends SourceDB { }

export const addNewsletter = async (newsletter: {
  url: string,
  title?: string,
  _id?: string
}, userId?: string): Promise<Newsletter> => {
  // is the newsletter already in the database?
  let newsletterDB = await getNewsletter(newsletter.url)
  if (newsletterDB === null) {
    try {
      const _id = createId(newsletter.url)
      const newsletterMeta = await getFeedMeta(newsletter)
      const title = newsletterMeta === undefined ? '' :
        (newsletterMeta.title.trim().length > 0 ? newsletterMeta.title.trim() : newsletter.title?.trim()) || ''
      let newNewsletterDB: NewsletterDB = {
        _id,
        url: newsletter.url,
        title,
        description: newsletterMeta?.description ?? '',
        color: newsletterMeta?.color ?? '',
        favicon_url: newsletterMeta?.favicon?.url ?? '',
        favicon_size: newsletterMeta?.favicon?.size ?? ''
      }
      if (newsletterMeta?.favicon?.url.indexOf('substack')) {
        newNewsletterDB.subscribe_url = newsletter.url + 'subscribe'
      }
      const fn = async () => await supabase
        .from('Newsletter')
        .insert(newNewsletterDB)
      const { error } = await doQuery(fn)
      if (error && Object.keys(error).includes('message')) {
        const errorWithMessage = error as { message: string }
        throw error
      }
      newsletterDB = newNewsletterDB
    } catch (error: any) {
      console.error(`Error adding newsletter ${newsletter.url}: ${error.message}`)
      throw error
    }
  }
  // now add the user_newsletter relationship
  userId = userId || await getUserId()
  if (!userId) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('User_Newsletter')
    .select()
    .eq('newsletter_id', (newsletterDB as NewsletterDB)._id)
    .eq('user_id', userId as string)
  let userNewsletterQuery = await doQuery(fn)
  if (userNewsletterQuery.error) {
    throw userNewsletterQuery.error
  }
  let userNewsletter = Array.isArray(userNewsletterQuery.data) && userNewsletterQuery.data.length === 1 ?
    userNewsletterQuery.data[0] :
    undefined
  if (!userNewsletter) {
    const fn = async () => await supabase
      .from('User_Newsletter')
      .insert({
        newsletter_id: (newsletterDB as NewsletterDB)._id,
        user_id: userId as string,
        is_nudge_active: true,
        next_nudge: NUDGE_FREQUENCY
      })
      .select()
    userNewsletterQuery = await doQuery(fn)
    if (userNewsletterQuery.error || !userNewsletterQuery.data) {
      throw userNewsletterQuery.error || new Error('No user newsletter data')
    }
    userNewsletter = Array.isArray(userNewsletterQuery.data) && userNewsletterQuery.data.length === 1 ?
      userNewsletterQuery.data[0] :
      undefined
  }
  return {
    _id: newsletterDB._id,
    url: newsletterDB.url,
    title: newsletterDB.title,
    description: newsletterDB.description ?? '',
    color: newsletterDB.color ?? '',
    favicon: {
      url: newsletterDB.favicon_url,
      size: newsletterDB.favicon_size
    },
    subscribeUrl: newsletterDB.subscribe_url,
    readCount: userNewsletter.read_count,
    nextNudge: userNewsletter.next_nudge,
    isNudgeActive: userNewsletter.is_nudge_active
  }
}

export const removeUserNewsletter = async (newsletter: Newsletter) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  const fn = async () => await supabase
    .from('User_Newsletter')
    .delete()
    .eq('newsletter_id', newsletter._id)
    .eq('user_id', user_id)
  const response = await doQuery(fn)
  if (response.error) {
    throw response.error
  }
}

const getNewsletter = async (url: string): Promise<NewsletterDB | null> => {
  const fn = async () => await supabase
    .from('Newsletter')
    .select('*')
    .like('url', url)
  const { data, error } = await doQuery(fn)
  if (error) {
    throw error
  }
  // console.log(url)
  // console.log('getNewsletter', data)
  return data === null || !Array.isArray(data) || data.length === 0 ? null : {
    ...data[0],
    url,
    color: data[0]?.color?.match(/\[[0-9]*,[0-9]*,[0-9]*\]/) ? JSON.parse(data[0].color) : [0, 0, 0]
  } as NewsletterDB
}

export const getNewsletters = async (): Promise<NewsletterDB[] | null> => {
  const fn = async () => await supabase
    .from('User_Newsletter')
    .select('Newsletter(*)')
  const { data, error } = await doQuery(fn)
  if (error) {
    throw error
  }
  // console.log('getnewsletter', data)
  return data === null || !Array.isArray(data) ? null : data.map(d => ({
    ...d.Newsletter,
    color: d.Newsletter?.color?.match(/\[[0-9]*,[0-9]*,[0-9]*\]/) ? JSON.parse(d.Newsletter.color) : [0, 0, 0]
  })) as NewsletterDB[]
}

export const incrementReadCountNewsletter = async (newsletterId: string) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  const select = await supabase
    .from('User_Newsletter')
    .select('read_count')
    .eq('newsletter_id', newsletterId)
    .eq('user_id', user_id)
  if (select.error) {
    throw select.error
  }
  const readCount = (select.data.length > 0 && select.data[0].read_count) || 0
  const update = await supabase
    .from('User_Newsletter')
    .update({
      read_count: readCount + 1
    })
    .eq('newsletter_id', newsletterId)
    .eq('user_id', user_id)
  if (update.error) {
    throw update.error
  }
}

export const pauseNudgeNewsletter = async (source: Source) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  const update = await supabase
    .from('User_Newsletter')
    .update({
      next_nudge: source.nextNudge
    })
    .eq('newsletter_id', source._id)
    .eq('user_id', user_id)
  if (update.error) {
    throw update.error
  }
}

export const deactivateNudgeNewsletter = async (source: Source) => {
  const { data } = await supabase.auth.getSession()
  const user_id = data?.session?.user?.id
  if (!user_id) {
    throw new Error('No user id')
  }
  const update = await supabase
    .from('User_Newsletter')
    .update({
      is_nudge_active: false
    })
    .eq('newsletter_id', source._id)
    .eq('user_id', user_id)
  if (update.error) {
    throw update.error
  }
}
