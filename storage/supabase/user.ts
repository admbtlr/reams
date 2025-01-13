import { doQuery, getUserId, supabase } from '.'
import log from '../../utils/log'
import { adjectives, nouns } from '../../utils/usernames'

export const getCodeName = async () => {
  let codeName: string
  try {
    const user_id = await getUserId()
    const fn = async () => await supabase.from('User_CodeName').select('*').eq('user_id', user_id)
    const { data, error } = await doQuery(fn)
    if (error) {
      throw error
    }
    console.log(data)
    if (data.length === 0) {
      codeName = await getUniqueCodeName()
      const fn = async () => await supabase.from('User_CodeName').insert({
        user_id,
        code_name: codeName
      })
      const { data, error } = await doQuery(fn)
      if (error) {
        throw error
      }
      console.log(data)
    } else {
      codeName = data[0].code_name
    }
    return codeName
  } catch (error) {
    log('getCodeName', error)
    return
  }
}

const getUniqueCodeName = async () => {
  let candidate = ''
  let isCandidateUnique = false
  while (!isCandidateUnique) {
    candidate = getCandidate()
    const fn = async () => await supabase.from('User_CodeName').select('*').eq('code_name', candidate)
    const { data, error } = await doQuery(fn)
    if (error) {
      throw error
    }
    isCandidateUnique = data.length === 0
  }
  return candidate
}

const getCandidate = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adjective}.${noun}`
}
