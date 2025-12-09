package expo.modules.wechat

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.util.Base64
import com.tencent.mm.opensdk.modelmsg.SendMessageToWX
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import java.security.MessageDigest
import androidx.core.graphics.scale
import com.tencent.mm.opensdk.modelmsg.WXMiniProgramObject
import java.io.ByteArrayOutputStream
import java.io.FileInputStream

class WeChatSDKUtils {
    companion object {
        var thumbImageSizeKB = 32

        suspend fun getAccessToken(weiXinId: String, weiXinSecret: String): String? {
            val url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential" +
                    "&appid=$weiXinId&secret=$weiXinSecret"

            return withContext(Dispatchers.IO) {
                try {
                    val responseText = URL(url).readText()
                    val jsonResponse = JSONObject(responseText)
                    jsonResponse.getString("access_token")
                } catch (e: Exception) {
                    e.printStackTrace()
                    null
                }
            }
        }

        suspend fun getSDKTicket(accessToken: String): String? {
            val url =
                "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=2&access_token=$accessToken"

            return withContext(Dispatchers.IO) {
                try {
                    val response = URL(url).readText()
                    JSONObject(response).getString("ticket")
                } catch (e: Exception) {
                    e.printStackTrace()
                    null
                }
            }
        }

        // 2. 创建签名 (使用Java原生SHA1)
        fun createSignature(
            weiXinId: String,
            nonceStr: String,
            sdkTicket: String,
            timestamp: String
        ): String {
            val origin =
                "appid=$weiXinId&noncestr=$nonceStr&sdk_ticket=$sdkTicket&timestamp=$timestamp"

            val bytes = MessageDigest.getInstance("SHA-1")
                .digest(origin.toByteArray(Charsets.UTF_8))
            return bytes.joinToString("") { "%02x".format(it) }
        }

        suspend fun getUserInfo(
            weiXinId: String,
            weiXinSecret: String,
            code: String
        ): Map<String, Any?>? {
            return withContext(Dispatchers.IO) {
                try {
                    // 第一步：获取access_token
                    val tokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?" +
                            "appid=$weiXinId&secret=$weiXinSecret&code=$code&grant_type=authorization_code"

                    val tokenResponse = URL(tokenUrl).readText()
                    val tokenJson = JSONObject(tokenResponse)
                    val accessToken = tokenJson.getString("access_token")
                    val openid = tokenJson.getString("openid")

                    // 第二步：获取用户信息
                    val userInfoUrl =
                        "https://api.weixin.qq.com/sns/userinfo?access_token=$accessToken&openid=$openid"
                    val userInfoResponse = URL(userInfoUrl).readText()
                    val userJson = JSONObject(userInfoResponse)

                    mapOf(
                        "nickname" to userJson.getString("nickname"),
                        "headimgurl" to userJson.getString("headimgurl"),
                        "openid" to openid,
                        "unionid" to userJson.optString("unionid")
                    )
                } catch (e: Exception) {
                    e.printStackTrace()
                    null
                }
            }
        }

        fun generateObjectId(): String {
            val timestamp = (System.currentTimeMillis() / 1000).toInt().toString(16)
            val randomPart = buildString {
                repeat(16) {
                    append(((0..15).random()).toString(16))
                }
            }
            return timestamp + randomPart
        }

        fun getWeChatShareScene(scene: String): Int {
            return when (scene) {
                "session" -> SendMessageToWX.Req.WXSceneSession
                "timeline" -> SendMessageToWX.Req.WXSceneTimeline
                "favorite" -> SendMessageToWX.Req.WXSceneFavorite
                "status" -> SendMessageToWX.Req.WXSceneStatus
                "contact" -> SendMessageToWX.Req.WXSceneSpecifiedContact
                else -> SendMessageToWX.Req.WXSceneSession
            }
        }

        fun getBitmapFromBase64OrUri(base64OrUri: String?): Bitmap? {
            if (base64OrUri.isNullOrEmpty()) return null
            val isFileUri = base64OrUri.startsWith("file://")
            if (isFileUri) {
                val filePath = base64OrUri.substring(7)
                val fileStream = FileInputStream(filePath)
                val bitmap = BitmapFactory.decodeStream(fileStream)
                fileStream.close()
                return bitmap
            } else {
                val bytes = Base64.decode(base64OrUri, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                return bitmap
            }
        }

        fun compressBitmapToTargetSize(bitmap: Bitmap, targetSizeKB: Int): ByteArray {
            val outputStream = ByteArrayOutputStream()
            var quality = 100
            // 第一次不压缩，直接写入
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)

            // 循环压缩直到小于目标大小
            while (outputStream.toByteArray().size / 1024 > targetSizeKB) {
                outputStream.reset()
                if (quality > 10) {
                    quality -= 8 // 每次减少8%质量
                } else {
                    // 如果质量降到10%以下仍然太大，则缩放图片
                    val scaledWidth = (bitmap.width * 0.7f).toInt()
                    val scaledHeight = (bitmap.height * 0.7f).toInt()
                    val scaledBitmap = bitmap.scale(scaledWidth, scaledHeight)
                    return compressBitmapToTargetSize(scaledBitmap, targetSizeKB)
                }
                bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream)
            }
            return outputStream.toByteArray()
        }

        fun getMiniProgramType(miniProgramType: String): Int {
            return when (miniProgramType) {
                "release" -> WXMiniProgramObject.MINIPTOGRAM_TYPE_RELEASE
                "test" -> WXMiniProgramObject.MINIPROGRAM_TYPE_TEST
                "preview" -> WXMiniProgramObject.MINIPROGRAM_TYPE_PREVIEW
                else -> WXMiniProgramObject.MINIPTOGRAM_TYPE_RELEASE
            }
        }

        fun getVideoThumbnailBitmap(videoPath: String): Bitmap? {
            val retriever = MediaMetadataRetriever()
            return try {
                retriever.setDataSource(videoPath)
                retriever.getFrameAtTime(0)
            } catch (e: Exception) {
                null
            } finally {
                try {
                    retriever.release()
                } catch (e: Exception) {
                    // pass
                }
            }
        }
    }
}