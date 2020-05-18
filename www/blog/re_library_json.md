---
title: Re. Library JSON, a Decentralised Goodreads
description: Thoughts on Matt Webb’s thoughts on a proposal by Tom Critchlow
date: 2020-04-17
tags:
  - books
layout: layouts/post.njk
---
Tom Critchlow makes a [proposal](https://tomcritchlow.com/2020/04/15/library-json/) for a kind of indie web version of Goodreads, that would make it easy to publish lists of books in a unified and interoperable fashion.

(As Tom says,
> at some point almost every side-project-slinger has tried their hand at building a “books website”

so I should probably mention [Booxel](https://github.com/adamvert/booxel), a ebookstore framework that I built in 2013 and failed to cajole a couple of indie publishers into using. It had some nifty features like format conversion, digital watermarking (“social DRM”) and automatic Kindle sideloading of purchased books. I had dreams of a loosely affiliated network of independent online ebookstores that provided frictionless enough UX to tempt people away from Amazon. But I digress.)

Tom proposes a “web of books” that uses something similar to RSS to describes books and libraries, and comes up with a simple JSON spec, which looks very workable.

## A Universal Book ID Solution

He wonders about a “universal book ID solution”... at which point I immediately thought of [ISBN numbers](https://en.wikipedia.org/wiki/International_Standard_Book_Number). But it turns out that ISBNs, while universally unique (well, [almost](https://en.wikipedia.org/wiki/International_Standard_Book_Number#cite_note-1)), are too granular: a particular ISBN only refer to a particular edition of a book: hardback, paperback, ebook editions can all have different ISBNs. And since ISBNs are assigned by publishers, a book published by two different publishers (as is often the case, since various publishers will own various geographical rights) will have at least two different ISBNs.

As an example, here is a selection of ISBNs assigned to editions of Tom McCarthy’s Satin Island: 
- Knopf (hardback): 978-0307593955
- Jonathan Cape (hardback): 978-0224090193
- Vintage Contemporaries (paperback): 978-0307739629
- Vintage (paperback): 978-0099546993

There’s already some web infrastructure around ISBNs – [isbnsearch.org](https://isbnsearch.org/isbn/9780099546993) and [WorldCat](https://www.worldcat.org/search?q=9780099546993) for example. Open Library has an API that lets you search by ISBN, but its selection is incomplete – it doesn’t have the Vintage edition of Satin Island, for example, although it does have the [Vintage Contemporaries edition](http://openlibrary.org/search.json?q=9780307739629). Maybe it would be an acceptable kludge to just say that Open Library has the canonical ISBNs for each book and use the one that they list as the universal identifier?

## RSS

Matt Webb [suggests](http://interconnected.org/home/2020/04/16/rss_for_books) using actually existing RSS, instead of “something similar to it”. This is a very pragmatic idea, since it uses what’s already there – he points to podcasts, which use RSS plus custom tags. But there are two problems with this, that I can see:

- RSS is horrible to use. My approach to RSS is to use someone else’s library to convert it to JSON and then start working with that. So skipping the “someone else’s library” step makes a lot of sense to me. This is a specific form of a more generalised dilemma that often crops up in system design: do you (a) use what’s already there – even if it’s kind of crappy by today’s standards – just because *it’s already there*, or do you (b) invent something less crappy? (a) is analogous to the old dictum that “the best camera is the one that’s in your pocket”. (b) is more idealistic, more noble, and probably more naïve; imagining myself to be all those things, I usually tend towards (b). (a) is usually the right choice. In this case, though, I genuinely think that (b) is better because...
- RSS is more dynamic and less structured than I think that a “web of books” would ideally be. I can imagine that some of the social media type indieweb innovations ([webmentions](https://indieweb.org/webmention.io), [highlights](https://web.hypothes.is/), [activity streams](https://www.w3.org/TR/activitystreams-core/)) would make for particularly fruitful integrations. Along similar lines, I definitely like @ravernkoh’s [idea](https://twitter.com/ravernkoh/status/1250654173701369856) of adding a ”following” section to a library as a seed for building webs.

I’m looking forward to seeing how this progresses, and I’m already wondering how it would make sense to integrate book libraries into Rizzle.