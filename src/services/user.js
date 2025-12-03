/**
 * 用户相关 API 服务
 * 示例文件，展示如何使用 API 配置
 */

import request from "../api/index.js";

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise}
 */
export const login = (data) => {
  return request({
    url: "/user/login",
    method: "post",
    data,
  });
};

/**
 * 获取用户信息
 * @returns {Promise}
 */
export const getUserInfo = () => {
  return request({
    url: "/user/info",
    method: "get",
  });
};

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export const updateUserInfo = (data) => {
  return request({
    url: "/user/info",
    method: "put",
    data,
  });
};

/**
 * 用户登出
 * @returns {Promise}
 */
export const logout = () => {
  return request({
    url: "/user/logout",
    method: "post",
  });
};
