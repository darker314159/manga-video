# Manga Video · 日漫分镜视频 Skill

> 用**纯代码**（HTML + SVG + Canvas）生成「日漫 · 漫画分镜」风格的真实 MP4 视频。
> 白纸黑墨、网点纸、斜切破框、速度线、手绘拟声词、动漫字幕——全部代码画出来，不靠素材拼。

支持**横屏 16:9 / 竖屏 9:16**，用于口播讲解、情感心理拆解、知识科普、故事反转、产品宣传片。

> ⚠️ 这是**第三方作品**（作者 Dylan Deng，MIT），本仓库为符合许可条款的再分发。
> 出处、上游 commit、修改情况见 [NOTICE.md](NOTICE.md)。**使用前请先读「已知问题」一节。**

---

## 🎨 它长什么样

不是"套模板"，是**按你的文案现画**：

| 层 | 内容 |
|---|---|
| **场景背景** | 23 种内置日漫预设（咖啡馆、教室、夜街…）+ `P.scene()` 按文案现场生成任意场景 |
| **物品与意象** | 48+ 种内置预设 + `P.metaphor()` 生成心理比喻道具（选择权王冠、博弈天平、提线木偶、心理冰山…） |
| **角色** | 美型男女立绘系统 `R.cast` / `P.char`，表情、姿势、换装 |
| **漫符** | 速度线、集中线、手绘拟声词（ドン / 轰 / 决）、圆框 / 爆炸吼叫 / 思考云 / 黑底旁白气泡 |
| **声音** | 配音 + 变速剪辑 + BGM 闪避混音 + 日漫拟声词音效 |

### 两条硬性铁律（`render.mjs --check` 会强制校验）

1. **具象场景背景覆盖率 ≥ 35%** —— 不许全程用抽象速度线/网点充当背景
2. **具象物品与心理意象覆盖率 ≥ 30%** —— 文案提到手机、密码、钻戒、合同，就得画出来

这两条是它跟"PPT 式动画"的分水岭：**每句话都要能画成画面**。

## 🔀 两套工作流

| | `explainer/` | `promo/` |
|---|---|---|
| 驱动 | **旁白驱动** | **节拍驱动** |
| 适用 | 讲解、走查、故事 | 宣传片、产品、无旁白 |
| 配音 | edge-tts | 代码合成音乐 + 音效 |
| 节奏 | 跟着旁白走 | 卡在音乐拍点上 |

两套都遵循同一个原则：**每一帧都是纯函数 `renderFrame(t)`**。
GSAP / Three.js / Matter.js / opentype.js 都能用，但**时钟永远是我们自己的**——
时间线预先建好并暂停，在帧函数里 seek 到 `t`；物理提前模拟好再读状态。
绝不让库自己跑时钟，也不依赖它的回调。这是逐帧渲染能对齐的唯一办法。

## 📦 安装

```bash
git clone https://github.com/darker314159/manga-video.git
cp -r manga-video ~/.agents/skills/
```

Claude Code / Codex / Cursor / WorkBuddy 会自动读 `SKILL.md` 并按描述触发。

## 🛠 环境要求

需要自备，**本 skill 不会自动安装**：

- **Node.js**（跑 `core/scripts/*.mjs` 渲染器）
- **Python 3**（`explainer/scripts/tts.py` 配音）
- **ffmpeg**（合流、转码、混音）
- **Playwright / Chromium**（逐帧渲染）
- 网络（CDN 拉 GSAP / three.js / 字体；Node 走代理需 `NODE_USE_ENV_PROXY=1`，`core/scripts/net.mjs` 会自动处理）

## 🗂 目录

```
manga-video/
├── SKILL.md                    # 主说明：核心铁律 + 场景/物品/角色 API + 工作流
├── core/
│   ├── runtime/core.js         # 运行时核心
│   └── scripts/                # render / bgm / music / sound / net + 5 套配乐 score
├── explainer/                  # 旁白驱动工作流（GUIDE + references + tts.py）
├── promo/                      # 节拍驱动工作流（GUIDE + kit/manga/promo 运行时）
├── styles/manga/               # manga 风格规范（STYLE.md 26KB）+ 预览页 + 音画配置
├── references/                 # 环境说明、来源与许可
└── agents/openai.yaml          # ChatGPT / Codex 接口声明
```

## ⚠️ 已知问题（重要，使用前必读）

本包是**从 BB-Video 的 29 种风格里抽出的 `manga` 单风格版**，但部分文档仍是多风格版原文：

- 文档引用了 **21 种本包不存在的风格**（`whiteboard`、`riso`、`swiss`…），AI 去读会失败
- `agents/openai.yaml` 仍写着「BB Video / 29 种风格 / `$bb-video`」
- `SKILL.md` 提到 `scripts/unpack.py`，但该文件不存在（已是解包版）
- `references/source.md` 提到 `explainer/runtime/katex/LICENSE`，该目录不存在

**这些问题全部来自上游，本仓库原样保留未修改。** 详细清单与影响见 [NOTICE.md](NOTICE.md)。

> 实际使用时：只走 `styles/manga/`，忽略文档里其他风格的引用即可。

## 📜 许可

**MIT © 2026 Dylan Deng** —— 第三方作品，本仓库仅再分发，`LICENSE` 原封未改。

- 上游：[BubbleBrainBB/BB-Video](https://github.com/BubbleBrainBB/BB-Video)，commit `9acd130`
- CDN 依赖（GSAP / three.js / Matter.js / opentype.js / 字体）**许可各自独立**，
  尤其 GSAP 用的是 Standard License（免费版可商用，但不得用于竞品动画工具）
- 详见 [NOTICE.md](NOTICE.md)
