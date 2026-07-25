import { useEffect, useRef } from 'react';
import { LogLevel, LogPayload } from '../ExpoWechat.types';
import ExpoWechatModule from '../ExpoWechatModule';

/**
 * 微信调试日志Hook
 * @param level 日志级别
 */
export function useDebugLogger(level: LogLevel) {

  useEffect(() => {
    // 启动微信日志
    ExpoWechatModule.startLogByLevel(level);

    // 监听日志事件
    const subscription = ExpoWechatModule.addListener('onLog', (params: LogPayload) => {
      console.log(`[ExpoWeChat ${String(params.level)}] ${params.log}`);
    });

    return () => {
      // 清理监听器
      subscription.remove();
    };
  }, [level]);
}