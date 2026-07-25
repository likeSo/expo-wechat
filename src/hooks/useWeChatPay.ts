import { useState, useCallback, useEffect } from 'react';
import { PayResultPayload, PayOptions } from '../ExpoWechat.types';
import ExpoWechatModule from '../ExpoWechatModule';

/**
 * 微信支付Hook
 */
export function useWeChatPay() {
  const [result, setResult] = useState<PayResultPayload | null>(null);

  useEffect(() => {
    // 监听支付结果事件
    const subscription = ExpoWechatModule.addListener('onPayResult', (payload: PayResultPayload) => {
      setResult(payload);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const pay = useCallback(async (options: PayOptions) => {
    try {
      // 重置状态，避免显示上次支付的旧数据
      setResult(null);

      const sent = await ExpoWechatModule.pay(options);
      return sent;
    } catch (error) {
      console.error('ExpoWeChat pay failed:', error);
      throw error;
    }
  }, []);

  return {
    pay,
    result,
  };
}