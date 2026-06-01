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

  /// 往 Podfile 中添加 Wechat 相关的环境变量
  config = withPodfile(config, (config) => {
    const podfile = config.modResults.contents;
    if (podfile.includes(`ENV['EXPO_WECHAT_ENABLE_PAY']`)) {
      return config;
    }

    config.modResults.contents = podfile.replace(
      /ENV\['RCT_NEW_ARCH_ENABLED'\].*\n/,
      `ENV['EXPO_WECHAT_ENABLE_PAY'] = '${enablePay ? "1" : "0"}'\n$&`,
    );
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
