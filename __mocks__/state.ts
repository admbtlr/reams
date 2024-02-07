import { ItemType } from "../store/items/types";
import { RootState } from "../store/reducers";
import { DarkModeSetting } from "../store/ui/types";

const state: RootState = {
  "annotations": {
    annotations: [],
  },
  "categories": {
    "categories": []
  },
  "itemsUnread": {
    "items": [
      {
        "title": "Item #1",
        "url": "https://www.url.com/item1",
        "content_length": 94,
        "coverImageUrl": "https://cover.image/url", 
        "decoration_failures": 0, 
        "feed_title": "Feed title",
        "hasCoverImage": true,
        "hasShownMercury": false,
        "isDecorated": true, 
        "isExternal": false, 
        "isSaved": false, 
        "savedAt": 0,
        "coverImageFile": "/Users/adam/Library/Developer/CoreSimulator/Devices/F9F13921-4C25-4EDF-A44D-009219A8008D/data/Containers/Data/Application/4EAB9B24-E722-443B-AE45-CE5DB9C06494/Documents/f1b3063a-b63b3782.jpg",
        "_id": "f1b3063a-b63b3782",
        "showMercuryContent": true,
        "id": 345,
        "imageDimensions": {
          "width": 1050,
          "height": 550,
        },
        "feed_id": "c9c5a444-8920-fc15-d089-22630796e4ae",
        "showCoverImage": true,
        "created_at": 1615232395000,
        "readAt": 1617109478642,
      },
      {
        "title": "Item #2",
        "url": "https://www.url.com/item2",
        "content_length": 94,
        "coverImageUrl": "https://cover.image/url", 
        "decoration_failures": 0, 
        "feed_title": "Feed title",
        "hasCoverImage": true,
        "hasShownMercury": false,
        "isDecorated": true, 
        "isExternal": false, 
        "isSaved": false, 
        "savedAt": 0,
        "coverImageFile": "/Users/adam/Library/Developer/CoreSimulator/Devices/F9F13921-4C25-4EDF-A44D-009219A8008D/data/Containers/Data/Application/4EAB9B24-E722-443B-AE45-CE5DB9C06494/Documents/f1b3063a-b63b3782.jpg",
        "_id": "f1b3063a-b63b3782",
        "showMercuryContent": true,
        "id": 345,
        "imageDimensions": {
          "width": 1050,
          "height": 550,
        },
        "feed_id": "c9c5a444-8920-fc15-d089-22630796e4ae",
        "showCoverImage": true,
        "created_at": 1615232395000,
        "readAt": 1617109478642,
      },
    ],
    "index": 0,
    "lastUpdated": -1,
  },
  "itemsSaved": {
    "items": [
    ],
    "index": 0,
    "lastUpdated": -1,
  },
  "itemsMeta": {
    "display": ItemType.unread,
    "decoratedCount": 54,
  },
  "feeds": {
    "feeds": [
      {
        "title": "kottke.org",
        "url": "http://feeds.kottke.org/main",
        "rootUrl": "http://kottke.org/",
        "description": "Jason Kottke's weblog, home of fine hypertext products",
        "favicon": {
          "url": "http://kottke.org/images/2016/ios/76x76.png",
          "size": "76x76",
        },
        "color": [
          347,
          65,
          41,
        ],
        "_id": "c9c5a444-8920-fc15-d089-22630796e4ae",
        "unreadCount": 2,
        "readingTime": 420,
        "readCount": 16,
        "readingRate": 0.0155,
      },
    ],
    "lastUpdated": 0,
  },
  "feedsLocal": {
    "feeds": [
      {
        "_id": "c9c5a444-8920-fc15-d089-22630796e4ae",
        "isNew": false,
        "hasCachedIcon": true,
        "cachedIconDimensions": {
          "width": 76,
          "height": 76,
        },
        "cachedCoverImageId": "66565bb5-c9c5a444",
      },
    ],
  },
  "ui": {
    "darkModeSetting": DarkModeSetting.AUTO, 
    "isActive": false, 
    "isHelpTipVisible": false, 
    "helpTipKey": "helpTipKey", 
    "displayedHelpTips": ["helpTipKey"],
    "viewButtonsVisible": false,
    "itemButtonsVisible": true,
    "showLoadingAnimation": false,
    "imageViewerVisible": false,
    "imageViewerUrl": "",
    "messageQueue": [],
    "message": "",
    "isDarkMode": false,
    "fontSize": 3,
  },
  "remoteActionQueue": {
    "actions": [
    ],
  },
  "config": {
    "orientation": "portrait",
    "lastActivated": 0,
    "isOnboarding": false,
    "lastUpdated": 0,
    "onboardingIndex": 2,
    "onboardingLength": 13,
    "filter": null,
    "isOnline": true,
    "itemSort": 0,
    "showNumUnread": true,
    "isItemsOnboardingDone": true,
    "isFeedOnboardingDone": false,
  },
  "user": {
    "analyticsId": "",
    backends: [],
    "email": "",
    "signInEmail": "",
  },
}

export default state
