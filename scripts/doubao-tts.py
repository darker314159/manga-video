#!/usr/bin/env python3
"""
Doubao TTS · 豆包语音合成
基于 Volcengine DoubaoVoice HTTP API（https://docs.volcengine.com/docs/DoubaoVoice/audio-generation-http?lang=zh）
输出：audio/narration.m4a + timeline.json + timeline.js

Usage:
  python3 scripts/doubao-tts.py <project_dir>
  python3 scripts/doubao-tts.py <project_dir> --voice doubao_female_shaobo
  python3 scripts/doubao-tts.py <project_dir> --api-key <KEY>
"""
import asyncio, hashlib, json, os, subprocess, sys, time
from pathlib import Path

SR = 24000  # target sample rate

# ─── 默认音色配置 ───────────────────────────────────────────────
# 优先使用「黑猫侦探社咪仔」，其余见 https://www.volcengine.com/docs/6791/1241372
DEFAULT_VOICE = "doubao_male_blackcat"  # 黑猫侦探社咪仔（悬疑/故事类默认）

VOICE_REGISTRY = {
    "doubao_male_blackcat":  {"name": "黑猫侦探社咪仔", "gender": "male",   "desc": "悬疑故事解说"},
    "doubao_male_chenchen":  {"name": "晨晨",           "gender": "male",   "desc": "轻松日常男声"},
    "doubao_male_jingjing":  {"name": "京京",           "gender": "male",   "desc": "新闻播报男声"},
    "doubao_male_qingqiu":   {"name": "青叔",           "gender": "male",   "desc": "沉稳成熟男声"},
    "doubao_female_shaobo":  {"name": "莎宝",           "gender": "female", "desc": "甜美少女音"},
    "doubao_female_xiaobei": {"name": "小北",           "gender": "female", "desc": "知性讲解女声"},
    "doubao_female_yaya":    {"name": "雅雅",           "gender": "female", "desc": "温柔治愈女声"},
    "doubao_male_zhizhe":    {"name": "智者",           "gender": "male",   "desc": "深沉旁白男声"},
}


def ensure_package():
    try:
        import httpx
        return
    except ImportError:
        pass
    here = Path.cwd().resolve()
    for d in [here, *here.parents]:
        py = d / ".venv" / ("Scripts" if os.name == "nt" else "bin") / "python"
        if py.exists() and Path(sys.prefix).resolve() != py.resolve().parents[1]:
            os.execv(str(py), [str(py), *sys.argv])
    sys.exit("httpx not found. Install it: pip install httpx")


ensure_package()
import httpx  # noqa: E402


async def synth_line(line_text, voice_id, api_key, out_mp3, sem):
    """单次 TTS 合成，调用豆包长文本接口。返回 words 列表（含时间戳）。"""
    payload = {
        "app": {
            "appid": os.environ.get("DOUBAO_APPID", ""),
            "token": os.environ.get("DOUBAO_TOKEN", api_key),
            "cluster": "volcano_tts",
        },
        "user": {"uid": os.environ.get("DOUBAO_UID", "manga-video-user")},
        "audio": {
            "voice_type": voice_id,
            "encoding": "mp3",
            "speed_ratio": 1.0,
            "pitch_ratio": 1.0,
            "breath_detection": True,
        },
        "request": {
            "reqid": hashlib.sha1(f"{line_text}{voice_id}{time.time()}".encode()).hexdigest()[:16],
            "text": line_text,
            "text_type": "plain",
            "operation": "query",
        },
    }
    # 豆包接口支持单次最多 500 字符；超长文本自动分段
    MAX_CHUNK = 480
    chunks = [line_text[i:i+MAX_CHUNK] for i in range(0, len(line_text), MAX_CHUNK)] if len(line_text) > MAX_CHUNK else [line_text]

    all_words = []
    audio_chunks = []
    offset_ms = 0

    async with sem:
        for ci, chunk in enumerate(chunks):
            for attempt in range(4):
                try:
                    async with httpx.AsyncClient(timeout=30) as client:
                        resp = await client.post(
                            "https://openservice.volcengineapi.com/api/v3/tts",
                            headers={
                                "Content-Type": "application/json",
                                "Authorization": f"Bearer {api_key}",
                                "X-Volcengine-Api-Key": api_key,
                            },
                            json=payload,
                        )
                        data = resp.json()
                        if data.get("code") != 0:
                            raise RuntimeError(f"API error {data.get('code')}: {data.get('message')}")
                        audio_b64 = data.get("data", {}).get("audio", "")
                        if not audio_b64:
                            raise RuntimeError("empty audio")
                        audio_bytes = bytes.fromhex(audio_b64) if isinstance(audio_b64, str) and not audio_b64.startswith("/") else b"".join(audio_b64)
                        # 实际上豆包返回 base64 编码的音频
                        mp3_path = out_mp3.parent / f"{out_mp3.stem}_c{ci}.mp3"
                        mp3_path.write_bytes(audio_bytes)
                        audio_chunks.append(mp3_path)
                        # 尝试获取 word-level timing（部分音色支持）
                        if "words" in data.get("data", {}):
                            for w in data["data"]["words"]:
                                all_words.append({
                                    "text": w.get("word", ""),
                                    "start": round(offset_ms + w.get("start_time", 0) / 1000, 3),
                                    "end": round(offset_ms + w.get("end_time", 0) / 1000, 3),
                                })
                        offset_ms += len(audio_bytes) / (128 * 1000) * 1000  # approximate ms
                        break
                except Exception as e:
                    if attempt == 3:
                        raise
                    await asyncio.sleep(1.5 * (attempt + 1))

    # 合并 chunk 音频
    if len(audio_chunks) == 1:
        subprocess.run(["ffmpeg", "-y", "-i", str(audio_chunks[0]), "-c:a", "copy", str(out_mp3)],
                       capture_output=True, check=False)
    elif len(audio_chunks) > 1:
        concat = out_mp3.parent / "_concat.txt"
        concat.write_text("\n".join(f"file '{p}'" for p in audio_chunks))
        subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
                        "-c:a", "copy", str(out_mp3)], capture_output=True, check=True)
        for p in audio_chunks:
            p.unlink(missing_ok=True)
        concat.unlink(missing_ok=True)

    return all_words


async def main():
    args = sys.argv[1:]
    proj = Path(args[0]).resolve() if args and not args[0].startswith("--") else Path.cwd()
    args = args[1:] if args and not args[0].startswith("--") else args

    voice = DEFAULT_VOICE
    api_key = os.environ.get("DOUBAO_API_KEY", "")
    for i, a in enumerate(args):
        if a == "--voice" and i + 1 < len(args):
            voice = args[i + 1]; args = args[:i] + args[i+2:]
        elif a == "--api-key" and i + 1 < len(args):
            api_key = args[i + 1]; args = args[:i] + args[i+2:]

    if not api_key:
        print("Error: 请提供豆包 API Key，通过 --api-key 参数或 DOUBAO_API_KEY 环境变量", file=sys.stderr)
        sys.exit(1)

    script_path = proj / "script.json"
    if not script_path.exists():
        print(f"Error: {script_path} not found", file=sys.stderr)
        sys.exit(1)

    cfg = json.loads(script_path.read_text())
    lines = cfg["lines"]
    gap = cfg.get("gap", 0.35)
    lead_in = cfg.get("lead_in", 0.6)

    out_dir = proj / "audio" / "lines"
    out_dir.mkdir(parents=True, exist_ok=True)

    speak = [l for l in lines if l.get("text")]
    sem = asyncio.Semaphore(3)
    results = {}

    print(f"  [Doubao TTS] voice={voice} ({VOICE_REGISTRY.get(voice, {}).get('name', '?')})")
    print(f"  [Doubao TTS] synthesizing {len(speak)} lines...")

    for l in speak:
        vid = l.get("voice", voice)
        mp3 = out_dir / f"{l['id']}.mp3"
        meta = out_dir / f"{l['id']}.json"
        if mp3.exists() and meta.exists():
            try:
                m = json.loads(meta.read_text())
                if m.get("voice") == vid and m.get("text") == l["text"]:
                    results[l["id"]] = m.get("words", [])
                    continue
            except Exception:
                pass
        results[l["id"]] = await synth_line(l["text"], vid, api_key, mp3, sem)
        meta.write_text(json.dumps({"voice": vid, "text": l["text"], "words": results[l["id"]]}, ensure_ascii=False))
        print(f"  synthesized {l['id']}: {l['text'][:24]}")

    # Build timeline
    cursor = lead_in
    timeline = []
    for l in lines:
        cursor += l.get("pause_before", 0)
        if "at" in l:
            lead = results.get(l["id"], [{}])[0].get("start", 0) if results.get(l["id"]) else 0
            if cursor > l["at"] - lead + 0.02:
                print(f"warning: line {l['id']} wants to start at {l['at']}s but previous runs until {cursor + lead:.2f}s", file=sys.stderr)
            cursor = max(cursor, l["at"] - lead)
        if not l.get("text"):
            d = l.get("silence", 1.0)
            timeline.append({"id": l["id"], "text": "", "silence": True, "start": round(cursor, 3), "end": round(cursor + d, 3), "words": []})
            cursor += d
            continue
        words = results.get(l["id"], [])
        words = [{"text": w["text"], "start": round(cursor + w["start"], 3), "end": round(cursor + w["end"], 3)} for w in words]
        audio_len = words[-1]["end"] if words else 1.5
        timeline.append({
            "id": l["id"], "text": l["text"],
            "start": round(cursor, 3),
            "end": round(cursor + audio_len, 3),
            "words": words,
            **({"fx": l["fx"]} if l.get("fx") else {}),
        })
        cursor += audio_len + gap + l.get("pause_after", 0)

    duration = round(max(cursor - gap, cursor) + cfg.get("tail", 1.5), 3)

    # Chapters
    chapters = []
    for i, l in enumerate(lines):
        if l.get("chapter"):
            start = 0.0 if not chapters else round(timeline[i - 1]["end"] + 0.05, 3) if i > 0 else timeline[0]["start"] if timeline else 0
            chapters.append({"title": l["chapter"], "start": start})
    spoken_end = max((t["end"] for t in timeline if not t.get("silence")), default=duration)
    for i, c in enumerate(chapters):
        c["end"] = chapters[i + 1]["start"] if i + 1 < len(chapters) else round(min(duration, spoken_end + 0.05), 3)

    data = {"duration": duration, "lines": timeline, "chapters": chapters, "voice": voice}
    (proj / "timeline.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    (proj / "timeline.js").write_text("window.TIMELINE = " + json.dumps(data, ensure_ascii=False) + ";\n")
    print(f"Done: {len(timeline)} lines, total {duration:.1f}s, voice={voice}")
    for c in chapters:
        print(f"  chapter {c['start']:6.2f} – {c['end']:6.2f}  {c['title']}")
    for t in timeline:
        if t.get("text"):
            print(f"  {t['start']:6.2f} – {t['end']:6.2f}  {t['id']:<12} {t['text'][:30]}")


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] in ("--help", "-h"):
        print(__doc__)
        sys.exit(0)
    asyncio.run(main())
