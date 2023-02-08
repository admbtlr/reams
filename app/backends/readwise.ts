import { Annotation } from "store/annotations/types";

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
    body: JSON.stringify(body)
  })
}

function deleteRequest (endpoint: String, body: String, expectNoContent = false) {
  return doRequest(getUrl(endpoint), {
    method: 'DELETE',
    body: JSON.stringify(body)
  }, expectNoContent)
}

async function doRequest (url: String, options: {headers?: {}} = {}, expectNoContent = false) {
  // const getNextPage = (headers) => {
  //   const links = headers?.get('Links')?.split(',')
  //   if (links) {
  //     const nextPage = links.find(link => link.indexOf('rel="next"') > -1)
  //     return nextPage?.match(/<(.*)>/)[1]
  //   } else {
  //     return null
  //   }
  // }

  options.headers = options.headers || getBasicAuthHeader()
  options.headers['Content-Type'] = 'application/json; charset=utf-8'
  const response = await fetch(url, options)
  if (!response.ok) {
    throw Error(response.statusText)
  }

  let json //, nextPage
  // if (response.headers) {
  //   nextPage = getNextPage(response.headers)
  // }
  if (!expectNoContent) {
    json = await response.json()
    // if (nextPage) {
    //   json.nextPage = nextPage
    // }
  }
  return expectNoContent || json
}

export function createHighlight (highlight: Annotation) {
  // ...
}

export function updateHighlight (highlight: Annotation) {

}

export function deleteHighlight (highlight: Annotation) {

}
