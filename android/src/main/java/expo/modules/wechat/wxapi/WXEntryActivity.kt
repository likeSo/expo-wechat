package expo.modules.wechat.wxapi

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import com.tencent.mm.opensdk.modelbase.BaseReq
import com.tencent.mm.opensdk.modelbase.BaseResp
import com.tencent.mm.opensdk.modelmsg.ShowMessageFromWX
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler
import com.tencent.mm.opensdk.openapi.WXAPIFactory
import expo.modules.wechat.ExpoWechatModule

class WXEntryActivity : Activity(), IWXAPIEventHandler {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleWechatIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleWechatIntent(intent)
    }

    private fun handleWechatIntent(intent: Intent) {
        // Receiving does not need an app ID or registerApp. Validate the WeChat
        // envelope even when React Native and its Expo module do not exist yet.
        val receiver = WXAPIFactory.createWXAPI(this, null, true)
        try {
            receiver.handleIntent(intent, this)
        } finally {
            receiver.detach()
            finish()
        }
    }

    override fun onReq(req: BaseReq?) {
        if (req is ShowMessageFromWX.Req) {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                // Reuse the existing main activity, or create it on a cold launch.
                launchIntent.addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                )
                startActivity(launchIntent)
            } else {
                Log.e("ExpoWeChatModule", "Cannot open app: no launcher activity")
            }
            // On a cold launch neither the module nor its JS listener exists yet; the module
            // keeps the message until JS listens.
            ExpoWechatModule.receiveShowMessage(req)
        }
    }

    override fun onResp(resp: BaseResp?) {
        // Auth, share and payment responses keep the module's existing delivery.
        ExpoWechatModule.moduleInstance?.onResp(resp)
    }
}
