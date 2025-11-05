/**
 * 环境配置文件
 * 根据不同环境配置不同的 API 地址
 */

const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    baseURL: "http://localhost:3000/api",
    timeout: 30000,
    withCredentials: true,
  },
  production: {
    baseURL: "https://api.example.com",
    timeout: 30000,
    withCredentials: true,
  },
  test: {
    baseURL: "http://localhost:3000/api",
    timeout: 30000,
    withCredentials: false,
  },
};

export default config[env];
