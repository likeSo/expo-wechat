//
//  ExpoWeChatModuleTypes.swift
//  ExpoWechat
//
//  Created by Aron on 2025/6/17.
//

import Foundation
import ExpoModulesCore
import WechatOpenSDK


/**
 * 微信扫码登录所需参数。
 */
struct AuthByQROptions : Record {
    @Field
    var appId: String = ""

    @Field
    var appSecret: String = ""

    @Field
    var scope: String = "snsapi_userinfo"

    @Field
    var schemeData: String?
}

/**
 * 图片分享对象
 */
struct ShareImageOptions : Record {
    @Field
    var base64OrImageUri: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var thumbBase64OrImageUri: String?

    @Field
    var imageDataHash: String?

    @Field
    var miniProgramId: String?

    @Field
    var miniProgramPath: String?
}

/**
 * 音乐分享对象
 */
struct ShareMusicOptions : Record {
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
    var songLyric: String?

    @Field
    var hdAlbumThumbBase64OrImageUri: String?

    @Field
    var hdAlbumThumbFileHash: String?

    @Field
    var albumName: String?

    @Field
    var musicGenre: String?

    @Field
    var issueDate: UInt64?

    @Field
    var identification: String?

    @Field
    var title: String?

    @Field
    var description: String?

    @Field
    var extraMessage: String?

    @Field
    var thumbBase64OrImageUri: String?
}

/*
* 视频分享对象
*/
struct ShareVideoOptions : Record {
    @Field
    var videoUri: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var lowQualityVideoUri: String?

    @Field
    var thumbBase64OrImageUri: String?

    @Field
    var title: String?

    @Field
    var description: String?
}

/*
* 网页分享对象
*/
struct ShareWebpageOptions : Record {
    @Field
    var url: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var extraInfo: String?

    @Field
    var canvasPageXml: String?

    @Field
    var title: String = ""

    @Field
    var description: String = ""

    @Field
    var thumbBase64OrImageUri: String?
}

/*
* 小程序分享对象
*/
struct ShareMiniProgramOptions : Record {
    @Field
    var webpageUrl: String?

    @Field
    var id: String = ""

    @Field
    var scene: String = "timeline"

    @Field
    var path: String?

    @Field
    var type: String = "release"

    @Field
    var withShareTicket: Bool?

    @Field
    var title: String?

    @Field
    var description: String?

    @Field
    var thumbBase64OrImageUri: String?

    @Field
    var disableForward: Bool?

    @Field
    var isUpdatableMessage: Bool?

    @Field
    var isSecretMessage: Bool?
}

/**
 * 启动小程序所需参数
 */
struct LaunchMiniProgramOptions : Record {
    @Field
    var id: String = ""

    @Field
    var type: String = "release"

    @Field
    var path: String?

    @Field
    var extraData: String?
}

struct WeChatPayOptions : Record {
    @Field
    var partnerId: String = ""

    @Field
    var prepayId: String = ""

    @Field
    var nonceStr: String = ""

    @Field
    var timeStamp: UInt32 = 0

    @Field
    var sign: String = ""

    @Field
    var `package`: String = ""

    @Field
    var extraData: String = ""
}


enum LogLevel: String, Comparable {
    case verbose
    case debug
    case info
    case warning
    case error
    
    var weight: Int {
        switch self {
        case .verbose: return 0
        case .debug:   return 1
        case .info:    return 2
        case .warning: return 3
        case .error:   return 4
        }
    }
    
    var wxLogLevel: WXLogLevel {
        switch self {
        case .verbose, .debug, .info:
            return WXLogLevel.detail
        default: return WXLogLevel.normal
        }
    }
    
    static func < (lhs: LogLevel, rhs: LogLevel) -> Bool {
        return lhs.weight < rhs.weight
    }
    
    static func <= (lhs: LogLevel, rhs: LogLevel) -> Bool {
        return lhs.weight <= rhs.weight
    }
}
