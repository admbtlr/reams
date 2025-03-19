# ![Reams logo](assets/images/icons/Apple/Icon-Small-40.png) Reams

[Reams](https://reams.app) is a serious, joyful and open reading app, written in React Native / Expo. It is available on the [iOS app store](https://apps.apple.com/de/app/reams/id1229027127?l=en) and on the [web](https://web.reams.app/). I started working on it several years ago because I was frustrated by the fact that other RSS and read-it-later apps make all the articles look the same. Reams does something different: it revels in the immersive pleasures of text and images.

<video src="https://user-images.githubusercontent.com/admbtlr/reams/assets/reams-720.mp4" controls="controls" muted="muted" style="max-width:730px;"></video>

## Key Features
  
- Joyful layouts! Reams uses infernally complex logic, a sprinkling of AI and a whole lot of attention to typographic detail to turn your reading into a stunning, immersive experience
- Find and add RSS feeds via the iOS extension
- Subscribe to newsletters with a reams.app email address
- Add tags to feeds, newsletters or individual articles
- Add highlights and notes to articles
- Add any article to your library with iOS & desktop browser extensions
- Offline search
- Remembers your place in long articles
- Nudges that remind you to pay authors (if they offer subscriptions)

This repo is the React Native / Expo app. In order to run it you will need to set up various bits and pieces:

### Reams Backend

This lives in the [reams-server](https://github.com/admbtlr/reams-server) repo. I run this on Vercel, but I guess that it should be possible wherever NextJS-friendly hosting is available.

### Supabase Database

Set up a [Supabase](https://supbase.com) account (free tier works fine). Create a new project, and then set up the schema using `supabase/schema.sql`.

### JMAP-friendly Email Account

To handle newsletters. I use an account on [Fastmail](https://fastmail.com). You will need to get a JMAP token for the account, and figure out the JMAP id of the mailbox you want to use for all the newsletters.



Once those three services are up and running, create an `.env` file based on `.env.example`. 

Then you'll need to install the depedencies:

```
yarn; cd ios; pod install; cd..
```

Start Expo:

```
yarn expo start
```

The easiest way to build the iOS app is probably using XCode, but you can do it with Expo's [EAS](https://docs.expo.dev/build-reference/ios-builds/) or with [Fastlane](https://fastlane.tools/) (there's a simple Fastlane configuration in the `ios` directory).

Article bodies are displayed in embedded webviews. When running in dev mode, the injected stylesheets and JavaScript code are served by Gulp, so you will also need to start the Gulp server:

```
yarn gulp
```
