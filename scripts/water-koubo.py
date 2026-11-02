#!/usr/bin/env python3
"""
Water-Koubo · 文案二创改写（抖音爆款短视频文案生成器）
基于 water-koubo 理念：先对输入文案进行结构化二创，再输出面向 18-35 岁男性的抖音爆款脚本。

Usage:
  python3 scripts/water-koubo.py "原始文案内容" --target "18-35岁男性" --platform douyin
  python3 scripts/water-koubo.py --input raw.txt --output script.json
"""
import argparse, json, sys, os, re
from pathlib import Path

# ─── 改写引擎（本地 LLM-free 版本，基于模板与规则）──────────────
# 若有大模型 API 可用，可在 DOUBAO_KOUBO_API_KEY 环境变量中配置
# 否则使用以下内置规则引擎


def extract_hooks(text):
    """提取文案中的情绪钩子、冲突点、数字/数据"""
    hooks = {
        "conflict": [],
        "numbers": [],
        "questions": [],
        "emotions": [],
        "keywords": []
    }
    # 数字
    hooks["numbers"] = re.findall(r'[\d]+[万|亿|千|百|个|次|分|秒]?|[\d.]+%', text)
    # 疑问句
    hooks["questions"] = re.findall(r'[？?][^\n]*', text)
    # 情绪词
    emotion_map = {
        "愤怒": r"生气|愤怒|恼火|火大|炸裂",
        "震惊": r"震惊|惊呆|难以置信|大跌眼镜|没想到",
        "悲伤": r"难过|伤心|委屈|崩溃|心碎|绝望",
        "喜悦": r"开心|高兴|兴奋|爽|惊喜|满足",
        "焦虑": r"焦虑|紧张|压力|担心|恐慌|内耗",
        "羡慕": r"羡慕|嫉妒|向往|渴望|追不上",
        "共鸣": r"谁懂|懂的都懂|太真实|破防了|扎心了",
        "好奇": r"为什么|怎么回事|到底|究竟|秘密|真相"
    }
    for name, pat in emotion_map.items():
        if re.search(pat, text):
            hooks["emotions"].append(name)
    # 关键词
    keywords = re.findall(r'[a-zA-Z\u4e00-\u9fff]{2,8}', text)
    hooks["keywords"] = list(set(keywords))[:20]
    return hooks


def generate_douyin_script(original_text, target="18-35岁男性", platform="douyin"):
    """将原始文案改写为抖音爆款短视频脚本"""
    hooks = extract_hooks(original_text)
    lines = original_text.strip().split('\n')

    # 开场 Hook（前3秒必杀）
    hook_variants = []
    if hooks["numbers"]:
        num = hooks["numbers"][0]
        hook_variants.append(f"你知道吗？{num}的人都在做这件事…")
    if hooks["questions"]:
        hook_variants.append(f"{hooks['questions'][0].rstrip('？?')}——答案可能颠覆你的认知")
    if hooks["emotions"]:
        emo = hooks["emotions"][0]
        hook_variants.append(f"说实话，{emo}的时候，大多数人都不知道该怎么办…")
    hook_variants += [
        "今天这条视频，可能会改变你对这件事的看法",
        "我敢说，90%的人看完都会沉默",
        "如果你正在经历这些，请一定要看完",
        "这个秘密，只有极少数人知道"
    ]
    opening_hook = hook_variants[0] if hook_variants else "你有没有想过，为什么……？"

    # 正文结构：每段保持节奏
    body_segments = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # 短句化处理
        sentences = re.split(r'[。！？；\n]', line)
        for s in sentences:
            s = s.strip()
            if len(s) > 30:
                # 超长句拆短
                parts = re.split(r'[,，]', s)
                for p in parts:
                    if p.strip():
                        body_segments.append(p.strip())
            elif s:
                body_segments.append(s)

    # 金句/反转收尾
    endings = [
        "所以啊，有时候你以为的输，其实是另一种赢",
        "看完这条视频的你，已经比昨天更清醒了",
        "别急着划走，这句话你可能需要听很多遍",
        "愿每一个在黑暗里前行的人，都能等到天亮",
        "记住：真正厉害的人，从不解释自己"
    ]
    closing = endings[len(hooks["keywords"]) % len(endings)]

    # 构建脚本
    script = {
        "platform": platform,
        "target_audience": target,
        "opening_hook": opening_hook,
        "body": body_segments[:12],  # 最多12个信息点
        "closing": closing,
        "total_words": len("".join(body_segments)),
        "estimated_duration_s": max(15, len("".join(body_segments)) // 4),
        "emotion_tags": hooks["emotions"],
        "keywords": hooks["keywords"][:10]
    }
    return script


def generate_titles(script):
    """根据脚本生成 5 个抖音爆款标题"""
    titles = []
    emojis = ["🔥", "😱", "💡", "💔", "👀", "⚡", "🎯", "✨"]
    emo = script.get("emotion_tags", ["共鸣"])
    kw = script.get("keywords", [])

    templates = [
        f"{emo[0]}「{kw[0] if kw else '这件事'}」让多少人破防了？",
        f"看完这条视频，我沉默了很久…{emo[0]}",
        f"为什么{kw[0] if kw else '聪明人'}都选择{kw[1] if len(kw) > 1 else '沉默'}？",
        f"那些{emo[0]}的人，后来都怎么样了？",
        f"你绝对不知道：{kw[0] if kw else '真相'}居然是这样",
        f"建议收藏！{emo[0]}时该怎么应对？",
        f"这条视频，送给所有正在{emo[0]}的人",
        f"{kw[0] if kw else '真相'}曝光！看完我彻底醒了",
        f"后悔没早点看到这条视频…{emo[0]}",
        f"{kw[0] if kw else '这件事'}的底层逻辑，终于有人讲明白了",
    ]
    for i, t in enumerate(templates[:5]):
        titles.append(t.replace("「", "").replace("」", ""))
    return titles


def main():
    parser = argparse.ArgumentParser(description="Water-Koubo 文案二创改写 → 抖音爆款脚本")
    parser.add_argument("text", nargs="?", help="原始文案（也可通过 --input 文件传入）")
    parser.add_argument("--input", "-i", help="输入文案文件路径")
    parser.add_argument("--output", "-o", default="script-douyin.json", help="输出 JSON 文件")
    parser.add_argument("--target", default="18-35岁男性", help="目标受众")
    parser.add_argument("--platform", default="douyin", help="平台：douyin/kuaishou/xhs")
    args = parser.parse_args()

    text = args.text
    if not text:
        inp = Path(args.input) if args.input else None
        if inp and inp.exists():
            text = inp.read_text(encoding="utf-8").strip()
        else:
            # 从 stdin 读取
            text = sys.stdin.read().strip()

    if not text:
        print("Error: 请提供原始文案（参数或 --input 文件）", file=sys.stderr)
        sys.exit(1)

    print(f"  [water-koubo] 正在改写文案…（目标：{args.target}）")
    script = generate_douyin_script(text, args.target, args.platform)
    titles = generate_titles(script)

    output = {
        **script,
        "titles": titles,
        "source": text[:200] + ("…" if len(text) > 200 else ""),
    }

    out_path = Path(args.output)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  [water-koubo] 改写完成 → {out_path}")
    print(f"\n  📌 抖音爆款标题（5选1）：")
    for i, t in enumerate(titles, 1):
        print(f"    {i}. {t}")
    print(f"\n  ⏱ 预计时长：{script['estimated_duration_s']}s | 字数：{script['total_words']}")
    print(f"  🏷 情绪标签：{', '.join(script['emotion_tags']) if script['emotion_tags'] else '情感共鸣'}")


if __name__ == "__main__":
    main()
