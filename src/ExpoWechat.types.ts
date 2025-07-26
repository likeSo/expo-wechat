
export type ExpoWechatModuleEvents = {
  onQRCodeAuthGotQRCode: (params: QRCodeAuthGotQRCodePayload) => void;
  onQRCodeAuthResult: (params: QRCodeAuthResultPayload) => void;
  onQRCodeAuthUserScanned: () => void;
  onShowMessageFromWeChat: (params: ShowMessageFromWeChatPayload) => void;
  onAuthResult: (params: AuthResultPayload) => void;
  onPayResult: (params: PayResultPayload) => void;
  onLaunchMiniProgramResult: (params: LaunchMiniProgramResultPayload) => void;
};

export type QRCodeAuthGotQRCodePayload = {
  /**
   * 二维码base64编码的图片数据。
   */
  image: string;
};

export type QRCodeAuthResultPayload = {
  /**
   * 错误码。0表示授权成功。
   */
  errorCode: number;
  /**
   * 授权登录结果。
   */
  authCode: string;
}

/**
 * 从微信打开应用时的消息。
 * @param openId 微信用户的openId。
 * @param transaction 微信消息的transaction。
 * @param lang 微信消息的语言。
 * @param country 微信消息的国家。
 * @param mediaType 微信消息的媒体类型。
 * @param title 微信消息的标题。
 * @param description 微信消息的描述。
 * @param extraInfo 微信消息的额外信息。这个字段在你分享内容到微信时可以自定义。
 * @param mediaTag 微信消息的媒体标签。
 */
export type ShowMessageFromWeChatPayload = {
  openId: string;
  transaction: string;
  lang: string;
  country: string;
  mediaType: MessageMediaType;
  title?: string;
  description?: string;
  extraInfo?: string;
  mediaTag?: string;
}

/// 微信消息媒体类型。
export enum MessageMediaType {
    unknown = 0,
    text = 1,
    image = 2,
    music = 3,
    video = 4,
    url = 5,
    file = 6,
    appdata = 7,
    emoji = 8,
    product = 10,
    emoticonGift = 11,
    deviceAccess = 12,
    mallProduct = 13,
    oldTv = 14,
    emoticonShared = 15,
    cardShare = 16,
    locationShare = 17,
    record = 19,
    tv = 20,
    note = 24,
    designerShared = 25,
    emotionListShared = 26,
    emojiListShared = 27,
    location = 30,
    appBrand = 33,
    giftCard = 34,
    openSDKAppBrand = 36,
    videoFile = 38,
    gameVideoFile = 39,
    businessCard = 45,
    openSDKAppBrandWeiShiVideo = 46,
    opensdkWeWorkObject = 49,
    openSDKLiteApp = 68,
    gameLive = 70,
    musicVideo = 76,
    nativeGamePage = 101,
}
/**
 * 微信回调事件通用响应体。
 */
export type CommonResultPayload = {
  errorCode: ResultErrorCode;
  errorMessage: string;
  openId: string;
  transaction: string;
}

export enum ResultErrorCode {
  ok = 0,
  common = -1,
  userCancel = -2,
  sentFailed = -3,
  authDenied = -4,
  unsupported = -5,
  ban = -6,
}

/**
 * 微信授权登录结果。
 * 
 */
export type AuthResultPayload = {
  code: string;
  state: string;
  url: string;
  authResult: boolean;
  lang: string;
  country: string;
} & CommonResultPayload

/**
 * 微信支付结果。
 */
export type PayResultPayload = {
  prepayId?: string;
  returnKey?: string;
  extraInfo?: string;
} & CommonResultPayload

export type LaunchMiniProgramResultPayload = {
  extraInfo?: string;
}

/**
 * 微信分享目标场景。发送到聊天、朋友圈、收藏。
 */
export type ShareScene = 'session' | 'timeline' | 'favorite' | 'status' | 'specifiedContact';

/**
 * 微信扫码登录所需参数。
 */
export type AuthByQROptions = {
  appId: string,
  appSecret: string,
  scope: "snsapi_userinfo" | Omit<string, "snsapi_userinfo">,
  schemeData?: string
}

/**
 * 分享图片到微信所需的参数。
 * @param base64OrImageUri 图片内容，可以是本地图片URI，或者base64编码的图片数据。
 * @param scene 要分享的目标场景。
 * @param thumbBase64OrImageUri 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。如果不提供，默认使用base64OrImageUri进行压缩，得到缩略图。
 * @param imageDataHash 图片数据的哈希值。
 * @param miniProgramId 小程序的原始id。
 * @param miniProgramPath 小程序的路径。
 */
export type ShareImageOptions = {
  base64OrImageUri: string
  scene: ShareScene
  thumbBase64OrImageUri?: string;
  imageDataHash?: string | null
  miniProgramId?: string | null
  miniProgramPath?: string | null
}

/**
 * 分享音乐到微信所需的参数。
 * @param musicWebpageUrl 音乐网页URL。
 * @param musicFileUri 音乐文件URI。
 * @param singerName 歌手名称。
 * @param duration 音乐时长，单位为秒。
 * @param scene 分享目标场景。
 * @param songLyric 歌曲歌词。
 * @param hdAlbumThumbFilePath 高清专辑缩略图文件路径。
 * @param hdAlbumThumbFileHash 高清专辑缩略图文件哈希值。
 * @param albumName 专辑名称。
 * @param musicGenre 音乐风格。
 * @param issueDate 发行日期。
 * @param identification 音乐标识。
 * @param title 标题。
 * @param description 歌曲描述，建议跟singerName保持一致。
 * @param extraMessage 额外信息字段，当微信跳回软件的时候会带上这个字段。
 * @param thumbBase64OrImageUri 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。不得超过64kb。如果超过64kb，会被自动压缩。
 */ 
export type ShareMusicOptions = {
  musicWebpageUrl: string
  musicFileUri: string
  singerName: string
  duration: number
  scene: ShareScene
  songLyric?: string;
  hdAlbumThumbFilePath?: string;
  hdAlbumThumbFileHash?: string;
  albumName?: string;
  musicGenre?: string;
  issueDate?: string;
  identification?: string;
  title?: string;
  description?: string;
  extraMessage?: string;
  thumbBase64OrImageUri?: string;
}

/**
 * 分享视频到微信所需的参数。
 * @param videoUri 视频文件URI。
 * @param scene 分享目标场景。
 * @param lowQualityVideoUri 低质量视频文件URI。用于在低带宽网络环境下使用。
 * @param thumbBase64OrImageUri 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。如果不提供，默认是视频的第一帧的截图。
 * @param title 标题。
 * @param description 视频描述。
 */
export type ShareVideoOptions = {
  videoUri: string
  scene: ShareScene
  lowQualityVideoUri?: string;
  thumbBase64OrImageUri?: string;
  title?: string;
  description?: string;
}

/**
 * 分享网页到微信所需的参数。
 * @param url 网页URL。
 * @param extraInfo 额外信息字段。
 * @param canvasPageXml 画布页面XML。
 * @param scene 分享目标场景。
 * @param title 标题。
 * @param description 网页描述。
 * @param thumbBase64OrImageUri 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。
 */
export type ShareWebpageOptions = {
  url: string
  scene: ShareScene
  extraInfo?: string
  canvasPageXml?: string
  title?: string
  description?: string
  thumbBase64OrImageUri?: string;
}

/**
 * 微信小程序类型。
 */
export type WeChatMiniProgramType = 'release' | 'test' | 'preview'

/**
 * 分享小程序到微信所需的参数。
 * @param webpageUrl 网页URL。
 * @param miniProgramId 小程序的原始id。
 * @param miniProgramPath 小程序的路径。
 * @param withShareTicket 是否携带shareTicket。
 * @param miniProgramType 小程序类型。
 * @param title 标题。
 * @param description 小程序描述。
 * @param thumbBase64OrImageUri 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。
 */

export type ShareMiniProgramOptions = {
  webpageUrl?: string
  id: string;
  type: WeChatMiniProgramType
  path?: string;
  scene: ShareScene
  withShareTicket?: boolean;
  title?: string
  description?: string
  thumbBase64OrImageUri?: string;
  disableForward?: boolean;
  isUpdatableMessage?: boolean;
  isSecretMessage?: boolean;
}

/**
 * 启动微信小程序所需的参数。
 * @param id 小程序的原始id。
 * @param path 小程序的路径。
 * @param type 小程序类型。
 * @param extraData 额外数据。
 */
export type LaunchMiniProgramOptions = {
  id: string;
  type: WeChatMiniProgramType
  path?: string;
  extraData?: string;
}

/**
 * 微信支付所需的参数。
 * @param partnerId 商户号。
 * @param prepayId 预支付交易会话ID。
 * @param nonceStr 随机字符串。
 * @param timeStamp 时间戳。
 * @param sign 签名。
 * @param package 扩展字段。
 * @param extraData 额外数据。
 */
export type WeChatPayOptions = {
  partnerId: string
  prepayId: string
  nonceStr: string
  timeStamp: string
  sign: string
  package: string
  extraData: string
}

/**
 * 微信日志等级。权重从高到低。
 */
export type LogLevel = 'verbose' | 'debug' | 'info' | 'warning' | 'error'
