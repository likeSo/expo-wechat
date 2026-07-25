import { useState, useCallback, useEffect } from 'react';
import {
  QRCodeAuthGotQRCodePayload,
  QRCodeAuthResultPayload,
  AuthByQROptions,
} from '../ExpoWechat.types';
import ExpoWechatModule from '../ExpoWechatModule';

/**
 * 微信二维码登录Hook
 * @param options 二维码登录参数
 */
export function useWeChatQRLogin(options?: AuthByQROptions) {
  const [qrCode, setQrCode] = useState<QRCodeAuthGotQRCodePayload | null>(null);
  const [result, setResult] = useState<QRCodeAuthResultPayload | null>(null);
  const [userScanned, setUserScanned] = useState<boolean>(false);

  useEffect(() => {
    // 监听二维码图片回调
    const qrCodeSubscription = ExpoWechatModule.addListener('onQRCodeAuthGotQRCode', (payload: QRCodeAuthGotQRCodePayload) => {
      setQrCode(payload);
    });

    // 监听登录结果回调
    const resultSubscription = ExpoWechatModule.addListener('onQRCodeAuthResult', (payload: QRCodeAuthResultPayload) => {
      setResult(payload);
    });

    // 监听用户扫描二维码回调
    const userScannedSubscription = ExpoWechatModule.addListener('onQRCodeAuthUserScanned', () => {
      setUserScanned(true);
    });

    return () => {
      qrCodeSubscription.remove();
      resultSubscription.remove();
      userScannedSubscription.remove();
    };
  }, []);

  const login = useCallback(async (authOptions?: AuthByQROptions) => {
    try {
      // 重置状态，避免显示上次登录的旧数据
      setQrCode(null);
      setResult(null);
      setUserScanned(false);

      const mergedOptions = authOptions || options;
      if (!mergedOptions) {
        throw new Error('AuthByQROptions is required');
      }
      const qrCodeImage = await ExpoWechatModule.sendAuthByQRRequest(mergedOptions);
      return qrCodeImage;
    } catch (error) {
      console.error('WeChat QR login failed:', error);
      throw error;
    }
  }, [options]);

  const reset = useCallback(() => {
    setQrCode(null);
    setResult(null);
    setUserScanned(false);
  }, []);

  return {
    login,
    qrCode,
    result,
    userScanned,
    reset,
  };
}