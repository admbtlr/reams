package com.rizzle;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.codemotionapps.reactnativedarkmode.DarkModePackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.proyecto26.inappbrowser.RNInAppBrowserPackage;
import com.github.amarcruz.rntextsize.RNTextSizePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import io.invertase.firebase.RNFirebasePackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.sentry.RNSentryPackage;
import io.realm.react.RealmReactPackage;
import com.github.alinz.rnsk.RNSKPackage;
import com.horcrux.svg.SvgPackage;
import com.alinz.parkerdan.shareextension.SharePackage;
import io.github.airamrguez.RNMeasureTextPackage;
import com.rnfs.RNFSPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.projectseptember.RNGL.RNGLPackage;
import com.poppop.RNReactNativeSharedGroupPreferences.RNReactNativeSharedGroupPreferencesPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNCWebViewPackage(),
            new DarkModePackage(),
            new ReanimatedPackage(),
            new RNGestureHandlerPackage(),
            new RNGoogleSigninPackage(),
            new RNInAppBrowserPackage(),
            new RNTextSizePackage(),
            new RNFetchBlobPackage(),
            new RNFetchBlobPackage(),
            new RNFirebasePackage(),
            new SplashScreenReactPackage(),
            new RNSentryPackage(),
            new RealmReactPackage(),
            new RNSKPackage(),
            new SvgPackage(),
            new SharePackage(),
            new RNSentryPackage(MainApplication.this),
            new RNMeasureTextPackage(),
            new RNFSPackage(),
            new BlurViewPackage(),
            new RNGLPackage(),
            new RNReactNativeSharedGroupPreferencesPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
