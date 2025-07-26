import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
} from "expo/config-plugins";

const withExpoWechat: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );
    let activities = mainApplication.activity ?? [];
    let packageName = config.android?.package;
    let entryActivityIndex = activities.findIndex(
      (activity) => activity.$["android:name"] === ".wxapi.WXEntryActivity"
    );
    let payEntryActivityIndex = activities.findIndex(
      (activity) => activity.$["android:name"] === ".wxapi.WXPayEntryActivity"
    );

    if (entryActivityIndex !== -1) {
      activities.splice(entryActivityIndex, 1);
    }
    if (payEntryActivityIndex !== -1) {
      activities.splice(payEntryActivityIndex, 1);
    }

    activities.push(
      {
        $: {
          "android:name": ".wxapi.WXEntryActivity",
          "android:launchMode": "singleTask",
          "android:exported": "true",
          "android:theme": "@android:style/Theme.Translucent.NoTitleBar",
          "android:label": "@string/app_name",
          "android:taskAffinity": packageName,
        },
      },
      {
        $: {
          "android:name": ".wxapi.WXPayEntryActivity",
          "android:launchMode": "singleTask",
          "android:exported": "true",
          "android:theme": "@android:style/Theme.Translucent.NoTitleBar",
          "android:label": "@string/app_name",
          "android:taskAffinity": packageName,
        },
      }
    );
    mainApplication.activity = activities;
    return config;
  });

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
