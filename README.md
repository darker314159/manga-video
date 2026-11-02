# Manga Video · 日漫分镜视频 Skill

> 用**纯代码**（HTML + SVG + Canvas）生成「日漫 · 漫画分镜」风格的真实 MP4 视频。
> 白纸黑墨、网点纸、斜切破框、速度线、手绘拟声词、动漫字幕——全部代码画出来，不靠素材拼。

支持**横屏 16:9 / 竖屏 9:16**，用于口播讲解、情感心理拆解、知识科普、故事反转、产品宣传片。

**当前版本：v1.1 抖音爆款优化版** —— 在原作者基础上加了 6 个实战模块（见下）。

> ⚠️ 这是**第三方作品**（作者 Dylan Deng，MIT），本仓库为符合许可条款的再分发 + 本地定制。
> 出处、上游 commit、修改情况见 [NOTICE.md](NOTICE.md)。**使用前请先读「已知问题」一节。**

---

## 🔥 v1.1 六大优化模块

| # | 模块 | 做什么 | 入口 |
|---|---|---|---|
| 1 | **画面品质升级** | 女性精修（长发/裙装/精致五官）、男性立体五官、表情扩到 **36 种** | `styles/CHARACTERS.md` |
| 2 | **water-koubo 文案二创** | 原始文案 → 抖音爆款口播改写 | `scripts/water-koubo.py` |
| 3 | **豆包 TTS 配音** | 火山引擎豆包语音，替代 edge-tts | `scripts/doubao-tts.py` |
| 4 | **自动在线部署** | 成片+封面传 Vercel / Netlify，返回下载链接 | `scripts/deploy.mjs` |
| 5 | **微信绿色气泡 UI** | 聊天气泡对话场景 | `promo/runtime/wechat-bubble.js` |
| 6 | **抖音爆款标题** | 按内容生成标题 | 见 `SKILL.md` |

配套：`scripts/pack-manga-video.mjs` 一键打包。

**这些脚本的密钥全部读环境变量，仓库内无任何硬编码 Key：**

```bash
export DOUBAO_API_KEY=...      # 豆包 TTS（另可设 DOUBAO_APPID / DOUBAO_TOKEN / DOUBAO_UID）
export VERCEL_TOKEN=...        # 部署到 Vercel（另可设 VERCEL_TEAM_ID）
export NETLIFY_AUTH_TOKEN=...  # 部署到 Netlify（另可设 NETLIFY_ACCOUNT_ID）
```

> 没设 token 时脚本会**优雅跳过**并提示，不会报错退出。

---

## 🎨 它长什么样

不是"套模板"，是**按你的文案现画**：

| 层 | 内容 |
|---|---|
| **场景背景** | 23 种内置日漫预设（咖啡馆、教室、夜街…）+ `P.scene()` 按文案现场生成任意场景 |
| **物品与意象** | 48+ 种内置预设 + `P.metaphor()` 生成心理比喻道具（选择权王冠、博弈天平、提线木偶、心理冰山…） |
| **角色** | 美型男女立绘系统 `R.cast` / `P.char`，36 种表情、姿势、换装 |
| **漫符** | 速度线、集中线、手绘拟声词（ドン / 轰 / 决）、圆框 / 爆炸吼叫 / 思考云 / 黑底旁白气泡 |
| **对话** | 微信绿色气泡 UI（v1.1 新增） |
| **声音** | 豆包 TTS / edge-tts 配音 + 变速剪辑 + BGM 闪避混音 + 日漫拟声词音效 |

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
- **Python 3**（`explainer/scripts/tts.py`、`scripts/doubao-tts.py` 配音）
- **ffmpeg**（合流、转码、混音）
- **Playwright / Chromium**（逐帧渲染）
- 网络（CDN 拉 GSAP / three.js / 字体；Node 走代理需 `NODE_USE_ENV_PROXY=1`，`core/scripts/net.mjs` 会自动处理）

## 🗂 目录

```
manga-video/
├── SKILL.md                    # 主说明：六大模块 + 铁律 + 角色/场景/物品 API + 工作流
├── core/
│   ├── runtime/core.js         # 运行时核心
│   └── scripts/                # render / bgm / music / sound / net + 5 套配乐 score
├── explainer/                  # 旁白驱动工作流（GUIDE + references + tts.py）
├── promo/                      # 节拍驱动工作流（GUIDE + kit/manga/promo 运行时）
│   └── runtime/                # + wechat-bubble.js / wechat-patch.js（微信气泡 UI）
├── scripts/                    # v1.1 新增：doubao-tts / water-koubo / deploy / pack
├── styles/manga/               # manga 风格规范（STYLE.md 26KB）+ 预览页 + 音画配置
├── references/                 # 环境说明、来源与许可
└── agents/openai.yaml          # ChatGPT / Codex 接口声明
```

## ⚠️ 已知问题（重要，使用前必读）

本包是**从 BB-Video 的 29 种风格里抽出的 `manga` 单风格版**，部分文档仍是多风格版原文。
v1.1 修好了 `SKILL.md` 里的跨风格引用，但**以下几处仍未修**：

| 位置 | 问题 |
|---|---|
| `explainer/GUIDE.md` | 仍指向 `../styles/whiteboard/STYLE.md`、`../styles/riso/STYLE.md`（不存在） |
| `promo/references/kit.md` | 仍指向 `styles/swiss/STYLE.md`、`styles/lumen/STYLE.md`（不存在） |
| `agents/openai.yaml` | 仍写着「BB Video 代码视频导演 / 29 种风格 / `$bb-video`」 |
| `SKILL.md` 第 48 行 | 让你先跑 `scripts/unpack.py`，但该文件不存在（已是解包版） |
| `references/source.md` | 提到 `explainer/runtime/katex/LICENSE`，该目录不存在 |

**本仓库只修了 `SKILL.md` 的跨风格引用（v1.1 定制），其余原样保留未改。**

> 实际使用时：只走 `styles/manga/`，忽略文档里其他风格的引用即可。

## 📜 许可

**MIT © 2026 Dylan Deng** —— 第三方作品，本仓库为再分发 + 本地定制，`LICENSE` 原封未改。

- 上游：[BubbleBrainBB/BB-Video](https://github.com/BubbleBrainBB/BB-Video)，commit `9acd130`
- v1.1 的定制改动（六大模块、新增脚本）按 MIT 要求在同 commit message 与 [NOTICE.md](NOTICE.md) 中标注
- CDN 依赖（GSAP / three.js / Matter.js / opentype.js / 字体）**许可各自独立**，
  尤其 GSAP 用的是 Standard License（免费版可商用，但不得用于竞品动画工具）
- 详见 [NOTICE.md](NOTICE.md)
