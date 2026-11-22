# LangGraph Execution Visualizer

**[打开在线演示](https://langgraph-execution-visualizer.pages.dev/)**

首页用 Three.js 动画演示 LangGraph Python `1.2.15` 的执行过程。拖动可转动视角，点「下一步」逐段查看。

[深入源码与实验](https://langgraph-execution-visualizer.pages.dev/guide) 讲解 Pregel、superstep、Channel、checkpoint 和审批恢复，包含源码行号、两个小实验和面试自测。

## 本地预览

```sh
python3 -m http.server 8080 --directory public
```

打开 [localhost:8080](http://localhost:8080)。页面由静态 HTML、CSS 和 JavaScript 构成。浏览到「等待审批」后，点击「恢复审批」查看同一节点重新执行。

## 更新部署

静态文件位于 `public/`。Cloudflare Pages 使用 Wrangler Direct Upload。

```sh
npx wrangler@4.128.0 pages deploy public --project-name langgraph-execution-visualizer --branch main
```
