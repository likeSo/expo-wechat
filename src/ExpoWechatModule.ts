import { NativeModule, requireNativeModule } from "expo";

import {
  ExpoWechatModuleEvents,
  ShareScene,
  ShareImageOptions,
  ShareMusicOptions,
  ShareVideoOptions,
  ShareWebpageOptions,
  ShareMiniProgramOptions,
  LaunchMiniProgramOptions,
} from "./ExpoWechat.types";

declare class ExpoWechatModule extends NativeModule<ExpoWechatModuleEvents> {
  isWXAppInstalled(): Promise<boolean>;
  getApiVersion(): Promise<string>;

  /**
   * 初始化微信SDK。返回初始化结果。
   * @param appId 微信App ID
   * @param universalLink 通用链接地址
   */
  registerApp(appId: string, universalLink: string): Promise<boolean>;

  /**
   * 打开微信App。返回打开结果。
   */
  openWXApp(): Promise<boolean>;

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
    appId: string,
    appSecret: string,
    scope: "snsapi_userinfo" | string
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
  pay(): Promise<boolean>;
}

export default requireNativeModule<ExpoWechatModule>("ExpoWechat");
