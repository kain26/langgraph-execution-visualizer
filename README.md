# LangGraph Execution Visualizer

**[打开在线演示](https://langgraph-execution-visualizer.pages.dev/)**

沿 SVG 工厂剖面流水线逐步理解 LangGraph Python `1.2.15` 的执行路径。点击「下一步」，或让镜头跟随货物经过各工位，查看 `compile()`、Pregel 调度、并行更新合并、Checkpoint 和人工审批恢复。每一步附有对应版本的源码入口。

每步提供源码行号、输入、写入和简化执行逻辑。下方有 superstep 主循环、Channel 合并试验、checkpoint 查找试验和面试自测。两个并行取数节点用于演示同一 superstep 的读写边界。恢复审批时，图会展示中断节点从头执行，以及 `Command(resume=...)` 如何成为 `interrupt()` 的返回值。

## 本地预览

```sh
python3 -m http.server 8080 --directory public
```

打开 [localhost:8080](http://localhost:8080)。页面由静态 HTML、CSS、JavaScript 和代码绘制的 SVG 构成。选择「播放」可自动前进到审批闸门，再手动恢复执行。

## 更新部署

静态文件位于 `public/`。Cloudflare Pages 使用 Wrangler Direct Upload。

```sh
npx wrangler@4.128.0 pages deploy public --project-name langgraph-execution-visualizer --branch main
```
