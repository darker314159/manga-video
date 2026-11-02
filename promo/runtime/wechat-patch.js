// wechat-patch.js · 微信绿色气泡补丁（叠加在 manga.js 之后加载）
// 扩展 P 面板 API，添加 P.wechatBubble() 方法
// 用法：在 index.html 中，<script src="lib/manga.js"></script> 之后加载此文件

(function () {
  if (typeof window.__WECHAT_PATCHED__ !== 'undefined') return;
  window.__WECHAT_PATCHED__ = true;

  const el = (tag, css, parent) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (parent) parent.appendChild(e);
    return e;
  };

  // Patch: 找到所有 manga 创建的 panel，为其添加 wechatBubble 方法
  // 通过 monkey-patch PROMO.manga 的返回值
  const _origManga = window.PROMO && window.PROMO.manga;
  if (!_origManga) {
    console.warn('[wechat-patch] PROMO.manga not found, patch skipped');
    return;
  }

  window.PROMO.manga = function (F, opt) {
    const R = _origManga(F, opt);

    // 保存原始的 page 函数
    const _origPage = R.page;
    R.page = function (a, b, o) {
      const pg = _origPage(a, b, o);
      // 为每个新创建的 panel 添加 wechatBubble 支持
      const _origPanel = pg.panel;
      pg.panel = function (rect, panelOpts) {
        const P = _origPanel(rect, panelOpts);
        P.wechatBubble = function (text, opts = {}) {
          return drawWechatBubble(P, text, opts);
        };
        // 也添加到 kit
        if (R.kit) {
          const _origKit = R.kit;
          R.kit = function (p) {
            const k = _origKit(p);
            k.wechatBubble = function (text, opts) { return drawWechatBubble(p, text, opts); };
            return k;
          };
        }
        return P;
      };
      return pg;
    };

    // 也暴露全局辅助
    R.wechatBubble = function (P, text, opts) {
      return drawWechatBubble(P, text, opts);
    };

    return R;
  };

  // 核心：绘制微信绿色气泡
  function drawWechatBubble(P, text, o = {}) {
    const S = P.S;
    const at = o.at ?? P.at;
    const until = o.until ?? null;
    const align = o.align ?? 'right'; // 'right' = 绿色发送者, 'left' = 白色接收者
    const x = (o.x ?? (align === 'right' ? 0.72 : 0.18));
    const y = (o.y ?? 0.45);
    const sizePx = (o.size ?? 0.20) * P.h;
    const g = S.g;

    // 文字宽度估算
    const charWidth = sizePx * 0.48;
    const lineCount = Math.ceil(text.length / 12);
    const contentW = Math.min(text.length * charWidth * 0.55, sizePx * 3.2);
    const contentH = sizePx * 0.42 * Math.max(1, lineCount);
    const padX = sizePx * 0.16;
    const padY = sizePx * 0.10;
    const boxW = contentW + padX * 2;
    const boxH = contentH + padY * 2;

    const leftPx = (P.x0 + x * P.w - (align === 'right' ? boxW : 0)) * g;
    const topPx = (P.y0 + y * P.h - boxH / 2) * g;

    // 颜色
    const bgColor = align === 'right' ? '#95EC69' : '#FFFFFF';
    const textColor = '#000000';
    const timeColor = '#999999';

    // 气泡主体
    const bubble = el('div', `
      position:absolute;
      left:${leftPx.toFixed(1)}px;
      top:${topPx.toFixed(1)}px;
      width:${(boxW * g).toFixed(1)}px;
      min-height:${(boxH * g).toFixed(1)}px;
      max-width:${(sizePx * 3.5 * g).toFixed(1)}px;
      padding:${(padY * g).toFixed(1)}px ${(padX * g).toFixed(1)}px;
      background:${bgColor};
      color:${textColor};
      font-family:-apple-system,"PingFang SC","Helvetica Neue",sans-serif;
      font-size:${(sizePx * 0.40 * g).toFixed(1)}px;
      line-height:1.45;
      border-radius: ${align === 'right' ? '12px 12px 2px 12px' : '12px 12px 12px 2px'};
      box-shadow:0 1px 4px rgba(0,0,0,0.15);
      opacity:0;
      z-index:100;
      pointer-events:none;
      word-break:break-all;
      white-space:pre-wrap;
    `, S.textLayer);
    bubble.textContent = text;

    // 小三角箭头
    const tailSize = sizePx * 0.10 * g;
    const tail = el('div', `
      position:absolute;
      width:0;height:0;
      border:${tailSize}px solid transparent;
      ${align === 'right'
        ? `bottom:${(padY * g * 0.4).toFixed(1)}px; left:${(-tailSize * 1.8).toFixed(1)}px; border-right-color:${bgColor};`
        : `bottom:${(padY * g * 0.4).toFixed(1)}px; right:${(-tailSize * 1.8).toFixed(1)}px; border-left-color:${bgColor};`
      }
      opacity:0;
    `, S.textLayer);

    // 时间戳
    const timeText = o.time ?? '';
    let timeEl = null;
    if (timeText) {
      timeEl = el('div', `
        position:absolute;
        ${align === 'right' ? 'right' : 'left'}:0;
        bottom:${(-sizePx * 0.36 * g).toFixed(1)}px;
        font-size:${(sizePx * 0.20 * g).toFixed(1)}px;
        color:${timeColor};
        font-family:-apple-system,"PingFang SC",sans-serif;
        white-space:nowrap;
        opacity:0;
      `, S.textLayer);
      timeEl.textContent = timeText;
    }

    // 入场动画
    S.fx.push((t) => {
      let op = 0;
      if (t >= at) {
        op = Math.min(1, (t - at) / 0.12);
        // 弹出效果
        const bounce = op < 1 ? 1 + Math.sin(op * Math.PI) * 0.08 : 1;
        bubble.style.transform = `scale(${bounce.toFixed(3)})`;
        tail.style.transform = `scale(${bounce.toFixed(3)})`;
      }
      if (until != null && t >= until) {
        op = Math.max(0, 1 - (t - until) / 0.18);
      }
      bubble.style.opacity = op.toFixed(3);
      tail.style.opacity = op.toFixed(3);
      if (timeEl) timeEl.style.opacity = op.toFixed(3);
    });

    // 注册文字（事实检查用）
    if (S.F && S.F.text) {
      S.F.text(bubble, 'label', text, at, until ?? P.until, { noFact: o.noFact });
    }

    // 音效
    if (S.F && S.F.sfx && o.sound !== false) {
      S.F.sfx(at - 0.05, 'blip', 0.12, { dur: 0.15 });
    }

    return bubble;
  }

  // 也暴露给 panel API
  if (window.PROMO && window.PROMO.manga) {
    // 兼容：如果已有 panel 被创建，重新包装
    const _checkAndPatch = () => {
      // 这个在页面渲染时自动处理
    };
  }
})();
