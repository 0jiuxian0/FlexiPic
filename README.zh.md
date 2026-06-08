# FlexiPic

[English](./README.md)

纯前端图片生成工具，用于创建占位图片。在浏览器中自定义图片尺寸、背景、文字和导出格式，无需后端服务。

## 功能特性

- **尺寸** -- 宽/高输入（1--10000）、宽高对调按钮、比例实时显示与预设（16:9、4:3、1:1、3:2、21:9）、常用分辨率快捷按钮
- **背景** -- 纯色或线性渐变，可调起始/结束色和角度；一键随机生成
- **文字** -- 多行文字（默认三行显示宽、高、格式），可调字号（自动/手动），文字色自动计算（黑白对比或完全反色）
- **导出** -- 支持 PNG、JPEG（可调质量）、WebP（可调质量，不支持时自动回退 PNG）
- **预览** -- 实时预览，滚动时吸顶显示
- **国际化** -- 中文 / 英文界面切换

## 技术栈

| 项目 | 选择 |
|---|---|
| 构建工具 | Vite 6 + TypeScript |
| 渲染 | HTML Canvas 2D API |
| 样式 | 原生 CSS（跟随系统深色/浅色主题） |
| 部署 | GitHub Actions 部署到 GitHub Pages |

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 输出到 dist/
npm run preview    # 预览生产构建
```

## GitHub Pages 部署

1. 将仓库推送到 GitHub（仓库名应与 [`vite.config.ts`](vite.config.ts) 中的 `base` 一致，默认为 `FlexiPic`）
2. 在 **Settings > Pages > Source** 中选择 **Deploy from branch > gh-pages / root**
3. 推送到 `main` 分支后，GitHub Actions 会自动构建并部署

访问地址：`https://<用户名>.github.io/FlexiPic/`

如果仓库名不是 `FlexiPic`，需修改 [`vite.config.ts`](vite.config.ts) 中的 `base` 值。

## 项目结构

```
FlexiPic/
├── index.html
├── package.json
├── vite.config.ts
├── .github/workflows/deploy.yml
└── src/
    ├── main.ts          # 入口：事件绑定、状态协调
    ├── i18n.ts          # 中英文字符串表与语言切换
    ├── state.ts         # AppState 类型与默认值
    ├── colors.ts        # 颜色工具（随机、反色、亮度计算）
    ├── renderer.ts      # Canvas 绘制（背景 + 居中文字）
    ├── exporter.ts      # 图片导出（PNG/JPEG/WebP）与下载
    └── style.css        # 布局与响应式主题
```

## 开源协议

MIT
