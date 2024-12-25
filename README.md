# 目录结构查看器 V2

一个简单的在线工具，用于查看和分析文件夹的目录结构。

## 功能特点

- 支持拖放上传目录文件
- 树形结构展示
- 实时搜索和高亮
- 支持大文件处理
- URL分享功能

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Vercel Blob Storage

## 本地开发

1. 克隆项目
```bash
git clone [repository-url]
cd directory-viewer2
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```
然后编辑 `.env.local` 文件，添加必要的环境变量。

4. 启动开发服务器
```bash
npm run dev
```

## 环境变量

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage 的访问令牌
- `NEXTAUTH_URL`: Next Auth URL（本地开发使用 http://localhost:3000）
- `NEXTAUTH_SECRET`: Next Auth 密钥

## 部署

项目可以直接部署到 Vercel 平台：

1. Fork 这个仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 使用方法

1. 打开百度网盘网页版，找到要分析的文件夹
2. 右键点击文件夹，选择"生成目录文件.txt"
3. 将生成的 txt 文件上传到本网站
4. 等待处理完成后即可查看目录结构

## 存储策略

- 小文件（<1000个文件）：使用 URL 参数 + 压缩编码
- 大文件（>=1000个文件）：使用 Vercel Blob Storage

## 许可证

MIT
