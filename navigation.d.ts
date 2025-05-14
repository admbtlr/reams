// navigation.d.ts - React Navigation Type Declarations
declare namespace ReactNavigation {
  export interface RootParamList {
    Main: undefined;
    ModalWithGesture: undefined;
    Initial: undefined;
    Account: undefined;
    Settings: undefined;
    Feed: { isSaved?: boolean };
    Items: {
      feedCardHeight?: number;
      feedCardWidth?: number;
      feedCardX?: number;
      feedCardY?: number;
      toItems?: boolean;
    };
    Highlights: undefined;
    Subscribe: undefined;
    Login: undefined;
    'Feeds Screen': undefined;
    'New Feeds List': undefined;
    Modal: undefined;
    Library: undefined;
    Accounts: undefined;
    Feeds: undefined;
  }
}