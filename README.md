# expo-wechat
![npm](https://img.shields.io/npm/v/expo-wechat.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React Native Expo版本的微信SDK。基本实现了所有的微信官方SDK的功能，包括支付、登录、分享、客服、跳转小程序等。支持安卓和iOS。
本框架旨在让你所有原生代码配置都在RN侧以及json文件中进行，真正做到0原生代码配置，充分利用expo的优势来做到简单好用。

# 🚀 主要特性

- ✅完整的微信SDK功能。
- ✅完整的TypeScript支持，完整的代码提示。
- ✅跨平台支持。同时支持安卓和iOS。在web上你也可以调用，只是不会有任何效果，不会报错。
- ✅售后保证。在使用过程中遇到任何问题都可以联系我，有Expo相关的技术问题也欢迎交流。


# 📦 安装
```shell
npx expo install expo-wechat

# 不带支付版本
# npx expo install expo-wechat-no-pay
```

# 🔧 配置

iOS需要配置通用链接和URL Scheme。安卓上需要配置混淆规则。这些都可以通过`app.json`或`app.config.js`来配置。

> 什么是URL Scheme和通用链接？简单来说这就是iOS上微信授权完成后，跳回你的app的两种途径。
> URL Scheme用于给你的应用注册一个独一无二的链接，使别的软件可以通过这个链接直接唤起你的App。
> 是微信回调起你的App的保底方案，当通用链接唤起失败后，微信会尝试使用URL Scheme来唤起你的App。这个URL Scheme就是微信开放平台给你的微信id，类似于`wx1234567890`这种格式的。
>
> 通用链接是微信首推的唤起微信和你的App的方案，当通用链接没有配置好的时候，才会回退到URL Scheme方案。
> 通用链接允许你向苹果注册一个URL地址，当访问这个地址的时候，系统优先唤起你的App，而不是网页。简单来说，它是一种比URL Scheme更好的唤起App的解决方案。
>
> 通用链接如何生成，以及如何向苹果注册，也许你需要参照一下[苹果官方文档](https://developer.apple.com/documentation/xcode/supporting-associated-domains)。
> 
> 如果对于`app.json`和`app.config.js`有疑问，请参阅[Expo Configure with app config 文档](https://docs.expo.dev/workflow/configuration/)。其实都是一个东西，只是后者能让你写JS代码，更灵活一些。

在`app.json`或`app.config.js`添加如下配置：

```json5
"expo": {
  "scheme": [
    // 微信开放平台给你的微信id，类似于wx1234567890这种格式的。
    "wx1234567890"
  ],
  "ios": {
    "associatedDomains": [
      // 你的通用链接地址，前缀applinks是固定的，需要保证后边的域名和苹果，以及微信上注册的一致。
        "applinks:example.com"
    ]
  },
  "plugins": [
    [
      // expo-build-properties是另外一个expo官方的插件，它能让你自定义很多构建阶段的参数，包括自定义混淆规则和maven仓库等。
      // 记得先npx expo install expo-build-properties
      "expo-build-properties",
      {
        "android": {
          "extraProguardRules": "把下面的混淆规则放到这里",
        },
      }
    ],
    "expo-wechat"
  ]
}

```

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

请注意，由于包含了自定义的原生代码，无法在expo go中直接使用。你应该使用`npx expo run:android`或者`npx expo run:ios`，编译原生app。详情参见官方[DevClient文档](https://docs.expo.dev/versions/latest/sdk/dev-client/)。


# 📝 初始化

```typescript
import ExpoWeChat from 'expo-wechat'

/// 初始化微信SDK。一般都在用户接受了隐私政策后，调用此方法。
const result = await ExpoWeChat.registerApp(wechatAppId, universalLink);
```

# 📚 API文档

## 属性

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `isRegistered` | `boolean` | 是否已经成功调用registerApp方法 |

## 初始化与检测

### registerApp
```typescript
registerApp(appId: string, universalLink: string): Promise<boolean>
```

初始化微信SDK。返回初始化结果。

**参数：**
- `appId`: 微信App ID
- `universalLink`: 通用链接地址（iOS必需）

**返回值：** `Promise<boolean>` - 初始化是否成功

### isWXAppInstalled
```typescript
isWXAppInstalled(): Promise<boolean>
```

检查用户是否已安装微信客户端。

**返回值：** `Promise<boolean>` - 是否已安装微信

### getApiVersion
```typescript
getApiVersion(): Promise<string>
```

获取微信SDK的版本号。

**返回值：** `Promise<string>` - SDK版本号

### getWXAppInstallUrl
```typescript
getWXAppInstallUrl(): Promise<string | null>
```

获取微信安装的URL。

**返回值：** `Promise<string | null>` - 安装URL或null

### openWXApp
```typescript
openWXApp(): Promise<boolean>
```

打开微信App。

**返回值：** `Promise<boolean>` - 打开是否成功

### checkUniversalLinkReady
```typescript
checkUniversalLinkReady(): Promise<void>
```

启动微信自检流程，打印自检日志。

**注意：** iOS Only

## 授权登录

### sendAuthRequest
```typescript
sendAuthRequest(
  scope: "snsapi_userinfo" | string,
  state: string
): Promise<boolean>
```

发送微信授权登录请求。

**参数：**
- `scope`: 微信scope字段，如`snsapi_userinfo`
- `state`: 微信state字段，用于维持请求和回调的状态

**返回值：** `Promise<boolean>` - 请求是否发送成功

**注意：** 此方法返回的是请求发送结果，不是授权结果。授权结果需通过监听`onAuthResult`事件获取。

### sendAuthByQRRequest
```typescript
sendAuthByQRRequest(options: AuthByQROptions): Promise<string>
```

发送微信扫码登录请求。

**参数：**
```typescript
interface AuthByQROptions {
  appId: string;              // 微信App ID
  appSecret: string;          // 微信App Secret
  scope: "snsapi_userinfo" | string;  // 授权范围
  schemeData?: string;        // 可选的scheme数据
}
```

**返回值：** `Promise<string>` - 二维码base64编码的图片数据

## 分享功能

### shareText
```typescript
shareText(text: string, scene: ShareScene): Promise<boolean>
```

分享文字到微信。

**参数：**
- `text`: 要分享的文字内容
- `scene`: 分享目标场景 (`'session' | 'timeline' | 'favorite' | 'status' | 'specifiedContact'`)

**返回值：** `Promise<boolean>` - 分享请求是否发送成功

### shareImage
```typescript
shareImage(options: ShareImageOptions): Promise<boolean>
```

分享图片到微信。

**参数：**
```typescript
interface ShareImageOptions {
  base64OrImageUri: string;           // 图片内容（本地URI或base64）
  scene: ShareScene;                  // 分享场景
  thumbBase64OrImageUri?: string;     // 缩略图内容（可选）
  imageDataHash?: string | null;      // 图片哈希值（可选）
  miniProgramId?: string | null;      // 小程序原始id（可选）
  miniProgramPath?: string | null;    // 小程序路径（可选）
}
```

**返回值：** `Promise<boolean>` - 分享请求是否发送成功

### shareFile
```typescript
shareFile(
  base64OrFileUri: string,
  title: string,
  scene: ShareScene
): Promise<boolean>
```

分享文件到微信。

**参数：**
- `base64OrFileUri`: 文件内容（本地URI或base64）
- `title`: 文件标题
- `scene`: 分享目标场景

**返回值：** `Promise<boolean>` - 分享请求是否发送成功

### shareMusic
```typescript
shareMusic(options: ShareMusicOptions): Promise<boolean>
```

分享音乐到微信。

**参数：**
```typescript
interface ShareMusicOptions {
  musicWebpageUrl: string;                  // 音乐网页URL
  musicFileUri: string;                     // 音乐文件URI
  singerName: string;                       // 歌手名称
  duration: number;                         // 音乐时长（秒）
  scene: ShareScene;                        // 分享场景
  songLyric?: string;                       // 歌词（可选）
  hdAlbumThumbFilePath?: string;            // 高清专辑缩略图文件路径（安卓）
  hdAlbumThumbBase64OrImageUri?: string;    // 高清专辑缩略图（iOS）
  hdAlbumThumbFileHash?: string;            // 高清专辑缩略图文件哈希值
  albumName?: string;                       // 专辑名称
  title?: string;                           // 标题（可选）
  description?: string;                     // 描述（可选）
  thumbBase64OrImageUri?: string;           // 缩略图（可选）
}
```

**返回值：** `Promise<boolean>` - 分享请求是否发送成功

### shareVideo
```typescript
shareVideo(options: ShareVideoOptions): Promise<boolean>
```

分享视频到微信。

**参数：**
```typescript
interface ShareVideoOptions {
  videoUri: string;                         // 视频文件URI
  scene: ShareScene;                        // 分享场景
  lowQualityVideoUri?: string;              // 低质量视频URI（可选）
  thumbBase64OrImageUri?: string;           // 缩略图（可选）
  title?: string;                           // 标题（可选）
  description?: string;                     // 描述（可选）
}
```

**返回值：** `Promise<boolean>` - 分享请求是否发送成功

### shareWebpage
```typescript
shareWebpage(options: ShareWebpageOptions): Promise<boolean>
```

分享网页到微信。

**参数：**
```typescript
interface ShareWebpageOptions {
  url: string;                              // 网页URL
  scene: ShareScene;                        // 分享场景
  title?: string;                           // 标题（可选）
  description?: string;                     // 描述（可选）
  thumbBase64OrImageUri?: string;           // 缩略图（可选）
  extraInfo?: string;                       // 额外信息（可选）
}
```

**返回值：** `Promise<boolean>` - 分享请求是否发送成功

### shareMiniProgram
```typescript
shareMiniProgram(options: ShareMiniProgramOptions): Promise<boolean>
```

分享小程序到微信。

**参数：**
```typescript
interface ShareMiniProgramOptions {
  id: string;                               // 小程序原始id
  type: WeChatMiniProgramType;              // 小程序类型 ('release' | 'test' | 'preview')
  path?: string;                            // 小程序路径（可选）
  scene: ShareScene;                        // 分享场景
  webpageUrl?: string;                      // 网页URL（可选）
  title?: string;                           // 标题（可选）
  description?: string;                     // 描述（可选）
  thumbBase64OrImageUri?: string;           // 缩略图（可选）
  withShareTicket?: boolean;                // 是否携带shareTicket（可选）
}
```

**返回值：** `Promise<boolean>` - 分享请求是否发送成功

## 小程序相关

### launchMiniProgram
```typescript
launchMiniProgram(options: LaunchMiniProgramOptions): Promise<boolean>
```

打开微信小程序。

**参数：**
```typescript
interface LaunchMiniProgramOptions {
  id: string;                               // 小程序原始id
  type: WeChatMiniProgramType;              // 小程序类型
  path?: string;                            // 小程序路径（可选）
  extraData?: string;                       // 额外数据（可选）
}
```

**返回值：** `Promise<boolean>` - 打开请求是否发送成功

## 支付功能

### pay
```typescript
pay(options: PayOptions): Promise<boolean>
```

发起微信支付。

**参数：**
```typescript
interface PayOptions {
  partnerId: string;                        // 商户号
  prepayId: string;                         // 预支付交易会话ID
  nonceStr: string;                         // 随机字符串
  timeStamp: number;                        // 时间戳
  sign: string;                             // 签名
  package: string;                          // 扩展字段
  extraData: string;                        // 额外数据
}
```

**返回值：** `Promise<boolean>` - 支付请求是否发送成功

## 客服与订阅消息

### openWeChatCustomerServiceChat
```typescript
openWeChatCustomerServiceChat(cropId: string, url: string): Promise<boolean>
```

打开微信客服聊天。

**参数：**
- `cropId`: 企业ID
- `url`: 客服URL

**返回值：** `Promise<boolean>` - 打开请求是否发送成功

### sendSubscribeMessage
```typescript
sendSubscribeMessage(
  scene: number,
  templateId: string,
  reserved: string
): Promise<boolean>
```

发送订阅消息。

**参数：**
- `scene`: 场景
- `templateId`: 模板ID
- `reserved`: 保留字段

**返回值：** `Promise<boolean>` - 发送请求是否成功

## 事件监听

调用API返回的Promise仅仅代表调用的成功与否，不代表最终的微信返回结果。对于需要观测结果的API，应当使用事件监听的方式来实现：

### 支持的事件列表

| 事件名 | 说明 | 回调参数类型 |
|--------|------|------------|
| `onQRCodeAuthGotQRCode` | 二维码登录时，得到二维码图片 | `{ image: string }` |
| `onQRCodeAuthUserScanned` | 二维码登录时，用户成功扫描二维码 | `void` |
| `onQRCodeAuthResult` | 二维码登录结果 | `{ errorCode: number; authCode: string }` |
| `onShowMessageFromWeChat` | 从微信打开应用时收到的消息 | `ShowMessageFromWeChatPayload` |
| `onAuthResult` | 授权登录结果 | `AuthResultPayload` |
| `onPayResult` | 支付结果 | `PayResultPayload` |
| `onLaunchMiniProgramResult` | 打开小程序结果 | `{ extraInfo?: string }` |

### 授权登录结果结构
```typescript
export type AuthResultPayload = {
  code: string;         // 授权码
  state: string;        // 状态值
  url: string;          // 完整URL
  authResult: boolean;  // 授权是否成功
  lang: string;         // 语言
  country: string;      // 国家
  errorCode: number;    // 错误码
  errorMessage: string; // 错误信息
  openId: string;       // 开放ID
  transaction: string;  // 事务ID
};
```

### 支付结果结构
```typescript
export type PayResultPayload = {
  prepayId?: string;    // 预支付ID
  returnKey?: string;   // 返回键
  extraInfo?: string;   // 额外信息
  errorCode: number;    // 错误码
  errorMessage: string; // 错误信息
  openId: string;       // 开放ID
  transaction: string;  // 事务ID
};
```

## 错误码说明

```typescript
export enum ResultErrorCode {
  ok = 0,             // 成功
  common = -1,        // 普通错误
  userCancel = -2,    // 用户取消
  sentFailed = -3,    // 发送失败
  authDenied = -4,    // 授权被拒绝
  unsupported = -5,   // 不支持的操作
  ban = -6,           // 被禁止
}
```

## 使用示例

### 授权登录示例
```typescript
import ExpoWeChat from 'expo-wechat'
import { useEvent, useEffect } from 'expo'

// 初始化
const initializeWeChat = async () => {
  const result = await ExpoWeChat.registerApp('wx1234567890', 'https://example.com/');
  console.log('微信SDK初始化结果:', result);
};

// 使用useEvent监听授权结果
const authResult = useEvent(ExpoWeChat, 'onAuthResult');

useEffect(() => {
  if (authResult) {
    if (authResult.errorCode === 0) {
      console.log('授权成功!');
      console.log('授权码:', authResult.code);
      console.log('状态:', authResult.state);
      // 在这里使用code向服务器换取token
    } else {
      console.log('授权失败:', authResult.errorMessage);
    }
  }
}, [authResult]);

// 发送授权请求
const handleWeChatLogin = async () => {
  // 检查微信是否安装
  const isInstalled = await ExpoWeChat.isWXAppInstalled();
  if (!isInstalled) {
    alert('请先安装微信');
    return;
  }
  
  // 发送授权请求
  const requestResult = await ExpoWeChat.sendAuthRequest('snsapi_userinfo', 'state123');
  console.log('授权请求发送结果:', requestResult);
};
```

### 二维码登录示例
```typescript
import ExpoWeChat from 'expo-wechat'
import { useEvent, useEffect } from 'expo'

// 监听二维码相关事件
const qrCodeResult = useEvent(ExpoWeChat, 'onQRCodeAuthGotQRCode');
const qrCodeScanResult = useEvent(ExpoWeChat, 'onQRCodeAuthUserScanned');
const qrCodeLoginResult = useEvent(ExpoWeChat, 'onQRCodeAuthResult');

useEffect(() => {
  if (qrCodeResult) {
    console.log('二维码生成成功，可以显示了');
    // 这里可以使用qrCodeResult.image来渲染二维码
  }
}, [qrCodeResult]);

useEffect(() => {
  if (qrCodeScanResult) {
    console.log('用户已扫描二维码，请确认');
  }
}, [qrCodeScanResult]);

useEffect(() => {
  if (qrCodeLoginResult) {
    if (qrCodeLoginResult.errorCode === 0) {
      console.log('二维码登录成功!');
      console.log('授权码:', qrCodeLoginResult.authCode);
      // 在这里使用authCode向服务器换取token
    } else {
      console.log('二维码登录失败:', qrCodeLoginResult.errorCode);
    }
  }
}, [qrCodeLoginResult]);

// 生成登录二维码
const generateLoginQRCode = async () => {
  try {
    const qrCode = await ExpoWeChat.sendAuthByQRRequest({
      appId: 'wx1234567890',
      appSecret: 'your_app_secret',
      scope: 'snsapi_userinfo'
    });
    console.log('二维码生成成功');
  } catch (error) {
    console.error('二维码生成失败:', error);
  }
};
```

### 支付示例
```typescript
import ExpoWeChat from 'expo-wechat'
import { useEvent, useEffect } from 'expo'

// 监听支付结果
const payResult = useEvent(ExpoWeChat, 'onPayResult');

useEffect(() => {
  if (payResult) {
    if (payResult.errorCode === 0) {
      console.log('支付成功!');
      // 支付成功后的处理逻辑
    } else {
      console.log('支付失败:', payResult.errorMessage);
      // 支付失败后的处理逻辑
    }
  }
}, [payResult]);

// 发起支付
const handlePay = async () => {
  try {
    // 从服务器获取支付参数
    const payParams = await getPayParamsFromServer();
    
    const result = await ExpoWeChat.pay({
      partnerId: payParams.partnerId,
      prepayId: payParams.prepayId,
      nonceStr: payParams.nonceStr,
      timeStamp: payParams.timeStamp,
      sign: payParams.sign,
      package: payParams.package,
      extraData: payParams.extraData
    });
    
    console.log('支付请求发送结果:', result);
  } catch (error) {
    console.error('支付失败:', error);
  }
};
```

### 分享示例
```typescript
import ExpoWeChat from 'expo-wechat'

// 分享网页到微信会话
const shareToWeChat = async () => {
  try {
    const result = await ExpoWeChat.shareWebpage({
      url: 'https://example.com',
      title: '分享标题',
      description: '分享描述内容',
      thumbBase64OrImageUri: 'base64编码的图片或本地图片URI',
      scene: 'session'
    });
    console.log('分享请求发送结果:', result);
  } catch (error) {
    console.error('分享失败:', error);
  }
};
```

# 🔧 调试
开启日志调试，首先你需要调用`ExpoWeChat.startLogByLevel('verbose')`方法，即可打开全部日志。
为了将日志打印到JS控制台，你需要监听`onLog`事件，然后将其打印出来即可，具体可以参考example下的`App.tsx`文件。


> 注意：
> 所有API返回的Promise仅表示调用是否成功发送，不代表最终操作结果。需要通过相应的事件监听获取实际操作结果。
> `useEvent`是expo提供的一个模块事件监听的工具，你完全可以使用`ExpoWeChat.addListener('onAuthResult', (result) => {})`这种语法来监听事件结果，但千万不要忘记在组件卸载时移除事件监听，否则会导致内存泄漏。

# 📱 例子项目

克隆本仓库，并启动Example示例项目的步骤如下
- 克隆本仓库后，在根目录执行`npm i`
- 在根目录执行`npm run build plugin`，然后按下`ctrl + c`退出命令即可。
- 进入example文件夹，执行`npm i`安装依赖。
- 启动之前，请在`.env`文件内配置微信AppId和Key，去`app.json`文件内配置scheme和associatedDomains，切记确保与微信后台配置的一致。

# ☎️ 联系方式
本框架积极维护，如有任何问题，欢迎提交issue或者PR。也欢迎进群交流：682911244。


# 🗺️ 线路图

- [ ] 实现选择发票功能
- [x] 发布不带支付功能的SDK
- [x] 完善文档

# 🤔 常见问题
### 报错 could not find module `ExpoModulesCore` for target '86_64-apple-ios-simulator'; found: arm64-apple-ios-simulator
以下方案是我们的一些经验，你可以都试一下：
- 启动Rosetta模拟器。
- 使用真机运行项目。
- 升级Xcode到16.4以及以后。
- 使用[expo-fix-ios-simulator-arch](https://github.com/Morphicai/expo-fix-ios-simulator-arch)插件来自动帮你解决这个问题。

### 微信授权结束后，没有回到登录页面，而是跳到了404页面？
> 原因分析
> 微信授权结束后，会通过URL Scheme和通用链接来回到你的应用，并把授权结果带在路径上作为参数。比如`/wxauth/wx1234567890/oauth`
> 如果你使用了expo-router，或者配置好了React Navigation的deep linking，那么导航器会尝试跳转到这个URL对应的路由下，由于路由不存在，就会显示404页面。

#### 解决方案1
既然这个问题产生的原因其实就是微信打开你的app的链接和你准备接收回调的链接没有“对准”，那么解决方案就是你想办法让它俩对准即可。在通用链接上和路由配置上想想办法。

#### 解决方案2
expo-router提供了一个API，可以让你拦截所有deep link，并手动控制是否处理。详见[Customizing links](https://docs.expo.dev/router/advanced/native-intent/#rewrite-incoming-native-deep-links)。
简单来说，你需要新建一个`+native-intent.tsx`文件，按照文档导出一个函数，并根据条件，重定向到你的登录页面即可。


# 🙏 鸣谢
本框架参考了许多[react-native-wechat-lib](https://github.com/little-snow-fox/react-native-wechat-lib)的实现，实现了基本上所有的API的功能，在此基础上，极大的简化了配置流程，并使用了最新的微信SDK，感谢前人！
