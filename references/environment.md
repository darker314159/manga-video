# 环境与命令

## 依赖

- 推荐 Node.js 22+（本次用 24 验证）；渲染器直接使用全局 `WebSocket`。上游标注 18+，但较旧 Node 如缺少该全局对象需升级。原引擎不依赖 npm 包。
- Chrome / Chromium；不在默认路径时设置 `CHROME_PATH` 为可执行文件绝对路径。
- `ffmpeg`、`ffprobe` 在 PATH 中。
- Python 3；配音使用 `edge-tts`（按环境允许方式安装 `python3 -m pip install edge-tts`）。
- 按项目需要联网：微软语音服务、字体和固定版本 CDN 库。网络受限时缓存许可允许的字体/库并改为项目本地引用；`--offline` 不能替代缺失的 three.js 等库，也不能离线生成 edge-tts。
- Blender 3.6+ 可选，仅用于 toy3d 吉祥物建模；没有时按指南用 three.js。

先执行 `node --version`、`ffmpeg -version`、`ffprobe -version`、`python3 -c 'import edge_tts'`，检查 Chrome。只补充实际缺少且获准的依赖，不宣称所有机器已配置好。

## 容器中的 Chrome

渲染器通过本机 CDP 启动 Chrome。如果报缺少 `DevToolsActivePort`，先独立执行 Chrome 查看启动错误。root 容器可能无法启动沙箱；在明确允许关闭浏览器沙箱的隔离渲染环境中，可为可信的自制项目创建本地启动包装器，在实际 Chrome 命令前加入 `--no-sandbox`，再将 `CHROME_PATH` 指向该包装器。不要把包装器或 Chrome 二进制写进技能目录，也不要在用户正常桌面环境中默认禁用沙箱。

## 路径与命令

先将 `BV_SKILL` 赋为本技能的真实绝对路径，将 `BV_PROJECT` 赋为工作目录下独立的新项目路径。以下讲解和宣传是不同项目示例，不能连续对同一已有项目运行两个创建命令。

```bash
# 讲解：29 种风格均由此入口创建
node "$BV_SKILL/explainer/scripts/new.mjs" "$BV_PROJECT" --style whiteboard --lang zh-CN --title '视频标题'
# 写好 brief.md、storyboard.md、script.json 后生成语音和时间轴
python3 "$BV_SKILL/explainer/scripts/tts.py" "$BV_PROJECT"
# 编写 index.html 后检查、查看截图、渲染
node "$BV_SKILL/explainer/scripts/render.mjs" "$BV_PROJECT" --check
node "$BV_SKILL/explainer/scripts/render.mjs" "$BV_PROJECT" --stills 1,3
node "$BV_SKILL/explainer/scripts/render.mjs" "$BV_PROJECT" --draft
node "$BV_SKILL/explainer/scripts/render.mjs" "$BV_PROJECT"

# 产品宣传：使用另一个新项目路径
node "$BV_SKILL/promo/scripts/new.mjs" "$BV_PROJECT" --style launch --lang zh-CN --title '产品名称'
node "$BV_SKILL/promo/scripts/capture.mjs" "$BV_PROJECT" --research 'https://example.com'
# 调研核实后写 brief.md 和 shots.json，再截图
node "$BV_SKILL/promo/scripts/capture.mjs" "$BV_PROJECT"
# 编写画面、分镜、score.js、sound.js 后检查并渲染
node "$BV_SKILL/promo/scripts/render.mjs" "$BV_PROJECT" --check
node "$BV_SKILL/promo/scripts/render.mjs" "$BV_PROJECT" --check --aspect 9:16
node "$BV_SKILL/promo/scripts/render.mjs" "$BV_PROJECT"
node "$BV_SKILL/promo/scripts/render.mjs" "$BV_PROJECT" --aspect 9:16
```

个别上游风格文档（如 manga）称路径相对 `promo/`，但其中 `explainer/scripts/new.mjs`、`styles/manga/explain.html` 示例实际相对技能根目录；遇到此类歧义，以实际文件存在位置为准，使用 `$BV_SKILL/explainer/scripts/new.mjs` 和 `$BV_SKILL/styles/manga/explain.html` 等绝对路径。

对于非 whiteboard/riso/ink 风格的讲解，创建脚本自动转交 promo 引擎；仍按讲解流程制作，改用 `promo/scripts/render.mjs` 渲染。不要把初始化模板当作完成视频。按 `styles/<style>/STYLE.md` 编写实际画面；是否支持 `--quick`，以所选 `STYLE.md` 和初始化器的实际报告为准；manga、toy3d、lumen 等须手写画面，不强行套用快速模板。

常用检查：`--strip 1,3,8` 输出某段连续帧；`--sheet` 输出旁白节点总览；`--review` 输出成片检查包；`--scan` 复查已有成片；`--audio` 只导出声音。依工具实际报告确认文件名，通常在项目 `out/` 下，有 `video.mp4` 或 `video-16x9.mp4`、`video-9x16.mp4` 与相应封面、字幕和署名。
