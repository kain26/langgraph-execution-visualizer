const sourceRoot = 'https://github.com/langchain-ai/langgraph/blob/1.2.15/libs/langgraph/langgraph/';

export function sourceHref(file, line) {
  return sourceRoot + file + (line ? '#L' + line : '');
}

export const steps = [
  {
    short: '编译',
    title: 'compile() 把声明装配成运行时',
    detail: 'StateGraph 收集节点、边和字段定义。编译把这些定义装成 Pregel 可以调度的节点和 Channel。',
    file: 'graph/state.py', line: 1177, symbol: 'StateGraph.compile',
    read: '节点函数、边、State Schema、可选的 checkpointer。',
    write: 'CompiledStateGraph 包含 Pregel 节点、Channel 和触发关系。此刻还没调用你的取数函数。',
    why: 'add_node 声明“做什么”。运行时以后根据 Channel 和触发关系决定“什么时候做”。',
    code: 'compile()\n  → 校验图定义\n  → 创建 CompiledStateGraph\n  → attach_node / attach_edge / attach_branch\n  → 返回可 invoke / stream 的图'
  },
  {
    short: '选任务',
    title: 'Plan · tick() 选出本轮要跑的节点',
    detail: '调用 invoke() 或 stream() 后，输入进入图。PregelLoop.tick() 根据触发条件准备任务。',
    file: 'pregel/_loop.py', line: 633, symbol: 'PregelLoop.tick',
    read: '上一轮的 Channel 状态和版本、节点订阅的触发 Channel、自身已经消费的版本，以及显式派发任务。',
    write: 'self.tasks，例如这一轮安排 Worker A 和 Worker B。',
    why: 'Channel 的值用于给节点准备输入。触发 Channel 和版本比较用于判断本轮是否要调度该节点。',
    code: 'loop.tick()\n  → prepare_next_tasks(...)\n  → 对普通触发任务检查可用 Channel 和版本\n    例：trigger version = 2，节点 seen version = 1\n  → 生成 self.tasks'
  },
  {
    short: '执行',
    title: 'Execution · 同一轮可以并行',
    detail: '本例两个节点都读到轮初的 facts = []。节点各自返回更新，写入先记录在任务上。',
    file: 'pregel/_runner.py', line: 177, symbol: 'PregelRunner.tick',
    read: '本轮任务和轮初 Channel 状态。A 先返回时，B 仍读取本轮输入。',
    write: 'A 的待合并写入是 facts: ["5m"]，B 的是 facts: ["15m"]。',
    why: '同一轮的节点通过下一轮可见的状态交换信息。外部 API、数据库等副作用仍有自己的时序和一致性。',
    code: 'runner.tick(tasks)\n  A: read [] → return {"facts": ["5m"]}\n  B: read [] → return {"facts": ["15m"]}\n  → 分别记录 task.writes'
  },
  {
    short: '合并',
    title: 'Update · after_tick() 把写入交给 Channel',
    detail: '本轮任务完成后，after_tick() 调用 apply_writes()，由各 Channel 决定如何接收这批值。',
    file: 'pregel/_algo.py', line: 233, symbol: 'apply_writes',
    read: '当前 facts = []，以及同一轮的两份更新 ["5m"] 和 ["15m"]。',
    write: '带列表追加 reducer 的 facts 变成 ["5m", "15m"]。发生更新的 Channel 版本被推进。',
    why: '同一字段同轮收到两次写入时，默认 LastValue 会抛 InvalidUpdateError。定义 reducer 才有明确合并规则。',
    code: 'loop.after_tick()\n  → apply_writes(...) 按 Channel 分组\n  → channels["facts"].update([["5m"], ["15m"]])\n  → facts = ["5m", "15m"]\n  → 下一轮可读'
  },
  {
    short: '存档',
    title: 'Checkpoint · 保存执行状态和进度',
    detail: '配置 checkpointer 后，运行时可以保存轮边界的 checkpoint，并按任务单独记录已产生的写入。',
    file: 'pregel/_loop.py', line: 1209, symbol: 'PregelLoop._put_checkpoint',
    read: 'Channel 值、Channel 版本、节点已读版本、轮次等运行状态。',
    write: '一个 checkpoint 有自己的 checkpoint_id。checkpointer 还可以保存与它关联的 pending writes。',
    why: 'thread_id 定位哪条执行历史，checkpoint_id 定位历史里的哪一份快照。同一 thread 可以有多份 checkpoint。',
    code: 'thread_id = "review-42"\n  checkpoint c1 → facts = []\n  checkpoint c2 → facts = ["5m", "15m"]\n  put_writes(...) → 记录已完成任务的独立写入'
  },
  {
    short: '中断',
    title: 'Interrupt · 把审批问题交还调用方',
    detail: '审批节点第一次执行 interrupt(...) 时会抛出 GraphInterrupt。运行时处理它，并向外返回中断信息。',
    file: 'types.py', line: 903, symbol: 'interrupt',
    read: '正在执行的任务和要跟调用方确认的数据。',
    write: '中断信息与可恢复进度关联。调用方可以结束当前请求，稍后再提交审批。',
    why: '等待发生在两次应用调用之间。恢复靠 checkpointer 和相同的 thread_id。',
    code: 'def approve(state):\n    answer = interrupt("确认生成报告？")\n    return {"approved": answer == "approve"}\n\n首次执行：interrupt(...) → GraphInterrupt → 等待调用方'
  },
  {
    short: '恢复',
    title: 'Resume · 被中断的节点从头重新执行',
    detail: '再次调用图，传入相同的 thread_id 和 Command(resume="approve")。',
    file: 'types.py', line: 903, symbol: 'interrupt / Command',
    read: 'checkpointer 载入对应执行历史和待恢复任务。interrupt() 读取本次传入的 resume 值。',
    write: '审批节点执行到 interrupt() 时拿到 "approve"，继续运行后面的代码并返回状态更新。',
    why: '恢复会重跑当前节点中 interrupt() 前的代码。写库和发通知应放在审批后或用业务幂等键保护。',
    code: 'app.invoke(\n    Command(resume="approve"),\n    config={"configurable": {"thread_id": "review-42"}}\n)\n\n再次进入 approve() → interrupt(...) 返回 "approve"'
  }
];

const channelResult = document.querySelector('[data-channel-result]');
const channelExamples = {
  aggregate: 'facts = ["5m", "15m"]。两份更新都进入下一轮的状态。',
  last: 'InvalidUpdateError。LastValue 同一轮只接收一个值，本轮不能这样合并。'
};
for (const input of document.querySelectorAll('[name="channel-reducer"]')) {
  input.addEventListener('change', () => {
    channelResult.textContent = channelExamples[input.value];
  });
}

const checkpointConfig = document.querySelector('[data-checkpoint-config]');
const checkpointResult = document.querySelector('[data-checkpoint-result]');
const checkpointExamples = {
  latest: [{thread_id: 'review-42'}, '读取该线程最新的 c2。facts 已有 ["5m", "15m"]。'],
  specific: [{thread_id: 'review-42', checkpoint_id: 'c1'}, '读取指定的 c1。facts 仍是 []，从这里回放时后续节点可能再次执行。'],
  other: [{thread_id: 'review-99'}, '这个新线程还没有 checkpoint。从空状态启动时，需要提交正常的图输入。']
};
for (const input of document.querySelectorAll('[name="checkpoint-choice"]')) {
  input.addEventListener('change', () => {
    const [config, result] = checkpointExamples[input.value];
    checkpointConfig.textContent = JSON.stringify(config, null, 2);
    checkpointResult.textContent = result;
  });
}
