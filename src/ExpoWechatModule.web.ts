import { registerWebModule, NativeModule } from "expo";

import { ExpoWechatModuleEvents, LogLevel } from "./ExpoWechat.types";

const WEB_NOT_SUPPORTED_MESSAGE = "ExpoWeChat is not supported on web";

class ExpoWechatModule extends NativeModule<ExpoWechatModuleEvents> {

  private showWebPlatformNotSupportMessage() {
    if (__DEV__) {
      console.log(WEB_NOT_SUPPORTED_MESSAGE);
    }
  }

  isWXAppInstalled() {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  getApiVersion() {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve("");
  }

  getWXAppInstallUrl() {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(null);
  }

  openWXApp() {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  registerApp(appId: string, universalLink: string) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  startLogByLevel(level: LogLevel) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve();
  }

  checkUniversalLinkReady() {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve();
  }

  sendAuthRequest(scope: string, state: string) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  sendAuthByQRRequest(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve("");
  }

  shareText(text: string, scene: string) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  shareImage(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  shareFile(base64OrFileUri: string, title: string, scene: string) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  shareMusic(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  shareVideo(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  shareWebpage(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  shareMiniProgram(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  launchMiniProgram(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  openWeChatCustomerServiceChat(cropId: string, url: string) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  sendSubscribeMessage(scene: number, templateId: string, reserved: string) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  pay(options: any) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }

  openWebView(url: string) {
    this.showWebPlatformNotSupportMessage();
    return Promise.resolve(false);
  }
}

export default registerWebModule(ExpoWechatModule, "ExpoWechatModule");
