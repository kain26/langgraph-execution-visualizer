import { sourceHref, steps } from './lessons.js';

const find = name => document.querySelector('[data-' + name + ']');
const scene = find('scene');
const svgNS = 'http://www.w3.org/2000/svg';
const ink = '#1d2030';
const cream = '#fbf7ee';
const teal = '#359b91';
const gold = '#f3b23a';
const blue = '#89aef0';
const red = '#e65d47';
const rust = '#ee9f87';
const ground = '#24345a';
const wide = [0, 0, 1080, 601];
const rooms = [
  {x:96, y:120, name:'PRESS', label:'编译图', color:teal},
  {x:407, y:120, name:'SWITCH', label:'选择任务', color:teal},
  {x:718, y:120, name:'TWIN LINE', label:'并行执行', color:gold},
  {x:718, y:355, name:'MERGER', label:'统一合并', color:gold},
  {x:407, y:355, name:'ARCHIVE', label:'保存快照', color:blue},
  {x:96, y:355, name:'GATE', label:'中断与恢复', color:red}
];
const route = [
  {color:teal, path:'M18 220 H215'},
  {color:teal, path:'M215 220 H525'},
  {color:teal, path:'M525 220 H752 Q770 220 770 204 H797'},
  {color:teal, path:'M525 220 H752 Q770 220 770 250 H890'},
  {color:gold, path:'M797 204 V297 Q797 308 809 308 H829 Q840 308 840 321 V457'},
  {color:gold, path:'M890 250 V295 Q890 308 877 308 H844 Q840 308 840 320 V457'},
  {color:blue, path:'M840 457 H530'},
  {color:red, path:'M530 457 H214'},
  {color:red, path:'M214 457 V528 Q214 541 201 541 H158 Q146 541 146 529 V476 Q146 457 162 457 H214'}
];
const stageRoutes = [[0], [1], [2, 3], [4, 5], [6], [7], [8]];
const roomFor = [0, 1, 2, 3, 4, 5, 5];
const narrow = matchMedia('(max-width:40rem)');
const reduce = matchMedia('(prefers-reduced-motion:reduce)');

function box(x, y, w, h, fill, extra = '') {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
    '" fill="' + fill + '" class="outline" ' + extra + '/>';
}
function line(d, style = 'engrave') {
  return '<path d="' + d + '" class="' + style + '"/>';
}
function circle(x, y, radius, fill, extra = '') {
  return '<circle cx="' + x + '" cy="' + y + '" r="' + radius +
    '" fill="' + fill + '" class="outline" ' + extra + '/>';
}
function text(x, y, value, size = 18, extra = '') {
  return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" ' + extra + '>' + value + '</text>';
}
function worker(x, y, arm = 'M2 27 L16 20') {
  return '<g transform="translate(' + x + ' ' + y + ')">' +
    line('M-4 49 L-9 63 H-15 M6 49 L11 63 H18') +
    box(-7, 21, 16, 29, cream, 'rx="4"') + circle(2, 10, 8, rust) +
    line('M-9 10 H13 M-7 7 Q0 -1 9 6') + line(arm) + '</g>';
}
function conveyor(x, y, width) {
  const rollers = Array.from({length: Math.floor((width-10)/20)}, (_,i) => circle(x+11+i*20,y+7,3.6,rust)).join('');
  return box(x,y,width,14,cream,'rx="5"') + rollers +
    line('M'+(x+17)+' '+(y+14)+' v10 h-8 M'+(x+width-16)+' '+(y+14)+' v10 h8');
}

const machines = [
  () => box(56,62,127,84,teal,'rx="4"') + box(67,74,105,48,cream) +
    box(99,76,44,13,blue,'data-press=""') + line('M121 89 V103 M96 117 H146') +
    conveyor(46,126,148) + worker(213,82,'M-2 30 L-18 33'),
  () => box(61,66,117,75,teal,'rx="6"') + box(73,78,93,34,cream) +
    line('M84 94 H107 L120 85 H155 M107 94 L120 104 H155') +
    circle(96,125,5,gold) + circle(122,125,5,red) + circle(148,125,5,blue) +
    worker(201,83,'M-2 27 L-23 24'),
  () => box(34,69,80,45,teal,'rx="4"') + box(140,69,80,45,gold,'rx="4"') +
    text(56,99,'5m',21) + text(155,99,'15m',21) +
    conveyor(30,123,196) + worker(238,87,'M-2 24 L-17 32'),
  () => box(64,73,114,56,gold) +
    '<path d="M78 71 H164 L139 102 H103 Z" fill="'+cream+'" class="outline"/>' +
    line('M95 84 L120 95 L147 84 M120 102 V119') +
    conveyor(56,131,130) + worker(207,85,'M-1 22 L-18 36'),
  () => box(51,65,142,81,blue) + line('M61 93 H181 M61 119 H181') +
    box(68,74,45,17,cream) + box(122,100,48,17,cream) +
    text(81,87,'c1',14) + text(137,113,'c2',14) + worker(216,84,'M-2 28 L-22 36'),
  () => box(67,71,120,64,red,'rx="3"') + box(80,82,94,51,cream) +
    box(86,102,79,10,rust,'data-gate-arm=""') + circle(157,92,4,gold) +
    conveyor(63,131,126) + worker(208,83,'M-2 25 L-20 23')
];

function pipe({path,color}, i) {
  const attrs = 'd="' + path + '" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  return '<g class="pipe"><path '+attrs+' stroke="'+ink+'" stroke-width="17"/>' +
    '<path '+attrs+' stroke="'+color+'" stroke-width="11"/>' +
    '<path '+attrs+' stroke="'+cream+'" stroke-opacity=".38" stroke-width="2" transform="translate(-1 -1)"/>' +
    '<path '+attrs+' id="cargo-route-'+i+'" stroke="none"/></g>';
}
function room(n, i) {
  const plaque = box(5,2,245,36,'#dcc5a7','rx="3"') + box(0,-3,245,36,cream,'rx="3"') +
    '<g class="station-number">' + circle(22,15,11,cream,'data-plaque=""') +
    text(22,20,String(i+1).padStart(2,'0'),12,'text-anchor="middle" data-number=""') + '</g>' +
    text(41,21,n.name,19) + text(146,21,n.label,16);
  return '<g class="room" data-room="'+i+'" transform="translate('+n.x+' '+n.y+')">' +
    box(0,0,256,161,n.color,'data-room-frame=""') +
    box(9,13,238,140,cream) + box(10,144,236,10,rust) +
    line('M17 47 H239 M20 147 H235') + '<g class="machine">'+machines[i]()+'</g>' + plaque + '</g>';
}

scene.insertAdjacentHTML('beforeend',
  '<defs><pattern id="grain" width="21" height="13" patternUnits="userSpaceOnUse"><path d="M1 4h2M11 11h1M17 6h2" stroke="'+cream+'" opacity=".14" stroke-width=".65"/></pattern></defs>' +
  '<path d="M25 210 V86 L80 86 123 46 H920 L975 86 H1032 V552 L995 575 H78 L25 540 V232" fill="'+rust+'" class="outline"/>' +
  '<path d="M55 209 V104 H96 L134 71 H909 L963 104 H1004 V536 L981 547 H86 L55 520 V233" fill="'+ground+'" class="outline"/>' +
  '<path d="M25 210 H55 M25 232 H55" class="engrave"/>' +
  '<path d="M60 310 H1000 V327 H60 Z" fill="'+rust+'" class="outline"/>' +
  [105,188,270,352,434,516,598,680,762,844,926].map(x => circle(x,318,3,cream)).join('') +
  route.map(pipe).join('') + rooms.map(room).join('') +
  '<g transform="translate(92 43)"><path d="M28 -14 V0 M280 -14 V0" stroke="'+ink+'" stroke-width="4"/>' +
  box(5,6,310,45, '#dcc5a7','rx="3"') + box(0,0,310,45,cream,'rx="3"') +
  text(16,30,'LANGGRAPH',25) + text(180,29,'执行工厂',22) + '</g>' +
  '<rect x="50" y="82" width="955" height="463" fill="url(#grain)" pointer-events="none"/>' +
  '<g data-cargo aria-hidden="true"></g>'
);

const stepNav = find('step-nav');
const sceneRooms = [...scene.querySelectorAll('[data-room]')];
const cargo = find('cargo');
const routeElements = route.map((_,i) => scene.querySelector('#cargo-route-'+i));
const buttons = steps.map((step,i) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = String(i+1).padStart(2,'0') + ' ' + step.short;
  button.addEventListener('click', () => { stop(); show(i); });
  stepNav.append(button);
  return button;
});
let index = 0;
let follow = narrow.matches;
let timer;
let frame = 0;
let currentBox = wide;

function cameraBox(station) {
  if (!follow) return wide;
  const w = narrow.matches ? 440 : 550;
  const h = narrow.matches ? 300 : 300;
  const n = rooms[station];
  return [Math.max(0,Math.min(wide[2]-w,n.x+128-w/2)),
    Math.max(0,Math.min(wide[3]-h,n.y+83-h/2)), w, h];
}
function setView(box) {
  currentBox = box;
  scene.setAttribute('viewBox',box.join(' '));
}
function animation(animate) {
  cancelAnimationFrame(frame);
  cargo.replaceChildren();
  const station = sceneRooms[roomFor[index]];
  const machine = station.querySelector('.machine');
  const desired = cameraBox(roomFor[index]);
  if (!animate || reduce.matches) {
    setView(desired);
    machine.setAttribute('data-hit','');
    return;
  }
  const from = currentBox.slice();
  const segments = stageRoutes[index].map(i => {
    const icon = document.createElementNS(svgNS,'rect');
    icon.setAttribute('x','-10');
    icon.setAttribute('y','-7');
    icon.setAttribute('width','20');
    icon.setAttribute('height','14');
    icon.setAttribute('rx','2');
    icon.setAttribute('class','outline');
    icon.setAttribute('fill',route[i].color);
    cargo.append(icon);
    return {icon,path:routeElements[i],length:routeElements[i].getTotalLength()};
  });
  const started = performance.now();
  function travel(now) {
    const progress = Math.min(1,(now-started)/950);
    const cameraProgress = 1-Math.pow(1-progress,3);
    setView(desired.map((value,i) => from[i]+(value-from[i])*cameraProgress));
    for (const {icon,path,length} of segments) {
      const {x,y} = path.getPointAtLength(progress*length);
      icon.setAttribute('transform','translate('+x+' '+y+')');
    }
    if (progress < 1) frame = requestAnimationFrame(travel);
    else machine.setAttribute('data-hit','');
  }
  frame = requestAnimationFrame(travel);
}

function show(i, animate = true) {
  index = Math.max(0,Math.min(steps.length-1,i));
  const step = steps[index];
  const currentRoom = roomFor[index];
  const number = String(index+1).padStart(2,'0');
  for (const field of ['heading','detail','read','write','why','code']) {
    find(field).textContent = field === 'heading' ? step.title : step[field];
  }
  find('stamp').textContent = number;
  find('count').textContent = number + ' / ' + String(steps.length).padStart(2,'0');
  const source = find('source');
  source.href = sourceHref(step.file,step.line);
  source.textContent = step.file + ':' + step.line + ' · ' + step.symbol;
  find('prev').disabled = index === 0;
  find('next').disabled = index === steps.length-1;
  find('play').disabled = index === 5;
  const gateArm = scene.querySelector('[data-gate-arm]');
  gateArm.setAttribute('transform', index === 6 ? 'rotate(-34 88 107)' : '');
  find('next').textContent = index === 5 ? '恢复审批' : '下一步';
  for (const [j, button] of buttons.entries()) {
    if (j === index) button.setAttribute('aria-current','step');
    else button.removeAttribute('aria-current');
  }
  sceneRooms.forEach((station,j) => {
    station.toggleAttribute('data-active',j === currentRoom);
    station.toggleAttribute('data-visited',j <= currentRoom);
    station.querySelector('.machine').removeAttribute('data-hit');
    station.querySelector('[data-number]').textContent = j === 5 && index === 6 ? '07' : String(j+1).padStart(2,'0');
  });
  animation(animate);
}

function stop() {
  clearTimeout(timer);
  timer = undefined;
  find('play').textContent = '播放';
}
function play() {
  // Step 6 is a human handoff. Only the explicit resume button crosses it.
  if (timer) { stop(); return; }
  if (index === 5) return;
  if (index === steps.length-1) show(0);
  setFollow(true);
  find('play').textContent = '暂停';
  function advance() {
    show(index+1);
    if (index >= 5) stop();
    else timer = setTimeout(advance,1800);
  }
  timer = setTimeout(advance,1800);
}
function setFollow(value) {
  follow = value;
  const camera = find('camera');
  camera.textContent = follow ? '查看全图' : '跟随货物';
  camera.setAttribute('aria-pressed',String(follow));
  scene.toggleAttribute('data-follow',follow);
  animation(false);
}
find('prev').addEventListener('click', () => { stop(); show(index-1); });
find('next').addEventListener('click', () => { stop(); show(index+1); });
find('play').addEventListener('click', play);
find('camera').addEventListener('click', () => setFollow(!follow));
narrow.addEventListener('change',event => setFollow(event.matches));
show(0,false);
setFollow(follow);
