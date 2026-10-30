# 出处与致谢 / Attribution

本仓库收录的 `manga-video` skill 是**第三方作品**，不是黑蜂情感 AI 原创。
本仓库为**符合 MIT 条款的再分发**，著作权归原作者所有。

## 原作者

| 项 | 内容 |
|---|---|
| 作者 | **Dylan Deng** |
| 许可 | **MIT**（© 2026 Dylan Deng，完整文本见根目录 [`LICENSE`](LICENSE)） |
| 上游项目 | [BubbleBrainBB/BB-Video](https://github.com/BubbleBrainBB/BB-Video) |
| 导入版本 | commit `9acd130f6ac47637a54f515e8b33bdc4a5439645` |
| 原始技能目录 | `skills/bb-video/` |
| 核对日期 | 2026-10-30（北京时间） |

## 本仓库做了什么

**未修改任何代码逻辑**，47 个文件原样收录。上游已完成的改编包括：

- 中文触发说明与执行入口
- 环境命令与来源说明
- UI 元数据
- 删除 lumen 无旁白宣传模板中未使用、且初始化器不会创建的 `timeline.js` 引用
- 保留上游完整引擎、模板、风格与详细指南

本仓库仅新增本文件与 `README.md`，**未改动 `LICENSE` 一字**。

## MIT 义务履行情况

MIT 许可要求再分发时保留版权声明与许可文本：

- ✅ `LICENSE` 原样保留，署名 Dylan Deng
- ✅ 本文件明确标注原作者与上游地址
- ✅ 未以本仓库名义宣称著作权

## 第三方依赖与素材

本 skill 运行时会从 CDN 加载以下库/字体，**它们的许可独立于本 skill，需各自遵守**：

| 依赖 | 用途 | 许可 |
|---|---|---|
| `gsap@3.13.0` | 动画引擎 | GSAP Standard License（免费版可商用，禁用于竞品动画工具） |
| `three@0.170.0` | 3D 渲染 | MIT |
| `matter-js@0.20.0` | 物理 | MIT |
| `opentype.js@1.3.4` | 字体解析 | MIT |
| `@fontsource/*`（Dela Gothic One / 站酷庆科黄油体 / Noto Sans SC / Noto Serif SC） | 日漫风字体 | SIL OFL 1.1 |

> 参考：[`references/source.md`](references/source.md) 上游说明原文。

## ⚠️ 已知问题（原样保留，未擅自修改）

本包是**从 BB-Video 全部 29 种风格中抽出的 `manga` 单风格版本**，但部分文档仍是上游多风格版的原文，
导致以下引用对不上。这些问题**全部来自上游，不是本仓库引入**，本仓库照实记录、不做静默修改：

### 1. 文档引用了 21 种本包不存在的风格（影响最大）

本包 `styles/` 下**只有 `manga`**，但文档里引用了这些不存在目录的 `STYLE.md`：

```
blueprint  chat    collage  dossier  filmroom  ink      isometric  launch
lumen      map     mystery  newsreel pixel     riso     shadow     storybook
swiss      tapestry trailer  whiteboard
```

受影响文件：`explainer/GUIDE.md`（明确写 `../styles/whiteboard/STYLE.md`、`../styles/riso/STYLE.md`）、
`promo/GUIDE.md`、`SKILL.md` 等。**AI 按文档去读这些文件会失败。**

### 2. `agents/openai.yaml` 元数据陈旧

仍写着 `display_name: BB Video 代码视频导演`、`short_description: 29 种风格…`、
`default_prompt: 使用 $bb-video` —— 但本包实际只含 `manga` 一种风格，技能名是 `manga-video`。

### 3. `SKILL.md` 含死引用

开头写「若技能目录下存在 `scripts/unpack.py`，先执行 `python3 scripts/unpack.py`」，
但本包内**既无 `scripts/unpack.py` 也无 `assets/runtime_bundle.json`**（已是解包版），该指示恒不成立。

### 4. `references/source.md` 部分条目失效

- 声称「风格：29 种」——本包只有 1 种
- 提到 `explainer/runtime/katex/LICENSE` —— 本包内无该目录

> 若需要，可后续提交一个「manga 单风格适配」补丁：修正上述元数据、把多风格引用改写为 `styles/manga/`、
> 删除死引用。该补丁会构成对上游的修改，需按 MIT 要求在改动说明中标注。


## 免责声明

- 本仓库不产出成品内容，使用者对生成内容的合规性负责。
- 运行时需自备 Node.js、Python、ffmpeg 与 Playwright/Chromium。
- 本 skill 不自动安装依赖；来源说明明确要求「不要无条件执行远程脚本」。
