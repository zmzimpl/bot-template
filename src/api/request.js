/**
 * Axios 请求封装
 * 统一的请求拦截器和响应拦截器
 */

import axios from "axios";
import { apiConfig } from "../config/index.js";

// 创建 axios 实例
const service = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  headers: apiConfig.headers,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如：添加 token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 打印请求日志（开发环境）
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        config.data || config.params
      );
    }

    return config;
  },
  (error) => {
    // 对请求错误做些什么
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const { data, status, config } = response;

    // 打印响应日志（开发环境）
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Response] ${config.method?.toUpperCase()} ${config.url}`,
        status,
        data
      );
    }

    // 统一处理响应数据格式
    // 假设后端返回格式为 { code: 200, data: {}, message: '' }
    if (data.code === 200 || data.code === 0) {
      return data.data;
    }

    // 处理业务错误
    const errorMsg = data.message || "请求失败";
    console.error(`[API Error] ${errorMsg}`);
    return Promise.reject(new Error(errorMsg));
  },
  async (error) => {
    // 对响应错误做点什么
    const { response, config } = error;

    // 打印错误日志
    console.error(
      `[API Response Error] ${config?.method?.toUpperCase()} ${config?.url}`,
      response?.status,
      error.message
    );

    // 处理不同的 HTTP 状态码
    if (response) {
      switch (response.status) {
        case 401:
          // 未授权，清除 token 并跳转登录
          localStorage.removeItem("token");
          // window.location.href = '/login';
          console.error("[401] 未授权，请重新登录");
          break;

        case 403:
          console.error("[403] 没有权限访问该资源");
          break;

        case 404:
          console.error("[404] 请求的资源不存在");
          break;

        case 500:
          console.error("[500] 服务器内部错误");
          break;

        case 502:
          console.error("[502] 网关错误");
          break;

        case 503:
          console.error("[503] 服务不可用");
          break;

        default:
          console.error(`[${response.status}] 请求失败`);
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("[Timeout] 请求超时，请稍后重试");
    } else if (error.message === "Network Error") {
      console.error("[Network Error] 网络连接失败，请检查网络");
    }

    // 自动重试（如果启用）
    if (apiConfig.retry.enabled && (!config.__retryCount || config.__retryCount < apiConfig.retry.count)) {
      config.__retryCount = config.__retryCount || 0;
      config.__retryCount++;

      console.log(`[Retry] 第 ${config.__retryCount} 次重试...`);

      // 延迟后重试
      await new Promise((resolve) =>
        setTimeout(resolve, apiConfig.retry.delay)
      );

      return service(config);
    }

    return Promise.reject(error);
  }
);

export default service;
