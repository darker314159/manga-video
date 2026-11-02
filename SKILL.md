---
name: manga-video
description: 专用于制作「日漫 · 漫画分镜（manga）」风格的抖音爆款短视频（口播讲解、情感/心理拆解、知识科普、故事反转、产品宣传片）。支持横屏 16:9 与竖屏 9:16，内置精修美型男女角色立绘系统（女性默认长发+裙子、男性立体五官）、36+ 种丰富表情、23 种同风格日漫场景背景、48+ 种具象物品与心理比喻道具，支持微信绿色气泡对话 UI、豆包 TTS 配音（默认「黑猫侦探社咪仔」）、water-koubo 文案二创改写、自动在线部署 + 可下载链接、以及抖音爆款标题生成。面向 18-35 岁男性用户。用户提到日漫视频、漫画分镜视频、manga-video、把文案/音频做成日漫风视频时使用。
---

# Manga Video · 日漫分镜视频独立技能（抖音爆款优化版）

用纯代码（HTML + SVG + Canvas）制作真实可播放的 **日漫 · 漫画分镜（`manga`）** MP4 视频：白纸黑墨、网点纸（Screentone）、斜切与破框分镜、速度线与集中线、手绘拟声词（ドン / 轰 / 决）、圆框/爆炸吼叫/思考云/黑底旁白气泡，**以及微信绿色气泡对话 UI**；美型男女主角立绘（女性：长发/双马尾/裙子/精致五官；男性：立体五官/帅气发型），**36+ 种丰富表情**；并**随文案内容同步绘制的日漫场景背景与具象物品/心理意象**。

## 🔥 六大核心优化模块

### 模块一：画面品质升级
- 女性角色默认精修美型特征：**长发（拖地/及腰/锁骨/波波头可选）、多层渐变发色高光、精致小脸 V 形下颌线、大眼睫毛、薄唇微笑、身体曲线比例**
- 女性默认穿着：**连衣裙、JK 制服、职业套裙、运动装等可配置**
- 男性角色默认精修：**立体眉骨、V 形下颌、薄唇、帅气发型（背头/碎发/狼尾/锅盖可配）**
- 角色表情扩展至 **36 种**（详见 `styles/CHARACTERS.md` §5）

### 模块二：water-koubo 文案二创改写
- 输入原始文案后，先调用 water-koubo（https://github.com/waterbrojx/water-koubo）进行二创改写
- 最终输出一份**抖音爆款短视频文案**，目标受众为 **18-35 岁男性用户**
- 调用方式：见 `scripts/water-koubo.py`

### 模块三：豆包 TTS 配音
- 默认使用豆包 TTS（https://docs.volcengine.com/docs/DoubaoVoice/audio-generation-http?lang=zh）
- **默认音色「黑猫侦探社咪仔」**（`zhiyue_male` / `doubao_male_blackcat`）
- 可通过 `script.json` 中 `voice` 字段覆盖默认音色
- 生成文件：`audio/narration.m4a`（与旧 edge-tts 兼容）

### 模块四：自动在线部署
- 渲染完成后，自动调用部署脚本 `scripts/deploy.mjs`
- 部署到 Vercel 静态托管（或用户指定的平台）
- 最终输出一个**可直接点击的下载链接**

### 模块五：微信绿色气泡对话 UI
- 当画面中出现对话内容时，优先使用微信风格绿色气泡（而不是传统日漫圆框气泡）
- 右侧绿色气泡（发送者）：`#95EC69` 绿底黑字
- 左侧灰色气泡（接收者）：`#FFFFFF` 白底黑字
- 气泡下方带发送时间（如「下午 3:24」）
- 实现见 `promo/runtime/wechat-bubble.js`，在 `index.html` 中引入即可

### 模块六：抖音爆款标题生成
- 视频渲染完成后，AI 自动生成 5 个备选抖音爆款标题
- 风格特点：悬念感强、数字化、情绪化、反问句、制造焦虑或爽感
- 示例：「那个删掉你所有联系方式的女人，后来怎么样了？」

---

- **首次运行解压运行时**：在运行任何 `node` / `python3` 脚本前，若技能目录下存在 `scripts/unpack.py`，先在技能根目录执行一次 `python3 scripts/unpack.py`，会自动将 `assets/runtime_bundle.json` 中的 `.mjs` / `.js` 脚本完整还原到技能目录。

---

## 1. 完整工作流（新增水寇波改写 → 豆包TTS → 渲染 → 部署）

```
1. 收到原始文案
   ↓
2. [可选] 调用 water-koubo 二创改写 → 输出抖音爆款文案
   ↓
3. 编写 script.json（含 voice 字段，默认黑豆包TTS咪仔音色）
   ↓
4. 运行 python3 scripts/doubao-tts.py <project_dir> 生成 audio/narration.m4a
   ↓
5. 编写 brief.md（画内所有文字）+ index.html（分镜脚本）
   ↓
6. 运行 node promo/scripts/render.mjs <project_dir> --check --no-motion --no-font-cache
   ↓
7. 运行 node promo/scripts/render.mjs <project_dir> --audio --no-font-cache --bgm "<bgm.mp3>" --bgm-volume 0.18
   ↓
8. 渲染成片：node promo/scripts/render.mjs <project_dir>
   ↓
9. 运行 node scripts/deploy.mjs <project_dir> → 输出可下载链接
   ↓
10. 输出 5 个抖音爆款标题
```

---

## 2. 核心铁律：按文案生成同风格场景背景与物品/意象

制作日漫分镜视频时，**严禁全程只用抽象速度线、集中线或纯色网点充当背景，也严禁只画大头人物说话而不画文案里的物品与比喻**。必须遵守以下双层可视化规范（`render.mjs --check` 会自动强制校验）：

1. **具象场景背景覆盖率 ≥ 35%（`P.bg` / `P.scene`）**
2. **具象物品与心理意象覆盖率 ≥ 30%（`P.prop` / `P.metaphor` / `P.chart` / `P.draw`）**

（详见原版 SKILL.md 第 1-3 节，保持不变）

---

## 3. 美型角色系统升级（`R.cast` & `P.char`）

### 3.1 女性角色精修规范

女性角色**必须**具备以下特征之一（优先全部具备）：
- **头发**：长发（及腰/拖地）默认，或精致锁骨发/波波头；必须有两缕鬓发垂于脸颊两侧；发丝带高光（angel halo）
- **眼睛**：大眼造型（`eyes: 'round'` 或 `'sharp'`），多层星眸高光 + 外翘睫毛
- **嘴唇**：薄唇自然弧度，微笑时嘴角上扬
- **脸型**：V 形小脸（`jaw: 0.88`），对称微侧脸（`turn: 0.14`）
- **服装**：默认连衣裙（`outfit: { skirt: true, top: 'white', coat: false }`）或 JK 制服
- **妆容**：`blush: true`（两颊红晕），`mole: true`（可选美人痣）

### 3.2 男性角色精修规范

男性角色**必须**具备以下特征：
- **头发**：帅气发型（`hair: 'spiky'` 或 `'short'`），顶部蓬松，两侧收紧；必须有发际线细节
- **眼睛**：锐利有神的眼睛（`eyes: 'sharp'`），浓眉（`brows: 'thick'`）
- **下颌**：清晰的 V 形下颌线（`jaw: 0.92`）
- **鼻子**：挺拔鼻翼（通过面部光影体现）
- **服装**：外套/衬衫/西装（`coat: true` 或 `collar: true`）

### 3.3 36 种表情系统

```js
// 基础表情
'calm' | 'smile' | 'grin' | 'smug' | 'determined' | 'angry' | 'shout' | 'grit'
// 情绪类
'shock' | 'scared' | 'pain' | 'tired' | 'sad' | 'sleep' | 'closed'
// 新增丰富表情
'nervous' | 'flustered' | 'embarrassed' | 'suspicious' | 'thinking'
'yearning' | 'longing' | 'disdain' | 'proud' | 'teasing' | 'melancholy'
'zealous' | 'confused' | 'ashamed' | 'relieved' | 'surprised_happy'
'stern' | 'cold' | 'gentle' | 'playful' | 'nostalgic' | 'defiant'
```

每种表情在眼睛（眼睑高度/瞳孔大小/高光）、眉毛（角度/密度）、嘴巴（弧度/开合）三个维度都有精细变化。

### 3.4 角色定义示例

```js
R.cast({
  '男主·陆沉': {
    proportions: 'hero', build: 'slim', jaw: 0.92, turn: 0.14,
    hair: 'spiky', spikes: 7, tall: [2, 4, 6], hairTone: 'black',
    eyes: 'sharp', brows: 'thick',
    outfit: { top: 'white', bottom: 'black', coat: 'black', collar: true, shoes: 'black' },
    expression: 'default_expressions'  // 启用全部 36 种表情
  },
  '女主·苏晚': {
    proportions: 'hero', build: 'slim', jaw: 0.88, turn: 0.14,
    hair: 'long', hairLength: 'waist', hairTone: 'black',
    // 鬓发细节：两侧各一绺垂落
    sideLocks: true,
    eyes: 'round', brows: 'thin', blush: true,
    // 默认穿连衣裙
    outfit: { top: 'white', skirt: true, skirtLength: 'knee', collar: true, shoes: 'black' },
    expression: 'default_expressions'
  }
});
```

---

## 4. 微信绿色气泡对话 UI

当文案包含角色对话（`"xxx说：..."` 或引号包裹的内容）时，使用微信风格气泡而非传统日漫圆框：

```js
// 在 index.html 的 P 面板中调用（需要先引入 wechat-bubble.js）
P.wechatBubble('text', {
  x: 0.72,        // 右侧（发送者视角）
  y: 0.35,
  size: 0.22,
  receiver: '女主·苏晚',
  time: '下午 3:24',
  at: s('l3'),
  until: s('l4') - 0.2
});
// 左侧气泡（灰色，接收者视角）
P.wechatBubble('text', {
  x: 0.28,
  y: 0.35,
  size: 0.22,
  receiver: '男主·陆沉',
  time: '下午 3:25',
  at: s('l4'),
  until: s('l5') - 0.2,
  align: 'left'   // 左侧灰色气泡
});
```

> 详见 `promo/runtime/wechat-bubble.js` 的完整 API。

---

## 5. 豆包 TTS 配音集成

```bash
# 替换原有的 edge-tts，使用豆包 TTS
python3 scripts/doubao-tts.py <project_dir>
```

默认配置（`script.json`）：
```json
{
  "voice": "doubao_male_blackcat",
  "rate": "+0%",
  "pitch": "+0Hz"
}
```

可选音色列表（部分）：
| ID | 名称 | 适用场景 |
|---|---|---|
| `doubao_male_blackcat` | 黑猫侦探社咪仔 | 悬疑/故事类（默认） |
| `doubao_male_chenchen` | 晨晨 | 轻松日常 |
| `doubao_female_shaobo` | 莎宝 | 甜美风格 |
| `doubao_male_jingjing` | 京京 | 新闻播报 |
| `doubao_female_xiaobei` | 小北 | 知性讲解 |

---

## 6. water-koubo 文案二创改写

```bash
# 输入原始文案，输出抖音爆款改写版本
python3 scripts/water-koubo.py "原始文案内容" --target-age "18-35岁男性" --platform "douyin"
```

改写原则：
- 开头 3 秒必须抓住注意力（悬念/冲突/数字）
- 中间段落保持节奏，每 15 秒一个信息点
- 结尾要有金句/反转/情绪高点
- 语言口语化、短句为主、适当使用网络热词

---

## 7. 自动在线部署

```bash
# 部署完成后输出可下载链接
node scripts/deploy.mjs <project_dir>
```

部署流程：
1. 将 `out/video-*.mp4` 和 `out/cover-*.png` 上传至 Vercel 静态托管
2. 创建临时预览页面展示视频
3. 输出直链下载地址（7 天有效）
4. 同时输出 5 个抖音爆款标题建议

---

## 8. 抖音爆款标题生成

渲染完成后，AI 根据视频内容自动生成 5 个候选标题：

**标题公式模板：**
1. 悬念式：「那个____的人，后来怎么样了？」
2. 数字式：「____个男人都在偷偷做这件事」
3. 反差式：「以为____，其实____」
4. 共鸣式：「如果你也____，请一定要看完」
5. 情绪式：「看完这条视频，我沉默了很久」

---

## 9. 精简优化说明（已移除的内容）

为适配抖音爆款短视频的流畅节奏，以下传统漫画元素已被移除：

| 已移除内容 | 说明 |
|---|---|
| 第一话 / 第二话 / 第三话 章节标签 | 短视频不宜分集，连续观看更友好 |
| 结尾「完」字印章页面 | 抖音不需要漫画式收束，直接收尾更流畅 |
| 资料来源 / 出处展示 | 用户更关注内容本身，来源影响沉浸感 |

> 如需恢复某功能，可通过 `opt.chapters` 或 `R.end()` 参数手动传入。

---

## 10. 标准制作与渲染工作流

1. **准备音频**（`audio/narration.m4a` + `timeline.json` + `timeline.js`）：
   - 若用户未提供音频：编写 `script.json` 并运行 `python3 scripts/doubao-tts.py <project_dir>`
   - 若有现成音频：用 `ffmpeg` 切分并拼接，写入时间轴
2. **编写 `brief.md` 与 `index.html`**：
   - 所有画内文字写入 `brief.md`
   - 对话使用 `P.wechatBubble()` 而非 `P.balloon()`
   - 确保场景背景 ≥ 35%、物品/意象 ≥ 30%
3. **自动检查**：`node promo/scripts/render.mjs <project_dir> --check --no-motion --no-font-cache`
4. **合成混音与渲染**：`node promo/scripts/render.mjs <project_dir> --audio --bgm "<bgm.mp3>" --bgm-volume 0.18`
5. **部署 + 输出链接**：`node scripts/deploy.mjs <project_dir>`
6. **输出抖音爆款标题**
