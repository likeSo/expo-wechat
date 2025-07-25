# expo-wechat
![npm](https://img.shields.io/npm/v/expo-wechat-sdk.svg)

React Native Expo版本的微信SDK。
本框架旨在让你所有原生代码配置都在RN侧以及json文件中进行，真正做到0原生代码配置，充分利用expo的优势来做到简单好用。

⚠️项目测试中，敬请期待⚠️

# 安装
```shell
npx expo install expo-wechat-sdk

# 不带支付版本
# npx expo install expo-wechat-sdk-no-pay
```

# 配置

## iOS
iOS需要配置通用链接和URL Scheme。

URL Scheme用于给你的应用注册一个独一无二的链接，使别的软件可以通过这个链接直接唤起你的App。
是微信回调起你的App的保底方案，当通用链接唤起失败后，微信会尝试使用URL Scheme来唤起你的App。这个URL Scheme就是微信开放平台给你的微信id，类似于`wx1234567890`这种格式的。

通用链接是微信首推的唤起微信和你的App的方案，当通用链接没有配置好的时候，才会回退到URL Scheme方案。
通用链接允许你向苹果注册一个URL地址，当访问这个地址的时候，系统优先唤起你的App，而不是网页。简单来说，它是一种比URL Scheme更好的唤起App的解决方案。

使用Expo官方提供的方式来添加URL Scheme，以及配置通用链接。在`app.json`中添加以下字段：
```json
"ios": {
    "scheme": [
        "wx1234567890"
    ],
    "associatedDomains": [
        "applinks:example.com"
    ]
}
```
这里的通用链接如何创建，以及如何向苹果注册，也许你需要参照一下[苹果官方文档](https://developer.apple.com/documentation/xcode/supporting-associated-domains)。

URL Scheme白名单，也就是`LSApplicationQueriesSchemes`字段，因为是固定不变的，所以已经自动帮你配置好。

## 安卓

```text
-keep class com.tencent.mm.opensdk.** {
    *;
}

-keep class com.tencent.wxop.** {
    *;
}

-keep class com.tencent.mm.sdk.** {
    *;
}
```

需要配置proguard文件，在`app.json`中添加以下字段：
```json
"android": {
    "extraProguardRules": ""
}
```


## 总结
配置部分，iOS需要配置URL Scheme和通用链接，安卓需要配置混淆规则。最后需要添加`expo-wechat-sdk`的config plugin：
```json
"plugins": [
    "expo-wechat-sdk"
]
```
这些是全部的配置项了，都可以通过expo的`app.json`来完成，配置部分完成后，就可以正常使用微信SDK了。

# 使用

```typescript
import * as ExpoWeChat from 'expo-wechat-sdk'

const result = await ExpoWeChat.registerApp(wechatAppId, universalLink);
```

# API
以下是所有已支持的API：
```typescript
  isWXAppInstalled(): Promise<boolean>;
  getApiVersion(): Promise<string>;
  getWXAppInstallUrl(): Promise<string | null>;
    /**
   * 打开微信App。返回打开结果。
   */
    openWXApp(): Promise<boolean>;

  /**
   * 初始化微信SDK。返回初始化结果。
   * @param appId 微信App ID
   * @param universalLink 通用链接地址
   */
  registerApp(appId: string, universalLink: string): Promise<boolean>;

  /**
   * 启动微信自检流程，打印自检日志。iOS Only
   */
  checkUniversalLinkReady(): Promise<void>;

  /**
   * 发送微信授权登录请求。返回**发送**结果，注意是发送结果不是授权结果，授权结果要从事件中获取。
   * @param scope 微信scope字段。
   * @param state 微信state字段。
   */
  sendAuthRequest(
    scope: "snsapi_userinfo" | Omit<string, "snsapi_userinfo">,
    state: string
  ): Promise<boolean>;

  /**
   * 发送微信扫码登录请求。返回微信登录二维码。
   * @param appId 微信App ID
   * @param appSecret 微信App Secret
   */
  sendAuthByQRRequest(
    options: AuthByQROptions
  ): Promise<string>;

  /**
   * 分享文字到微信。返回分享结果。
   * @param text 要分享的文字内容。
   * @param scene 分享目标场景。
   */
  shareText(text: string, scene: ShareScene): Promise<boolean>;

  /**
   * 分享图片到微信。返回分享结果。
   */
  shareImage(options: ShareImageOptions): Promise<boolean>;

  /**
   * 分享文件到微信。返回分享结果。
   * @param base64OrFileUri 文件内容，可以是本地文件URI，或者base64编码的文件数据。
   * @param title 文件标题。
   * @param scene 要分享的目标场景。
   */
  shareFile(
    base64OrFileUri: string,
    title: string,
    scene: ShareScene
  ): Promise<boolean>;

  /**
   * 分享音乐到微信。返回分享结果。
   */
  shareMusic(options: ShareMusicOptions): Promise<boolean>;

  /**
   * 分享视频到微信。返回分享结果。
   */
  shareVideo(options: ShareVideoOptions): Promise<boolean>;
  /**
   * 分享网页到微信。返回分享结果。
   */
  shareWebpage(options: ShareWebpageOptions): Promise<boolean>;
  /**
   * 分享小程序到微信。返回分享结果。
   */
  shareMiniProgram(options: ShareMiniProgramOptions): Promise<boolean>;

  /**
   * 打开微信小程序。返回打开结果。
   */
  launchMiniProgram(options: LaunchMiniProgramOptions): Promise<boolean>;

  /**
   * 打开微信客服聊天。
   */
  openWeChatCustomerServiceChat(cropId: string, url: string): Promise<boolean>;
  /**
   * 发送订阅消息。
   * @param scene 场景
   * @param templateId 模板ID
   * @param reserved 保留字段
   */
  sendSubscribeMessage(
    scene: number,
    templateId: string,
    reserved: string
  ): Promise<boolean>;

  /**
   * 微信支付
   */
  pay(options: WeChatPayOptions): Promise<boolean>;
```
调用API返回的Promise仅仅代表调用的成功与否，不代表最终的微信返回结果。
对于需要观测结果的API，比如分享，登录，需要拿到结果信息的场景，应当使用事件监听的方式来实现：

```typescript
/// 当得到授权登录结果后，会回调此hook并重新渲染组件
const onAuthResult = useEvent(ExpoWechat, "onAuthResult");
/// 这里的onAuthResult是普通授权登录结果的事件名，类似的还有：
/// onQRCodeAuthGotQRCode 二维码登录时，得到二维码图片回调，你可在页面上展示，让用户扫码
/// onQRCodeAuthUserScanned 二维码登录时，用户成功扫描到了二维码
/// onQRCodeAuthResult 二维码登录结果回调
/// onPayResult 支付结果回调

useEffect(() => {
    onAuthResult.code
    onAuthResult.state
}, [onAuthResult])

/// 发送授权登录请求，最终的结果会体现在hook里
ExpoWeChat.sendAuthRequest()
```

# Example

克隆本仓库，进入example文件夹，执行`npm i`，再启动项目。
启动之前，请在`.env`文件内配置微信AppId和Key，通用链接。

# 鸣谢
本框架参考了许多[react-native-wechat-lib](https://github.com/little-snow-fox/react-native-wechat-lib)的代码，实现了基本上所有的API的功能，在此基础上，极大的简化了配置流程，并使用了最新的微信SDK，感谢前人！

# 联系方式
本框架积极维护，如有任何问题，欢迎提交issue或者PR。
QQ 群：682911244


# 线路图

- [ ] 实现选择发票功能
- [x] 发布不带支付功能的SDK
- [ ] 完善文档
