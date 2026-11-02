#!/usr/bin/env node
/**
 * deploy.mjs · 自动在线部署 manga-video 项目
 * 将渲染完成的视频 + 封面上传至 Vercel 静态托管，输出可下载链接
 *
 * Usage:
 *   node scripts/deploy.mjs <project_dir>
 *   node scripts/deploy.mjs <project_dir> --platform netlify
 *   node scripts/deploy.mjs <project_dir> --expire 7
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const projDir = args.find(a => !a.startsWith('--')) || '.';
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    flags[key] = args[i + 1] !== undefined ? args[i + 1] : true;
  }
}

const proj = path.resolve(projDir);
const outDir = path.join(proj, 'out');
const expireDays = parseInt(flags.expire) || 7;
const platform = flags.platform || 'vercel';

// ─── 1. 扫描输出文件 ───────────────────────────────────────────
const videoFiles = fs.readdirSync(outDir)
  .filter(f => f.endsWith('.mp4'))
  .map(f => path.join(outDir, f));
const coverFiles = fs.readdirSync(outDir)
  .filter(f => f.startsWith('cover') && f.endsWith('.png'))
  .map(f => path.join(outDir, f));

if (videoFiles.length === 0) {
  console.error('Error: 找不到 out/*.mp4，请先渲染视频');
  process.exit(1);
}

const mainVideo = videoFiles[0];
const mainCover = coverFiles[0] || null;
console.log(`  [deploy] 找到视频：${path.basename(mainVideo)}`);
console.log(`  [deploy] 封面：${mainCover ? path.basename(mainCover) : '无'}`);

// ─── 2. 构建临时部署目录 ───────────────────────────────────────
const tmpDeploy = path.join(require('os').tmpdir(), `manga-deploy-${crypto.randomBytes(4).toString('hex')}`);
fs.mkdirSync(tmpDeploy, { recursive: true });

// 创建 index.html 展示页
const videoName = path.basename(mainVideo, '.mp4');
const coverName = mainCover ? path.basename(mainCover) : null;

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${videoName} · Manga Video</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: #0f0f0f;
      color: #eee;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .container { max-width: 640px; width: 100%; }
    h1 { font-size: 22px; margin-bottom: 16px; text-align: center; color: #fff; }
    .video-wrap {
      position: relative;
      width: 100%;
      border-radius: 12px;
      overflow: hidden;
      background: #1a1a1a;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    video { width: 100%; display: block; }
    .actions {
      display: flex; gap: 12px; margin-top: 20px; justify-content: center; flex-wrap: wrap;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 12px 24px; border-radius: 8px; font-size: 15px;
      text-decoration: none; cursor: pointer; border: none; font-weight: 600;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
    .btn-primary { background: #e0442a; color: #fff; }
    .btn-secondary { background: #2a2a2a; color: #ddd; border: 1px solid #444; }
    .meta { margin-top: 16px; text-align: center; font-size: 13px; color: #666; }
    .footer { margin-top: 32px; font-size: 12px; color: #444; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎬 ${videoName}</h1>
    <div class="video-wrap">
      <video controls playsinline preload="metadata">
        <source src="${path.basename(mainVideo)}" type="video/mp4">
        您的浏览器不支持视频播放。
      </video>
    </div>
    <div class="actions">
      <a class="btn btn-primary" href="${path.basename(mainVideo)}" download>⬇ 下载视频</a>
      ${mainCover ? `<a class="btn btn-secondary" href="${path.basename(mainCover)}" download>🖼 下载封面</a>` : ''}
    </div>
    <div class="meta">
      链接有效期 ${expireDays} 天 · Manga Video 自动生成
    </div>
  </div>
  <div class="footer">Powered by manga-video skill</div>
</body>
</html>`;

fs.writeFileSync(path.join(tmpDeploy, 'index.html'), html);
fs.copyFileSync(mainVideo, path.join(tmpDeploy, path.basename(mainVideo)));
if (mainCover) fs.copyFileSync(mainCover, path.join(tmpDeploy, path.basename(mainCover)));

console.log(`  [deploy] 临时目录：${tmpDeploy}`);

// ─── 3. 部署到 Vercel（需要 VERCEL_TOKEN 环境变量）─────────────
async function deployToVercel(projectDir) {
  const { VERCEL_TOKEN, VERCEL_TEAM_ID } = process.env;
  if (!VERCEL_TOKEN) {
    console.log('  [deploy] VERCEL_TOKEN 未设置，跳过自动部署');
    console.log('  [deploy] 请手动部署或设置环境变量后重试');
    return { success: false, reason: 'no_token' };
  }

  return new Promise((resolve) => {
    const proc = spawn('npx', ['vercel', 'deploy', '--prod', '--yes', '--token', VERCEL_TOKEN, ...(VERCEL_TEAM_ID ? ['--scope', VERCEL_TEAM_ID] : []), projectDir], {
      stdio: 'pipe',
      detached: false,
    });

    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      if (code === 0) {
        // 从输出中提取 URL
        const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
        const url = urlMatch ? urlMatch[0] : null;
        console.log(`  [deploy] Vercel 部署成功 → ${url || '(未知URL)'}`);
        resolve({ success: true, url });
      } else {
        console.error('  [deploy] Vercel 部署失败:', stderr.slice(0, 200));
        resolve({ success: false, reason: stderr.slice(0, 200) });
      }
    });
  });
}

// ─── 4. 部署到 Netlify（需要 NETLIFY_AUTH_TOKEN）───────────────
async function deployToNetlify(projectDir) {
  const { NETLIFY_AUTH_TOKEN, NETLIFY_ACCOUNT_ID } = process.env;
  if (!NETLIFY_AUTH_TOKEN) {
    console.log('  [deploy] NETLIFY_AUTH_TOKEN 未设置，跳过自动部署');
    return { success: false, reason: 'no_token' };
  }

  return new Promise((resolve) => {
    const args = [
      'publish', projectDir,
      '--auth', NETLIFY_AUTH_TOKEN,
      '--json'
    ];
    if (NETLIFY_ACCOUNT_ID) args.push('--site', NETLIFY_ACCOUNT_ID);

    const proc = spawn('npx', ['netlify', ...args], { stdio: 'pipe' });
    let stdout = '', stderr = '';
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      if (code === 0) {
        try {
          const data = JSON.parse(stdout);
          const url = data.appUrl || data.url;
          console.log(`  [deploy] Netlify 部署成功 → ${url}`);
          resolve({ success: true, url });
        } catch {
          const urlMatch = stdout.match(/https:\/\/[^\s]+/);
          console.log(`  [deploy] Netlify 部署完成 → ${urlMatch ? urlMatch[0] : '(解析失败)'}`);
          resolve({ success: true, url: urlMatch ? urlMatch[0] : null });
        }
      } else {
        console.error('  [deploy] Netlify 部署失败:', stderr.slice(0, 200));
        resolve({ success: false, reason: stderr.slice(0, 200) });
      }
    });
  });
}

// ─── 5. 主流程 ─────────────────────────────────────────────────
(async () => {
  let deployResult = { success: false, url: null };

  if (platform === 'vercel') {
    deployResult = await deployToVercel(tmpDeploy);
  } else if (platform === 'netlify') {
    deployResult = await deployToNetlify(tmpDeploy);
  } else {
    console.log(`  [deploy] 未知平台 "${platform}"，使用 vercel`);
    deployResult = await deployToVercel(tmpDeploy);
  }

  // 输出下载链接
  console.log('\n═══════════════════════════════════════');
  console.log('  📦 部署结果');
  console.log('═══════════════════════════════════════');
  if (deployResult.success && deployResult.url) {
    console.log(`  ✅ 在线链接：${deployResult.url}`);
    console.log(`  📥 直链下载：${deployResult.url}/${path.basename(mainVideo)}`);
  } else {
    console.log('  ⚠️  自动部署未成功，请检查环境变量或手动部署');
    console.log(`  📁 本地输出：${mainVideo}`);
    console.log(`  📁 临时目录：${tmpDeploy}（可手动上传）`);
  }

  // 清理临时文件
  try { fs.rmSync(tmpDeploy, { recursive: true, force: true }); } catch {}

  console.log(`  ⏱ 链接有效期：${expireDays} 天`);
  console.log('═══════════════════════════════════════\n');
})();
