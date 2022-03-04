# reams

This is the monorepo for Reams. It contains the app (React Native, currently iOS only) and the server (a bunch of Vercel functions).

To run the app:

```
cd app
yarn install
cd ios; pod install; cd ..
yarn start
```

Then in another console:
```
npx react-native run-ios
```
