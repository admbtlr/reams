export function derelativise (url: string) {
  return url.indexOf('//') === 0 ?
  `https:${url}` :
  url
}
