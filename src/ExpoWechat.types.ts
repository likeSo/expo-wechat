
/**
 * 插件所有事件。
 */
export type ExpoWechatModuleEvents = {
  /**
   * 二维码登录，获得登录二维码图片回调。
   */
  onQRCodeAuthGotQRCode: (params: QRCodeAuthGotQRCodePayload) => void;
  /**
   * 二维码登录，获得登录结果回调。
   */
  onQRCodeAuthResult: (params: QRCodeAuthResultPayload) => void;
  /**
   * 二维码登录，用户扫描二维码回调。
   */
  onQRCodeAuthUserScanned: () => void;
  /**
   * 从微信打开应用时的消息回调。
   */
  onShowMessageFromWeChat: (params: ShowMessageFromWeChatPayload) => void;
  /**
   * 授权登录结果回调。
   */
  onAuthResult: (params: AuthResultPayload) => void;
  /**
   * 支付结果回调。
   */
  onPayResult: (params: PayResultPayload) => void;
  /**
   * 打开微信小程序结果回调。
   */
  onLaunchMiniProgramResult: (params: LaunchMiniProgramResultPayload) => void;
  /**
   * 日志事件。
   */
  onLog: (params: LogPayload) => void;
};

/**
 * 微信日志事件。
 */
export type LogPayload = {
  /**
   * 日志级别。
   */
  level: keyof LogLevel;
  /**
   * 日志内容。
   */
  log: string;
}

/**
 * 二维码登录，获得登录二维码图片事件。
 */
export type QRCodeAuthGotQRCodePayload = {
  /**
   * 二维码base64编码的图片数据。
   */
  image: string;
};

/**
 * 二维码登录，获得登录结果事件。
 */
export type QRCodeAuthResultPayload = {
  /**
   * 错误码。0表示授权成功。
   */
  errorCode: number;
  /**
   * 授权登录结果。
   */
  authCode: string;
};

/**
 * 从微信打开应用时的消息。
 */
export type ShowMessageFromWeChatPayload = {
  /**
   * 微信用户的openId。
   */
  openId: string;
  /**
   * 微信消息的transaction。
   */
  transaction: string;
  /**
   * 微信消息的语言。
   */
  lang: string;
  /**
   * 微信消息的国家。
   */
  country: string;
  /**
   * 微信消息的媒体类型。
   */
  mediaType: MessageMediaType;
  /**
   * 微信消息的标题。
   */
  title?: string;
  /**
   * 微信消息的描述。
   */
  description?: string;
  /**
   * 微信消息的额外信息。这个字段在你分享内容到微信时可以自定义。
   */
  extraInfo?: string;
  /**
   * 微信消息的媒体标签。
   */
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
 * 微信跳回App回调事件通用响应体。
 */
export type CommonResultPayload = {
  errorCode: ResultErrorCode;
  errorMessage: string;
  openId: string;
  transaction: string;
};

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
 */
export type AuthResultPayload = {
  /**
   * 授权登录结果的code。
   */
  code: string;
  state: string;
  url: string;
  authResult: boolean;
  lang: string;
  country: string;
} & CommonResultPayload;

/**
 * 微信支付结果。
 */
export type PayResultPayload = {
  prepayId?: string;
  returnKey?: string;
  extraInfo?: string;
} & CommonResultPayload;

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
  appId: string;
  appSecret: string;
  scope: "snsapi_userinfo" | Omit<string, "snsapi_userinfo">;
  schemeData?: string;
}

/**
 * 分享图片到微信所需的参数。
 */
export type ShareImageOptions = {
  /**
   * 图片内容，可以是本地图片URI，或者base64编码的图片数据。
   */
  base64OrImageUri: string
  /**
   * 分享目标场景。发送到聊天、朋友圈、收藏。
   */
  scene: ShareScene;
  /**
   * 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。如果不提供，默认使用base64OrImageUri进行压缩，得到缩略图。
   */
  thumbBase64OrImageUri?: string;
  /**
   * 图片数据的哈希值。
   */
  imageDataHash?: string | null;
  /**
   * 小程序的原始id。
   */
  miniProgramId?: string | null;
  /**
   * 小程序的路径。
   */
  miniProgramPath?: string | null;
}

/**
 * 分享音乐到微信所需的参数。
 */
export type ShareMusicOptions = {
  /**
   * 音乐网页URL。
   */
  musicWebpageUrl: string;
  /**
   * 音乐文件URI。
   */
  musicFileUri: string;
  /**
   * 歌手名称。
   */
  singerName: string;
  /**
   * 音乐时长，单位为秒。
   */
  duration: number;
  /**
   * 分享目标场景。发送到聊天、朋友圈、收藏。
   */
  scene: ShareScene;
  /**
   * 音乐歌词。
   */
  songLyric?: string;
  /**
   * 高清专辑封面图片文件路径。
   */
  hdAlbumThumbFilePath?: string;
  /**
   * 高清专辑封面图片内容，可以是本地图片URI，或者base64编码的图片数据。
   */
  hdAlbumThumbBase64OrImageUri?: string;
  /**
   * 高清专辑封面图片数据的哈希值。
   */
  hdAlbumThumbFileHash?: string;
  /**
   * 专辑名称。
   */
  albumName?: string;
  /**
   * 音乐流派。
   */
  musicGenre?: string;
  /**
   * 发行日期。
   */
  issueDate?: string;
  /**
   * 音乐标识。
   */
  identification?: string;
  /**
   * 标题。
   */
  title?: string;
  /**
   * 音乐描述。
   */
  description?: string;
  /**
   * 额外消息。
   */
  extraMessage?: string;
  /**
   * 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。
   */
  thumbBase64OrImageUri?: string;
}

/**
 * 分享视频到微信所需的参数。
 */
export type ShareVideoOptions = {
  /**
   * 视频文件URI。
   */
  videoUri: string;
  /**
   * 分享目标场景。发送到聊天、朋友圈、收藏。
   */
  scene: ShareScene;
  /**
   * 低质量视频文件URI。用于在低带宽网络环境下使用。
   */
  lowQualityVideoUri?: string;
  /**
   * 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。如果不提供，默认是视频的第一帧的截图。
   */
  thumbBase64OrImageUri?: string;
  /**
   * 标题。
   */
  title?: string;
  /**
   * 视频描述。
   */
  description?: string;
}

/**
 * 分享网页到微信所需的参数。
 */
export type ShareWebpageOptions = {
  /**
   * 网页URL。
   */
  url: string;
  /**
   * 分享目标场景。发送到聊天、朋友圈、收藏。
   */
  scene: ShareScene;
  /**
   * 额外信息字段。
   */
  extraInfo?: string;
  /**
   * 画布页面XML。
   */
  canvasPageXml?: string;
  /**
   * 标题。
   */
  title?: string;
  /**
   * 网页描述。
   */
  description?: string;
  /**
   * 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。
   */
  thumbBase64OrImageUri?: string;
};

/**
 * 微信小程序类型。
 */
export type WeChatMiniProgramType = 'release' | 'test' | 'preview'

/**
 * 分享小程序到微信所需的参数。
 */

export type ShareMiniProgramOptions = {
  /**
   * 网页URL。
   */
  webpageUrl?: string;
  /**
   * 小程序的原始id。
   */
  id: string;
  /**
   * 小程序类型。
   */
  type: WeChatMiniProgramType;
  /**
   * 小程序的路径。
   */
  path?: string;
  /**
   * 分享目标场景。发送到聊天、朋友圈、收藏。
   */
  scene: ShareScene;
  /**
   * 是否携带shareTicket。
   */
  withShareTicket?: boolean;
  /**
   * 标题。
   */
  title?: string;
  /**
   * 小程序描述。
   */
  description?: string;
  /**
   * 缩略图内容，可以是本地图片URI，或者base64编码的图片数据。
   */
  thumbBase64OrImageUri?: string;
  /**
   * 是否禁用转发。
   */
  disableForward?: boolean;
  /**
   * 是否是可更新消息。
   */
  isUpdatableMessage?: boolean;
  /**
   * 是否是保密消息。
   */
  isSecretMessage?: boolean;
};

/**
 * 启动微信小程序所需的参数。
 */
export type LaunchMiniProgramOptions = {
  /**
   * 小程序的原始id。
   */
  id: string;
  /**
   * 小程序类型。
   */
  type: WeChatMiniProgramType;
  /**
   * 小程序的路径。
   */
  path?: string;
  /**
   * 额外数据。
   */
  extraData?: string;
};

/**
 * 微信支付所需的参数。
 */
export type PayOptions = {
  /**
   * 商户号。
   */
  partnerId: string;
  /**
   * 预支付交易会话ID。
   */
  prepayId: string;
  /**
   * 随机字符串。
   */
  nonceStr: string;
  /**
   * 时间戳。
   */
  timeStamp: number;
  /**
   * 签名。
   */
  sign: string;
  /**
   * 扩展字段。
   */
  package: string;
  /**
   * 额外数据。
   */
  extraData: string;
}

/**
 * 微信日志等级。权重从高到低。
 */
export type LogLevel = 'verbose' | 'debug' | 'info' | 'warning' | 'error'
