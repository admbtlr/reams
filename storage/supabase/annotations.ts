import { doQuery, getUserId, supabase } from '.'
import { Annotation } from '../../store/annotations/types'
import { id as createId, pgTimestamp} from '../../utils'
import log from '../../utils/log'

export const addAnnotation = async (annotation: Annotation) => {
  try {
    const user_id = await getUserId()
    const fn = async () => await supabase.from('Annotation').insert({
      ...annotation,
      created_at: pgTimestamp(),
      updated_at: pgTimestamp(),
      user_id
    })
    const { error } = await doQuery(fn)
    if (error) {
      throw error
    }
    return annotation
  } catch (error) {
    log('addAnnotation', error)
    return
  }
}

export const updateAnnotation = async (annotation: Annotation) => {
  try {
    const user_id = await getUserId()
    const fn = async () => await supabase.from('Annotation').update({
        ...annotation,
        updated_at: pgTimestamp(),
        user_id
      }).eq('_id', annotation._id)
    const { error } = await doQuery(fn)
    if (error) {
      throw error
    }
    return annotation  
  } catch (error) {
    log('updateAnnotation', error)
    return annotation
  }
}

export const deleteAnnotation = async (annotation: Annotation) => {
  try {
    const fn = async () => await supabase.from('Annotation')
      .delete()
      .eq('_id', annotation._id)
    const { error } = await doQuery(fn)
    if (error) {
      throw error
    }
  } catch (error) {
    log('deleteAnnotation', error)
  }
  return annotation
}

export const fetchAnnotations = async (newerThan: number = 0) => {
  console.log('Inside fetchAnnotationSupabase')
  const lastUpdated = pgTimestamp(new Date(newerThan))
  try {
    const fn = async () => supabase.from('Annotation').select('*').gte('updated_at', lastUpdated)
    console.log('Calling doQuery')
    const { data, error } = await doQuery(fn)
    if (error) throw error
    console.log('fetchAnnotationSupabase returned some data: ' + data)
    return data  
  } catch (error) {
    console.log('fetchAnnotationSupabase errored: ' + error)
    log('fetchAnnotations', error)
    return
  }
}

