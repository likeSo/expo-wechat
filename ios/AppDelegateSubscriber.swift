import ExpoModulesCore
import WechatOpenSDK

public class AppDelegateSubscriber: ExpoAppDelegateSubscriber, WXApiDelegate {
    // WeChat can launch the app before JS registers the SDK, and the app only registers it once the
    // privacy policy is accepted. What opens the app until then waits here, in arrival order, and
    // goes to the SDK when JS registers it. It is not also tried at once, so a message reaches onReq
    // once, whatever the SDK does while unregistered. Main thread only.
    private static var isSDKRegistered = false
    private static var pendingOpens: [() -> Void] = []

    static func sdkDidRegister() {
        DispatchQueue.main.async {
            isSDKRegistered = true
            let opens = pendingOpens
            pendingOpens = []
            opens.forEach { $0() }
        }
    }

    private func openOnceRegistered(_ open: @escaping () -> Bool) -> Bool {
        if Self.isSDKRegistered {
            return open()
        }
        Self.pendingOpens.append { _ = open() }
        return false
    }

    public func application(_ application: UIApplication, handleOpen url: URL) -> Bool {
        return openOnceRegistered { WXApi.handleOpen(url, delegate: self) }
    }
    
    public func application(_ application: UIApplication, open url: URL, sourceApplication: String?, annotation: Any) -> Bool {
        return openOnceRegistered { WXApi.handleOpen(url, delegate: self) }
    }
    
    public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return openOnceRegistered { WXApi.handleOpen(url, delegate: self) }
    }
    
    public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([any UIUserActivityRestoring]?) -> Void) -> Bool {
        return openOnceRegistered { WXApi.handleOpenUniversalLink(userActivity, delegate: self) }
    }
    
    // MARK: WXApiDelegate
    
    public func onReq(_ req: BaseReq) {
        if let launchFromWeChatReq = req as? LaunchFromWXReq {
            let payload: [String: Any?] = [
                "lang": launchFromWeChatReq.lang,
                "country": launchFromWeChatReq.country,
                "mediaType": "",
                "title": launchFromWeChatReq.message.title,
                "description": launchFromWeChatReq.message.description,
                "extraInfo": launchFromWeChatReq.message.messageExt,
                "mediaTag": launchFromWeChatReq.message.mediaTagName,
            ]
            // On a cold launch JS has no listener yet; the module keeps the message until it does.
            ExpoWechatModule.receiveShowMessage(payload)
        }
    }
    
    public func onResp(_ resp: BaseResp) {
        var payload: [String : Any?] = [
            "errorCode": resp.errCode,
            "errorMessage": resp.errStr,
            "openId": nil,
            "transaction": nil
        ]
        if let authResp = resp as? SendAuthResp {
            payload["code"] = authResp.code
            payload["state"] = authResp.state
            payload["lang"] = authResp.lang
            payload["country"] = authResp.country
            ExpoWechatModule.moduleInstance?.sendEvent("onAuthResult",
                                                       payload)
        } else if let launchMiniProgramResp = resp as? WXLaunchMiniProgramResp {
            payload["extraInfo"] = launchMiniProgramResp.extMsg
            ExpoWechatModule.moduleInstance?.sendEvent("onLaunchMiniProgramResult", payload)
        } else if let sendMsgResp = resp as? SendMessageToWXResp {
            payload["lang"] = sendMsgResp.lang
            payload["country"] = sendMsgResp.country
            ExpoWechatModule.moduleInstance?.sendEvent("onSendMessageToWeChatResult", payload)
        } else if let chooseInvoiceResp = resp as? WXChooseInvoiceResp {
            
        }
#if EXPO_WECHAT_ENABLE_PAY
        if let payResp = resp as? PayResp {
            payload["prepayId"] = nil
            payload["returnKey"] = payResp.returnKey
            payload["extraInfo"] = nil
            ExpoWechatModule.moduleInstance?.sendEvent("onPayResult",
                                                       payload)
        }
#endif
    }
}
