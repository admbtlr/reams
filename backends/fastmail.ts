import { Item, ItemInflated } from '../store/items/types'
import { debugService } from '../utils/debug-service'
import log from '../utils/log'

// bail if we don't have our ENV set:
// if (!process.env.EXPO_PUBLIC_JMAP_TOKEN) {
//   console.log("Please set your JMAP_USERNAME and EXPO_PUBLIC_JMAP_TOKEN")
//   console.log("EXPO_PUBLIC_JMAP_TOKEN=token node hello-world.js")

//   process.exit(1)
// }

const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL
const EXPO_PUBLIC_CORS_PROXY = process.env.EXPO_PUBLIC_CORS_PROXY
const EXPO_PUBLIC_JMAP_TOKEN = process.env.EXPO_PUBLIC_JMAP_TOKEN
const EXPO_PUBLIC_REAMS_MAILBOX_ID = process.env.EXPO_PUBLIC_REAMS_MAILBOX_ID
const EXPO_PUBLIC_JMAP_ACCOUNT_ID = process.env.EXPO_PUBLIC_JMAP_ACCOUNT_ID

const authUrl = EXPO_PUBLIC_CORS_PROXY + '?url=' +
  encodeURIComponent('https://api.fastmail.com/.well-known/jmap')
const headers = {
  "Content-Type": "application/json; charset=utf-8",
  'x-authorization': 'Bearer ' + EXPO_PUBLIC_JMAP_TOKEN,
  'Authorization': 'Bearer ' + EXPO_PUBLIC_JMAP_TOKEN
}

let session: any = undefined

const getSession = async () => {
  if (session) {
    return session
  }
  try {
    const response = await fetch(authUrl, {
      method: "GET",
      headers
    })
    session = await response.json()
    return session
  } catch (e) {
    log(e)
  }
}

const mailboxQuery = async (apiUrl: string, queryState?: string, codeName?: string) => {
  const emailQuery = `[
    "Email/query",
    {
      "accountId": "${EXPO_PUBLIC_JMAP_ACCOUNT_ID}",
      "filter": {
        "inMailbox": "${EXPO_PUBLIC_REAMS_MAILBOX_ID}",
        "to": "${codeName}@feed.reams.app"
      },
      "sort": [{ "property": "receivedAt", "isAscending": false }],
      "limit": 50
    },
    "a"
  ]`

  const emailQueryChanges = `[
    "Email/queryChanges",
    {
      "accountId": "${EXPO_PUBLIC_JMAP_ACCOUNT_ID}",
      "filter": {
        "inMailbox": "${EXPO_PUBLIC_REAMS_MAILBOX_ID}",
        "to": "${codeName}@feed.reams.app"
      },
      "sinceQueryState": "${queryState}",
      "maxChanges": 100,
      "upToId": null
    },
    "a"
  ]`
  const body = `{
    "using": ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
    "methodCalls": [
      ${queryState ? emailQueryChanges : emailQuery},
      [
        "Email/get",
        {
          "accountId": "${EXPO_PUBLIC_JMAP_ACCOUNT_ID}",
          "properties": ["id", "subject", "receivedAt", "from", "htmlBody", "headers"],
          "#ids": {
            "resultOf": "a",
            "name": ${queryState ? '"Email/queryChanges"' : '"Email/query"'},
            "path": ${queryState ? '"/added/*/id"' : '"/ids/*"'}
          }
        },
        "b"
      ]
    ]
  }`
  try {
    const response = await fetch(`${EXPO_PUBLIC_CORS_PROXY}?url=${encodeURIComponent('https://api.fastmail.com/jmap/api/')}&t=${Date.now()}`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body
    })
    const data = await response.json()
    return data
  } catch (e) {
    log(e)
  }
}

export const getBlob = async (item: Item, apiUrl: string, accountId: string) => {
  const url = encodeURIComponent(`https://www.fastmailusercontent.com/jmap/download/${accountId}/${item.blobId}/${item.title}`)
  try {
    const response = await fetch(EXPO_PUBLIC_CORS_PROXY + '?url=' + url, { headers })
    const body = await response.text()
    return body
  } catch (e) {
    log('getBlob', e)
    throw e
  }
}

export default async function fetchNewsletterItems(lastQueryState?: string, codeName?: string): Promise<{
  items: ItemInflated[],
  queryState: string
}> {
  let response: {}
  const session = await getSession()
  // console.log(JSON.stringify(session))
  const apiUrl = EXPO_PUBLIC_CORS_PROXY + '?url=' + session.apiUrl
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"]
  response = await mailboxQuery(apiUrl, lastQueryState, codeName)
  // console.log(JSON.stringify(response["methodResponses"][1].slice(1, -1)))
  debugService.log('GOT RESPONSE')
  if (response["methodResponses"][0][0] === 'error') {
    const type = response["methodResponses"][0][1]?.type || 'Unknown error'
    debugService.log('RESPONSE WAS ERROR')
    debugService.log(`Account id: ${EXPO_PUBLIC_JMAP_ACCOUNT_ID}`)
    throw new Error(type)
  }
  let emails = response["methodResponses"][1][1].list
  debugService.log('GOT EMAILS ' + emails.length)
  const queryState = response["methodResponses"][0][1].queryState || response["methodResponses"][0][1].newQueryState
  return {
    items: emails.map(mapFastmailItemToRizzleItem),
    queryState
  }
}

export const downloadContent = async (item: ItemInflated) => {
  const session = await getSession()
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"]
  const blobId = item.blobId
  const title = 'whatever'
  const contentUrl = encodeURIComponent(`${EXPO_PUBLIC_API_URL}/fastmail-content/?accountId=${accountId}&blobId=${blobId}&title=${title}`)
  const endpoint = `${EXPO_PUBLIC_CORS_PROXY}?url=${contentUrl}`
  const response = await fetch(endpoint)
  const { body, url } = await response.json()

  return {
    ...item,
    content_html: body,
    url: transformSubstackUrl(url)
  }
}

interface FastmailItem {
  headers: {
    name: string
    value: string
  }[]
  id: string,
  htmlBody: { blobId: string }[],
  body?: string,
  url?: string,
  receivedAt: number,
  from: {
    email: string,
    name: string
  }[],
  subject: string
}

const mapFastmailItemToRizzleItem = (item: FastmailItem) => {
  // console.log(item)
  let feed_url = item.headers.find(header => header.name === 'List-URL')?.value.replace(/[<> ]/g, '') ||
    'https://www.' + item.from[0].email.trim().split('@')[1]
  if (feed_url === 'https://www.ghost.io') {
    const listUnsubscribe = item.headers.find(h => h.name === 'List-Unsubscribe')?.value
    if (listUnsubscribe) {
      const matches = /https:\/\/.*?\//.exec(listUnsubscribe)
      if (matches !== null && matches.length > 0) {
        feed_url = matches[0]
      }
    }
  }
  let mappedItem = {
    id: item.id,
    title: item.subject,
    content_html: item.body,
    blobId: item.htmlBody[0].blobId, // this is needed to download the body during decoration
    author: item.from[0]?.name,
    created_at: new Date(item.receivedAt).getTime(),
    date_modified: new Date(item.receivedAt).getTime(),
    date_published: new Date(item.receivedAt).getTime(),
    feed_title: item.from[0].name,
    feed_id: item.headers.find(header => header.name === 'List-Id')?.value ||
      item.headers.find(header => header.name === 'X-EmailOctopus-List-Id')?.value ||
      item.headers.find(header => header.name === 'X-List-Id')?.value ||
      feed_url,
    feed_url,
    isNewsletter: true,
    url: item.url
  }
  // mappedItem.feed_url = transformSubstackUrl(mappedItem.feed_url)
  return mappedItem
}

const transformSubstackUrl = (url: String) => {
  if (url.indexOf('open.substack.com') !== -1) {
    const pieces = url.match(/.*?\/pub\/(.*?)(\/.*)/)
    if (pieces?.length === 3) {
      url = `https://${pieces[1]}.substack.com${pieces[2]}`
    }
  }
  return url
}

// main()
