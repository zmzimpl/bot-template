# 前端配置说明

本目录包含前端的配置文件和 API 服务封装。

## 目录结构

```
src/
├── config/           # 配置文件
│   ├── env.js       # 环境配置
│   └── index.js     # 主配置入口
├── api/             # API 请求封装
│   ├── request.js   # Axios 实例配置
│   └── index.js     # API 入口
├── services/        # 业务 API 服务
│   ├── user.js      # 用户相关 API
│   └── index.js     # 服务统一导出
└── README.md        # 说明文档
```

## 配置说明

### 环境配置 (config/env.js)

根据不同环境自动加载对应的配置：

- `development`: 开发环境
- `production`: 生产环境
- `test`: 测试环境

### API 配置 (config/index.js)

包含以下配置项：

- `baseURL`: API 基础地址
- `timeout`: 请求超时时间
- `withCredentials`: 是否携带凭证
- `headers`: 默认请求头
- `retry`: 重试配置

## 使用方法

### 方法 1: 直接使用 request 实例

```javascript
import request from './api/index.js';

// GET 请求
const data = await request({
  url: '/users',
  method: 'get',
  params: { page: 1 }
});

// POST 请求
const result = await request({
  url: '/users',
  method: 'post',
  data: { name: 'John', email: 'john@example.com' }
});
```

### 方法 2: 使用封装的方法

```javascript
import { get, post, put, del } from './api/index.js';

// GET 请求
const users = await get('/users', { page: 1 });

// POST 请求
const newUser = await post('/users', { name: 'John' });

// PUT 请求
const updated = await put('/users/1', { name: 'Jane' });

// DELETE 请求
await del('/users/1');
```

### 方法 3: 使用 services（推荐）

```javascript
import { login, getUserInfo, updateUserInfo } from './services/index.js';

// 登录
const loginData = await login({
  username: 'admin',
  password: '123456'
});

// 获取用户信息
const userInfo = await getUserInfo();

// 更新用户信息
await updateUserInfo({
  nickname: 'New Name',
  avatar: 'https://example.com/avatar.jpg'
});
```

## 创建新的 API 服务

在 `services/` 目录下创建新的服务文件：

```javascript
// services/product.js
import request from '../api/index.js';

export const getProductList = (params) => {
  return request({
    url: '/products',
    method: 'get',
    params
  });
};

export const getProductDetail = (id) => {
  return request({
    url: `/products/${id}`,
    method: 'get'
  });
};
```

然后在 `services/index.js` 中导出：

```javascript
export * from './user.js';
export * from './product.js';
```

## 请求拦截器

请求拦截器会自动：

1. 添加 Authorization token（从 localStorage 读取）
2. 打印请求日志（开发环境）
3. 返回配置对象

## 响应拦截器

响应拦截器会自动：

1. 统一处理响应数据格式
2. 处理业务错误
3. 处理 HTTP 状态码错误（401, 403, 404, 500 等）
4. 自动重试失败的请求（可配置）
5. 打印响应日志（开发环境）

## 错误处理

所有错误都会被捕获并统一处理：

```javascript
import { login } from './services/index.js';

try {
  const data = await login({ username: 'admin', password: '123456' });
  console.log('登录成功', data);
} catch (error) {
  console.error('登录失败', error.message);
}
```

## 修改配置

### 修改 API 地址

编辑 `src/config/env.js`，修改对应环境的 `baseURL`。

### 修改超时时间

编辑 `src/config/env.js`，修改 `timeout` 配置（单位：毫秒）。

### 修改重试配置

编辑 `src/config/index.js`，修改 `apiConfig.retry` 配置：

```javascript
retry: {
  enabled: true,   // 是否启用重试
  count: 3,        // 重试次数
  delay: 1000,     // 重试延迟（毫秒）
}
```

## 注意事项

1. 所有 API 请求都会经过拦截器处理
2. 默认假设后端返回格式为 `{ code: 200, data: {}, message: '' }`
3. Token 存储在 localStorage 中，key 为 `token`
4. 401 错误会自动清除 token
5. 开发环境会打印详细的请求和响应日志
