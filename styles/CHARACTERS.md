# Manga Characters · 美型角色规范（抖音爆款优化版）

本文件描述 manga 风格中所有可命名角色的**设计规范、视觉特征与表情系统**。
原则：**角色靠轮廓和 1–2 个标志性特征辨认，不靠五官细节堆砌**。

---

## 1. 核心铁律：双人场景视觉区分

同一场景中两个角色必须在 **至少两个视觉属性** 上区分：
- 脸型（轮廓）
- 发型/发色
- 头饰
- 服装颜色
- 体型（高/矮、瘦/壮）

否则 `--check` 会报警。

---

## 2. 女性角色精修规范（重点）

### 2.1 默认特征：长头发 + 裙子

所有女性角色**默认**带以下特征，除非明确覆盖：
- **长发**：至少及肩（`hairLength: 'shoulder'`），推荐及腰（`'waist'`）或拖地（`'floor'`）
- **鬓发**：两侧各一绺垂落脸颊（`sideLocks: true`）
- **裙子**：默认连衣裙或 JK 制服裙（`skirt: true`）
- **红晕**：两颊浅红（`blush: true`）
- **睫毛**：外翘双层睫毛

### 2.2 发型规格

```js
// 女性发型参考
{
  hair: 'long',
  hairLength: 'waist',     // 'shoulder' | 'waist' | 'floor' | 'bob' | 'ponytail'
  hairTone: 'black',        // 'black' | 'brown' | 'blonde' | 'white' | 任意颜色
  sideLocks: true,          // 两侧鬓发（默认开启）
  bangs: 'soft',            // 'soft' | 'straight' | 'side' | 'none'
  hairAccessories: ['ribbon'], // 发饰：'ribbon' | 'flower' | 'clip' | 'band'
}
```

### 2.3 服装规格

```js
// 女性服装参考
{
  outfit: {
    top: 'white',                    // 上衣颜色
    skirt: true,                     // 有裙子（默认）
    skirtLength: 'knee',             // 'mini' | 'knee' | 'ankle' | 'floor'
    skirtType: 'pleated',            // 'plain' | 'pleated' | 'flared'
    collar: true,                    // 有领子
    shoes: 'black',                  // 'black' | 'white' | 'brown'
    accessories: ['bag'],            // 配件：'bag' | 'gloves' | 'scarf'
  }
}
```

### 2.4 面部精修

```js
{
  jaw: 0.88,           // V 形小脸（0.8~0.95）
  turn: 0.14,          // 微侧脸比例
  blush: true,         // 两颊红晕
  mole: false,         // 美人痣（可选）
  eyes: 'round',       // 'round'(大眼) | 'sharp'(锐利) | 'sleepy'(慵懒)
  brows: 'thin',       // 纤细眉
}
```

### 2.5 女性角色示例

```js
// 清纯校园风
R.cast({
  '林小晚': {
    proportions: 'hero', build: 'slim', jaw: 0.86, turn: 0.12,
    hair: 'long', hairLength: 'waist', hairTone: 'black',
    sideLocks: true, bangs: 'soft', hairAccessories: ['ribbon'],
    eyes: 'round', brows: 'thin', blush: true,
    outfit: { top: 'white', skirt: true, skirtLength: 'knee', skirtType: 'pleated', collar: true, shoes: 'black' },
    expression: 'default_expressions'
  }
});

// 冷艳职场风
R.cast({
  '沈清秋': {
    proportions: 'hero', build: 'slim', jaw: 0.88, turn: 0.14,
    hair: 'long', hairLength: 'floor', hairTone: 'black',
    sideLocks: true, bangs: 'side',
    eyes: 'sharp', brows: 'thin', blush: false,
    outfit: { top: 'white', skirt: true, skirtLength: 'ankle', skirtType: 'flared', collar: true, coat: 'black', shoes: 'black' },
    expression: 'default_expressions'
  }
});
```

---

## 3. 男性角色精修规范

### 3.1 默认特征：立体五官 + 帅气发型

- **发型**：顶部蓬松，两侧收紧；背头/碎发/狼尾可选
- **眉眼**：浓眉、锐利有神的眼型
- **下颌**：清晰的 V 形轮廓
- **服装**：外套/衬衫/西装风格

### 3.2 发型规格

```js
// 男性发型参考
{
  hair: 'spiky',           // 'spiky' | 'short' | 'slick' | 'wolf'
  spikes: 7,               // 尖刺数量（spiky 风格）
  tall: [2, 4, 6],         // 最高尖刺的索引
  hairTone: 'black',
  hairVolume: 1.1,         // 发量（1.0 = 默认）
}
```

### 3.3 面部精修

```js
{
  jaw: 0.92,           // 方正 V 形下颌（比女性更明显）
  turn: 0.14,          // 微侧脸
  eyes: 'sharp',       // 锐利眼型
  brows: 'thick',      // 浓眉
  noseBridge: true,    // 鼻梁高光（通过光影体现挺拔）
}
```

### 3.4 男性角色示例

```js
// 冷峻精英风
R.cast({
  '陆沉': {
    proportions: 'hero', build: 'slim', jaw: 0.92, turn: 0.14,
    hair: 'spiky', spikes: 7, tall: [2, 4, 6], hairTone: 'black', hairVolume: 1.1,
    eyes: 'sharp', brows: 'thick', noseBridge: true,
    outfit: { top: 'white', bottom: 'black', coat: 'black', collar: true, shoes: 'black' },
    expression: 'default_expressions'
  }
});

// 阳光运动风
R.cast({
  '周阳': {
    proportions: 'hero', build: 'normal', jaw: 0.90, turn: 0.12,
    hair: 'short', hairTone: 'brown', hairVolume: 1.0,
    eyes: 'round', brows: 'normal',
    outfit: { top: 'white', bottom: 'grey', coat: false, collar: false, shoes: 'white' },
    expression: 'default_expressions'
  }
});
```

---

## 4. 36 种表情系统

每种表情在 **眼睑高度**、**瞳孔大小**、**眉毛角度**、**嘴角弧度** 四个维度精确控制：

| 分类 | 表情 ID | 特征描述 |
|---|---|---|
| 基础 | `'calm'` | 平静，自然眼神，微闭嘴 |
| | `'smile'` | 微笑，眼睛弯成月牙，嘴角上扬 |
| | `'grin'` | 咧嘴笑，露齿，眼睛眯起 |
| | `'smug'` | 得意/自信，单边嘴角上扬，半眯眼 |
| | `'determined'` | 坚定，眉头微蹙，嘴唇紧闭成直线 |
| 情绪爆发 | `'angry'` | 愤怒，眉毛倒竖，眼睛瞪大，牙关紧咬 |
| | `'shout'` | 大喊，嘴巴大张，眉毛高挑 |
| | `'grit'` | 咬牙，嘴唇压成细线，眼眶用力 |
| 震惊恐惧 | `'shock'` | 震惊，眼睛极大，瞳孔缩小，嘴巴微张 |
| | `'scared'` | 恐惧，眼睛睁大含泪光，眉毛上扬内倾 |
| | `'pain'` | 痛苦，眼睛紧闭，眉头紧锁，嘴部扭曲 |
| 疲惫消极 | `'tired'` | 疲惫，眼袋，半闭眼，嘴角下垂 |
| | `'sad'` | 悲伤，眼角下垂，眼泪，嘴唇颤抖 |
| | `'sleep'` | 睡觉，眼睛闭合，嘴角放松 |
| | `'closed'` | 闭眼（用于思考/感受） |
| 新增丰富表情 | `'nervous'` | 紧张，眼神飘忽，额头冒汗点 |
| | `'flustered'` | 慌乱，眼睛睁大混乱，眉毛纠结 |
| | `'embarrassed'` | 害羞，脸红加重，眼神躲闪，嘴角微抿 |
| | `'suspicious'` | 怀疑，单眉上扬，眼神斜视 |
| | `'thinking'` | 思考，眼神向上，手托下巴 |
| | `'yearning'` | 渴望/憧憬，眼神发光，嘴角微扬 |
| | `'longing'` | 思念，眼神温柔带泪光 |
| | `'disdain'` | 不屑，单眼微眯，嘴角下撇 |
| | `'proud'` | 骄傲，下巴微抬，眼神自信 |
| | `'teasing'` | 调侃，单眉挑，狡黠笑 |
| | `'melancholy'` | 忧郁，眼神低垂，淡淡的忧伤 |
| | `'zealous'` | 狂热，眼睛放光，嘴角咧开 |
| | `'confused'` | 困惑，眉毛纠结，眼神迷茫 |
| | `'ashamed'` | 羞愧，低头，脸红，不敢看人 |
| | `'relieved'` | 释然，肩膀放松，眼神柔和 |
| | `'surprised_happy'` | 惊喜，眼睛亮，嘴巴张成 O 型 |
| | `'stern'` | 严肃，眉毛压低，嘴唇紧抿 |
| | `'cold'` | 冷漠，眼神平淡无波，嘴角平直 |
| | `'gentle'` | 温柔，眼神柔和，浅浅微笑 |
| | `'playful'` | 调皮，眨眼，歪头笑 |
| | `'nostalgic'` | 怀旧，眼神远方，淡淡微笑 |
| | `'defiant'` | 反抗，下巴抬起，眼神强硬 |

### 4.1 表情动态切换

```js
const c = p.char('苏晚', { shot: 'bust', x: 0.5, y: 0.7, size: 0.8 });
c.face(t, 'shock');          // t 时刻切换到震惊
c.face(t + 0.5, 'sad');      // 0.5s 后变成悲伤
c.pose(t, 'point', 0.15);    // 同时做指动作
c.shake(t, 0.3, 8);          // 身体微抖（震惊状态）
```

---

## 5. 景别系统

| 景别 | shot 值 | 适用场景 |
|---|---|---|
| 全身骨骼动作 | `'full'` | 登场、战斗、走路 |
| 半身胸像（最常用） | `'bust'` | 对话、旁白、心理描写 |
| 面部大特写 | `'face'` | 情绪爆发、关键台词 |
| 眼部极特写条漫 | `'eyes'` | 震惊、心动、决意 |
| 黑底白边剪影 | `'silhouette'` | 神秘登场、悬念营造 |
| Q 版反差 | `'chibi'` | 搞笑反应、吐槽 |

---

## 6. 角色检查规则

- 同一场景中两个角色必须在 **至少两个属性** 上有差异（发型/发色、脸型、服装颜色、体型等）
- `--check` 会自动校验，差异少于两个会报警
- 群演可以用同一个模板重复，不需要全量定义
