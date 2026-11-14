import UIKit
import React

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let windowScene = scene as? UIWindowScene else { return }

    // Reuse the window created by AppDelegate so RN starts normally
    if let appDelegate = UIApplication.shared.delegate as? AppDelegate, let existingWindow = appDelegate.window {
      existingWindow.windowScene = windowScene
      window = existingWindow
    } else {
      let newWindow = UIWindow(windowScene: windowScene)
      newWindow.frame = windowScene.coordinateSpace.bounds
      window = newWindow
    }

    window?.makeKeyAndVisible()

    // Handle URL contexts (deep links) via scene lifecycle
    if let urlContext = connectionOptions.urlContexts.first {
      _ = RCTLinkingManager.application(UIApplication.shared, open: urlContext.url, options: [:])
    }

    // Handle user activities (universal links) via scene lifecycle
    if let userActivity = connectionOptions.userActivities.first {
      _ = RCTLinkingManager.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    for context in URLContexts {
      _ = RCTLinkingManager.application(UIApplication.shared, open: context.url, options: [:])
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = RCTLinkingManager.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }
}
