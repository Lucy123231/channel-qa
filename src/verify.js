// 功能验证：模拟浏览器环境运行 index.html 中的 JS
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('../index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('FAIL: script not found'); process.exit(1); }
const code = m[1];

// ---- DOM stub ----
const captured = [];
function makeEl() {
  return { value: '', innerHTML: '', className: '', id: '', style: {}, onclick: null, onkeydown: null,
    appendChild() {}, remove() {}, scrollTop: 0, src: 'data:stub' };
}
const els = {};
global.document = {
  getElementById(id) { if (!els[id]) els[id] = makeEl(); return els[id]; },
  createElement() { return makeEl(); },
  body: makeEl()
};
global.localStorage = { getItem() { return null; }, setItem() {} };
global.confirm = () => true;
global.setTimeout = (fn) => { fn(); };
global.alert = () => {};

vm.runInThisContext(code);

// 拦截 am() 捕获 AI 回复
const origAm = global.am;
global.am = function (t, c) { captured.push({ t, c }); };

function ask(q) {
  captured.length = 0;
  els['inp'].value = q;
  global.send();
  return captured.map(x => x.c).join('\n===MSG===\n');
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}

// 1. 附件数字：附件9 必须命中附件库（严禁匹配流程条目）
let r = ask('附件9');
check('附件9→附件库', r.includes('实际经营人情况说明'), r.slice(0, 120));

// 2. 附件中文数字：附件九
r = ask('附件九');
check('附件九→附件库', r.includes('实际经营人情况说明'), r.slice(0, 120));

// 3. 附件2
r = ask('附件2');
check('附件2→营业执照', r.includes('营业执照'), r.slice(0, 120));

// 4. 纯数字双检：9 同时展示流程与附件
r = ask('9');
check('纯数字9→双检弹窗', r.includes('匹配到两类内容'), r.slice(0, 120));

// 5. 一码通办：板块名直达（板块名导航路径）
r = ask('一码通办');
check('一码通办→板块列表', r.includes('渠道数据导出路径') && r.includes('转移台账'), r.slice(0, 120));

// 6. 触发词：数据看板 必须调取章节，禁止无匹配话术
r = ask('数据看板');
check('数据看板→一码通办章节', r.includes('一码通办') && r.includes('渠道数据驱动'), r.slice(0, 120));

// 7. 触发词：智慧雪花2.0
r = ask('智慧雪花2.0');
check('智慧雪花2.0→章节', r.includes('渠道数据驱动'), r.slice(0, 120));

// 8. 触发词：渠道数据报表
r = ask('渠道数据报表');
check('渠道数据报表→章节', r.includes('渠道数据驱动'), r.slice(0, 120));

// 9. 触发词：数据报表
r = ask('数据报表');
check('数据报表→章节', r.includes('渠道数据驱动'), r.slice(0, 120));

// 10. 章节内数字导航：先问数据看板，再输入 1
ask('数据看板');
r = ask('1');
check('章节内选1→数据导出路径', r.includes('渠道数据导出路径') && r.includes('库存'), r.slice(0, 120));

// 11. 章节内数字导航：输入 3 → 台账（交接）
ask('数据看板');
r = ask('3');
check('章节内选3→转移台账', r.includes('转移台账') || r.includes('箱码转移'), r.slice(0, 120));

// 12. 子关键词直接检索：台账
r = ask('台账');
check('台账→交接内容直达', r.includes('箱码转移') || r.includes('一码通办相关转移详情'), r.slice(0, 120));

// 13. 子关键词：数据导出
r = ask('数据导出');
check('数据导出→库存报表路径', r.includes('数据导出路径'), r.slice(0, 120));

// 14. 无匹配新话术模板
r = ask('今天中午吃什么');
check('无匹配→新统一话术', r.includes('这个问题暂不在渠道管理指南范围内哦~') && r.includes('一码通办数据报表'), r.slice(0, 160));

// 15. 开户三选预判（原有功能）
r = ask('我要开户');
check('我要开户→三选', r.includes('一批新渠道开户') && r.includes('二批开户') && r.includes('管理开户'), r.slice(0, 120));

// 16. 盘库预判
r = ask('怎么盘库');
check('怎么盘库→身份二选', r.includes('公司业务员') && r.includes('经销商人员'), r.slice(0, 120));

// 17. 合同预判五选
r = ask('合同签不了');
check('合同签不了→五选', r.includes('没有收到签署消息') && r.includes('人脸识别失败') && r.includes('经办人信息错误'), r.slice(0, 120));

// 18. 新增地址预判
r = ask('我要新增地址');
check('我要新增地址→四选', r.includes('新开户维护首个地址') && r.includes('拼车地址'), r.slice(0, 120));

// 19. 二批开户隔离
r = ask('如何给二批商开户');
check('二批开户→只答二批', r.includes('二批') && !r.includes('一批新渠道开户'), r.slice(0, 150));

// 20. 一批开户不混二批
r = ask('怎么给一批商开户');
check('一批开户→开户板块', r.includes('一批商管理') || r.includes('开户'), r.slice(0, 120));

// 21. 会话记忆
ask('我要开户');
r = ask('我刚才问了几个问题');
check('会话记忆→历史问题数', r.includes('问了'), r.slice(0, 120));

// 22. 合同关键词→吴宜谦联系人兜底
r = ask('人脸识别失败怎么办');
check('合同→吴宜谦兜底', r.includes('吴宜谦'), r.slice(0, 200));

// 22b. 合同签不上→五选（同义转换后仍命中预判）
r = ask('合同签不上怎么办');
check('合同签不上→五选', r.includes('没有收到签署消息') && r.includes('合同作废后无法重新签署'), r.slice(0, 200));

// 22c. 待选状态输入新问题应正常处理（_bz 中断恢复）
ask('我要开户');
r = ask('怎么盘库');
check('待选时新问题→盘库二选', r.includes('公司业务员') && r.includes('经销商人员'), r.slice(0, 200));

// 23. 特约开户转二批
r = ask('特约经销商怎么开户');
check('特约开户→转二批指引', r.includes('特约开户已取消'), r.slice(0, 150));

// 24. 附件碎片词：骑缝章
r = ask('骑缝章');
check('骑缝章→附件1+红线', r.includes('骑缝章'), r.slice(0, 120));

console.log('\n===== 结果: ' + pass + ' PASS / ' + fail + ' FAIL =====');
process.exit(fail ? 1 : 0);
