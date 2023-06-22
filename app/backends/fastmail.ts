import sanitizeHtml from 'sanitize-html'
import Config from "react-native-config"

// bail if we don't have our ENV set:
if (!Config.JMAP_TOKEN) {
  console.log("Please set your JMAP_USERNAME and JMAP_TOKEN")
  console.log("JMAP_TOKEN=token node hello-world.js")

  process.exit(1)
}

const hostname = Config.JMAP_HOSTNAME

const authUrl = 'https://api.fastmail.com/.well-known/jmap' //`https://${hostname}/.well-known/jmap`
const headers = {
  // "Content-Type": "application/json; charset=utf-8",
  'Authorization': 'Bearer fmu1-2ee041d2-a8e62539f53becb29fc3ec45dfc98c9f-0-a79f48d8e594314e89597734a89cba38'//`Bearer ${Config.JMAP_TOKEN}`,
}

const reamsMailboxId = Config.REAMS_MAILBOX_ID

const getSession = async () => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers: {
      Authorization: 'Bearer fmu1-2ee041d2-a8e62539f53becb29fc3ec45dfc98c9f-0-a79f48d8e594314e89597734a89cba38'//`Bearer ${Config.JMAP_TOKEN}`,
    },
    mode: "cors"
  })
  const blob = await response.blob()
  console.log(JSON.stringify(blob))
  console.log(blob)
  const reader = new FileReader()
  reader.addEventListener("loadend", () => {
    console.log(reader.result)
  })
  reader.readAsText(blob)
  return await response.json()
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

const mailboxQuery = async (apiUrl, accountId) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        [
          "Email/query",
          {
            accountId: accountId,
            filter: { inMailbox: reamsMailboxId },
            sort: [{ property: "receivedAt", isAscending: false }],
            limit: 10,
          },
          "a",
        ],
        [
          "Email/get",
          {
            accountId: accountId,
            properties: ["id", "subject", "receivedAt", "from", "htmlBody", "headers"],
            "#ids": {
              resultOf: "a",
              name: "Email/query",
              path: "/ids/*",
            },
          },
          "b",
        ],
      ],
    }),
  })

  const data = await response.json()
  return data
}

const getBlob = async (email, apiUrl, accountId) => {
    // console.log(`${email.receivedAt} — ${email.subject}`)
    const url = `https://www.fastmailusercontent.com/jmap/download/${accountId}/${email.htmlBody[0].blobId}/${email.name}`
    const response = await fetch(url, { headers })
    const body = await response.text()
    return body
  }

export default async function fetchNewsletters() {
  let response
  const session = await getSession()
  // console.log(JSON.stringify(session))
  const apiUrl = session.apiUrl
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"]
  response = await mailboxQuery(apiUrl, accountId)
  // console.log(JSON.stringify(response["methodResponses"][1].slice(1, -1)))
  let emails = response["methodResponses"][1][1].list
  for (const e of emails) {
    const body = await getBlob(e, apiUrl, accountId)
    e.body = sanitizeHtml(body)
  }
  const items = emails.map(mapFastmailItemToRizzleItem)
  console.log(JSON.stringify(items))
  // const bodies = await getBodies(response["methodResponses"][1][1]["list"], apiUrl, accountId)
  // console.log(JSON.stringify(bodies))

}

const mapFastmailItemToRizzleItem = (item) => {
  // console.log(item)
  let mappedItem = {
    id: item.id,
    title: item.subject,
    content_html: item.body,
    author: item.from[0]?.name,
    created_at: new Date(item.receivedAt).getTime(),
    date_modified: new Date(item.receivedAt).getTime(),
    date_published: new Date(item.receivedAt).getTime(),
    feed_title: item.from.name,
    feed_id: item.headers.find(header => header.name === 'List-Id')?.value || 
      item.headers.find(header => header.name === 'X-EmailOctopus-List-Id')?.value ||
      item.headers.find(header => header.name === 'X-List-Id')?.value ||
      item.from[0].email,
  }
  return mappedItem
}

// main()