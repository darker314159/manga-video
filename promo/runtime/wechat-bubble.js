// wechat-bubble.js · 微信绿色气泡对话 UI（叠加在 manga 分镜画面上）
// 引入方式：在 index.html 中，`lib/manga.js` 之后加载
//
// 用法：在 panel 回调内调用 P.wechatBubble(text, options)
//   默认右侧绿色气泡（发送者视角）
//   align: 'left' 则左侧灰色气泡（接收者视角）
//
// 微信配色参考：
//   发送者气泡：#95EC69（浅绿）
//   接收者气泡：#FFFFFF（白色）
//   字体：-apple-system, "PingFang SC", "Helvetica Neue", sans-serif
//   时间戳：#999999，11px

(function () {
  const P0 = window.PROMO;
  if (!P0) throw new Error('wechat-bubble.js must load after promo.js');
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, css, parent) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (parent) parent.appendChild(e);
    return e;
  };
  const sa = (e, attrs) => {
    for (const k in attrs) {
      if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
  };

  P0.manga = P0.manga || function () {};
  // Patch: add wechatBubble to panel API after manga.js runs
  const _origManga = P0.manga;
  P0.manga = function (F, opt) {
    const R = _origManga(F, opt);
    const _origPanelApi = R.panel || null;
    // We attach wechatBubble to the page-level API so it can access textLayer
    if (R && R.kit) {
      const origKit = R.kit;
      R.kit = function (P) {
        const k = origKit(P);
        k.wechatBubble = function (text, o = {}) {
          return wechatBubble(P, text, o);
        };
        return k;
      };
    }
    return R;
  };
  // Copy over any other properties
  for (const k of Object.keys(_origManga)) P0.manga[k] = _origManga[k];

  // Core wechat bubble renderer (called from within a panel's draw/balloon context)
  function wechatBubble(P, text, o = {}) {
    const S = P.S;
    const at = o.at ?? P.at;
    const until = o.until ?? null;
    const align = o.align ?? 'right';  // 'right' = green (sender), 'left' = white (receiver)
    const x = (o.x ?? (align === 'right' ? 0.72 : 0.18));
    const y = (o.y ?? 0.45);
    const size = (o.size ?? 0.18) * P.h;

    // Wrap in HTML overlay (like manga.js textLayer)
    const bgColor = align === 'right' ? '#95EC69' : '#FFFFFF';
    const textColor = '#000000';
    const radius = '10px';
    const padX = size * 0.18;
    const padY = size * 0.12;

    const tx = el('div', `
      position:absolute;
      left:${(x * P.S.w - padX) * S.g}px;
      top:${(y * P.h - size * 0.5 - padY) * S.g}px;
      max-width:${size * 2.8}px;
      padding:${padY * S.g}px ${padX * S.g}px;
      background:${bgColor};
      color:${textColor};
      font-family:-apple-system,"PingFang SC","Helvetica Neue",sans-serif;
      font-size:${size * 0.42}px;
      line-height:1.45;
      border-radius:${radius};
      box-shadow:0 1px 3px rgba(0,0,0,0.12);
      opacity:0;
      z-index:100;
      pointer-events:none;
      word-break:break-all;
    `, S.textLayer);
    tx.textContent = text;

    // Tail direction
    const tail = el('div', `
      position:absolute;
      width:0;height:0;
      border:${size * 0.12}px solid transparent;
      ${align === 'right'
        ? `bottom: ${padY * S.g * 0.5}px; left: -${size * 0.24}px; border-right-color:${bgColor};`
        : `bottom: ${padY * S.g * 0.5}px; right: -${size * 0.24}px; border-left-color:${bgColor};`
      }
      opacity:0;
    `, S.textLayer);

    // Time stamp
    const timeText = o.time ?? '';
    let timeEl = null;
    if (timeText) {
      timeEl = el('div', `
        position:absolute;
        ${align === 'right' ? 'right' : 'left'}:0;
        bottom:-${size * 0.38}px;
        font-size:${size * 0.2}px;
        color:#999999;
        font-family:-apple-system,"PingFang SC",sans-serif;
        white-space:nowrap;
        opacity:0;
      `, S.textLayer);
      timeEl.textContent = timeText;
    }

    // Animation
    S.fx.push((t) => {
      let op = 1;
      if (t < at) op = 0;
      else if (t < at + 0.15) op = (t - at) / 0.15;
      else op = 1;
      if (until != null && t >= until) op = Math.max(0, 1 - (t - until) / 0.2);
      sa(tx, { opacity: op.toFixed(3) });
      sa(tail, { opacity: op.toFixed(3) });
      if (timeEl) sa(timeEl, { opacity: op.toFixed(3) });
    });

    F.text(tx, 'label', text, at, until ?? P.until, { noFact: true });
    F.sfx(at - 0.05, 'blip', 0.15);
    return tx;
  }

  // Register a helper on the panel object after manga.js finishes building
  const _origPanel = P0.manga;
  // We intercept via a wrapper added after the module loads
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      // Patch existing page instances (for runtime reload)
      if (window.PROMO && window.PROMO.manga) {
        const _m = window.PROMO.manga;
        window.PROMO.manga = function (F, opt) {
          const R = _m(F, opt);
          // Expose wechatBubble on the returned object
          R.wechatBubble = function (text, o) { return wechatBubble(R._lastPanel || R, text, o); };
          return R;
        };
      }
    });
  }
})();
