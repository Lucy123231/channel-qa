# 渠道管理智能问答 - 维护指南

## 快速开始

```bash
# 1. 编辑知识库（改文字、加截图、改链接都在这里）
#    用任意文本编辑器打开 kb.json

# 2. 替换/新增截图
#    把新截图放到 images/ 文件夹

# 3. 构建
python build.py

# 4. 输出文件在上级目录：
#    渠道管理智能问答-最终版.html（自用）
#    index.html（GitHub Pages网址用）
```

## 文件结构

```
source/
├── README.md       ← 本说明文件
├── kb.json         ← 知识库数据（日常维护就改这个）
├── template.html    ← 页面模板（CSS/JS/HTML结构，一般不需要改）
├── images/         ← 截图源文件（中文命名，如 "1.1.png" "附件2 营业执照.jpeg"）
├── build.py        ← 构建脚本（运行它生成最终HTML）
└── extract_template.py  ← 一次性用的提取脚本（不需要动）
```

## kb.json 结构说明

每个板块是一个对象，包含：

```json
{
  "开户": {
    "t": "标题（显示在回答顶部）",
    "intro": "简介（可选，支持HTML链接）",
    "s": [
      {
        "title": "步骤标题",
        "img": "单张图片文件名",
        "imgs": ["多张图片文件名数组"],
        "tx": "说明文字（支持\\n换行）",
        "w": "警告文字（黄底提示）"
      }
    ]
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `t` | string | 板块标题 |
| `intro` | string | 顶部简介，支持 `<a href='...'>链接</a>` |
| `s` | array | 步骤列表 |
| `s[].title` | string | 步骤标题 |
| `s[].img` | string | 单张图片文件名（在 images/ 中） |
| `s[].imgs` | array | 多张图片文件名列表 |
| `s[].tx` | string | 说明文字，`\n` 换行 |
| `s[].w` | string | 警告提示文字（黄底） |

## 常规维护操作

### 修改文字
1. 打开 `kb.json`
2. 找到对应板块，修改 `title`、`tx`、`w` 等字段
3. 运行 `python build.py`

### 添加新截图
1. 把截图放到 `images/` 文件夹
2. 在 `kb.json` 对应步骤里加 `"img": "你的文件名.png"`
3. 运行 `python build.py`

### 添加新板块
1. 在 `kb.json` 里添加新键值对
2. 在 `template.html` 的 `var p={...}` 匹配表里加对应的关键词（搜索 `// 匹配` 找到位置）
3. 运行 `python build.py`

### 修改页面样式
编辑 `template.html` 里 `<style>...</style>` 部分的CSS。

## 图片命名规则

图片编号前缀代表文档位置：
- `0` → 前言/目录
- `1.x` → 一批商管理
- `3.x` → 经销商信息变更
- `5.x` → 常见问题
- `6.x-7.x` → 二批商管理
- `8.x-12.x` → 合同/推送函
- `13.x-15.x` → 库存管理
- `16.x-28.x` → 仓库地址

建议保持这个编号体系，便于对应文档位置。

## 依赖

- Python 3 + Pillow（图片压缩）：`pip install Pillow`
- 或直接安装：`pip install -r requirements.txt`
