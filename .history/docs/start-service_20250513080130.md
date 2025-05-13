# 前端启动流程（start-service.md）

## 1. 安装依赖
```bash
npm install --legacy-peer-deps
```

## 2. 启动前端开发服务器
```bash
npm run dev
```
- 默认访问地址：http://localhost:5173/
- 如遇 `vite: command not found`，请执行：
  ```bash
  npm install vite --save-dev
  ```

## 3. 启动后端（如需 API 支持）
```bash
npm run dev:server
```
- 默认端口：3001

## 4. 常见问题排查
- 端口被占用：更换端口或关闭占用进程
- 依赖冲突：`npm install --legacy-peer-deps`
- Node 版本建议：>=16
- 生产环境构建：
  ```bash
  npm run build
  npm start
  ```

## 5. 进度记录（emgj）
- emgj: 完成前端启动流程文档编写。
- emgj: 建议每次迭代同步更新本文件。 
