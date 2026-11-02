#!/usr/bin/env node
/**
 * pack-manga-video.mjs · 打包优化后的 manga-video skill 为 zip
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const zipPath = path.join(repoRoot, '..', 'manga-video-optimized.zip');
const stagingDir = path.join(repoRoot, '.staging-pack');

if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
fs.mkdirSync(stagingDir, { recursive: true });

console.log('📦 正在打包 manga-video skill（优化版）...');

function copyRecursive(src, dest) {
  const items = fs.readdirSync(src);
  for (const item of items) {
    if (item === '.git' || item.startsWith('.')) continue;
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(repoRoot, stagingDir);

// 确认新增脚本存在
const newScripts = [
  ['doubao-tts.py', 'scripts/doubao-tts.py'],
  ['water-koubo.py', 'scripts/water-koubo.py'],
  ['deploy.mjs', 'scripts/deploy.mjs'],
  ['pack-manga-video.mjs', 'scripts/pack-manga-video.mjs'],
];
for (const [name, rel] of newScripts) {
  const src = path.join(repoRoot, rel);
  const dst = path.join(stagingDir, rel);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    console.log(`  ✓ ${name}`);
  }
}

const newRuntimes = [
  ['wechat-bubble.js', 'promo/runtime/wechat-bubble.js'],
  ['wechat-patch.js', 'promo/runtime/wechat-patch.js'],
];
for (const [name, rel] of newRuntimes) {
  const src = path.join(repoRoot, rel);
  const dst = path.join(stagingDir, rel);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    console.log(`  ✓ ${name}`);
  }
}

const newDocs = [
  ['styles/CHARACTERS.md', 'styles/CHARACTERS.md'],
  ['SKILL.md', 'SKILL.md'],
];
for (const [name, rel] of newDocs) {
  const src = path.join(repoRoot, rel);
  const dst = path.join(stagingDir, rel);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    console.log(`  ✓ ${name}`);
  }
}

console.log('\n✅ 文件复制完成，开始生成 ZIP...');

try {
  if (process.platform === 'win32') {
    const psCmd = `Compress-Archive -Path "${stagingDir}\\*" -DestinationPath "${zipPath}" -Force`;
    execSync(`powershell -ExecutionPolicy Bypass -Command "${psCmd}"`, { stdio: 'inherit' });
  } else {
    execSync(`cd "${stagingDir}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
  }
  const stats = fs.statSync(zipPath);
  console.log(`\n📦 ZIP 已生成：${zipPath}`);
  console.log(`   大小：${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} catch (e) {
  console.error('ZIP 打包失败：', e.message);
  console.log(`请手动打包：cd "${stagingDir}" && zip -r "../manga-video-optimized.zip" .`);
} finally {
  try { fs.rmSync(stagingDir, { recursive: true, force: true }); } catch {}
}
