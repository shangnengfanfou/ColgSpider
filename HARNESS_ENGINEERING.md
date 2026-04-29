# Harness Engineering 落地方案

本文档是针对此 Cursor 项目的 **Harness Engineering（工程化治理）** 完整落地方案。涵盖测试框架、代码规范、CI/CD、Docker 环境、Git 工作流等所有维度。

---

## 目录

1. [整体架构](#1-整体架构)
2. [测试体系](#2-测试体系)
3. [代码规范（ESLint + Prettier）](#3-代码规范eslint--prettier)
4. [Git Hooks（Husky + lint-staged）](#4-git-hookshusky--lint-staged)
5. [CI/CD（GitHub Actions）](#5-cicdgithub-actions)
6. [Docker 开发环境](#6-docker-开发环境)
7. [Cursor AI 辅助开发（.cursorrules）](#7-cursor-ai-辅助开发cursorrules)
8. [日常开发流程](#8-日常开发流程)
9. [可测试性重构建议](#9-可测试性重构建议)

---

## 1. 整体架构

```
项目根目录/
├── .cursorrules              # Cursor AI 开发规范
├── .eslintrc.js              # ESLint 配置
├── .prettierrc               # Prettier 配置
├── .husky/                   # Git Hooks
│   ├── pre-commit            # 提交前：lint-staged
│   └── pre-push              # 推送前：运行测试
├── .github/workflows/
│   └── ci.yml                # GitHub Actions CI 流水线
├── jest.config.js            # Jest 测试配置
├── Dockerfile                # 生产容器构建
├── docker-compose.yml        # 完整开发/测试环境
├── server/
│   ├── app.js                # Express 应用工厂（可测试）
│   ├── index.js              # 入口文件
│   ├── const/                # 常量配置
│   ├── db/                   # 数据库连接和模型
│   └── spider/               # 爬虫模块
├── public/                   # 前端静态资源
└── test/
    ├── unit/                 # 单元测试
    │   ├── util.test.js
    │   ├── variables.test.js
    │   └── getRidOfHTMLTag.test.js
    ├── integration/          # 集成测试
    │   └── app.test.js
    └── fixtures/             # 测试数据
        └── sample-post.html
```

---

## 2. 测试体系

### 框架选型

| 工具 | 用途 |
|------|------|
| **Jest** | 测试运行器 + 断言 + Mock |
| **Supertest** | HTTP 集成测试 |

### 运行测试

```bash
# 运行所有测试（含覆盖率报告）
npm test

# 仅运行单元测试
npm run test:unit

# 仅运行集成测试
npm run test:integration

# 监听模式（开发时使用）
npm run test:watch
```

### 测试分层策略

#### 单元测试（`test/unit/`）

测试纯函数和独立模块，Mock 所有外部依赖：

```javascript
// 示例：test/unit/util.test.js
jest.mock('../../server/db/db', () => ({
  getModel: () => ({ findOne: jest.fn() }),
}));

describe('getNextUrl', () => {
  it('should return URL with page number', () => {
    expect(getNextUrl(3)).toContain('3.html');
  });
});
```

#### 集成测试（`test/integration/`）

使用 Supertest 测试 HTTP 接口：

```javascript
// 示例：test/integration/app.test.js
const { createApp } = require('../../server/app');
const request = require('supertest')(createApp());

describe('GET /data', () => {
  it('should return JSON', async () => {
    const res = await request.get('/data');
    expect(res.status).toBe(200);
  });
});
```

### Mock 策略

| 被 Mock 的模块 | 原因 |
|----------------|------|
| `server/db/db` | 避免真实 MongoDB 连接 |
| `colors` | 避免终端颜色库副作用 |
| `fs` (部分) | 控制文件读写行为 |
| `puppeteer` | 避免启动真实浏览器 |

### 编写新测试的指南

1. 文件命名：`<模块名>.test.js`
2. 放置位置：纯函数 → `test/unit/`，HTTP 接口 → `test/integration/`
3. 必须 Mock 数据库和网络请求
4. 使用 `describe` 按功能分组，`it` 描述具体行为

---

## 3. 代码规范（ESLint + Prettier）

### ESLint 规则要点

- 强制 `const`，禁止 `var`
- 要求严格相等 `===`
- 允许 `console.log`（爬虫项目需要日志）
- 支持 Jest 全局变量
- 前端文件使用浏览器环境配置

### 运行

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix

# 检查格式
npm run format:check

# 自动格式化
npm run format
```

---

## 4. Git Hooks（Husky + lint-staged）

### 工作机制

```
git commit → pre-commit hook → lint-staged
                                ├── eslint --fix (自动修复)
                                └── prettier --write (自动格式化)

git push → pre-push hook → npm test (测试不过则拒绝推送)
```

### 安装

首次克隆项目后运行 `npm install`，Husky 会通过 `prepare` 脚本自动初始化。

---

## 5. CI/CD（GitHub Actions）

### 流水线设计

```
Push/PR → Lint Job → Test Job (Node 18)
                   → Test Matrix (Node 16/18/20)
                   → Coverage 上传
```

### 文件位置

`.github/workflows/ci.yml`

### 流水线阶段

1. **Lint**: 运行 `eslint` + `prettier --check`
2. **Test**: 运行 `jest --coverage`，上传覆盖率报告
3. **Matrix Test**: 在 Node 16/18/20 上运行测试，确保兼容性

---

## 6. Docker 开发环境

### 快速启动

```bash
# 启动应用 + MongoDB
docker compose up -d

# 查看日志
docker compose logs -f app

# 运行测试（隔离环境）
docker compose --profile test run test

# 关闭
docker compose down
```

### 服务说明

| 服务 | 端口 | 用途 |
|------|------|------|
| `app` | 4396 | Express 应用 |
| `mongo` | 27017 | MongoDB 数据库 |
| `test` | - | 测试运行器（需 `--profile test`） |

---

## 7. Cursor AI 辅助开发（.cursorrules）

`.cursorrules` 文件告诉 Cursor AI 项目的技术栈、架构和编码规范。AI 在生成代码时会遵循这些规则：

- 使用 `const/let`，不用 `var`
- 使用 `async/await`
- 新函数必须有 JSDoc
- 新导出函数必须有测试
- Mock 外部依赖

---

## 8. 日常开发流程

### 开发新功能

```bash
# 1. 创建分支
git checkout -b feature/my-feature

# 2. 编写代码
# ...

# 3. 编写测试
# ...

# 4. 验证
npm run lint
npm test

# 5. 提交（自动触发 lint-staged）
git add .
git commit -m "feat: add new feature"

# 6. 推送（自动触发测试）
git push -u origin feature/my-feature

# 7. 创建 PR → CI 自动运行
```

### 修复 Bug

```bash
git checkout -b fix/bug-description
# 先写测试复现 bug，再修复
npm test
git commit -m "fix: resolve the bug"
```

---

## 9. 可测试性重构建议

当前项目为了实现 harness engineering，做了以下关键重构：

### 已完成

1. **App 工厂模式** (`server/app.js`)：将 Express 应用创建从 `index.js` 分离，使 Supertest 可以直接测试 HTTP 接口，而不需要启动整个服务器。

### 建议后续改进

1. **导出 `getRidOfHTMLTag`**：这个纯函数目前未被导出，无法直接单元测试。建议在 `util.js` 中导出它。

2. **环境变量配置**：将 `_variables.js` 中的硬编码值改为读取环境变量，方便在不同环境切换：
   ```javascript
   const PORT = process.env.PORT || 4396;
   const MONGO_DB_URL = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/colg';
   ```

3. **分离爬虫启动逻辑**：`spider.js` 中的 IIFE 在 `require` 时立即执行。建议改为导出函数，由 `index.js` 主动调用。

4. **错误处理中间件**：添加 Express 错误处理中间件，统一错误响应格式。

5. **日志模块化**：用 `winston` 或 `pino` 替代直接 `console.log`，支持日志级别和结构化输出。

---

## 快速参考

| 命令 | 用途 |
|------|------|
| `npm test` | 运行所有测试 + 覆盖率 |
| `npm run test:unit` | 只运行单元测试 |
| `npm run test:integration` | 只运行集成测试 |
| `npm run test:watch` | 监听模式 |
| `npm run lint` | ESLint 检查 |
| `npm run lint:fix` | ESLint 自动修复 |
| `npm run format` | Prettier 格式化 |
| `npm run format:check` | 格式检查 |
| `npm run dev` | 开发模式启动 |
| `docker compose up -d` | Docker 环境启动 |
