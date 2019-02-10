let credentials

export const authenticate = (username, password) => {
  let url = 'https://api.feedbin.com/v2/authentication.json'
  credentials = btoa(`${username}:${password}`)
  return fetch(url, {
    headers: {
      Authorization: `Basic ${credentials}`
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
    .then((response) => response.json())
    .then(json => {
      console.log(json)
    })
}

