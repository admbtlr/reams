# To Do

- make rizzle basic work
- button alignment on ipad
  - what does that involve?
  - no firestore? so what about read stories?
  - do we even need to keep track of read stories with rizzle basic?
- signup button on onboarding screen has no margins
- deal with feed.number_unread problems
- upgrade to react native 62
- upgrade to react-navigation 5.0
    + https://reactnavigation.org/blog/2020/02/06/react-navigation-5.0.html
- improved add feed experience
- make Feedwrangler work fully
- Feedly integration
- replace https://github.com/request/request-promise-native in the server, since it's now deprecated

# Someday / Maybe

- i8n 
    - https://medium.com/better-programming/creating-a-multi-language-app-in-react-native-9828b138c274
- login with apple
    + https://github.com/invertase/react-native-apple-authentication
- make extension work with more data types
- text highlights
    + https://github.com/react-native-community/react-native-webview/issues/607
- placeholder images (use letters?)
- in-app purchases for subscriptions
    + https://medium.com/@rossbulat/react-native-subscriptions-with-in-app-purchases-setup-fdaf3863e07f
- Use https://github.com/DylanVann/react-native-fast-image to show cached images
- scroll effects
- make buttons use reanimate
- add a feed manually
- newsletters
- saved folders

# Done

- ~~move all firestore operations out of sagas and into backends~~
- ~~fix TopBar~~
- ~~fix share extension~~
- ~~better loading indicator~~
- ~~add per feed setting to always open in expanded view~~
- ~~add a message component~~
- ~~make icon color detection the main colour instead of average~~
- ~~move DISPLAY_MODE to ui, also SET_DARK_MODE~~
- ~~do something about Firebase listener memory leaks~~
- ~~why isn't icon color detection working?~~
- ~~why does a feed with color [0,0,0] get changed to [(...),(...),(...)]?~~
- ~~fix the navigation~~
- ~~why doesn't the topbar show the correct item feed_color?~~
- ~~Feedbin integration~~
- ~~where's my feed title gone?~~
- ~~have I broken the rizzle backend?~~
- ~~why isn't the userid getting set when I log into rizzle?~~
- ~~move scrollAnim out of redux state~~
- ~~find memory leak~~
- ~~speed up refresh of item carousel~~
- ~~fix bug with second item never showing its title~~
- ~~fix bug with items re-rendering and losing your place when getting new items~~
- ~~Sentry errors relating to inflation with feed filter~~
- ~~fix freezing share extension~~
- ~~finish adding all the fonts to css~~
- ~~integrate new feeds list properly~~
- ~~font size when onboarding on ipad mini~~
- ~~fix bug with logging in via email~~
- ~~upgrade to RN 0.60~~
- ~~onboarding overlay~~
- ~~switch to https://github.com/iyegoroff/react-native-image-filter-kit~~
- ~~improve darkmode~~
- ~~figure out why the decoration thread crashes (does it even?)~~
- ~~figure out why some items never get decorated~~
- ~~fix wired.com custom parser~~
- ~~fix scrollTo~~
- ~~list of feeds to add~~
- ~~dark mode (RN 0.61? dark-mode module?)~~
- ~~use SF symbols~~
- ~~onboarding~~
- ~~make the icons work~~
s- ~~make the batched fetch work~~
- ~~why isn't the extension feed search working?~~
- ~~fix feeds list~~
    + watch https://react.statuscode.com/link/69708/eb58c0bc0e
- ~~make extension search for common feed locations~~
    + https://www.howtogeek.com/318401/how-to-find-or-create-an-rss-feed-for-any-website/
- ~~present found feeds by title in share extension~~
- ~~get feed colors~~
- ~~allow arbitrary feed colours~~
- ~~fix universal links / magic link auth~~
- ~~fix problem with new remote saved items~~
- ~~move feed image stuff to feeds-local~~
- ~~only move buttons when scrolling has ended~~
- ~~move cover image stuff to a items-local reducer~~
- ~~ensure remote feed updates propagate correctly~~
- ~~investigate feed multiplication~~
- ~~don't always return to index=0 with saved items~~
- ~~fix various caption layouts~~
- ~~make sure all saved items have savedAt; order thereby~~
- ~~get rid of white frame around images, or at least on floated images~~
- ~~fix null AS object error~~
- ~~image overscroll scale~~
- ~~fix li blocks showing up in ol lists~~
- ~~improve author/date layout~~
- ~~stop titles being > 50% of page height~~
- ~~add proper margins to cover title etc.~~
- ~~improve top bar for saved items~~
- ~~blur too small images~~
- ~~auto mercury / hide excerpt~~
- ~~what's with scroll position?~~
- ~~don't show first image if same as cover~~


http://feedpress.me/baldurbjarnason,http://feeds.feedburner.com/CssTricks,http://feeds.feedburner.com/QuarterlyConversation?format=xml,http://www.marco.org/rss,http://feeds.feedburner.com/PhilGyford,https://thebaffler.com/feed,http://interconnected.org/home/;atom,http://feeds.feedburner.com/ucllc/brandnew,https://firstlook.org/theintercept/feed/?rss,http://waitbutwhy.com/feed,https://www.theatlantic.com/feed/channel/technology/,http://feeds.feedburner.com/SidebarFeed,https://aeon.co/feed.rss,http://randsinrepose.com/feed/,http://inessential.com/xml/rss.xml,http://www.therestisnoise.com/index.rdf,http://andrewgallix.com/feed/,http://doctorzamalek2.wordpress.com/feed/,https://cms.qz.com/feed/,http://feeds.feedburner.com/createdigitalmusic,https://www.wired.com/feed/rss,http://feeds.feedburner.com/ThingsMagazine,http://feeds.kottke.org/main,http://pxlnv.com/feed/,http://putthison.com/rss,http://feeds.feedburner.com/ShadyCharacters,http://siliconallee.com/feed,https://theoutline.com/feeds/recent.rss,http://www.fsgworkinprogress.com/?feed=rss2,https://www.theguardian.com/international/rss,https://hackernoon.com/feed,http://lithub.com/feed/,https://salty.medium.com/feed,http://feedpress.me/sixcolors,http://feeds.feedburner.com/TheSartorialist,https://www.ribbonfarm.com/feed/,http://brettterpstra.com/atom.xml,http://rss1.smashingmagazine.com/feed/,http://www.daemonology.net/hn-daily/index.rss,https://www.vox.com/rss/index.xml,http://blissout.blogspot.com/feeds/posts/default,https://www.fastcompany.com/latest/rss?truncated=true,http://stratechery.com/feed/,http://daringfireball.net/index.xml,http://this-space.blogspot.com/feeds/posts/default,https://cdn.lrb.co.uk/feeds/lrb,http://www.doyoureadme.de/feed/,http://www.mhpbooks.com/feed/,http://feedproxy.google.com/brainpickings/rss,http://www.versobooks.com/blog_rss,http://languagelog.ldc.upenn.edu/nll/?feed=rss2,http://feeds2.feedburner.com/themillionsblog/fedw,http://www.languagehat.com/index.rdf,https://www.ben-evans.com/benedictevans?format=RSS,https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml,https://newrepublic.com/pages/rss,https://www.theatlantic.com/feed/all/