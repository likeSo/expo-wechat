import {
  ConfigPlugin,
  withInfoPlist,
  withAppDelegate,
} from 'expo/config-plugins';

const withExpoWechat: ConfigPlugin = (config) => {
  // config = withAndroidManifest(config, (config) => {
  //   const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
  //     config.modResults
  //   );
  //   return config;
  // });

  config = withInfoPlist(config, (config) => {
    let queriesSchemes = config.modResults.LSApplicationQueriesSchemes ?? [];
    queriesSchemes.unshift(
      'weixin',
      'weixinULAPI',
      'weixinURLParamsAPI',
      'weixinQRCodePayAPI',
    );
    queriesSchemes = [...new Set(queriesSchemes)];
    config.modResults.LSApplicationQueriesSchemes = queriesSchemes;
    return config;
  });
  config = withAppDelegate(config, (config) => {
    const appDelegate = config.modResults.contents;
    if (!appDelegate) {
      return config;
    }

    const methodPattern =
      /public override func application\(\s*_ application: UIApplication,\s*continue userActivity: NSUserActivity,\s*restorationHandler: @escaping \(\[UIUserActivityRestoring\]\?\) -> Void\s*\) -> Bool \{[\s\S]*?\n  \}/;

    const replacementMethod = `public override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    // 微信 Universal Link 回调阻止 expo-router 处理，只让 WeChat SDK 处理 @expo-wechat
    if let webpageURL = userActivity.webpageURL {
      let urlString = webpageURL.absoluteString
      // 精确匹配微信 appid 确保是微信链接
      if urlString.contains("/wx") {
        let wxPattern = "/wx[a-zA-Z0-9]{16}/"
        if let range = urlString.range(of: wxPattern, options: .regularExpression) {
          return super.application(application, continue: userActivity, restorationHandler: restorationHandler)
        }
      }
    }

    let result = RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
    return super.application(application, continue: userActivity, restorationHandler: restorationHandler) || result
  }`;

    config.modResults.contents = appDelegate.replace(
      methodPattern,
      replacementMethod,
    );
    return config;
  });
  return config;
};

export default withExpoWechat;
