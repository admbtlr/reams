#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <React/RCTConvert.h>
#import "RNSplashScreen.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{

  self.moduleName = @"main";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // [RNSplashScreen show];

  // //Create FontFamilies Array
  // NSArray *fontFamilies = [UIFont familyNames];
  
  // //check all fontfamilies
  // for (int i = 0; i < [fontFamilies count]; i++)
  // {
  //     //Create FontFamily Name NSString for all
  //     NSString *fontFamily = [fontFamilies objectAtIndex:i];
  //     //Check the Font names of the Font Family
  //     NSArray *fontNames = [UIFont fontNamesForFamilyName:[fontFamilies objectAtIndex:i]];
  //     // Write out the Font Famaily name and the Font's names of the Font Family
  //     NSLog (@"%@: %@", fontFamily, fontNames);
  // }
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

@end