# 渠道管理智能问答 - 维护指南

## 快速开始（5分钟上手）

```bash
# 1. 安装 Python 依赖（只需一次）
pip install -r requirements.txt

# 2. 编辑知识库（改文字、加截图都在这里）
#    用文本编辑器打开 kb.json

# 3. 替换/新增截图
#    把截图放到 images/ 文件夹

# 4. 构建
python build.py

# 5. 输出文件
#    渠道管理智能问答-最终版.html ← 双击即可打开使用
#    index.html                    ← 用于 GitHub Pages 发布
```

## 发布到网址（让更新同步）

网址：https://lucy123231.github.io/channel-qa/

```bash
# 构建完成后推送
git add . && git commit -m "更新内容" && git push

# 等1-2分钟，网址自动刷新
```

## 别人也想发布更新怎么办

别需要 GitHub 仓库写权限。仓库管理员在 GitHub 上操作：

1. 打开 https://github.com/Lucy123231/channel-qa/settings/access
2. 点击 "Add people"
3. 输入对方的 GitHub 用户名
4. 选择 "Write" 权限

对方获得权限后，克隆仓库即可发布：

```bash
git clone https://github.com/Lucy123231/channel-qa.git
cd channel-qa/source

# 编辑 kb.json → python build.py → git push
# 网址自动同步 ✓
```

## 文件结构

```
source/
├── README.md       ← 本说明文件
├── requirements.txt ← Python 依赖
├── kb.json         ← 知识库数据（日常只改这个）
├── template.html    ← 页面模板（CSS/JS，一般不改）
├── images/         ← 150 张截图（中文文件名）
└── build.py        ← 构建脚本
```

## kb.json 结构

```json
{
  "开户": {
    "t": "一、一批商管理——（一）开户",
    "intro": "入口：<a href='https://tpm.crb.cn/...'>链接</a>",
    "s": [
      {
        "title": "步骤标题",
        "img": "1.1.png",
        "tx": "说明文字（\\n 换行）",
        "w": "警告文字（黄底）"
      },
      {
        "title": "多图步骤",
        "imgs": ["1.2.png", "1.3.png", "1.4.png"]
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `t` | string | 板块大标题 |
| `intro` | string | 顶部简介，支持 `<a href='...'>` HTML |
| `s` | array | 步骤数组 |
| `s[].title` | string | 步骤标题 |
| `s[].img` | string | 单张图片（images/ 中的文件名） |
| `s[].imgs` | array | 多张图片（数组） |
| `s[].tx` | string | 说明文字，`\\n` = 换行 |
| `s[].w` | string | 警告提示（黄底红边） |

## 常见操作

### 修改文字
→ 编辑 `kb.json` 里的 `title`、`tx`、`w` → 运行 `python build.py`

### 添加新截图
→ 把图放到 `images/` → 在对应步骤加 `"img": "文件名.png"` → 运行 `python build.py`

### 添加新板块
→ 在 `kb.json` 加新键 → 在 `template.html` 里搜 `var p={` 加关键词匹配 → 运行 `python build.py`

### 修改页面样式/功能
→ 编辑 `template.html` 里的 `<style>` 和 `<script>` 部分

## 依赖

- Python 3.8+
- Pillow（图片压缩）：`pip install Pillow`
