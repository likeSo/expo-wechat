package expo.modules.wechat

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

/**
 * 微信扫码登录所需参数。
 */
class AuthByQROptions : Record {
    @Field
    var appId: String = ""

    @Field
    var appSecret: String = ""

    @Field
    var scope: String = "snsapi_userinfo"

    @Field
    var schemeData: String? = null
}

/**
 * 图片分享对象
 */
class ShareImageOptions : Record {
    @Field
    var base64OrImageUri: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var thumbBase64OrImageUri: String? = null

    @Field
    var imageDataHash: String? = null

    @Field
    var miniProgramId: String? = null

    @Field
    var miniProgramPath: String? = null
}

/**
 * 音乐分享对象
 */
class ShareMusicOptions : Record {
    @Field
    var musicWebpageUrl: String = ""

    @Field
    var musicFileUri: String = ""

    @Field
    var singerName: String = ""

    @Field
    var duration: Int = 0

    @Field
    var scene: String = "timeline"

    @Field
    var songLyric: String? = null

    @Field
    var hdAlbumThumbFilePath: String? = null

    @Field
    var hdAlbumThumbFileHash: String? = null

    @Field
    var albumName: String? = null

    @Field
    var musicGenre: String? = null

    @Field
    var issueDate: Long? = null

    @Field
    var identification: String? = null

    @Field
    var title: String? = null

    @Field
    var description: String? = null

    @Field
    var extraMessage: String? = null

    @Field
    var thumbBase64OrImageUri: String? = null
}

/*
* 视频分享对象
*/
class ShareVideoOptions : Record {
    @Field
    var videoUri: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var lowQualityVideoUri: String? = null

    @Field
    var thumbBase64OrImageUri: String? = null

    @Field
    var title: String? = null

    @Field
    var description: String? = null
}

/*
* 网页分享对象
*/
class ShareWebpageOptions : Record {
    @Field
    var url: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var extraInfo: String? = null

    @Field
    var canvasPageXml: String? = null

    @Field
    var title: String = ""

    @Field
    var description: String = ""

    @Field
    var thumbBase64OrImageUri: String? = null
}

/*
* 小程序分享对象
*/
class ShareMiniProgramOptions : Record {
    @Field
    var webpageUrl: String? = null

    @Field
    var id: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var path: String? = null

    @Field
    var type: String = "release"

    @Field
    var withShareTicket: Boolean? = null

    @Field
    var title: String? = null

    @Field
    var description: String? = null

    @Field
    var thumbBase64OrImageUri: String? = null

    @Field
    var disableForward: Boolean? = null

    @Field
    var isUpdatableMessage: Boolean? = null

    @Field
    var isSecretMessage: Boolean? = null
}

/**
 * 启动小程序所需参数
 */
class LaunchMiniProgramOptions : Record {
    @Field
    var id: String = ""

    @Field
    var type: String = "release"

    @Field
    var path: String? = null

    @Field
    var extraData: String? = null
}

class PayOptions : Record {
    @Field
    var partnerId: String = ""

    @Field
    var prepayId: String = ""

    @Field
    var nonceStr: String = ""

    @Field
    var timeStamp: Int = 0

    @Field
    var sign: String = ""

    @Field
    var `package`: String = ""

    @Field
    var extraData: String = ""
}

enum class LogLevel(val weight: Int) {
    VERBOSE(0),
    DEBUG(1),
    INFO(2),
    WARNING(3),
    ERROR(4);

    companion object {
        fun fromString(level: String): LogLevel {
            return when (level.lowercase()) {
                "verbose" -> VERBOSE
                "debug" -> DEBUG
                "info" -> INFO
                "warning" -> WARNING
                else -> ERROR
            }
        }
    }
}