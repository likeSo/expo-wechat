import ExpoModulesCore
import WechatOpenSDK

public class AppDelegateSubscriber: ExpoAppDelegateSubscriber, WXApiDelegate {
    public func application(_ application: UIApplication, handleOpen url: URL) -> Bool {
        return WXApi.handleOpen(url, delegate: self)
    }
    
    public func application(_ application: UIApplication, open url: URL, sourceApplication: String?, annotation: Any) -> Bool {
        return WXApi.handleOpen(url, delegate: self)
    }
    
    public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return WXApi.handleOpen(url, delegate: self)
    }
    
    public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([any UIUserActivityRestoring]?) -> Void) -> Bool {
        return WXApi.handleOpenUniversalLink(userActivity, delegate: self)
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
            ExpoWechatModule.moduleInstance?.sendEvent("onShowMessageFromWeChat",
                                                       payload)
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
        } else if let payResp = resp as? PayResp {
            payload["prepayId"] = nil
            payload["returnKey"] = payResp.returnKey
            payload["extraInfo"] = nil
            ExpoWechatModule.moduleInstance?.sendEvent("onPayResult",
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
    }
}
