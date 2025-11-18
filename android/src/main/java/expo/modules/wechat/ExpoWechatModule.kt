package expo.modules.wechat

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Log
import android.util.Property
import androidx.core.content.FileProvider
import com.tencent.mm.opensdk.constants.ConstantsAPI
import com.tencent.mm.opensdk.diffdev.DiffDevOAuthFactory
import com.tencent.mm.opensdk.diffdev.OAuthErrCode
import com.tencent.mm.opensdk.diffdev.OAuthListener
import com.tencent.mm.opensdk.modelbase.BaseReq
import com.tencent.mm.opensdk.modelbase.BaseResp
import com.tencent.mm.opensdk.modelbiz.SubscribeMessage
import com.tencent.mm.opensdk.modelbiz.WXLaunchMiniProgram
import com.tencent.mm.opensdk.modelbiz.WXLaunchMiniProgramWithToken
import com.tencent.mm.opensdk.modelbiz.WXOpenCustomerServiceChat
import com.tencent.mm.opensdk.modelmsg.SendAuth
import com.tencent.mm.opensdk.modelmsg.SendMessageToWX
import com.tencent.mm.opensdk.modelmsg.ShowMessageFromWX
import com.tencent.mm.opensdk.modelmsg.WXFileObject
import com.tencent.mm.opensdk.modelmsg.WXImageObject
import com.tencent.mm.opensdk.modelmsg.WXMediaMessage
import com.tencent.mm.opensdk.modelmsg.WXMiniProgramObject
import com.tencent.mm.opensdk.modelmsg.WXMusicObject
import com.tencent.mm.opensdk.modelmsg.WXMusicVideoObject
import com.tencent.mm.opensdk.modelmsg.WXTextObject
import com.tencent.mm.opensdk.modelmsg.WXVideoObject
import com.tencent.mm.opensdk.modelmsg.WXWebpageObject
import com.tencent.mm.opensdk.modelpay.PayReq
import com.tencent.mm.opensdk.modelpay.PayResp
import com.tencent.mm.opensdk.openapi.IWXAPI
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler
import com.tencent.mm.opensdk.openapi.SendReqCallback
import com.tencent.mm.opensdk.openapi.WXAPIFactory
import com.tencent.mm.opensdk.utils.ILog
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileInputStream


val apiNotRegisteredException =
    CodedException(
        "ERR_NOT_REGISTERED",
        "Please call registerApp to initialize WX api first! ",
        null
    )
val LOG_TAG = "ExpoWeChatModule"

class ExpoWechatModule : Module(), IWXAPIEventHandler {

    companion object {
        var moduleInstance: ExpoWechatModule? = null

        fun sendEventToJS(eventName: String, params: Map<String, Any?>) {
            moduleInstance?.sendEvent(eventName, params)
        }
    }

    var api: IWXAPI? = null;
    var wxAppId: String? = null;
    var logLevel: LogLevel? = null
    var isApiRegistered = false

    override fun definition() = ModuleDefinition {
        Name("ExpoWechat")

        Events(
            "onQRCodeAuthGotQRCode",
            "onQRCodeAuthUserScanned",
            "onQRCodeAuthResult",
            "onShowMessageFromWeChat",
            "onAuthResult",
            "onPayResult",
            "onLaunchMiniProgramResult",
            "onSendMessageToWeChatResult"
        )

        OnCreate {
            moduleInstance = this@ExpoWechatModule
        }

        OnDestroy {
            moduleInstance = null
            api = null
            wxAppId = null
            logLevel = null
        }

        Property("isRegistered") {
            return@Property isApiRegistered
        }

        AsyncFunction("isWXAppInstalled") {
            if (api != null) {
                return@AsyncFunction api!!.isWXAppInstalled
            } else {
                throw apiNotRegisteredException
            }
        }

        AsyncFunction("getWXAppInstallUrl") {
            return@AsyncFunction null
        }
        AsyncFunction("registerApp") { appId: String, universalLink: String ->
            wxAppId = appId;
            api = WXAPIFactory.createWXAPI(appContext.reactContext, appId, true)
            val result = api?.registerApp(appId) ?: false
            isApiRegistered = result
            return@AsyncFunction result
        }
        AsyncFunction("startLogByLevel") { level: String ->
            logLevel = LogLevel.fromString(level)
            api?.setLogImpl(object : ILog {
                override fun v(p0: String?, p1: String?) {
                    if (logLevel!!.weight <= LogLevel.VERBOSE.weight) {
                        Log.v(p0 ?: LOG_TAG, p1 ?: "")
                    }
                }

                override fun d(p0: String?, p1: String?) {
                    if (logLevel!!.weight <= LogLevel.DEBUG.weight) {
                        Log.d(p0 ?: LOG_TAG, p1 ?: "")
                    }
                }

                override fun i(p0: String?, p1: String?) {
                    if (logLevel!!.weight <= LogLevel.INFO.weight) {
                        Log.i(p0 ?: LOG_TAG, p1 ?: "")
                    }
                }

                override fun w(p0: String?, p1: String?) {
                    if (logLevel!!.weight <= LogLevel.WARNING.weight) {
                        Log.w(p0 ?: LOG_TAG, p1 ?: "")
                    }
                }

                override fun e(p0: String?, p1: String?) {
                    if (logLevel!!.weight <= LogLevel.ERROR.weight) {
                        Log.e(p0 ?: LOG_TAG, p1 ?: "")
                    }
                }
            })
        }

        AsyncFunction("checkUniversalLinkReady") {
            return@AsyncFunction true
        }

        AsyncFunction("getApiVersion") {
            if (api != null) {
                return@AsyncFunction api!!.wxAppSupportAPI
            } else {
                throw apiNotRegisteredException
            }
        }

        AsyncFunction("openWXApp") {
            if (api != null) {
                return@AsyncFunction api!!.openWXApp()
            } else {
                throw apiNotRegisteredException
            }
        }

        AsyncFunction("sendAuthRequest") { scope: String, state: String, promise: Promise ->
            if (api != null) {
                val authRequest = SendAuth.Req()
                authRequest.scope = scope
                authRequest.state = state
                api?.sendReq(
                    authRequest
                ) { p0 -> promise.resolve(p0) }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("sendAuthByQRRequest") Coroutine { options: AuthByQROptions ->
            if (api != null) {

                val accessToken = WeChatSDKUtils.getAccessToken(options.appId, options.appSecret);
                if (accessToken != null) {
                    val ticket = WeChatSDKUtils.getSDKTicket(accessToken)
                    if (ticket != null) {
                        val nonceString = WeChatSDKUtils.generateObjectId()
                        val timestamp = System.currentTimeMillis().toString()
                        val signature =
                            WeChatSDKUtils.createSignature(
                                options.appId,
                                nonceString,
                                ticket,
                                timestamp
                            )
                        val oauth = DiffDevOAuthFactory.getDiffDevOAuth();
                        val result = oauth.auth(
                            options.appId, options.scope, nonceString, timestamp, signature,
                            object : OAuthListener {
                                override fun onAuthGotQrcode(p0: String?, p1: ByteArray?) {
                                    val base64 = Base64.encodeToString(p1, Base64.DEFAULT)
                                    sendEvent("onQRCodeAuthGotQRCode", mapOf("image" to base64))
                                }

                                override fun onQrcodeScanned() {
                                    sendEvent("onQRCodeAuthUserScanned")
                                }

                                override fun onAuthFinish(p0: OAuthErrCode?, p1: String?) {
                                    sendEvent(
                                        "onQRCodeAuthResult",
                                        mapOf("errorCode" to p0, "authCode" to p1)
                                    )
                                }
                            })
                        return@Coroutine result
                    } else {
                        throw CodedException(
                            "ERR_TICKET",
                            "Cannot get wechat ticket, please check networking log to find out why",
                            null
                        )
                    }
                } else {
                    throw CodedException(
                        "ERR_ACCESS_TOKEN",
                        "Cannot get wechat access token, please check networking log to find out why",
                        null
                    )
                }
            } else {
                throw apiNotRegisteredException
            }
        }

        AsyncFunction("shareText") { text: String, scene: String, promise: Promise ->
            if (api != null) {
                val textObject = WXTextObject()
                textObject.text = text

                val mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = textObject
                mediaMessage.description = text

                val req = SendMessageToWX.Req()
                req.transaction = "text"
                req.message = mediaMessage
                req.scene = WeChatSDKUtils.getWeChatShareScene(scene)
                api?.sendReq(
                    req
                ) { p0 -> promise.resolve(p0) }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("shareImage") { options: ShareImageOptions, promise: Promise ->
            if (api != null) {

                val mediaMessage = WXMediaMessage()

                val req = SendMessageToWX.Req()
                req.transaction = "img"
                req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)

                val bitmap = WeChatSDKUtils.getBitmapFromBase64OrUri(options.base64OrImageUri)
                if (bitmap == null) {
                    promise.reject(
                        CodedException(
                            "ERR_NO_IMAGE_FOUND",
                            "Please provide a valid image data",
                            null
                        )
                    )
                    return@AsyncFunction
                }
                val imageObject = WXImageObject(bitmap)
                imageObject.imgDataHash = options.imageDataHash
                imageObject.entranceMiniProgramUsername = options.miniProgramId
                imageObject.entranceMiniProgramPath = options.miniProgramPath

                mediaMessage.mediaObject = imageObject
                val thumbBitmap =
                    WeChatSDKUtils.getBitmapFromBase64OrUri(options.thumbBase64OrImageUri)
                if (thumbBitmap != null) {
                    mediaMessage.thumbData = WeChatSDKUtils.compressBitmapToTargetSize(
                        thumbBitmap,
                        WeChatSDKUtils.thumbImageSizeKB
                    )
                    thumbBitmap.recycle()
                } else {
                    mediaMessage.thumbData = WeChatSDKUtils.compressBitmapToTargetSize(
                        bitmap,
                        WeChatSDKUtils.thumbImageSizeKB
                    )
                }
                bitmap.recycle()

                req.message = mediaMessage
                api?.sendReq(
                    req
                ) { p0 -> promise.resolve(p0) }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("shareFile") { base64OrFileUri: String,
                                     title: String,
                                     scene: String,
                                     promise: Promise ->
            if (api != null) {
                val fileObject = WXFileObject()
                val isFileUri = base64OrFileUri.startsWith("file://")
                if (isFileUri) {
                    val filePath = base64OrFileUri.substring(7)
                    fileObject.filePath = filePath
                    appContext.reactContext?.let {
                        val file = File(filePath)
                        val contentUri =
                            FileProvider.getUriForFile(it, it.packageName + ".fileprovider", file)
                        it.grantUriPermission(
                            "com.tencent.mm",
                            contentUri,
                            Intent.FLAG_GRANT_READ_URI_PERMISSION
                        )
                    }
                } else {
                    fileObject.fileData = Base64.decode(base64OrFileUri, Base64.DEFAULT)
                }

                val mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = fileObject
                mediaMessage.title = title

                val req = SendMessageToWX.Req()
                req.transaction = System.currentTimeMillis().toString()
                req.scene = WeChatSDKUtils.getWeChatShareScene(scene)
                req.message = mediaMessage
                api?.sendReq(req) { p0 -> promise.resolve(p0) }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("shareMusic") { options: ShareMusicOptions, promise: Promise ->
            if (api != null) {
                val musicObject = WXMusicVideoObject()
                musicObject.musicUrl = options.musicWebpageUrl
                musicObject.musicDataUrl = options.musicFileUri
                musicObject.songLyric = options.songLyric
                musicObject.hdAlbumThumbFilePath = options.hdAlbumThumbFilePath
                musicObject.hdAlbumThumbFileHash = options.hdAlbumThumbFileHash
                musicObject.singerName = options.singerName
                musicObject.albumName = options.albumName
                musicObject.musicGenre = options.musicGenre
                options.issueDate?.let {
                    musicObject.issueDate = it
                }
                musicObject.identification = options.identification

                val mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = musicObject
                mediaMessage.title = options.title
                mediaMessage.description = options.description
                mediaMessage.messageExt = options.extraMessage
                val bitmap = WeChatSDKUtils.getBitmapFromBase64OrUri(options.thumbBase64OrImageUri)
                if (bitmap != null) {
                    mediaMessage.thumbData = WeChatSDKUtils.compressBitmapToTargetSize(bitmap, 64)
                    bitmap.recycle()
                }

                val req = SendMessageToWX.Req()
                req.transaction = "musicVideo"
                req.message = mediaMessage
                req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                api?.sendReq(req) { p0 ->
                    promise.resolve(p0)
                }

            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("shareVideo") { options: ShareVideoOptions, promise: Promise ->
            if (api != null) {
                val videoObject = WXVideoObject()
                videoObject.videoUrl = options.videoUri
                videoObject.videoLowBandUrl = options.lowQualityVideoUri

                val mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = videoObject
                mediaMessage.title = options.title
                mediaMessage.description = options.description
                val thumbBitmap =
                    WeChatSDKUtils.getBitmapFromBase64OrUri(options.thumbBase64OrImageUri)
                if (thumbBitmap != null) {
                    mediaMessage.thumbData =
                        WeChatSDKUtils.compressBitmapToTargetSize(thumbBitmap, 64)
                    thumbBitmap.recycle()
                } else {
                    if (options.videoUri.startsWith("file://")) {
                        val videoPath = options.videoUri.substring(7)
                        val firstFrameBitmap = WeChatSDKUtils.getVideoThumbnailBitmap(videoPath)
                        if (firstFrameBitmap != null) {
                            mediaMessage.thumbData =
                                WeChatSDKUtils.compressBitmapToTargetSize(firstFrameBitmap, 64)
                            firstFrameBitmap.recycle()
                        }
                    }
                }
                val req = SendMessageToWX.Req()
                req.transaction = "video"
                req.message = mediaMessage
                req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                api?.sendReq(req) { p0 ->
                    promise.resolve(p0)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("shareWebpage") { options: ShareWebpageOptions, promise: Promise ->
            if (api != null) {
                if (options.url.isNotEmpty()) {
                    val webpageObject = WXWebpageObject()
                    webpageObject.webpageUrl = options.url
                    webpageObject.extInfo = options.extraInfo
                    webpageObject.canvasPageXml = options.canvasPageXml

                    val mediaMessage = WXMediaMessage()
                    mediaMessage.mediaObject = webpageObject
                    mediaMessage.title = options.title
                    mediaMessage.description = options.description
                    val bitmap = WeChatSDKUtils.getBitmapFromBase64OrUri(options.thumbBase64OrImageUri)
                    if (bitmap != null) {
                        mediaMessage.thumbData = WeChatSDKUtils.compressBitmapToTargetSize(bitmap, 64)
                        bitmap.recycle()
                    }
                    val req = SendMessageToWX.Req()
                    req.transaction = "webpage"
                    req.message = mediaMessage
                    req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                    api?.sendReq(req) { p0 ->
                        promise.resolve(p0)
                    }
                } else {
                    promise.reject("ERR_INVALID_URL", "Webpage URL is empty", null)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("shareMiniProgram") { options: ShareMiniProgramOptions, promise: Promise ->
            if (api != null) {
                val miniProgramObject = WXMiniProgramObject()
                miniProgramObject.webpageUrl = options.webpageUrl
                miniProgramObject.userName = options.id
                miniProgramObject.path = options.path
                miniProgramObject.miniprogramType = WeChatSDKUtils.getMiniProgramType(options.type)
                miniProgramObject.withShareTicket = options.withShareTicket == true
                options.disableForward?.let {
                    miniProgramObject.disableforward = if (it) 1 else 0
                }
                miniProgramObject.isUpdatableMessage = options.isUpdatableMessage == true
                miniProgramObject.isSecretMessage = options.isSecretMessage == true

                val mediaMessage = WXMediaMessage()
                mediaMessage.mediaObject = miniProgramObject
                mediaMessage.title = options.title
                mediaMessage.description = options.description
                val bitmap = WeChatSDKUtils.getBitmapFromBase64OrUri(options.thumbBase64OrImageUri)
                if (bitmap != null) {
                    mediaMessage.thumbData = WeChatSDKUtils.compressBitmapToTargetSize(bitmap, 64)
                    bitmap.recycle()
                }
                val req = SendMessageToWX.Req()
                req.transaction = "webpage"
                req.message = mediaMessage
                req.scene = WeChatSDKUtils.getWeChatShareScene(options.scene)
                api?.sendReq(req) { p0 ->
                    promise.resolve(p0)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("launchMiniProgram") { options: LaunchMiniProgramOptions,
                                             promise: Promise ->
            if (api != null) {
                val req = WXLaunchMiniProgram.Req()
                req.userName = options.id
                req.path = options.path
                req.miniprogramType = WeChatSDKUtils.getMiniProgramType(options.type)
                req.extData = options.extraData
                api?.sendReq(req) { p0 ->
                    promise.resolve(p0)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("openWeChatCustomerServiceChat") { corpId: String,
                                                         url: String,
                                                         promise: Promise ->
            if (api != null) {
                val req = WXOpenCustomerServiceChat.Req()
                req.corpId = corpId
                req.url = url
                api?.sendReq(req) { p0 ->
                    promise.resolve(p0)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }

        AsyncFunction("sendSubscribeMessage") { scene: Int,
                                                templateId: String,
                                                reserved: String,
                                                promise: Promise ->
            if (api != null) {
                val req = SubscribeMessage.Req()
                req.scene = scene
                req.templateID = templateId
                req.reserved = reserved
                api?.sendReq(req) { p0 ->
                    promise.resolve(p0)
                }
            } else {
                promise.reject(apiNotRegisteredException)
            }
        }
    }

    fun handleIntent(intent: Intent) {
        api?.handleIntent(intent, this);
    }


    override fun onReq(p0: BaseReq?) {
        if (p0?.type == ConstantsAPI.COMMAND_SHOWMESSAGE_FROM_WX) {
            val weChatMessage = p0 as ShowMessageFromWX.Req;
            sendEventToJS(
                "onShowMessageFromWeChat",
                mapOf(
                    "openId" to p0.openId,
                    "transaction" to p0.transaction,
                    "lang" to weChatMessage.lang,
                    "country" to weChatMessage.country,
                    "mediaType" to weChatMessage.message.mediaObject.type(),
                    "title" to weChatMessage.message.title,
                    "description" to weChatMessage.message.description,
                    "extraInfo" to weChatMessage.message.messageExt,
                    "mediaTag" to weChatMessage.message.mediaTagName
                )
            )
        }
    }

    override fun onResp(resp: BaseResp?) {
        resp?.let {
            val payload = mutableMapOf(
                "errorCode" to it.errCode,
                "errorMessage" to it.errStr,
                "openId" to it.openId,
                "transaction" to it.transaction
            )
            if (it is SendAuth.Resp) {
                payload["code"] = it.code
                payload["state"] = it.state
                payload["url"] = it.url
                payload["authResult"] = it.authResult
                payload["lang"] = it.lang
                payload["country"] = it.country
                sendEventToJS("onAuthResult", payload)
            } else if (it is PayResp) {
                payload["prepayId"] = it.prepayId
                payload["returnKey"] = it.returnKey
                payload["extraInfo"] = it.extData
                sendEventToJS("onPayResult", payload)
            } else if (it is WXLaunchMiniProgram.Resp) {
                payload["extraInfo"] = it.extMsg
                sendEventToJS("onLaunchMiniProgramResult", payload)
            } else if (it is SendMessageToWX.Resp) {
                sendEventToJS("onSendMessageToWeChatResult", payload)
            }
        }
    }
}
