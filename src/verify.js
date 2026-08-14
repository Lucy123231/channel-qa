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

// 25. 奖励会谈强制检索：不得落入无匹配话术
r = ask('奖励会谈');
check('奖励会谈→章节目录', r.includes('经销商奖励会谈') && r.includes('签收奖励规则'), r.slice(0, 160));

// 26. 经销商会谈
r = ask('经销商会谈');
check('经销商会谈→章节目录', r.includes('经销商奖励会谈'), r.slice(0, 160));

// 27. 签收奖励
r = ask('签收奖励');
check('签收奖励→章节目录', r.includes('经销商奖励会谈'), r.slice(0, 160));

// 28. 会谈
r = ask('会谈');
check('会谈→章节目录', r.includes('经销商会谈相关规范'), r.slice(0, 160));

// 29. 奖励会谈章节内数字导航（条目暂无图文内容时应提示销管，绝不落入无匹配话术）
ask('奖励会谈');
r = ask('1');
check('章节内选1→空壳话术+销管', r.includes('暂无详细操作内容') && r.includes('吴宜谦') && !r.includes('渠道管理指南范围内'), r.slice(0, 160));

// 30. 无匹配话术含经销商奖励会谈
r = ask('今天中午吃什么');
check('无匹配话术→含奖励会谈', r.includes('经销商奖励会谈'), r.slice(0, 200));

// ===== 指令文档第7节：12条验收用例 =====
r = ask('开户需要准备哪些附件？');
check('验收1 开户附件→清单1-10+高亮', r.includes('附件1') && r.includes('附件10') && r.includes('骑缝章') && r.includes('预包装'), r.slice(0, 200));

r = ask('附件2是什么？');
check('验收2 附件2→营业执照', r.includes('营业执照'), r.slice(0, 120));

r = ask('附件9是什么？');
check('验收3 附件9→实际经营人情况说明', r.includes('实际经营人情况说明'), r.slice(0, 120));

r = ask('一码通办怎么用？');
check('验收4 一码通办→板块内容(非兜底)', r.includes('一码通办') && !r.includes('渠道管理指南范围内'), r.slice(0, 160));

r = ask('奖励会谈怎么操作？');
check('验收5 奖励会谈→空壳话术+转人工', r.includes('暂无详细操作内容') && r.includes('吴宜谦'), r.slice(0, 200));

r = ask('实控人信息怎么导入？');
check('验收6 实控人导入→TPM实控人档案', r.includes('实控人档案管理'), r.slice(0, 160));

r = ask('库存怎么调平？');
check('验收7 库存调平→虚拟终端方案', r.includes('虚拟终端'), r.slice(0, 160));

r = ask('合同签不了怎么办？');
check('验收8 合同签不了→常见问题五选', r.includes('没有收到签署消息') && r.includes('人脸识别失败'), r.slice(0, 200));

r = ask('拼车地址怎么申请？');
check('验收9 拼车地址→仓库专项指引', r.includes('拼车'), r.slice(0, 160));

r = ask('隐藏库是什么？');
check('验收10 隐藏库→飞检核心+考核高亮', r.includes('隐藏库') && r.includes('考核'), r.slice(0, 200));

r = ask('营业执照找不到了帮我看下');
check('验收11 同义词执照→附件2', r.includes('营业执照'), r.slice(0, 160));

r = ask('老板和法人不是同一个人，身份证要几张？');
check('验收12 附件3→两人身份证均需提供', r.includes('两人身份证均需提供'), r.slice(0, 200));

// 路由表补充：箱码/奖盖→交接，渠道激励→奖励会谈，失效→销户
r = ask('箱码转移怎么办');
check('路由 箱码→交接流程', r.includes('箱码'), r.slice(0, 160));
r = ask('渠道激励会谈');
check('路由 渠道激励→奖励会谈目录', r.includes('经销商奖励会谈'), r.slice(0, 160));
r = ask('经销商失效怎么操作');
check('路由 失效→销户', r.includes('销户'), r.slice(0, 160));
r = ask('一批商交接需要哪些资料');
check('路由 交接资料→不被开户附件劫持', r.includes('渠道调整报告') && !r.includes('开户必传附件清单'), r.slice(0, 200));

// ===== 模糊匹配引擎（错别字/同音字，L3编辑距离+L4拼音） =====
// 结果二选一均算通过：HIGH直接命中 或 MEDIUM候选确认框
r = ask('一码通版怎么用');
check('模糊 同音字一码通版→一码通办', r.includes('一码通办') && (r.includes('渠道数据导出路径') || r.includes('您是不是想问')), r.slice(0, 200));

r = ask('营业直照在不在');
check('模糊 错别字营业直照→营业执照', r.includes('营业执照') && r.includes('附件2'), r.slice(0, 200));

r = ask('奖励会弹怎么操作');
check('模糊 同音字奖励会弹→奖励会谈', r.includes('经销商奖励会谈') || (r.includes('您是不是想问') && r.includes('奖励会谈')), r.slice(0, 200));

r = ask('库存吊平');
check('模糊 同音字库存吊平→库存板块路由', r.includes('库存管理') || r.includes('虚拟终端') || (r.includes('您是不是想问') && r.includes('调平')), r.slice(0, 200));

r = ask('我要消户');
check('模糊 同音字消户→销户', r.includes('销户') || (r.includes('您是不是想问') && r.includes('销户')), r.slice(0, 200));

// 模糊层不得劫持无匹配兜底
r = ask('今天中午吃什么');
check('模糊 不劫持无匹配兜底', r.includes('这个问题暂不在渠道管理指南范围内哦~'), r.slice(0, 160));

// ===== 板块强制隔离：其他事项/一码通办 严禁调出开户附件内容 =====
r = ask('一批签收奖励需要哪些资料');
check('隔离 签收奖励资料→奖励会谈板块', r.includes('经销商奖励会谈') && !r.includes('开户必传附件清单') && !r.includes('骑缝章'), r.slice(0, 200));

r = ask('签收奖励的附件');
check('隔离 签收奖励的附件→不调开户附件', !r.includes('开户必传附件清单') && !r.includes('骑缝章'), r.slice(0, 200));

r = ask('一批商仓库需要哪些资料');
check('隔离 仓库资料→不调开户附件', !r.includes('开户必传附件清单'), r.slice(0, 200));

r = ask('数据看板需要什么资料');
check('隔离 数据看板资料→一码通办板块', r.includes('一码通办') && !r.includes('开户必传附件清单'), r.slice(0, 200));

r = ask('经销商会谈');
check('隔离 经销商会谈→不含开户内容', !r.includes('开户必传附件清单') && !r.includes('骑缝章') && !r.includes('一批商管理'), r.slice(0, 200));

r = ask('智慧雪花2.0');
check('隔离 智慧雪花→不含开户内容', !r.includes('开户必传附件清单') && !r.includes('骑缝章'), r.slice(0, 200));

console.log('\n===== 结果: ' + pass + ' PASS / ' + fail + ' FAIL =====');
process.exit(fail ? 1 : 0);
