#import <Foundation/Foundation.h>
#import "RizzleShare.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLog.h>
#import <MobileCoreServices/MobileCoreServices.h>

NSExtensionContext* extensionContext;


#define URL_IDENTIFIER (NSString *)kUTTypeURL
#define IMAGE_IDENTIFIER (NSString *)kUTTypeImage
//#define TEXT_IDENTIFIER (NSString *)kUTTypePlainText

@implementation RizzleShare {
}

RCT_EXPORT_MODULE();


- (void) shareView {
  extensionContext = self.extensionContext; // global for later call to async promise
 
  
  // set up react native instance
  NSURL *jsCodeLocation;
  
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.share"];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL: jsCodeLocation
                                                      moduleName: @"RizzleShare"
                                               initialProperties: nil
                                                   launchOptions: nil];
  
  UIViewController *rootViewController = [UIViewController alloc];
  rootViewController.view = rootView;
  [self addChildViewController: rootViewController];
  
  rootViewController.view.frame = self.view.bounds;
  rootViewController.view.translatesAutoresizingMaskIntoConstraints = false;
  [[self view] addSubview:rootViewController.view];
  NSArray* constraints = [NSArray arrayWithObjects:
                          [rootViewController.view.leftAnchor constraintEqualToAnchor: self.view.leftAnchor],
                          [rootViewController.view.rightAnchor constraintEqualToAnchor: self.view.rightAnchor],
                          [rootViewController.view.topAnchor constraintEqualToAnchor: self.view.topAnchor],
                          [rootViewController.view.bottomAnchor constraintEqualToAnchor: self.view.bottomAnchor], nil
                        ];
  [NSLayoutConstraint activateConstraints:constraints];
  
  [self didMoveToParentViewController: self];
}

- (void) viewDidLoad {
  [super viewDidLoad];
  
  // object variable for extension doesn't work for react-native. It must be assigned to gloabl
  // variable extensionContext
  extensionContext = self.extensionContext;

  // generate react native bundle and views
  [self shareView];
  
}

RCT_REMAP_METHOD(data,
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    [self extractData: extensionContext withCallback:^(NSDictionary* result, NSException* err) {
        if(err) {
            reject(@"error", err.description, nil);
        } else {
            resolve(result);
        }
    }];
}

- (void) extractData: (NSExtensionContext *)context withCallback:(void(^)(NSDictionary* result, NSException *exception))callback {
  @try {

    
    // get items shared
    NSExtensionItem *item = [context.inputItems firstObject];
    __block NSItemProvider *provider = item.attachments.firstObject;
    
    if ([provider hasItemConformingToTypeIdentifier:IMAGE_IDENTIFIER]){
      [provider loadItemForTypeIdentifier:IMAGE_IDENTIFIER options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error) {
        NSURL *url = (NSURL *)item;
        NSDictionary *result = @{@"data": [url absoluteString], @"extension": [[[url absoluteString] pathExtension] lowercaseString], @"type": @"image"};
        if(callback) {
            callback(result, nil);
        }
      }];
      return;
    }
    
    if([provider hasItemConformingToTypeIdentifier:URL_IDENTIFIER]) {
      [provider loadItemForTypeIdentifier:URL_IDENTIFIER options:nil completionHandler:^(id<NSSecureCoding> item, NSError *error) {
        NSURL *url = (NSURL *)item;
        NSDictionary *result = @{@"data": [url absoluteString], @"type": @"url"};
        if(callback) {
            callback(result, nil);
        }
      }];
      
      return;
      
    }
    
//    if ([provider hasItemConformingToTypeIdentifier:TEXT_IDENTIFIER]){
//      NSString *text = (NSString *)provider;
//      return;
//    }
    
    if(callback) {
      callback(nil, [NSException exceptionWithName:@"Error" reason:@"couldn't find provider" userInfo:nil]);
    }
  }
  @catch (NSException *exception) {
  }
}

RCT_EXPORT_METHOD(close) {
  [extensionContext completeRequestReturningItems:nil
                    completionHandler:nil];
//  exit(0);
}

+ (BOOL)requiresMainQueueSetup
{
  // only do this if your module initialization relies on calling UIKit!
  return YES;
}


@end

// @interface RizzleShare : ReactNativeShareExtension
// @end

// @implementation RizzleShare

// RCT_EXPORT_MODULE();

// - (UIView*) shareView {
//   NSURL *jsCodeLocation;

//   jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.share" fallbackResource:nil];

//   self.moduleRegistryAdapter = [[UMModuleRegistryAdapter alloc] initWithModuleRegistryProvider:[[UMModuleRegistryProvider alloc] init]];
 
//   RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
//                                                       moduleName:@"RizzleShare"
//                                                initialProperties:nil
//                                                    launchOptions:nil];
//   rootView.backgroundColor = [[UIColor alloc] initWithRed:0.87f green:0.85f blue:0.79f alpha:1];

//   // Uncomment for console output in Xcode console for release mode on device:
//   // RCTSetLogThreshold(RCTLogLevelInfo - 1);

//   return rootView;
// }

// @end
