/**
 * 主配置文件
 * 导出所有配置项
 */

import envConfig from "./env.js";

// API 配置
export const apiConfig = {
  ...envConfig,
  // 请求头配置
  headers: {
    "Content-Type": "application/json",
  },
  // 重试配置
  retry: {
    enabled: true,
    count: 3,
    delay: 1000,
  },
};

// 应用配置
export const appConfig = {
  name: "Bot Template",
  version: "1.0.0",
};

// 导出默认配置
export default {
  api: apiConfig,
  app: appConfig,
};
