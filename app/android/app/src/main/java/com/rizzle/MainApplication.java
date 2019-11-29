package com.rizzle;

import android.app.Application;

import com.facebook.react.ReactApplication;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.github.amarcruz.rntextsize.RNTextSizePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.realm.react.RealmReactPackage;
import com.github.alinz.rnsk.RNSKPackage;
import com.horcrux.svg.SvgPackage;
import com.alinz.parkerdan.shareextension.SharePackage;
import io.github.airamrguez.RNMeasureTextPackage;
import com.cmcewen.blurview.BlurViewPackage;
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
            new RNGoogleSigninPackage(),
            new RNTextSizePackage(),
            new RNFetchBlobPackage(),
            new RNFetchBlobPackage(),
            new SplashScreenReactPackage(),
            new RealmReactPackage(),
            new RNSKPackage(),
            new SvgPackage(),
            new SharePackage(),
            new RNSentryPackage(MainApplication.this),
            new RNMeasureTextPackage(),
            new BlurViewPackage(),
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
