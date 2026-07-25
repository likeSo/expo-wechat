// Reexport the native module. On web, it will be resolved to ExpoWechatModule.web.ts
// and on native platforms to ExpoWechatModule.ts
export { default } from './ExpoWechatModule';
export * from  './ExpoWechat.types';

// Export hooks
export * from './hooks';
