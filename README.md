# ![Reams logo](assets/images/icons/Apple/Icon-Small-40.png) Reams

[Reams](https://reams.app) is a serious, joyful and open reading app, written in React Native / Expo. It is available on the [iOS app store](https://apps.apple.com/de/app/reams/id1229027127?l=en) and on the [web](https://web.reams.app/). I started working on it several years ago because I was frustrated by the fact that other RSS and read-it-later apps make all the articles look the same. Reams does something different: it revels in the immersive pleasures of text and images.

<video src="https://user-images.githubusercontent.com/admbtlr/reams/assets/reams-720.mp4" controls="controls" muted="muted" style="max-width:730px;"></video>
  
- Joyful layouts! Reams uses infernally complex logic, a sprinkling of AI and a whole lot of attention to typographic detail to turn your reading into a stunning, immersive experience
- Find and add RSS feeds via the iOS extension
- Subscribe to newsletters with a reams.app email address
- Add tags to feeds, newsletters or individual articles
- Add highlights and notes to articles
- Add any article to your library with iOS & desktop browser extensions
- Offline search
- Remembers your place in long articles
- Nudges that remind you to pay authors (if they offer subscriptions)

This repo is the React Native app. There's also the NextJS backend, plus the app uses [Supabase](https://supabase.com), which is kinda complicated to set up. So right now it isn't possible to run the app yourself, until I figure out how to easily generate the Supabase schema.

To run the app in an ios simulator:

```
yarn; cd ios; pod install; cd ..
yarn expo start
```

You also need to start a Gulp server to handle article layouts when running in dev mode:

```
yarn gulp
```
