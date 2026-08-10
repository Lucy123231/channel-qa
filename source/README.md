# 渠道管理智能问答 — 维护交接文档

## 文件结构

```
渠道管理/
├── index.html           ← 最终产物（给用户用的网页，不要手动改）
├── .nojekyll            ← 空文件，GitHub Pages 配置用（不要删）
├── .gitignore           ← Git 忽略规则
└── source/              ← 维护工作区（日常在这里操作）
    ├── README.md        ← 本文件
    ├── requirements.txt ← Python 依赖
    ├── build.py         ← 构建脚本（把 kb.json + 图片 → index.html）
    ├── kb.json          ← 知识库数据（日常主要改这个！）
    ├── template.html    ← 页面模板（HTML/CSS/JS，改功能才动）
    └── images/          ← 147 张原始截图（中文文件名）
```

## 快速上手（3步）

```bash
# 1. 安装依赖（只需一次）
pip install Pillow

# 2. 编辑知识库（改 kb.json）
#    用 VS Code / 记事本打开 source/kb.json

# 3. 构建 + 发布
cd source
python build.py          # 生成 ../index.html
cd ..
git add . && git commit -m "更新内容" && git push
```

网址 `https://lucy123231.github.io/channel-qa/` 等 1-2 分钟自动刷新。

## kb.json 结构说明

```json
{
  "开户": {
    "t": "一、一批商管理——（一）开户",
    "intro": "入口：<a href='https://tpm.crb.cn/...'>链接</a>",
    "kw": ["开户","新开","新增经销商","开新户头","怎么开户"],
    "s": [
      {
        "title": "1、户头类型介绍",
        "tx": "术语和缩略语\n根户头：...",
        "img": "1.0.png",
        "kw": ["户头","根户头","主户头"]
      },
      {
        "title": "附件填写要求",
        "imgs": ["1.5附件1-1.png", "1.6附件1-2.png"],
        "w": "若基本信息未同步，请先补充主户信息"
      }
    ]
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `t` | string | 是 | 板块大标题 |
| `intro` | string | 否 | 顶部简介，支持 `<a href='...'>` HTML |
| `kw` | array | **建议** | 分类关键词，用于模糊匹配和问题排序，越多越好 |
| `s` | array | 是 | 步骤数组 |
| `s[].title` | string | 否 | 步骤标题（无标题则只显示正文和图片） |
| `s[].tx` | string | 否 | 正文，`\n` 换行，可含 `<a href='...'>` 超链接 |
| `s[].img` | string | 否 | 单张图片文件名（对应 images/ 中的文件） |
| `s[].imgs` | array | 否 | 多张图片文件名数组 |
| `s[].w` | string | 否 | 警告/注意事项（黄底显示） |
| `s[].kw` | array | 否 | 步骤级关键词 |

## 常见维护操作

### 修改文字内容
编辑 `kb.json` 里的 `title`、`tx`、`w` → 运行 `python build.py` → 推送

### 增加/替换截图
1. 把新图片放到 `source/images/` 
2. 在 `kb.json` 对应步骤里引用文件名
3. `python build.py` → 推送

### 增加新分类/板块
1. 在 `kb.json` 添加新键和内容
2. 在 `template.html` 的 `p` 对象（约第81行，`var p={` ）里加对应关键词
3. `python build.py` → 推送

### 增加关键词（提高匹配准确率）
编辑 `kb.json` 中对应分类的 `kw` 数组，加近义词、口语词、错别字。**不用改 template.html**。

### 修改页面样式
编辑 `template.html` 的 `<style>` 部分（约第7-54行）

### 修改 JS 功能
编辑 `template.html` 的 `<script>` 部分。主要函数：

| 函数 | 作用 |
|------|------|
| `mq(q)` | 关键词匹配，返回分类名 |
| `ba(e)` | 构建回答 HTML（含截图） |
| `gi(n)` | 按文件名查找隐藏图片的 base64 |
| `send()` | 核心流程：分词 → 匹配 → 回答/兜底 |
| `sq(q)` | 多问题拆分（未使用，预留） |

### AI 兜底配置
`template.html` 第 77 行 `var _ak='sk-...'` 是硅基流动 API 密钥。知识库匹配不到时自动调 DeepSeek-V3 生成回答。更换密钥或更换模型改这里。

## 依赖

- Python 3.8+
- Pillow：`pip install Pillow`

## 发布网址

- 正式：`https://lucy123231.github.io/channel-qa/`
- GitHub Pages 自动从 main 分支根目录的 `index.html` 部署
- 每次 `git push` 后 1-2 分钟生效
- `.nojekyll` 文件必须保留（跳过 Jekyll 处理，否则大文件部署失败）

## 给别人维护权限

仓库管理员在 GitHub 上：Settings → Collaborators → Add people → 输入对方 GitHub 用户名 → Write 权限。

对方拿到权限后：
```bash
git clone https://github.com/Lucy123231/channel-qa.git
cd channel-qa/source
pip install Pillow
# 编辑 kb.json → python build.py → git push
```
