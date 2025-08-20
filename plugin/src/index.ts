import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
  withInfoPlist,
  withDangerousMod,
} from "expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

const createWeChatEntryActivities = (packageName: string) => `package ${packageName}.wxapi

import android.app.Activity
import android.os.Bundle
import expo.modules.wechat.ExpoWechatModule

class WXEntryActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ExpoWechatModule.moduleInstance?.handleIntent(intent);
        finish()
    }
}

class WXPayEntryActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ExpoWechatModule.moduleInstance?.handleIntent(intent)
        finish()
    }
}
`;

const withExpoWechat: ConfigPlugin = (config) => {
  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );
    let activities = mainApplication.activity ?? [];
    let packageName = config.android?.package;

    // Remove existing entries from this plugin to avoid duplicates
    activities = activities.filter(
      (activity) =>
        activity.$["android:name"] !== ".wxapi.WXEntryActivity" &&
        activity.$["android:name"] !== ".wxapi.WXPayEntryActivity"
    );

    // Add new entries pointing to the generated wrapper activities
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

  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const androidMainPath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main"
      );
      const packageName = config.android?.package;

      if (!packageName) {
        throw new Error("Android package name is not defined in app.json");
      }

      const packagePath = packageName.replace(/\./g, path.sep);
      const wxapiPath = path.join(androidMainPath, "java", packagePath, "wxapi");

      fs.mkdirSync(wxapiPath, { recursive: true });

      const payEntryActivityContent = createWeChatEntryActivities(packageName);
      fs.writeFileSync(
        path.join(wxapiPath, "WXEntryActivities.kt"),
        payEntryActivityContent
      );

      return config;
    },
  ]);

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
