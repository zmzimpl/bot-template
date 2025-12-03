# Bot Template

一个现代化的 TypeScript Bot 开发模板，集成了 HTTP/2、Redis 缓存、并发控制等企业级功能。

## 特性

- **TypeScript** - 完整的类型支持，提升开发体验
- **HTTP/2** - 默认启用 HTTP/2，支持多路复用，提升性能
- **可切换 HTTP 客户端** - 支持 impit 和 got 两种客户端，可通过配置切换
- **Keep-Alive** - 长连接支持，减少连接建立开销
- **DNS 缓存** - 内置 DNS 缓存，减少 DNS 查询延迟
- **Redis 缓存** - 基于 ioredis 的缓存层
- **并发控制** - 基于 p-queue 的任务队列和速率限制
- **精度计算** - 基于 bignumber.js 的高精度数学运算
- **时间处理** - 基于 dayjs 的日期时间工具
- **模糊匹配** - 基于 fuzzball 的字符串模糊匹配
- **推送通知** - 支持 Bark 推送通知
- **完整测试** - 基于 Vitest 的测试套件，155+ 测试用例

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 运行测试

```bash
npm test
```

## 项目结构

```
bot-template/
├── src/
│   ├── index.ts              # 应用入口
│   ├── types/                # 类型定义
│   │   └── index.ts          # 所有类型导出
│   ├── config/               # 配置模块
│   │   ├── index.ts          # 配置导出
│   │   └── env.ts            # 环境变量处理
│   ├── constants/            # 常量定义
│   │   └── index.ts
│   ├── http/                 # HTTP 客户端模块
│   │   ├── index.ts          # 模块导出
│   │   ├── base.ts           # 抽象基类
│   │   ├── factory.ts        # 客户端工厂
│   │   ├── impit-client.ts   # Impit 客户端实现
│   │   └── got-client.ts     # Got 客户端实现
│   ├── api/                  # API 层
│   │   ├── index.ts          # API 导出
│   │   └── request.ts        # 请求封装
│   ├── services/             # 业务服务层
│   │   ├── index.ts          # 服务导出
│   │   └── user.ts           # 用户服务示例
│   └── utils/                # 工具函数
│       ├── index.ts          # 工具导出
│       ├── cache.ts          # Redis 缓存
│       ├── queue.ts          # 并发队列
│       ├── bignumber.ts      # 精度计算
│       ├── date.ts           # 日期处理
│       ├── fuzzy.ts          # 模糊匹配
│       ├── encrypt.ts        # 加解密
│       ├── retry.ts          # 重试机制
│       ├── sleep.ts          # 延时函数
│       ├── rand.ts           # 随机数生成
│       ├── proxy.ts          # 代理处理
│       ├── getProp.ts        # 对象属性获取
│       ├── bark.ts           # Bark 推送
│       ├── alert.ts          # 告警通知
│       ├── log.ts            # 简单日志
│       ├── logger.ts         # Winston 日志
│       ├── chalk.ts          # 终端颜色
│       └── getDir.ts         # 目录获取
├── tests/                    # 测试文件
│   ├── config/               # 配置测试
│   ├── http/                 # HTTP 客户端测试
│   └── utils/                # 工具函数测试
├── dist/                     # 编译输出
├── .env.example              # 环境变量示例
├── package.json
├── tsconfig.json             # TypeScript 配置
└── vitest.config.ts          # Vitest 测试配置
```

## 核心模块详解

### HTTP 客户端 (`src/http/`)

支持两种 HTTP 客户端，可通过环境变量 `HTTP_CLIENT` 切换：

#### 使用示例

```typescript
import { createHttpClient, HttpClientFactory } from './http/index.js';

// 创建默认客户端（根据环境变量 HTTP_CLIENT 决定）
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  http2: true,
  keepAlive: true,
  dnsCache: true,
});

// 发起请求
const response = await client.get<UserData>('/users/1');
console.log(response.data);

// POST 请求
const result = await client.post<ApiResponse>('/users', {
  name: 'John',
  email: 'john@example.com',
});

// 切换客户端类型
const factory = HttpClientFactory.getInstance();
factory.switchClient('got');  // 切换到 got
factory.switchClient('impit'); // 切换回 impit
```

#### 客户端特性对比

| 特性 | Impit | Got |
|------|-------|-----|
| HTTP/2 | 部分支持 | 完整支持 |
| Keep-Alive | 支持 | 支持 |
| DNS 缓存 | 需手动 | 内置支持 |
| 重试机制 | 需手动 | 内置支持 |
| 适用场景 | 轻量请求 | 复杂场景 |

### Redis 缓存 (`src/utils/cache.ts`)

基于 ioredis 的缓存封装，支持 TTL 和前缀。

```typescript
import { Cache, getRedisClient, closeRedis } from './utils/cache.js';

// 创建缓存实例
const cache = new Cache({
  prefix: 'myapp:',
  ttl: 3600,  // 默认过期时间（秒）
});

// 基本操作
await cache.set('user:1', { name: 'John', age: 30 });
const user = await cache.get<User>('user:1');
await cache.delete('user:1');

// 检查是否存在
const exists = await cache.has('user:1');

// 使用自定义 TTL
await cache.set('session:abc', sessionData, 1800);  // 30分钟过期

// 清除所有带前缀的键
await cache.clear();

// 关闭连接
await closeRedis();
```

### 并发控制 (`src/utils/queue.ts`)

基于 p-queue 的并发队列，支持速率限制和批处理。

```typescript
import {
  createQueue,
  getDefaultQueue,
  withQueue,
  processBatch,
  createRateLimiter,
} from './utils/queue.js';

// 创建自定义队列
const queue = createQueue({
  concurrency: 5,     // 最大并发数
  interval: 1000,     // 间隔时间（毫秒）
  intervalCap: 10,    // 每个间隔最大任务数
  timeout: 30000,     // 任务超时
});

// 添加任务
await queue.add(async () => {
  return await fetchData();
});

// 使用默认队列
const result = await withQueue(async () => {
  return await heavyTask();
});

// 批量处理
const items = [1, 2, 3, 4, 5];
const results = await processBatch(items, async (item, index) => {
  return await processItem(item);
}, { concurrency: 3 });

// 速率限制器（每秒最多 5 个请求）
const rateLimiter = createRateLimiter(5, 1000);
await rateLimiter.add(() => apiCall());
```

### 精度计算 (`src/utils/bignumber.ts`)

基于 bignumber.js 的高精度数学运算，适用于金融计算。

```typescript
import {
  bn,
  add,
  subtract,
  multiply,
  divide,
  format,
  toFixed,
  compare,
  min,
  max,
  isZero,
  isPositive,
  isNegative,
  percentage,
} from './utils/bignumber.js';

// 基本运算
const sum = add('0.1', '0.2');           // 0.3（精确）
const diff = subtract('1', '0.1');        // 0.9
const product = multiply('0.1', '0.2');   // 0.02
const quotient = divide('1', '3');        // 0.333...

// 格式化
format(1234567.89);                       // "1,234,567.89"
toFixed(1.23456, 2);                      // "1.23"

// 比较
compare('1.0', '1');                      // 0（相等）
min('1', '2', '3');                       // BigNumber(1)
max('1', '2', '3');                       // BigNumber(3)

// 检查
isZero('0');                              // true
isPositive('1');                          // true
isNegative('-1');                         // true

// 百分比计算
percentage('50', '200');                  // 25（50 是 200 的 25%）
```

### 日期处理 (`src/utils/date.ts`)

基于 dayjs 的日期时间工具。

```typescript
import {
  now,
  today,
  format,
  parse,
  addTime,
  subtractTime,
  diff,
  startOf,
  endOf,
  isBefore,
  isAfter,
  isSame,
  isBetween,
  fromNow,
  toNow,
  unix,
  fromUnix,
} from './utils/date.js';

// 当前时间
now();                                    // Dayjs 对象
today();                                  // 今天 00:00:00

// 格式化
format(new Date());                       // "2024-01-15 10:30:00"
format(new Date(), 'YYYY/MM/DD');        // "2024/01/15"

// 解析
parse('2024-01-15');                      // Dayjs 对象
parse('2024-01-15', 'YYYY-MM-DD');

// 时间运算
addTime(now(), 1, 'day');                 // 明天
subtractTime(now(), 1, 'week');           // 上周

// 时间差
diff(date1, date2, 'day');                // 相差天数

// 时间边界
startOf(now(), 'month');                  // 本月第一天
endOf(now(), 'month');                    // 本月最后一天

// 比较
isBefore(date1, date2);
isAfter(date1, date2);
isSame(date1, date2, 'day');
isBetween(date, start, end);

// 相对时间
fromNow(pastDate);                        // "2 hours ago"
toNow(futureDate);                        // "in 3 days"

// Unix 时间戳
unix(now());                              // 秒级时间戳
fromUnix(1705299000);                     // Dayjs 对象
```

### 模糊匹配 (`src/utils/fuzzy.ts`)

基于 fuzzball 的字符串模糊匹配。

```typescript
import {
  ratio,
  partialRatio,
  tokenSortRatio,
  tokenSetRatio,
  weightedRatio,
  quickRatio,
  extractBest,
  extractAll,
  fuzzyMatch,
} from './utils/fuzzy.js';

// 基本相似度（0-100）
ratio('hello', 'helo');                   // 90
partialRatio('hello world', 'hello');     // 100

// Token 比较（忽略顺序）
tokenSortRatio('world hello', 'hello world');  // 100
tokenSetRatio('hello world', 'hello');         // 100

// 加权比较
weightedRatio('hello', 'helo');           // 使用多种算法加权

// 从列表中提取最佳匹配
const choices = ['apple', 'banana', 'orange', 'grape'];
extractBest('aple', choices);             // { choice: 'apple', score: 90 }

// 提取所有匹配（按分数排序）
extractAll('ap', choices, 50);            // 分数 >= 50 的所有匹配

// 便捷函数
fuzzyMatch('apple', choices, 80);         // 分数 >= 80 的匹配
```

### 加解密 (`src/utils/encrypt.ts`)

XOR 加密和 MD5 哈希工具。

```typescript
import {
  encrypt,
  decrypt,
  md5,
  encryptWithKeys,
  decryptWithKeys,
} from './utils/encrypt.js';

// 单密钥加解密
const encrypted = encrypt('secret message', 'mykey');
const decrypted = decrypt(encrypted, 'mykey');

// 双密钥加解密（使用环境变量中的密钥）
const encrypted2 = encryptWithKeys('secret');
const decrypted2 = decryptWithKeys(encrypted2);

// MD5 哈希
md5('hello world');                       // "5eb63bbbe01eeed093cb22bb8f5acdc3"
```

### 重试机制 (`src/utils/retry.ts`)

支持指数退避的重试函数。

```typescript
import { retry, retryWithBackoff } from './utils/retry.js';

// 基本重试
const result = await retry(
  async () => {
    return await unstableApiCall();
  },
  3,        // 最大重试次数
  1000      // 重试间隔（毫秒）
);

// 指数退避重试
const result2 = await retryWithBackoff(
  async () => {
    return await unstableApiCall();
  },
  5,        // 最大重试次数
  1000,     // 初始延迟
  2         // 退避倍数
);
// 延迟序列：1000ms, 2000ms, 4000ms, 8000ms, 16000ms
```

### 代理处理 (`src/utils/proxy.ts`)

代理 URL 解析和 SOCKS 代理支持。

```typescript
import {
  parseProxy,
  formatProxyUrl,
  createSocksAgent,
} from './utils/proxy.js';

// 解析代理 URL
const proxy = parseProxy('socks5://user:pass@127.0.0.1:1080');
// { protocol: 'socks5', host: '127.0.0.1', port: '1080', username: 'user', password: 'pass' }

// 格式化代理 URL
formatProxyUrl(proxy);                    // "socks5://user:pass@127.0.0.1:1080"

// 创建 SOCKS 代理 Agent
const agent = createSocksAgent('socks5://127.0.0.1:1080');
```

### Bark 推送 (`src/utils/bark.ts`)

支持 Bark App 的推送通知。

```typescript
import { initBark, sendBarkNotification, bark } from './utils/bark.js';

// 初始化（使用环境变量配置）
const barkClient = initBark();

// 发送通知
await sendBarkNotification('标题', '内容', {
  sound: 'bell',
  group: 'MyApp',
  level: 'active',
  url: 'https://example.com',
});

// 使用便捷函数
await bark('提醒', '这是一条测试消息');
```

### 其他工具

#### 延时函数

```typescript
import { sleep, sleepRandom } from './utils/sleep.js';

await sleep(1000);                        // 等待 1 秒
await sleepRandom(1000, 3000);           // 等待 1-3 秒随机时间
```

#### 随机数生成

```typescript
import {
  randInt,
  randFloat,
  randString,
  randHex,
  randElement,
  shuffle,
} from './utils/rand.js';

randInt(1, 100);                          // 1-100 随机整数
randFloat(0, 1);                          // 0-1 随机浮点数
randString(16);                           // 16位随机字符串
randHex(32);                              // 32位随机十六进制
randElement(['a', 'b', 'c']);            // 随机选择元素
shuffle([1, 2, 3, 4, 5]);                // 打乱数组
```

#### 对象属性获取

```typescript
import { getProp } from './utils/getProp.js';

const obj = { a: { b: { c: 1 } } };
getProp(obj, 'a.b.c');                    // 1
getProp(obj, 'a.b.d', 'default');        // 'default'
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `API_BASE_URL` | API 基础 URL | `http://localhost:3000/api` |
| `API_TIMEOUT` | 请求超时（毫秒） | `30000` |
| `HTTP_CLIENT` | HTTP 客户端类型 | `impit` |
| `HTTP2_ENABLED` | 启用 HTTP/2 | `true` |
| `KEEP_ALIVE` | 启用 Keep-Alive | `true` |
| `DNS_CACHE` | 启用 DNS 缓存 | `true` |
| `REDIS_HOST` | Redis 主机 | `localhost` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `REDIS_PASSWORD` | Redis 密码 | - |
| `REDIS_DB` | Redis 数据库 | `0` |
| `BARK_ENABLED` | 启用 Bark 推送 | `false` |
| `BARK_SERVER_URL` | Bark 服务器 URL | `https://api.day.app` |
| `BARK_DEVICE_KEY` | Bark 设备密钥 | - |
| `MAX_CONCURRENCY` | 最大并发数 | `10` |
| `INTERVAL_MS` | 任务间隔（毫秒） | `100` |
| `LOG_LEVEL` | 日志级别 | `info` |

## 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（热重载） |
| `npm run build` | 编译 TypeScript |
| `npm start` | 运行编译后的代码 |
| `npm test` | 运行测试 |
| `npm run test:watch` | 监听模式测试 |
| `npm run test:coverage` | 测试覆盖率 |
| `npm run lint` | ESLint 检查 |
| `npm run clean` | 清理编译输出 |

## 技术栈

- **运行时**: Node.js >= 20.0.0
- **语言**: TypeScript 5.x
- **HTTP 客户端**: impit, got
- **缓存**: ioredis
- **并发控制**: p-queue
- **精度计算**: bignumber.js
- **日期处理**: dayjs
- **模糊匹配**: fuzzball
- **测试框架**: Vitest
- **其他**: ethers, viem, puppeteer, winston

## 许可证

AGPL-3.0
