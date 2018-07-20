const feeds = [
  {
    title: 'kottke.org',
    url: 'http://feeds.kottke.org/main'
  },
  {
    title: 'languagehat.com',
    url: 'http://www.languagehat.com/index.rdf'
  },
  {
    title: 'Velcro City Tourist Board',
    url: 'http://www.velcro-city.co.uk/feed/'
  },
  {
    title: 'Technology | The Atlantic',
    url: 'https://www.theatlantic.com/feed/channel/technology/'
  },
  {
    title: 'A List Apart: The Full Feed',
    url: 'http://www.alistapart.com/feed/rss.xml'
  },
  {
    title: 'Alex Ross: The Rest Is Noise',
    url: 'http://www.therestisnoise.com/index.rdf'
  },
  {
    title: 'ANDREW GALLIX',
    url: 'http://andrewgallix.com/feed/'
  },
  {
    title: 'Stratechery by Ben Thompson',
    url: 'http://stratechery.com/feed/'
  },
  {
    title: 'Blog of a Bookslut',
    url: 'http://www.bookslut.com/blog/index.rdf'
  },
  {
    title: 'booktwo.org',
    url: 'http://booktwo.org/feed/'
  },
  {
    title: 'Work in Progress',
    url: 'http://www.fsgworkinprogress.com/?feed=rss2'
  },
  {
    title: 'CSS-Tricks',
    url: 'http://feeds.feedburner.com/CssTricks'
  },
  {
    title: 'Melville House Books',
    url: 'http://www.mhpbooks.com/feed/'
  },
  {
    title: 'Object-Oriented Philosophy',
    url: 'http://doctorzamalek2.wordpress.com/feed/'
  },
  {
    title: 'The Elegant Variation',
    url: 'http://marksarvas.blogs.com/elegvar/atom.xml'
  },
  {
    title: 'Ampersand',
    url: 'http://andotherstoriespublishing.tumblr.com/rss'
  },
  {
    title: 'blissblog',
    url: 'http://blissout.blogspot.com/feeds/posts/default'
  },
  {
    title: 'THE ABLETON COOKBOOK',
    url: 'http://www.anthonyarroyodotcom.com/theabletoncookbook/feed/'
  },
  {
    title: 'AudioMulch Blog',
    url: 'http://www.audiomulch.com/blog/feed'
  },
  {
    title: ' Analog Industries',
    url: 'http://feeds2.feedburner.com/AnalogIndustries'
  },
  {
    title: 'Pixel Envy',
    url: 'http://pxlnv.com/feed/'
  },
  {
    title: 'do you read me?!',
    url: 'http://www.doyoureadme.de/feed/'
  },
  {
    title: 'Charlie Brooker | The Guardian',
    url: 'http://feeds.guardian.co.uk/theguardian/profile/charliebrooker/rss'
  },
  {
    title: 'paperpools',
    url: 'http://paperpools.blogspot.com/feeds/posts/default'
  },
  {
    title: 'Phil Gyford’s website: Everything',
    url: 'http://feeds.feedburner.com/PhilGyford'
  },
  {
    title: 'Marco.org',
    url: 'http://www.marco.org/rss'
  },
  {
    title: 'Interconnected',
    url: 'http://interconnected.org/home/;atom'
  },
  {
    title: 'NYR Daily',
    url: 'http://feeds.feedburner.com/nyrblog'
  },
  {
    title: 'Readability Blog',
    url: 'http://blog.readability.com/feed/'
  },
  {
    title: 'maudnewton.com',
    url: 'http://maudnewton.com/feed/'
  },
  {
    title: 'Recode -  All',
    url: 'https://www.recode.net/rss/index.xml'
  },
  {
    title: 'Wired',
    url: 'https://www.wired.com/feed/rss'
  },
  {
    title: 'CDM Create Digital Music',
    url: 'http://feeds.feedburner.com/createdigitalmusic'
  },
  {
    title: 'Gradwell Communications Ltd Status - Incident History',
    url: 'http://www.gradwellstatus.com/feed/'
  },
  {
    title: 'CR',
    url: 'http://feeds.feedburner.com/ConversationalReading'
  },
  {
    title: 'Dictionary.com Word of the Day',
    url: 'http://dictionary.reference.com/wordoftheday/wotd.rss'
  },
  {
    title: 'Top News - MIT Technology Review',
    url: 'https://www.technologyreview.com/topnews.rss'
  },
  {
    title: 'Rouge\'s Foam',
    url: 'http://rougesfoam.blogspot.com/feeds/posts/default?alt=rss'
  },
  {
    title: 'ActivistLab',
    url: 'http://www.activistlab.org/feed/'
  },
  {
    title: 'Fitzcarraldo Editions',
    url: 'http://blog.fitzcarraldoeditions.com/?feed=rss2'
  },
  {
    title: 'G2 | The Guardian',
    url: 'https://www.theguardian.com/theguardian/g2/rss'
  },
  {
    title: 'www.disassociated.com',
    url: 'http://feeds.disassociated.com/disassociated'
  },
  {
    title: 'Frere-Jones Type',
    url: 'http://www.frerejones.com/feed.xml'
  },
  {
    title: 'Hacker Noon - Medium',
    url: 'https://hackernoon.com/feed'
  },
  {
    title: 'things magazine',
    url: 'http://feeds.feedburner.com/ThingsMagazine'
  },
  {
    title: 'NYT &gt; Home Page',
    url: 'http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml'
  },
  {
    title: 'The Baffler',
    url: 'https://thebaffler.com/feed'
  },
  {
    title: 'Rands in Repose',
    url: 'http://randsinrepose.com/feed/'
  },
  {
    title: 'Six Colors',
    url: 'http://feedpress.me/sixcolors'
  },
  {
    title: 'Brain Pickings',
    url: 'http://feedproxy.google.com/brainpickings/rss'
  },
  {
    title: 'Literary  Hub',
    url: 'http://lithub.com/feed/'
  },
  {
    title: 'My Moroccan Food',
    url: 'http://www.mymoroccanfood.com/home?format=RSS'
  },
  {
    title: 'ribbonfarm',
    url: 'https://www.ribbonfarm.com/feed/'
  },
  {
    title: 'The Intercept',
    url: 'https://firstlook.org/theintercept/feed/?rss'
  },
  {
    title: 'Useful Mac',
    url: 'http://usefulmac.com/rss'
  },
  {
    title: 'Wait But Why',
    url: 'http://waitbutwhy.com/feed'
  },
  {
    title: 'Aeon',
    url: 'https://aeon.co/feed.rss'
  },
  {
    title: 'DevTools Tips',
    url: 'http://devtoolstips.com/rss'
  },
  {
    title: 'Put This On',
    url: 'http://putthison.com/rss'
  },
  {
    title: 'BrettTerpstra.com - The Mad Science of Brett Terpstra',
    url: 'http://brettterpstra.com/atom.xml'
  },
  {
    title: 'Baldur Bjarnason',
    url: 'http://feedpress.me/baldurbjarnason'
  },
  {
    title: 'Hacker News Daily',
    url: 'http://www.daemonology.net/hn-daily/index.rss'
  },
  {
    title: 'Radical Theory Berlin',
    url: 'http://radicaltheoryberlin.blogspot.com/feeds/posts/default'
  },
  {
    title: 'The Sartorialist',
    url: 'http://feeds.feedburner.com/TheSartorialist'
  },
  {
    title: 'Quarterly Conversation',
    url: 'http://feeds.feedburner.com/QuarterlyConversation?format=xml'
  },
  {
    title: 'S/FJ',
    url: 'http://www.sashafrerejones.com/index.rdf'
  },
  {
    title: 'Shady Characters',
    url: 'http://feeds.feedburner.com/ShadyCharacters'
  },
  {
    title: 'Silicon Allee',
    url: 'http://siliconallee.com/feed'
  },
  {
    title: 'Articles on Smashing Magazine — For Web Designers And Developers',
    url: 'http://rss1.smashingmagazine.com/feed/'
  },
  {
    title: 'inessential.com',
    url: 'http://inessential.com/xml/rss.xml'
  },
  {
    title: 'Larval Subjects                              .',
    url: 'http://larvalsubjects.wordpress.com/feed/'
  },
  {
    title: 'LRB blog',
    url: 'http://www.lrb.co.uk/blog/?feed=rss2'
  },
  {
    title: 'Magical Nihilism',
    url: 'http://magicalnihilism.wordpress.com/feed/'
  },
  {
    title: 'Clay Shirky',
    url: 'http://www.shirky.com/weblog/feed/'
  },
  {
    title: 'PhoneGap',
    url: 'http://phonegap.com/rss.xml'
  },
  {
    title: 'Brand New',
    url: 'http://feeds.feedburner.com/ucllc/brandnew'
  },
  {
    title: 'Nick Harkaway\'s blog',
    url: 'http://futurebook.net/blogs/nickharkaway/feed'
  },
  {
    title: 'Sidebar',
    url: 'http://feeds.feedburner.com/SidebarFeed'
  },
  {
    title: 'the selby',
    url: 'http://feeds.feedburner.com/Theselby-PhotosInYourSpace'
  },
  {
    title: 'This Space',
    url: 'http://this-space.blogspot.com/feeds/posts/default'
  },
  {
    title: 'Trent Walton',
    url: 'http://trentwalton.com/feed/'
  },
  {
    title: 'Versobooks.com',
    url: 'http://www.versobooks.com/blog_rss'
  },
  {
    title: 'Daring Fireball',
    url: 'http://daringfireball.net/index.xml'
  },
  {
    title: 'Badass JavaScript',
    url: 'http://rss.badassjs.com/'
  },
  {
    title: 'Best of Wikipedia',
    url: 'http://feeds.feedburner.com/bestofwikipedia'
  },
  {
    title: 'ulysses – Infinite Zombies',
    url: 'http://infinitezombies.wordpress.com/tag/ulysses/feed/'
  },
  {
    title: 'The Millions',
    url: 'http://feeds2.feedburner.com/themillionsblog/fedw'
  },
  {
    title: 'k-punk',
    url: 'http://k-punk.abstractdynamics.org/index.rdf'
  },
  {
    title: 'http://xhmujbnnptbc.com/',
    url: 'http://feeds.feedburner.com/wumingfoundation'
  },
  {
    title: 'The Outline',
    url: 'https://theoutline.com/feeds/recent.rss'
  },
  {
    title: 'Language Log',
    url: 'http://languagelog.ldc.upenn.edu/nll/?feed=rss2'
  },
  {
    title: 'News, Politics, Opinion, Commentary, and Analysis—The New Yorker',
    url: 'http://www.newyorker.com/online/blogs/hendrikhertzberg/rss.xml'
  },
  {
    title: 'FutureBook blogs',
    url: 'http://futurebook.net/blog/feed'
  },
  {
    title: 'Ian Bogost',
    url: 'http://feeds.feedburner.com/ianbogost'
  }
]

export default feeds
