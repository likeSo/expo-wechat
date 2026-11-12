import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
  withPodfile,
} from "expo/config-plugins";

const withExpoWechat: ConfigPlugin<{ enablePay?: boolean } | void> = (
  config,
  props,
) => {
  /// 往 Info.plist 中添加 Wechat 相关的 URL schemes
  config = withInfoPlist(config, (config) => {
    let queriesSchemes = config.modResults.LSApplicationQueriesSchemes ?? [];
    queriesSchemes.unshift(
      "weixin",
      "weixinULAPI",
      "weixinURLParamsAPI",
      "weixinQRCodePayAPI",
    );
    queriesSchemes = [...new Set(queriesSchemes)];
    config.modResults.LSApplicationQueriesSchemes = queriesSchemes;
    return config;
  });

  const enablePay = props?.enablePay ?? true;

  const envLine = `ENV['EXPO_WECHAT_ENABLE_PAY'] = '${enablePay ? "1" : "0"}'`;

  /// 往 Podfile 中添加 Wechat 相关的环境变量
  config = withPodfile(config, (config) => {
    const podfile = config.modResults.contents;
    if (/^ENV\['EXPO_WECHAT_ENABLE_PAY'\]/m.test(podfile)) {
      config.modResults.contents = podfile.replace(
        /^ENV\['EXPO_WECHAT_ENABLE_PAY'\].*$/m,
        envLine,
      );
    } else {
      config.modResults.contents = podfile.replace(
        /^[ \t]*platform[ \t]+:ios.*$\n/m,
        envLine + "\n$&",
      );
    }
    return config;
  });

  /// 往清单文件里面标记 Wechat 相关的环境变量
  config = withAndroidManifest(config, (config) => {
    const manifest = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );
    AndroidConfig.Manifest.removeMetaDataItemFromMainApplication(
      manifest,
      "EXPO_WECHAT_ENABLE_PAY",
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      manifest,
      "EXPO_WECHAT_ENABLE_PAY",
      enablePay.toString(),
    );
    return config;
  });

  return config;
};

export default withExpoWechat;
