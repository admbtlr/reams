import Config from "react-native-config"
import { Item, ItemInflated } from '../store/items/types'
import log from '../utils/log'
import { InteractionManager } from 'react-native'

// bail if we don't have our ENV set:
// if (!Config.JMAP_TOKEN) {
//   console.log("Please set your JMAP_USERNAME and JMAP_TOKEN")
//   console.log("JMAP_TOKEN=token node hello-world.js")

//   process.exit(1)
// }

const authUrl = Config.CORS_PROXY + '?url=https://api.fastmail.com/.well-known/jmap' //`https://${hostname}/.well-known/jmap`
const headers = {
  // "Content-Type": "application/json; charset=utf-8",
  'Authorization': `Bearer ${Config.JMAP_TOKEN}`,
}

const reamsMailboxId = Config.REAMS_MAILBOX_ID
let session: any = undefined

const getSession = async () => {
  if (session) {
    return session
  }
  try {
    const response = await fetch(authUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${Config.JMAP_TOKEN}`,
      }
    })
    session = await response.json()
    return session
  } catch (e) {
    log(e)
  }
}

// const inboxIdQuery = async (apiUrl, accountId) => {
//   const response = await fetch(apiUrl, {
//     method: "POST",
//     headers,
//     body: JSON.stringify({
//       using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
//       methodCalls: [
//         [
//           "Mailbox/query",
//           {
//             accountId: accountId,
//             sort: [{ property: "name", isAscending: true }],
//             // filter: { role: "inbox", hasAnyRole: true },
//           },
//           "a",
//         ],
//       ],
//     }),
//   })

//   const data = await response.json()

//   console.log(data["methodResponses"][0][1])
//   let inbox_id = data["methodResponses"][0][1]

//   if (!inbox_id.length) {
//     console.error("Could not get an inbox.")
//     process.exit(1)
//   }

//   return await inbox_id
// }


const mailboxQuery = async (apiUrl: string, queryState?: string) => {
  const emailQuery = `[
    "Email/query",
    {
      "accountId": "u2ee041d2",
      "filter": { "inMailbox": "aab8c71f-49e6-49a8-970f-e8293fb65b53" },
      "sort": [{ "property": "receivedAt", "isAscending": false }],
      "limit": 50
    },
    "a"
  ]`
  
  const emailQueryChanges = `[
    "Email/queryChanges",
    {
      "accountId": "u2ee041d2",
      "filter": { "inMailbox": "aab8c71f-49e6-49a8-970f-e8293fb65b53" },
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
          "accountId": "u2ee041d2",
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
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body 
    })
    const data = await response.json()
    return data
  } catch(e) {
    log(e)
  }
}

export const getBlob = async (item: Item, apiUrl: string, accountId: string) => {
  const url = `https://www.fastmailusercontent.com/jmap/download/${accountId}/${item.blobId}/${item.title}`
  try {
    const response = await fetch(Config.CORS_PROXY + '?url=' + url, { headers })
    const body = await response.text()
    return body
  } catch (e) {
    log('getBlob', e)
    throw e
  }
}

export default async function fetchNewsletterItems(lastQueryState?: string): Promise<{
  items: ItemInflated[],
  queryState: string
}> {
  let response
  const session = await getSession()
  // console.log(JSON.stringify(session))
  const apiUrl = Config.CORS_PROXY + '?url=' + session.apiUrl
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"]
  response = await mailboxQuery(apiUrl, lastQueryState)
  // console.log(JSON.stringify(response["methodResponses"][1].slice(1, -1)))
  if (response["methodResponses"][0][0] === 'error') {
    const type = response["methodResponses"][0][1]?.type || 'Unknown error'
    throw new Error(type)
  }
  let emails = response["methodResponses"][1][1].list
  const queryState = response["methodResponses"][0][1].queryState || response["methodResponses"][0][1].newQueryState
  return {
    items: emails.map(mapFastmailItemToRizzleItem),
    queryState
  }
  // console.log(JSON.stringify(items))
  // // const bodies = await getBodies(response["methodResponses"][1][1]["list"], apiUrl, accountId)
  // // console.log(JSON.stringify(bodies))
  // return []  
}

export const downloadContent = async (item: ItemInflated) => {
  const session = await getSession()
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"]
  const blobId = item.blobId
  const title = 'whatever'
  const endpoint = `${Config.API_URL}/fastmail-content/?accountId=${accountId}&blobId=${blobId}&title=${title}`
  const response = await fetch(endpoint)
  const { body, url } = await response.json()
  return {
    ...item,
    content_html: body,
    url
  }

  // const settings = {
  //   allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'script', 'video' ]),
  //   allowedAttributes: {
  //     '*': ['class', 'src'],
  //     'a': ['href', 'name', 'target'],
  //   },
  //   allowVulnerableTags: true
  // }
  // const apiUrl = Config.CORS_PROXY + '?url=' + session.apiUrl
  // const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"]
  // try {
  //   console.log("Getting blob for ", item.title)
  //   const body = await getBlob(item, apiUrl, accountId)
  //   const substackUrl = body.match(/(https:\/\/open\.substack\.com.*?)"/)
  //   if (substackUrl && substackUrl.length === 2) {
  //     item.url = substackUrl[1].split('?')[0]
  //   } else {
  //     await InteractionManager.runAfterInteractions()
  //     const viewInBrowserUrl = body.match(/href="(.*?)".*?>View in browser/)
  //     if (viewInBrowserUrl && viewInBrowserUrl.length === 2) {
  //       item.url = viewInBrowserUrl[1]
  //     } else {
  //       await InteractionManager.runAfterInteractions()
  //       const viewThisEmailInYourBrowserUrl = body.match(/href="(.*?)".*?>View this email in your browser/)
  //       if (viewThisEmailInYourBrowserUrl && viewThisEmailInYourBrowserUrl.length === 2) {
  //         item.url = viewThisEmailInYourBrowserUrl[1]
  //       }
  //     }
  //   }
  //   await InteractionManager.runAfterInteractions()
  //   return sanitizeHtml(body, settings)
  // } catch (e) {
  //   log(e)
  // }
}

const mapFastmailItemToRizzleItem = (item) => {
  // console.log(item)
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
      item.from[0].email.trim(),
    feed_url: item.headers.find(header => header.name === 'List-URL')?.value.replace(/[<> ]/g, '') ||
      'https://www.' + item.from[0].email.trim().split('@')[1],
    isNewsletter: true,
    url: item.url
  }
  return mappedItem
}

// main()