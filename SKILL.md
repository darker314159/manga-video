---
name: manga-video
description: 专用于制作「日漫 · 漫画分镜（manga）」风格的真实 MP4 视频（口播讲解、情感/心理拆解、知识科普、故事反转、产品宣传片）。支持横屏 16:9 与竖屏 9:16，内置美型男女角色立绘系统、23 种同风格日漫场景背景、48+ 种具象物品与心理比喻道具，并支持根据文案内容实时程序化生成任意复杂场景（P.scene）与独特物品意象（P.metaphor），含配音、变速剪辑、BGM 闪避混音、日漫拟声词音效、白字黑边动漫字幕与自动渲染检查。用户提到日漫视频、漫画分镜视频、manga-video、把文案/音频做成日漫风视频时使用。
---

# Manga Video · 日漫分镜视频独立技能

用纯代码（HTML + SVG + Canvas）制作真实可播放的 **日漫 · 漫画分镜（`manga`）** MP4 视频：白纸黑墨、网点纸（Screentone）、斜切与破框分镜、速度线与集中线、手绘拟声词（ドン / 轰 / 决）、圆框/爆炸吼叫/思考云/黑底旁白气泡、美型男女主角立绘，以及**随文案内容同步绘制的日漫场景背景与具象物品/心理意象**。

- **首次运行解压运行时**：在运行任何 `node` / `python3` 脚本前，若技能目录下存在 `scripts/unpack.py`，先在技能根目录执行一次 `python3 scripts/unpack.py`，会自动将 `assets/runtime_bundle.json` 中的 `.mjs` / `.js` 脚本完整还原到技能目录。

---

## 1. 核心铁律：按文案生成同风格场景背景与物品/意象

制作日漫分镜视频时，**严禁全程只用抽象速度线、集中线或纯色网点充当背景，也严禁只画大头人物说话而不画文案里的物品与比喻**。必须遵守以下双层可视化规范（`render.mjs --check` 会自动强制校验）：

1. **具象场景背景覆盖率 ≥ 35%（`P.bg` / `P.scene`）**：
   - 每个分镜格必须优先根据文案情境绘制黑白墨线+网点透视场景背景，可在场景背景上叠加动态速度线或集中线（如 `P.bg('cafe', { lines: 'focus' })`）。
   - **常规场景**直接调用 23 种内置日漫背景预设；**复杂、特殊或预设之外的场景**必须调用 `P.scene(specOrFn, o)` 按文案内容现场组合或手绘生成。
2. **具象物品与心理意象覆盖率 ≥ 30%（`P.prop` / `P.metaphor` / `P.chart` / `P.draw`）**：
   - 文案提到具体物品（如手机、微信、密码、礼物、玫瑰、钻戒、红酒、房车、合同）或抽象心理比喻（如选择权王冠、博弈天平、提线木偶、自断退路砖墙、待选商品条形码、齐泽克竞争信号、心理冰山、囚笼、断桥、耗尽的电池、情绪炸弹）时，必须在分镜中画出对应的同风格日漫道具或意象。
   - **常规道具**直接调用 48+ 种内置 `P.prop(kind, o)` 预设；**预设之外的复杂或独特物品/比喻**必须调用 `P.metaphor((g, k) => { ... }, o)` 现场生成。

---

## 2. 场景背景系统：23 种内置预设 + `P.scene()` 动态生成

### 2.1 内置 23 种日漫场景背景（`P.bg(kind, o)`）

| 类别 | 可选 `kind` 值 | 画面内容（黑白墨线 + 漫画网点 + 点睛色） |
|---|---|---|
| **居家与室内** | `'room'` / `'living_room'` | 透视客厅墙角、踢脚线、窗帘网点、挂画框 |
| | `'bedroom'` / `'bedroom_night'` | 卧室床头、双枕、台灯暖光网点、百叶窗月光斜影 |
| **社交与职场** | `'cafe'` / `'restaurant'` | 拱形街景玻璃窗、复古吊灯、双人卡座与桌面咖啡杯 |
| | `'office'` / `'workplace'` | 写字楼办公桌、电脑显示器、文件堆、窗外高楼天际线 |
| | `'bar'` / `'club'` | 酒吧吧台、后排酒架与酒瓶剪影、锥形聚光灯束 |
| **都市与交通** | `'street'` / `'city_night'` | 一点透视街道、两侧高楼窗格、竖排霓虹招牌、斑马线 |
| | `'subway'` / `'train'` | 地铁/列车车厢、顶部拉环扶手、车窗掠影与排椅 |
| | `'rooftop'` | 城市天台、铁丝网围栏、远景天际线与暮色渐变网点 |
| | `'corridor'` / `'hospital'` / `'airport'` / `'library'` | 深一点透视长廊、两侧对称门框/立柱/书架与顶灯 |
| **情绪、自然与象征空间** | `'rain'` / `'rain_window'` | 乌云网点、密集斜雨线、十字窗框与玻璃雨滴 |
| | `'crossroads'` / `'choice'` | Y字分岔透视道路、电线杆与双向抉择路牌 |
| | `'bridge'` / `'cliff'` | 断桥对峙 / 悬崖边缘与深谷网点 |
| | `'stage'` / `'spotlight'` | 全黑背景、锥形强聚光舞台与台下环绕人群剪影 |
| | `'arena'` / `'court'` | 透视方格博弈棋盘地面与古典立柱 |
| | `'park'` / `'seaside'` | 公园护栏/长椅、复古路灯与远景网点 |
| | `'sky'` / `'dawn'` | 渐变网点天空与手绘日漫层云 |
| **情绪底纹与动势线** | `'speed'` / `'focus'` / `'odoro'` / `'burst'` / `'flash'` / `'tone'` / `'grad'` / `'black'` / `'white'` | 流线速度线、旋转呼吸集中线、诡谲摇曳黑气线、网点渐变 |

> **叠加动势线技巧**：任何具象场景背景都支持传入 `{ lines: 'speed' | 'focus' | 'odoro', angle, density }`，例如 `p.bg('office', { lines: 'speed', angle: -10 })`，既有写字楼实景又不失日漫冲击力。

### 2.2 遇到复杂或其他场景：用 `P.scene(specOrFn, o)` 按文案实时生成

当文案出现上述 23 种预设之外的特定场景（如“深夜便利店门口”“暴雨中的公交站台”“摆满沙漏的密室”“婚礼礼堂”“审讯室”）时，使用 `P.scene()` 现场组合或绘制：

**方式 A：组合式描述对象**
```js
p.scene({
  sky: 'night',                  // 'day' | 'night' | 'dusk'
  horizon: 0.58,                 // 地平线/视平线高度 (0..1)
  skyline: { towers: 10, night: true },
  perspective: '1pt',            // 自动生成一点透视空间地面与墙线
  vanish: [0.5, 0.56],           // 透视消失点坐标
  window: { box: [0.12, 0.10, 0.76, 0.42], cols: 4, rows: 2, night: true },
  furniture: [
    { kind: 'bookshelf', x: 0.20, y: 0.52, size: 0.36 },
    { kind: 'desk',      x: 0.52, y: 0.78, size: 0.42 }
  ],
  weather: 'rain',               // 'rain' | 'snow' | 'petals' | 'sparks'
  lines: 'focus',                // 可选叠加集中线/速度线
  draw: (g, k) => {
    // 在此补充该场景特有的细节建筑或招牌
  }
});
```

**方式 B：完全自定义场景手绘回调 `P.scene((g, k) => { ... })`**
回调中的 `k` 提供全套日漫空间原语：
- `k.perspGrid(g, vx, vy, { rays, groundTone })`：绘制收敛于 `(vx, vy)` 的透视地面与空间网格
- `k.skyline(g, yHorizon, { towers, night })`：生成远景城市建筑群或山脊网点
- `k.windowWall(g, x, y, w, h, { cols, rows, night })`：绘制多格透视窗户
- `k.weather(g, 'rain' | 'snow' | 'petals' | 'sparks', { n })`：绘制雨幕、雪花、落花或火星
- `k.furniture(g, 'desk' | 'table' | 'bookshelf' | 'tree', cx, cy, size)`：放置模块化陈设
- `k.shape(g, svgPathD, { fill, tone: true, lw })`：绘制任意带自动受光网点阴影的日漫封闭图形
- `k.line(g, [[x1, y1], [x2, y2], ...], width, { taper: 'both' })`：绘制带笔锋粗细变化的墨线

---

## 3. 物品与心理意象系统：48+ 种内置预设 + `P.metaphor()` 动态生成

### 3.1 内置 48+ 种物品与心理意象（`P.prop(kind, o)`）

```js
p.prop('scales', {
  x: 0.32, y: 0.54, size: 0.36,
  cracks: false, halo: true,
  label: '倾斜的心理天平',
  at: s('l5') + 0.15
});
```

| 类别 | 可选 `kind` 值 | 适用文案意象 |
|---|---|---|
| **手机与社交** | `'phone'` / `'chat'` | 手机暧昧聊天、深夜消息气泡 |
| | `'chat_delete'` / `'blacklist'` | 删光异性好友、清空通讯录、拉黑 |
| | `'lock_phone'` / `'password'` | 手机锁屏密码、改成对方生日、查手机 |
| | `'magnifying_glass'` / `'inspect'` | 放大镜抓细节、蛛丝马迹、审视 |
| **权力、选择与博弈** | `'crown'` / `'king'` | 关系决定者、强者王冠、掌握主导权 |
| | `'scales'` / `'balance'` | 心理博弈天平、付出失衡、价值衡量 |
| | `'chess'` / `'game'` | 心理博弈棋局、棋子与控局者 |
| | `'puppet'` / `'marionette'` | 提线木偶、失去选择权被操控、言听计从 |
| | `'chains'` / `'shackles'` | 情感依赖枷锁（加 `broken: true` 表示崩断枷锁、随时离开的底气） |
| | `'wall'` / `'dead_end'` | 把退路全堵死、自我封闭的高墙 |
| | `'barcode'` / `'commodity'` | 等待被挑选的商品、打折廉价标签 |
| | `'signpost'` / `'options'` | 替代选择、多条出路、双向筛选 |
| | `'radar'` / `'signal'` / `'magnet'` / `'attraction'` | 齐泽克竞争信号、慕强吸引力磁场 |
| | `'trophy'` / `'medal'` | 大家都在抢的好东西、高价值奖杯 |
| | `'sword_shield'` / `'boundary'` | 原则底线之剑与边界之盾 |
| **深层心理隐喻** | `'cage'` / `'birdcage'` | 爱的囚笼、画地为牢、束缚 |
| | `'bridge'` / `'broken_bridge'` | 断桥、自断后路、无法跨越的鸿沟 |
| | `'iceberg'` | 心理冰山（水面之上一角、水下巨大潜意识） |
| | `'rope'` / `'tug_of_war'` | 紧绷到极限即将断裂的关系拉扯绳 |
| | `'ship'` / `'sinking_ship'` | 沉船效应、同舟或孤舟 |
| | `'flame'` / `'fire'` | 热情燃烧、飞蛾扑火 |
| | `'wings'` / `'freedom'` | 展翅高飞、独立自由 |
| | `'eye'` / `'eye_lens'` | 他人眼里的审视、看穿伪装 |
| | `'hands_apart'` / `'let_go'` | 双手松开、渐行渐远、放手离开 |
| | `'battery'` / `'exhausted'` | 精力情绪耗尽（1% 红色低电量告警） |
| | `'bomb'` / `'time_bomb'` | 隐瞒与情绪定时炸弹 |
| | `'compass'` / `'anchor'` | 迷失/坚定方向罗盘、安全感船锚 |
| | `'stairs_up'` / `'growth'` | 强者只负责提升自己、阶梯跃升 |
| | `'abyss'` / `'vortex'` | 内耗深渊、情绪漩涡 |
| | `'hourglass'` / `'time'` | 倾尽所有时间与青春流逝 |
| | `'mask'` / `'disguise'` / `'mirror'` | 双面伪装面具、破碎自我审视镜 |
| **情感与物质筹码** | `'heart'` / `'broken_heart'` | 心动偏爱 / 感情裂痕与心碎 |
| | `'rose'` / `'wilted_rose'` | 热烈追求的红玫瑰 / 不被珍惜的枯萎玫瑰 |
| | `'gift'` / `'trash_gift'` | 讨好送礼 / 被丢弃践踏的真心礼盒 |
| | `'ring'` / `'diamond'` | 婚姻承诺与钻戒 |
| | `'wine'` / `'cheers'` | 借酒越界、微醺夜宴 |
| | `'hotel_key'` / `'door'` | 紧闭房门与门锁房卡 |
| | `'house_car'` / `'wealth'` / `'money'` / `'contract'` | 房产车产筹码、财产转移契约与红印 |

### 3.2 遇到预设之外的独特物品或复杂意象：用 `P.metaphor((g, k) => { ... }, o)` 动态生成

当文案出现任何独特实物或复合比喻（如“把所有筹码推上赌桌”“被戳破的彩色泡沫”“生锈的钥匙与紧锁的门”“拿着号码牌排队的追求者”）时，直接调用 `P.metaphor((g, k) => { ... }, o)` 现场绘制：

```js
p.metaphor((g, k) => {
  const { u, sh, pth, cir, rct, txt, sparkle, spot, ink, paper, S } = k;
  // 局部坐标系原点在 (0, 0)，半径范围约为 [-0.55*u .. +0.55*u]
  // 1. sh(d, fill, tone, lwScale) 自动绘制带墨线描边与背光网点阴影的漫画图形
  sh(`M${-0.45*u},${0.35*u} L${-0.35*u},${-0.35*u} H${0.35*u} L${0.45*u},${0.35*u} Z`, paper, true, 1.3);
  // 2. rct / cir / pth / txt 绘制细节结构与点睛红色 (spot)
  cir(0, -0.05, 0.18, spot, 1.2);
  txt('NO.99', 0, 0.20, 0.14, ink);
  sparkle(g, -0.32 * u, -0.32 * u, 0.12 * u, spot);
}, {
  x: 0.30, y: 0.56, size: 0.36,
  halo: true,          // 可选：外围点睛红虚线光环
  cracks: false,       // 可选：叠加碎裂纹
  label: '排队拿号的追求者',
  at: s('l10') + 0.15
});
```

---

## 4. 美型角色系统（`R.cast` & `P.char`）

`manga-video` 内置精修版日漫美型五官（V字流畅下颌线、对称微侧脸比例 `turn: 0.14`、多层星眸高光+双眼皮折痕+外翘睫毛、挺拔细腻鼻梁与薄唇弧度）：

```js
R.cast({
  '陆沉': {
    proportions: 'hero', build: 'slim', jaw: 0.92, turn: 0.14,
    hair: 'spiky', spikes: 7, hairTone: 'black', // 或传入自定义美型发型函数 (gH, k) => { ... }
    eyes: 'sharp', brows: 'thick',
    outfit: { top: 'white', bottom: 'black', coat: 'black', collar: true, shoes: 'black' }
  },
  '苏晚': {
    proportions: 'hero', build: 'slim', jaw: 0.88, turn: 0.14,
    hair: 'long', hairTone: 'black',
    eyes: 'round', brows: 'thin', blush: true,
    outfit: { top: 'black', bottom: 'black', collar: true, shoes: 'black' }
  }
});
```
- **景别（`shot`）**：`'bust'`（半身胸像，最常用）、`'face'`（面部大特写）、`'eyes'`（眼部极特写条漫）、`'full'`（全身骨骼动作）、`'silhouette'`（黑底白边剪影）、`'chibi'`（Q版反差）。
- **表情（`face`）**：`'calm'` | `'smile'` | `'grin'` | `'smug'` | `'determined'` | `'angry'` | `'shout'` | `'grit'` | `'shock'` | `'scared'` | `'pain'` | `'tired'` | `'sad'`。
- **动态切换**：`const c = p.char('陆沉', ...); c.face(t, 'smug'); c.pose(t, 'point', 0.15); c.shake(t, 0.3, 8);`

---

## 5. 标准制作与渲染工作流

1. **准备音频与时间轴（`audio/narration.m4a` + `timeline.json` + `timeline.js`）**：
   - 若用户未提供音频：编写 `script.json` 并运行 `python3 explainer/scripts/tts.py <project_dir>`。
   - 若用户提供了现成音频（如 `.mp3`）且要求“语速偏快、节奏紧凑干脆”：用 `ffmpeg` 的 `silencedetect` 切分各句，对每句执行 `silenceremove=start_periods=1:start_duration=0.02:start_threshold=-36dB:stop_periods=-1:stop_duration=0.14:stop_threshold=-36dB,atempo=1.22`，句间保留 `0.10s` 紧凑换气拼接为 `audio/narration.m4a`，并将精确到毫秒的 `lines`（含 `words: [{ text, start, end }]` 与 `chapters: [{ start, end, title }]`）写入 `timeline.json` 和 `timeline.js`。
2. **编写 `brief.md` 与 `index.html`**：
   - 将所有画内文字（气泡、标签、介绍框、图表文字）写入 `brief.md` 以通过事实核对。
   - 在 `index.html` 中按每页 2–3 格（`pg.tiers(...)`）编排分镜，每页配置 `pg.read(panels, times, { travel: 0.35 })` 与关键句 `pg.punch(t, panel)`，确保具象场景背景 ≥ 35%、物品/意象 ≥ 30%。
3. **自动检查与截图自检**：
   - 运行 `node promo/scripts/render.mjs <project_dir> --check --no-motion --no-font-cache`，确保 **0 错误、0 提醒**。
   - 运行 `node promo/scripts/render.mjs <project_dir> --cover --stills ...` 并查看截图，确认人物五官、背景、道具与气泡无遮挡。
4. **合成混音与渲染 MP4 成片**：
   - 先生成混音音轨（含旁白 + BGM 自动闪避 + 日漫音效）：
     `node promo/scripts/render.mjs <project_dir> --audio --no-font-cache --bgm "<bgm.mp3>" --bgm-volume 0.18`
   - 渲染视频并封装 `-16 LUFS` 标准化音轨与 `+faststart` MP4，交付视频文件、封面图与下载链接。

详细组件参数见 [styles/manga/STYLE.md](styles/manga/STYLE.md)。
