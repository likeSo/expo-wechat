import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
} from "expo/config-plugins";

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
      "weixin",
      "weixinULAPI",
      "weixinURLParamsAPI",
      "weixinQRCodePayAPI"
    );
    queriesSchemes = [...new Set(queriesSchemes)];
    config.modResults.LSApplicationQueriesSchemes = queriesSchemes;
    return config;
  });

  return config;
};

export default withExpoWechat;
