import { sourceHref, steps } from './lessons.js';

const find = name => document.querySelector('[data-' + name + ']');
const buttons = [...document.querySelectorAll('[data-step]')];
const examples = [
  ['编译结果', 'StateGraph → CompiledStateGraph'],
  ['本轮任务', 'Worker A（5m）和 Worker B（15m）'],
  ['两份独立写入', 'A → ["5m"]　B → ["15m"]'],
  ['轮末的共享状态', 'facts: [] → ["5m", "15m"]'],
  ['同一条执行历史', 'thread_id = review-42　快照：c1 → c2'],
  ['等待调用方', 'interrupt("确认生成报告？")'],
  ['同一个节点重新执行', 'interrupt() 返回 "approve"']
];

let index = 1;
function show(selected) {
  index = selected;
  const step = steps[index];
  find('heading').textContent = step.title;
  for (const field of ['detail', 'read', 'write', 'why', 'code']) {
    find(field).textContent = step[field];
  }
  const [label, value] = examples[index];
  find('example-label').textContent = label;
  find('example').textContent = value;
  const source = find('source');
  source.href = sourceHref(step.file, step.line);
  source.textContent = '查看源码 · ' + step.file + ':' + step.line;
  find('count').textContent = (index + 1) + ' / ' + steps.length;
  find('prev').disabled = index === 0;
  find('next').disabled = index === steps.length - 1;
  find('next').textContent = index === 5 ? '恢复审批' : '下一步';
  for (const button of buttons) {
    if (Number(button.dataset.step) === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
}

for (const button of buttons) {
  button.addEventListener('click', () => show(Number(button.dataset.step)));
}
find('prev').addEventListener('click', () => show(index - 1));
find('next').addEventListener('click', () => show(index + 1));
show(index);
