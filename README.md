# LangGraph Execution Visualizer

**[打开在线演示](https://langgraph-execution-visualizer.pages.dev/)**

用 Three.js 逐步理解 LangGraph Python `1.2.15` 的执行路径。拖动图形调整视角，点击「下一步」查看 `compile()`、Pregel 调度、并行更新合并、Checkpoint 和人工审批恢复。每一步附有对应版本的源码入口。

两个并行取数节点用于演示同一 superstep 的读写边界。恢复审批时，图会展示中断节点从头执行，以及 `Command(resume=...)` 如何成为 `interrupt()` 的返回值。

## 本地预览

```sh
python3 -m http.server 8080 --directory public
```

打开 [localhost:8080](http://localhost:8080)。Three.js 使用固定版本的 CDN 模块。WebGL 或模块加载不可用时，页面仍能逐步浏览执行路径。

## 更新部署

静态文件位于 `public/`。Cloudflare Pages 使用 Wrangler Direct Upload。

```sh
npx wrangler@4.128.0 pages deploy public --project-name langgraph-execution-visualizer --branch main
```
