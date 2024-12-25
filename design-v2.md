# 目录结构查看器 V2 设计文档

## 架构改造
从数据库存储模式改为无数据库的混合存储方案。

### 1. 混合存储策略

#### 小文件处理 (<1000个文件)
- 使用 URL 参数 + 压缩编码方式
- 完全客户端处理
- localStorage 作为备份
- 优点：
  - 即时处理
  - 零存储成本
  - 直接通过 URL 分享
- 限制：
  - 受 URL 长度限制
  - 适用于小型目录

#### 大文件处理 (>=1000个文件)
- 使用 Vercel Blob Storage
- 分批处理大文件
- sessionStorage 存储处理进度
- 优点：
  - 支持大型目录
  - 使用 Vercel 免费额度
  - 稳定可靠
- 限制：
  - 需要监控存储使用量
  - 需要清理策略

### 2. 存储限制

#### Vercel Blob (免费额度)
- 存储空间：5GB
- 带宽：100GB/月
- 单文件大小限制：500MB

#### 浏览器存储
- localStorage：5-10MB
- sessionStorage：5-10MB
- URL 长度：2-8KB (因浏览器而异)

### 3. 代码架构

#### 保持不变的部分
- UI 组件和交互逻辑
- 目录解析算法
- 搜索和展示功能
- 错误处理机制

#### 需要修改的部分
- 删除��有数据库相关代码
- 修改数据持久化逻辑
- 添加文件大小检测
- 实现混合存储策略

### 4. 处理流程

```typescript
const FILE_STRATEGY = {
  SMALL: {
    maxItems: 1000,
    storage: 'URL',
    backup: 'localStorage'
  },
  LARGE: {
    minItems: 1000,
    storage: 'Vercel Blob',
    backup: 'sessionStorage',
    limits: {
      free: '5GB',
      bandwidth: '100GB/月'
    }
  }
};

// 文件处理流程
const processFile = async (file: File) => {
  // 1. 分析文件
  const stats = await analyzeFile(file);
  
  // 2. 选择策略
  if (stats.itemCount < 1000) {
    // 小文件：URL 方案
    return handleSmallFile(file);
  } else {
    // 大文件：Blob 存储
    return handleLargeFile(file);
  }
};
```

### 5. 改造步骤

1. 清理阶段
   - 删除 Prisma 相关文件
   - 移除数据库环境变量
   - 清理数据库依赖

2. 实现阶段
   - 实现文件分析功能
   - 添加压缩和编码工具
   - 集成 Vercel Blob
   - 修改数据处理逻辑

3. 测试阶段
   - 验证小文件处理
   - 测试大文件上传
   - 确认分享功能
   - 压力测试

4. 优化阶段
   - 添加进度显示
   - 优化错误处理
   - 实现文件清理
   - 监控使用量

### 6. 注意事项

1. 性能考虑
   - 大文件分块处理
   - 压缩算法选择
   - 客户端性能优化

2. 用户体验
   - 保持界面响应
   - 显示处理进度
   - 提供错误反馈

3. 存储管理
   - 监控 Blob 使用量
   - 定期清理旧文件
   - 设置过期策略

4. 安全性
   - 文件大小限制
   - 类型检查
   - 访问控制

### 7. 后续优化

1. 功能增强
   - 离线支持
   - 文件预览
   - 批量处理

2. 性能优化
   - 缓存策略
   - 压缩优化
   - 加载优化

3. 用户体验
   - 进度展示
   - 断点续传
   - 快速预览 