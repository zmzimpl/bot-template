/**
 * API 服务入口
 * 导出统一的 axios 实例
 */

import request from "./request.js";

export default request;

// 也可以导出常用的请求方法
export const get = (url, params, config) => {
  return request({
    method: "get",
    url,
    params,
    ...config,
  });
};

export const post = (url, data, config) => {
  return request({
    method: "post",
    url,
    data,
    ...config,
  });
};

export const put = (url, data, config) => {
  return request({
    method: "put",
    url,
    data,
    ...config,
  });
};

export const del = (url, data, config) => {
  return request({
    method: "delete",
    url,
    data,
    ...config,
  });
};

export const patch = (url, data, config) => {
  return request({
    method: "patch",
    url,
    data,
    ...config,
  });
};
