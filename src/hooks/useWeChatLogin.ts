import { useState, useCallback, useEffect } from 'react';
import { AuthResultPayload } from '../ExpoWechat.types';
import ExpoWechatModule from '../ExpoWechatModule';

/**
 * 微信登录Hook
 * @param scope 微信授权作用域
 * @param state 自定义状态参数
 */
export function useWeChatLogin(
  scope: "snsapi_userinfo" | Omit<string, "snsapi_userinfo">,
  state: string
) {
  const [result, setResult] = useState<AuthResultPayload | null>(null);

  useEffect(() => {
    // 监听授权结果事件
    const subscription = ExpoWechatModule.addListener('onAuthResult', (payload: AuthResultPayload) => {
      setResult(payload);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const login = useCallback(async () => {
    try {
      // 重置状态，避免显示上次登录的旧数据
      setResult(null);

      const sent = await ExpoWechatModule.sendAuthRequest(scope, state);
      return sent;
    } catch (error) {
      console.error('WeChat login failed:', error);
      throw error;
    }
  }, [scope, state]);

  return {
    login,
    result,
  };
}