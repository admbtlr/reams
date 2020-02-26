export function checkOnline () {
  return fetch('https://www.google.com').then(response => {
    return response.status === 200
  }).catch(error => {
    return false
  })
}
