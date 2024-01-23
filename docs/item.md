id
url
title
content_html
author
created_at
date_modified
date_published
feed_title
feed_id
coverImageUrl
content_mercury
excerpt

// Item

id
_id
url
title
content_html
author
created_at
date_modified
date_published
feed_id
feed_title
feed_color
coverImageUrl
content_mercury
excerpt
isDecorated
decoration_failures
hasCoverImage
imageDimensions
isSaved
showCoverImage
showMercuryContent
hasShownMercury
readAt
savedAt
readingTime
scrollRatio: {
  html
  mercury
}
styles



const deflated = {
    _id: item._id,
    coverImageUrl: item.coverImageUrl, // needed by the feed component
    content_length: item.content_length || (item.content_html
      ? item.content_html.length
      : 0),
    created_at: item.created_at,
    decoration_failures: item.decoration_failures,
    feed_id: item.feed_id,
    feed_title: item.feed_title,
    feed_color: item.feed_color,
    hasCoverImage: item.hasCoverImage,
    imageDimensions: item.imageDimensions,
    isDecorated: item.isDecorated,
    id: item.id, // needed to match existing copy in store
    readAt: item.readAt,
    // styles: item.styles,
    title: item.title,
    url: item.url,
    isSaved: item.isSaved,
    savedAt: item.savedAt
  }

in db:
_id
content_html
author
date_modified // scrap this
date_published
content_mercury
excerpt
showMercuryContent
hasShownMercury
scrollRatio
styles