import { registerWebModule, NativeModule } from "expo";

import { ExpoWechatModuleEvents, LogLevel } from "./ExpoWechat.types";

const WEB_NOT_SUPPORTED_MESSAGE = "ExpoWeChat is not supported on web";

class ExpoWechatModule extends NativeModule<ExpoWechatModuleEvents> {
  isWXAppInstalled() {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  getApiVersion() {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve("");
  }

  getWXAppInstallUrl() {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(null);
  }

  openWXApp() {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  registerApp(appId: string, universalLink: string) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  startLogByLevel(level: LogLevel) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve();
  }

  checkUniversalLinkReady() {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve();
  }

  sendAuthRequest(scope: string, state: string) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  sendAuthByQRRequest(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve("");
  }

  shareText(text: string, scene: string) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  shareImage(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  shareFile(base64OrFileUri: string, title: string, scene: string) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  shareMusic(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  shareVideo(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  shareWebpage(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  shareMiniProgram(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  launchMiniProgram(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  openWeChatCustomerServiceChat(cropId: string, url: string) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  sendSubscribeMessage(scene: number, templateId: string, reserved: string) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }

  pay(options: any) {
    console.log(WEB_NOT_SUPPORTED_MESSAGE);
    return Promise.resolve(false);
  }
}

export default registerWebModule(ExpoWechatModule, "ExpoWechatModule");
