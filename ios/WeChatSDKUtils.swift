//
//  WeChatSDKUtils.swift
//  ExpoWechat
//
//  Created by Aron on 2025/6/17.
//

import Foundation
import CommonCrypto
import WechatOpenSDK
import AVFoundation

enum NetworkError: Error {
    case invalidURL
    case noData
    case badStatusCode(Int)
}

struct WeChatSDKUtils {
    
    static func getObjectFromURLAsync(
            from urlString: String,
            completion: @escaping (Result<[String: Any?], Error>) -> Void
        ) {
            guard let url = URL(string: urlString) else {
                completion(.failure(NetworkError.invalidURL))
                return
            }
            
            let task = URLSession.shared.dataTask(with: url) { data, response, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                
                if let httpResponse = response as? HTTPURLResponse,
                   !(200...299).contains(httpResponse.statusCode) {
                    completion(.failure(NetworkError.badStatusCode(httpResponse.statusCode)))
                    return
                }
                
                guard let data = data else {
                    completion(.failure(NetworkError.noData))
                    return
                }
                if let json = try? JSONSerialization.jsonObject(with: data, options: .json5Allowed) as? [String: Any?] {
                    completion(.success(json))
                } else {
                    completion(.failure(NetworkError.noData))
                }
            }
            
            task.resume()
        }
    
    static func getAccessToken(weiXinId: String, weiXinSecret: String, completion: @escaping (String?) -> Void) {
        let url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential" +
                            "&appid=$weiXinId&secret=$weiXinSecret"
        getObjectFromURLAsync(from: url) { result in
            if case .success(let data) = result {
                if let accessToken = data["access_token"] as? String {
                    completion(accessToken)
                }
            } else if case .failure(let failure) = result {
                #if DEBUG
                print(failure)
                #endif
            }
        }
    }
    
    static func getSDKTicket(accessToken: String, completion: @escaping (String?) -> Void) {
        let url =
                        "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=2&access_token=$accessToken"
        getObjectFromURLAsync(from: url) { result in
            if case .success(let data) = result {
                if let ticket = data["ticket"] as? String {
                    completion(ticket)
                }
            } else if case .failure(let failure) = result {
                #if DEBUG
                print(failure)
                #endif
            }
        }
    }
    
    static func createSignature(
        weiXinId: String,
        nonceStr: String,
        sdkTicket: String,
        timestamp: String
    ) -> String {
        let origin = "appid=\(weiXinId)&noncestr=\(nonceStr)&sdk_ticket=\(sdkTicket)&timestamp=\(timestamp)"
        
        guard let data = origin.data(using: .utf8) else {
            return ""
        }
        
        var digest = [UInt8](repeating: 0, count: Int(CC_SHA1_DIGEST_LENGTH))
        data.withUnsafeBytes {
            _ = CC_SHA1($0.baseAddress, CC_LONG(data.count), &digest)
        }
        
        return digest.map { String(format: "%02hhx", $0) }.joined()
    }
    
    static func generateObjectId() -> String {
        let timestamp = String(Int(Date().timeIntervalSince1970), radix: 16)
        
        let randomPart = (0..<16).map { _ in
            String(Int.random(in: 0..<16), radix: 16)
        }.joined()
        
        return timestamp + randomPart
    }
    
    static func getWeChatShareScene(_ scene: String) -> Int32 {
        switch scene {
        case "timeline": return Int32(WXSceneTimeline.rawValue)
        case "session": return Int32(WXSceneSession.rawValue)
        case "favorite": return Int32(WXSceneFavorite.rawValue)
        case "contact": return Int32(WXSceneSpecifiedSession.rawValue)
        default: return Int32(WXSceneTimeline.rawValue)
        }
    }
    
    static func getImageDataFromBase64OrUri(_ base64OrImageUri: String?) -> Data? {
        if let string = base64OrImageUri, !string.isEmpty {
            if string.hasPrefix("file://") {
                if let fileURL = URL(string: string), let data = try? Data(contentsOf: fileURL, options: .mappedIfSafe) {
                    return data
                }
            } else {
                return Data(base64Encoded: string, options: .ignoreUnknownCharacters)
            }
        }
        return nil
    }
    
    static func getVideoThumbnail(from videoURL: URL, completion: @escaping (UIImage?) -> Void) {
        let asset = AVAsset(url: videoURL)
        
        let imageGenerator = AVAssetImageGenerator(asset: asset)
        imageGenerator.appliesPreferredTrackTransform = true // 保证正确的方向
        
        let time = CMTime(seconds: 0, preferredTimescale: 600)
        
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let cgImage = try imageGenerator.copyCGImage(at: time, actualTime: nil)
                let thumbnail = UIImage(cgImage: cgImage)
                
                DispatchQueue.main.async {
                    completion(thumbnail)
                }
            } catch {
                print("Error generating thumbnail: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    completion(nil)
                }
            }
        }
    }
    
    static func getMiniProgramType(_ type: String) -> WXMiniProgramType {
        switch type {
        case "release": return WXMiniProgramType.release
        case "test": return WXMiniProgramType.test
        case "preview": return WXMiniProgramType.preview
        default: return WXMiniProgramType.release
        }
    }
    
}
