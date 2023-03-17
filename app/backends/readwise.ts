import { Annotation } from "store/annotations/types";
import { getItem } from "../utils/get-item";

let token: String

export function init (t: String) {
  token = t
}

function getBasicAuthHeader () {
  return {
    Authorization: `Token ${token}`
  }
}

function getUrl (endpoint: String) {
  if (endpoint.startsWith('http')) return endpoint
  return 'https://readwise.io/api/v2/' + endpoint
}

function getRequest (endpoint: String) {
  return doRequest(getUrl(endpoint))
}

function postRequest (endpoint: String, body: String) {
  return doRequest(getUrl(endpoint), {
    method: 'POST',
    body
  })
}

function patchRequest (endpoint: String, body: String) {
  return doRequest(getUrl(endpoint), {
    method: 'PATCH',
    body
  })
}

function deleteRequest (endpoint: String) {
  return doRequest(getUrl(endpoint), {
    method: 'DELETE'
  }, true)
}

async function doRequest (url: String, options: {headers?: {}} = {}, expectNoContent = false) {
  options.headers = options.headers || getBasicAuthHeader()
  options.headers['Content-Type'] = 'application/json'
  const response = await fetch(url, options)
  if (!response.ok) {
    const body = await response.text()
    console.log(body)
    throw Error(response.statusText)
  }

  let json
  if (!expectNoContent) {
    json = await response.json()
  }
  return expectNoContent || json
}

export async function createHighlight (highlight: Annotation) {
  const response = await createHighlights([highlight])
  return response[0]
}

export async function createHighlights (highlights: Annotation[]) {
  // a function to save a highlight to Readwise
  const body = {
    "highlights": highlights.map((h: Annotation) => {
      const item = getItem(undefined, h.item_id, 'saved')
      return {
        "source_type": "Reams",
        "source_url": h.url,
        "note": h.note,
        "text": h.text,
        "title": item.title,
        "author": item.author,
      }
    })
  }
  // const body = '{"highlights": [{"text": "test"}]}'
  try {
    const response = await postRequest('highlights', JSON.stringify(body))
    return response
  } catch (e) {
    console.log(e)
  }
}

export async function updateHighlight (highlight: Annotation) {
  if (!highlight.remote_id) {
    return createHighlight(highlight)
  }
  const body = {
    "note": highlight.note,
    "text": highlight.text,
  }
  try {
    const response = await patchRequest(`highlights/${highlight.remote_id}/`, JSON.stringify(body))
    return response
  } catch (e) {
    console.log(e)
  }
}

export async function deleteHighlight (highlight: Annotation) {
  if (!highlight.remote_id) return
  try {
    const response = await deleteRequest(`highlights/${highlight.remote_id}/`)
    return response
  } catch (e) {
    console.log(e)
  }
}
