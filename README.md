# LangGraph Execution Visualizer

**[打开在线演示](https://langgraph-execution-visualizer.pages.dev/)**

从一次并行取数出发，逐步看懂 LangGraph Python `1.2.15` 如何选任务、执行节点、合并状态，再通过 checkpoint 保存和恢复进度。

页面默认打开 Plan。点击流程中的任一步可查看具体输入、结果和源码定位。下面有 Channel 双写、checkpoint 查找和面试自测。

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
