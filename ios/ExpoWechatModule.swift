import Foundation
import ExpoModulesCore
import WechatOpenSDK

let apiNotRegisteredException = Exception(name: "ApiNotRegisteredException", description: "Please call registerApp to initialize WX api first!", code: "ERR_NOT_REGISTERED")

public class ExpoWechatModule: Module {
    
    static weak var moduleInstance: ExpoWechatModule?
    private var isApiRegistered = false
    private var logLevel: LogLevel?
    fileprivate var authSDK: WechatAuthSDK?
    fileprivate var authSDKDelegateProxy: WeChatAuthSDKDelegateProxy?
    
    public func definition() -> ModuleDefinition {

        Name("ExpoWechat")
        
        Events(
            "onQRCodeAuthGotQRCode",
            "onQRCodeAuthUserScanned",
            "onQRCodeAuthResult",
            "onShowMessageFromWeChat",
            "onAuthResult",
            "onPayResult",
            "onLaunchMiniProgramResult",
            "onSendMessageToWeChatResult",
            "onLog"
        )
        
        OnCreate {
            Self.moduleInstance = self
        }
        
        OnDestroy {
            Self.moduleInstance = nil
            
            self.authSDK?.stopAuth()
            self.authSDKDelegateProxy = nil
            self.authSDK = nil
        }
        
        Property("isRegistered") {
            return isApiRegistered
        }

        AsyncFunction("isWXAppInstalled") {
            return WXApi.isWXAppInstalled()
        }
        
        AsyncFunction("getApiVersion") {
            return WXApi.getVersion()
        }
        
        AsyncFunction("getWXAppInstallUrl") {
            return WXApi.getWXAppInstallUrl()
        }
        
        AsyncFunction("openWXApp") {
            return WXApi.openWXApp()
        }
        
        AsyncFunction("registerApp") { (appId: String, universalLink: String) in
            let result = WXApi.registerApp(appId, universalLink: universalLink)
            isApiRegistered = result
            return result
        }
        
        AsyncFunction("startLogByLevel") { (logLevel: String) in
            let logLevelEnum = LogLevel(rawValue: logLevel)
            if let `enum` = logLevelEnum {
                self.logLevel = `enum`
                WXApi.startLog(by: `enum`.wxLogLevel) { [weak self] logInfo in
                    self?.sendEvent("onLog",
                                    ["level": self?.logLevel?.rawValue ?? "",
                                     "log": logInfo])
                }
            }
        }
        
        AsyncFunction("checkUniversalLinkReady") {
#if DEBUG
            WXApi.checkUniversalLinkReady { [weak self] step, result in
                let statusText = "微信自检步骤：\(step)，自检成功：\(result.success)，错误信息：\(result.errorInfo)，修复建议：\(result.suggestion)"
                self?.sendEvent("onLog", ["log": statusText])
            }
#endif
        }
        
        
        AsyncFunction("sendAuthRequest") { (scope: String, state: String, promise: Promise) in
            if isApiRegistered {
                let req = SendAuthReq()
                req.scope = scope
                req.state = state
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("sendAuthByQRRequest") { (options: AuthByQROptions,
                                                promise: Promise) in
            if isApiRegistered {
                if self.authSDK != nil {
                    self.authSDK?.stopAuth()
                    self.authSDKDelegateProxy = nil
                }
                WeChatSDKUtils.getAccessToken(weiXinId: options.appId,
                                              weiXinSecret: options.appSecret) { [weak self] accessToken in
                    if accessToken != nil {
                        WeChatSDKUtils.getSDKTicket(accessToken: accessToken!) { [weak self] ticket in
                            if ticket != nil {
                                let nonceString = WeChatSDKUtils.generateObjectId()
                                let timestamp = "\(Int(Date.now.timeIntervalSince1970 * 1000))"
                                let signature = WeChatSDKUtils.createSignature(weiXinId: options.appId,
                                                                               nonceStr: nonceString,
                                                                               sdkTicket: ticket!,
                                                                               timestamp: timestamp)
                                self?.authSDK = WechatAuthSDK()
                                self?.authSDKDelegateProxy = WeChatAuthSDKDelegateProxy()
                                self?.authSDK?.delegate = self?.authSDKDelegateProxy
                                
                                let result = self?.authSDK?.auth(options.appId,
                                                                 nonceStr: nonceString,
                                                                 timeStamp: timestamp,
                                                                 scope: options.scope,
                                                                 signature: signature,
                                                                 schemeData: options.schemeData)
                                promise.resolve(result ?? false)
                            } else {
                                promise.reject("ERR_TICKET", "Cannot get wechat ticket, please check networking log to find out why")
                            }
                        }
                    } else {
                        promise.reject("ERR_ACCESS_TOKEN", "Cannot get wechat access token, please check networking log to find out why")
                    }
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("shareText") { (text: String, scene: String, promise: Promise) in
            if isApiRegistered {
                let req = SendMessageToWXReq()
                req.text = text
                req.bText = true
                req.scene = WeChatSDKUtils.getWeChatShareScene(scene)
                
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("shareImage") { (options: ShareImageOptions, promise: Promise) in
            if isApiRegistered {
                if let imageData = WeChatSDKUtils.getImageDataFromBase64OrUri(options.base64OrImageUri) {
                    
                    let imageObject = WXImageObject()
                    imageObject.imageData = imageData
                    imageObject.imgDataHash = options.imageDataHash
                    imageObject.entranceMiniProgramUsername = options.miniProgramId
                    imageObject.entranceMiniProgramPath = options.miniProgramPath
                    
                    let mediaMessage = WXMediaMessage()
                    mediaMessage.mediaObject = imageObject
                    let thumbData = WeChatSDKUtils.getImageDataFromBase64OrUri(options.thumbBase64OrImageUri)
                    if thumbData != nil {
                        mediaMessage.thumbData = ImageCompressUtils.compressImageData(thumbData!, toTargetKB: 64)
                    } else {
                        mediaMessage.thumbData = ImageCompressUtils.compressImageData(imageData, toTargetKB: 64)
                    }
                    
                    let req = SendMessageToWXReq()
                    req.bText = false   
                    req.message = mediaMessage
                    req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                    
                    WXApi.send(req) { succeed in
                        promise.resolve(succeed)
                    }
                } else {
                    promise.reject("ERR_NO_IMAGE_FOUND", "Please provide a valid image data")
                }
                
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        
        AsyncFunction("shareFile") { (base64OrFileUri: String,
                                      title: String,
                                      scene: String,
                                      promise: Promise) in
            if (isApiRegistered) {
                let fileObject = WXFileObject()
                let isFileUri = base64OrFileUri.hasPrefix("file://")
                if isFileUri {
                    let startIndex = base64OrFileUri.index(base64OrFileUri.startIndex, offsetBy: 7)
                    let fileUrl = URL(fileURLWithPath: String(base64OrFileUri[startIndex...]))
                    if let fileData = try? Data(contentsOf: fileUrl, options: .mappedIfSafe) {
                        fileObject.fileData = fileData
                    }
                } else {
                    fileObject.fileData = Data(base64Encoded: base64OrFileUri, options: .ignoreUnknownCharacters) ?? Data()
                }
                
                let mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = fileObject
                mediaMessage.title = title
                
                let req = SendMessageToWXReq()
                req.bText = false
                req.scene = WeChatSDKUtils.getWeChatShareScene(scene)
                req.message = mediaMessage
                
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("shareMusic") { (options: ShareMusicOptions, promise: Promise) in
            if (isApiRegistered) {
                let musicObject = WXMusicVideoObject()
                musicObject.musicUrl = options.musicWebpageUrl
                musicObject.musicDataUrl = options.musicFileUri
                if options.songLyric != nil {
                    musicObject.songLyric = options.songLyric!
                }
                let hdAlbumThumbImageData = WeChatSDKUtils.getImageDataFromBase64OrUri(options.hdAlbumThumbBase64OrImageUri)
                if hdAlbumThumbImageData != nil {
                    musicObject.hdAlbumThumbData = hdAlbumThumbImageData!
                }
                musicObject.hdAlbumThumbFileHash = options.hdAlbumThumbFileHash
                musicObject.singerName = options.singerName
                musicObject.albumName = options.albumName
                musicObject.musicGenre = options.musicGenre
                if options.issueDate != nil {
                    musicObject.issueDate = options.issueDate!
                }
                musicObject.identification = options.identification
                
                let mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = musicObject
                if options.title != nil {
                    mediaMessage.title = options.title!
                }
                if options.description != nil {
                    mediaMessage.description = options.description!
                }
                mediaMessage.messageExt = options.extraMessage
                let thumbImageData = WeChatSDKUtils.getImageDataFromBase64OrUri(options.thumbBase64OrImageUri)
                if (thumbImageData != nil) {
                    mediaMessage.thumbData = ImageCompressUtils.compressImageData(thumbImageData!, toTargetKB: 64)
                }
                
                let req = SendMessageToWXReq()
                req.message = mediaMessage
                req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                req.bText = false
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
                
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("shareVideo") { (options: ShareVideoOptions, promise: Promise) in
            
            func sendVideoRequest(mediaMessage: WXMediaMessage, scene: String) {
                let req = SendMessageToWXReq()
                req.message = mediaMessage
                req.bText = false
                req.scene = WeChatSDKUtils.getWeChatShareScene(scene)
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            }
            
            if (isApiRegistered) {
                let videoObject = WXVideoObject()
                videoObject.videoUrl = options.videoUri
                if options.lowQualityVideoUri != nil {
                    videoObject.videoLowBandUrl = options.lowQualityVideoUri!
                }
                
                let mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = videoObject
                if options.title != nil {
                    mediaMessage.title = options.title!
                }
                if options.description != nil {
                    mediaMessage.description = options.description!
                }
                let thumbImageData =
                WeChatSDKUtils.getImageDataFromBase64OrUri(options.thumbBase64OrImageUri)
                if (thumbImageData != nil) {
                    mediaMessage.thumbData =
                    ImageCompressUtils.compressImageData(thumbImageData!, toTargetKB: 64)
                    sendVideoRequest(mediaMessage: mediaMessage, scene: options.scene)
                } else if (options.videoUri.hasPrefix("file://")) {
                    let startIndex = options.videoUri.index(options.videoUri.startIndex, offsetBy: 7)
                    let videoPath = String(options.videoUri[startIndex...])
                    let fileUri = URL(fileURLWithPath: videoPath)
                    WeChatSDKUtils.getVideoThumbnail(from: fileUri) { thumbImage in
                        if thumbImage != nil, let imageData = thumbImage!.jpegData(compressionQuality: 0.7) {
                            let compressedThumbImage = ImageCompressUtils.compressImageData(imageData, toTargetKB: 64)
                            mediaMessage.thumbData = compressedThumbImage
                        }
                        sendVideoRequest(mediaMessage: mediaMessage, scene: options.scene)
                    }
                } else {
                    /// 没提供缩略图，又不是本地视频文件，不拿缩略图了
                    sendVideoRequest(mediaMessage: mediaMessage, scene: options.scene)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("shareWebpage") { (options: ShareWebpageOptions, promise: Promise) in
            if (isApiRegistered) {
                guard !options.url.isEmpty, let _ = URL(string: options.url) else {
                    promise.reject("ERR_INVALID_URL", "Webpage URL is invalid")
                    return
                }
                let webpageObject = WXWebpageObject()
                webpageObject.webpageUrl = options.url
                if options.extraInfo != nil,
                   let object = try? JSONSerialization.jsonObject(with: options.extraInfo!.data(using: .utf8)!) as? [AnyHashable: Any] {
                    webpageObject.extraInfoDic = object
                }
                //                        webpageObject.canvasPageXml = options.canvasPageXml
                
                let mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = webpageObject
                mediaMessage.title = options.title
                mediaMessage.description = options.description
                let thumbImageData =
                WeChatSDKUtils.getImageDataFromBase64OrUri(options.thumbBase64OrImageUri)
                if (thumbImageData != nil) {
                    mediaMessage.thumbData =
                    ImageCompressUtils.compressImageData(thumbImageData!, toTargetKB: 64)
                }
                
                let req = SendMessageToWXReq()
                req.bText = false
                req.message = mediaMessage
                req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("shareMiniProgram") { (options: ShareMiniProgramOptions, promise: Promise) in
            if (isApiRegistered) {
                let miniProgramObject = WXMiniProgramObject()
                if options.webpageUrl != nil {
                    miniProgramObject.webpageUrl = options.webpageUrl!
                }
                miniProgramObject.userName = options.id
                miniProgramObject.path = options.path
                miniProgramObject.miniProgramType = WeChatSDKUtils.getMiniProgramType(options.type)
                miniProgramObject.withShareTicket = options.withShareTicket == true
                miniProgramObject.disableForward = options.disableForward == true
                miniProgramObject.isUpdatableMessage = options.isUpdatableMessage == true
                miniProgramObject.isSecretMessage = options.isSecretMessage == true
                
                let mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = miniProgramObject
                if options.title != nil {
                    mediaMessage.title = options.title!
                }
                if options.description != nil {
                    mediaMessage.description = options.description!
                }
                let thumbImageData =
                WeChatSDKUtils.getImageDataFromBase64OrUri(options.thumbBase64OrImageUri)
                if (thumbImageData != nil) {
                    mediaMessage.thumbData =
                    ImageCompressUtils.compressImageData(thumbImageData!, toTargetKB: 64)
                }
                let req = SendMessageToWXReq()
                req.bText = false
                req.message = mediaMessage
                req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("launchMiniProgram") { (options: LaunchMiniProgramOptions,
                                              promise: Promise) in
            if (isApiRegistered) {
                let req = WXLaunchMiniProgramReq()
                req.userName = options.id
                req.path = options.path
                req.miniProgramType = WeChatSDKUtils.getMiniProgramType(options.type)
                req.extMsg = options.extraData
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("openWeChatCustomerServiceChat") { (corpId: String,
                                                          url: String,
                                                          promise: Promise) in
            if (isApiRegistered) {
                let req = WXOpenCustomerServiceReq()
                req.corpid = corpId
                req.url = url
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("sendSubscribeMessage") { (scene: UInt32,
                                                 templateId: String,
                                                 reserved: String,
                                                 promise: Promise) in
            if (isApiRegistered) {
                let req = WXSubscribeMsgReq()
                req.scene = scene
                req.templateId = templateId
                req.reserved = reserved
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
        AsyncFunction("chooseInvoice") { (options: ChooseInvoiceOptions, promise: Promise) in
            if (isApiRegistered) {
                let req = WXChooseInvoiceReq()
                req.appID = options.appId
                req.timeStamp = UInt32(options.timestamp.timeIntervalSince1970)
                req.signType = options.signType ?? "SHA1"
                req.cardSign = options.cardSign ?? ""
                req.nonceStr = options.nonceStr ?? ""
                WXApi.send(req) { succeed in
                    promise.resolve(succeed)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("openWebView") { (url: String, promise: Promise) in
            if (isApiRegistered) {
                if let urlObject = URL(string: url) {
                    let req = OpenWebviewReq()
                    req.url = urlObject.absoluteString
                    WXApi.send(req) { succeed in
                        promise.resolve(succeed)
                    }
                } else {
                    promise.reject(Exception(name: "ERR_INVALID_URL", description: "Please provide a valid url string"))
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
        
    }
}

class WeChatAuthSDKDelegateProxy: NSObject, WechatAuthAPIDelegate {
    func onAuthGotQrcode(_ image: UIImage) {
        if let imageData = image.jpegData(compressionQuality: 0.6) {
            let base64String = imageData.base64EncodedString()
            ExpoWechatModule.moduleInstance?.sendEvent("onQRCodeAuthGotQRCode", ["image": base64String])
        }
    }
    
    func onQrcodeScanned() {
        ExpoWechatModule.moduleInstance?.sendEvent("onQRCodeAuthUserScanned")
    }
    
    func onAuthFinish(_ errCode: Int32, authCode: String?) {
        ExpoWechatModule.moduleInstance?.sendEvent("onQRCodeAuthResult",
                                                   ["errorCode": errCode,
                                                    "authCode": authCode])
        ExpoWechatModule.moduleInstance?.authSDK = nil
        ExpoWechatModule.moduleInstance?.authSDKDelegateProxy = nil
    }
}
