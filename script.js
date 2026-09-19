/* ===================================================================
   B(ring)Y(our)O(wn)T — vanilla JS rebuild
   Screens: home, browse, studio, cart, confirm, track
=================================================================== */

/* ---------------- DATA ---------------- */
const FABRICS = [
  { id: 'heavy', name: 'Heavy combed cotton', gsm: '240 GSM', note: 'Boxy, structural drape', price: 34 },
  { id: 'mid',   name: 'Mid-weight cotton',   gsm: '180 GSM', note: 'Everyday, softens fast', price: 26 },
  { id: 'tri',   name: 'Tri-blend',           gsm: '150 GSM', note: 'Fluid, heather finish',  price: 31 },
  { id: 'org',   name: 'Organic ringspun',    gsm: '200 GSM', note: 'GOTS certified, matte',  price: 38 },
];

const COLORS = [
  { id: 'ink',      name: 'Ink black',   code: '#201E1D', hex: '#201e1d', ink: '#f3f2f2' },
  { id: 'bone',     name: 'Bone',        code: '#F3F2F2', hex: '#f3f2f2', ink: '#201e1d' },
  { id: 'red',      name: 'Rust',        code: '#B24A2E', hex: '#b24a2e', ink: '#f3f2f2' },
  { id: 'concrete', name: 'Concrete',    code: '#9B9797', hex: '#9b9797', ink: '#201e1d' },
  { id: 'slate',    name: 'Slate',       code: '#444141', hex: '#444141', ink: '#f3f2f2' },
  { id: 'clay',     name: 'Clay',        code: '#8A7355', hex: '#8a7355', ink: '#f3f2f2' },
];

const LIBRARY = [
  { id: 'grid12',   name: 'Grid 12',   kind: 'bars',   tags: ['GEOMETRIC', 'MONO'],    meta: 'Geometric · 1 colour' },
  { id: 'block',    name: 'Offset',    kind: 'block',  tags: ['GEOMETRIC'],            meta: 'Geometric · 2 colour' },
  { id: 'typeset',  name: 'Typeset',   kind: 'type',   tags: ['TYPE'],                 meta: 'Type · 1 colour' },
  { id: 'circle60', name: 'Circle 60', kind: 'circle', tags: ['GEOMETRIC', 'LIMITED'], meta: 'Limited · 1 colour' },
  { id: 'rule2',    name: 'Rule 2PX',  kind: 'rule',   tags: ['MONO'],                 meta: 'Mono · 1 colour' },
  { id: 'archivo',  name: 'Archivo',   kind: 'type',   tags: ['TYPE', 'LIMITED'],      meta: 'Type · limited run' },
  { id: 'stack',    name: 'Stack',     kind: 'bars',   tags: ['GEOMETRIC'],            meta: 'Geometric · 1 colour' },
  { id: 'halfmoon', name: 'Halfmoon',  kind: 'circle', tags: ['MONO'],                 meta: 'Mono · 2 colour' },
];

const CHIPS = ['brutalist grid', 'red on bone', 'type only', 'halftone circle'];

const SIZE_TABLE = {
  XS: ['46 cm', '66 cm', '41 cm'], S: ['49 cm', '69 cm', '43 cm'], M: ['52 cm', '72 cm', '45 cm'],
  L: ['55 cm', '74 cm', '47 cm'], XL: ['58 cm', '76 cm', '50 cm'], XXL: ['61 cm', '78 cm', '52 cm'],
};

const ROUTES = [
  { num: '01', title: 'Pick from the library', body: 'Eight house prints, separated and press-ready. No extra fee.', cta: 'BROWSE', screen: 'browse' },
  { num: '02', title: 'Bring your own file', body: 'PNG, SVG, PDF or AI at 300 DPI. A human checks it before film.', cta: 'UPLOAD', screen: 'studio', tab: 'DESIGN', src: 'UP' },
  { num: '03', title: 'Generate one', body: 'Describe the print, get four variants, fit the one you want.', cta: 'GENERATE', screen: 'studio', tab: 'DESIGN', src: 'AI' },
];

const STATS = [{ n: '4', label: 'Fabrics' }, { n: '6', label: 'Colours' }, { n: '72h', label: 'To ship' }, { n: '1', label: 'Min order' }];

function trackSteps(fab) {
  return [
    ['Order placed', 'Payment taken, file queued for check', 'Tue 09:41', true],
    ['Artwork checked', 'Separated to four colours by hand', 'Tue 14:02', true],
    ['On the press', 'Water-based ink, ' + fab.gsm + ' ' + fab.name.toLowerCase(), 'Wed 08:10', true],
    ['Shipped', 'Tracked 48h — label not yet scanned', 'Pending', false],
  ];
}

/* Placeholder production/process photography for the gallery strip. */
const GALLERY = [
  { seed: 'byot-press-1',  cap: 'On the press' },
  { seed: 'byot-fabric-2', cap: 'GSM check' },
  { seed: 'byot-film-3',   cap: 'Film separation' },
  { seed: 'byot-fold-4',   cap: 'Folded & bagged' },
  { seed: 'byot-thread-5', cap: 'Quality pass' },
  { seed: 'byot-studio-6', cap: 'Leeds studio' },
  { seed: 'byot-ink-7',    cap: 'Water-based ink' },
  { seed: 'byot-pack-8',   cap: 'Ready to ship' },
];

/* ---------------- STATE ---------------- */
const state = {
  screen: 'home', tab: 'DESIGN', src: 'AI', fabricId: 'heavy', colorId: 'ink',
  design: { id: 'grid12', name: 'Grid 12', kind: 'bars', origin: 'library' },
  uploaded: false, size: 'M', fit: 'Regular', qty: 1,
  prompt: 'A brutalist grid of red bars, bone ground, no gradients',
  genStatus: 'idle', genResults: [], query: '', filter: 'ALL', cart: [], order: null,
};

function getFabric() { return FABRICS.find(f => f.id === state.fabricId); }
function getColor() { return COLORS.find(c => c.id === state.colorId); }
function fee() { const d = state.design; return d ? (d.origin === 'ai' ? 4 : d.origin === 'upload' ? 2 : 0) : 0; }
function unit() { return getFabric().price + fee(); }
function cartTotal() { return state.cart.reduce((s, i) => s + i.unit * i.qty, 0); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* ---------------- PRINT ART (shared icon system) ---------------- */
function printArtHTML(kind, label) {
  label = (label || 'BYOT').slice(0, 10);
  switch (kind) {
    case 'bars':
      return `<div class="pa-wrap"><div class="pa-bars"><div style="height:100%"></div><div style="height:62%"></div><div style="height:86%"></div><div style="height:40%"></div></div></div>`;
    case 'block':
      return `<div class="pa-wrap"><div class="pa-block"><div class="a"></div><div class="b"></div></div></div>`;
    case 'type':
      return `<div class="pa-wrap"><div class="pa-type"><div class="label">${esc(label)}</div><div class="rule"></div></div></div>`;
    case 'circle':
      return `<div class="pa-wrap"><div class="pa-circle"><div class="ring"></div><div class="line"></div></div></div>`;
    default:
      return `<div class="pa-wrap"><div class="pa-rule"><div></div><div></div><div></div></div></div>`;
  }
}

/* Shirt mockup: colour block + collar cutout + chest print area — same
   clip-path geometry as the original design, just recoloured. */
function shirtMockupHTML(colorHex, ink, kind, label, maxWidth) {
  maxWidth = maxWidth || 340;
  return `
    <div class="byot-shirt" style="width:min(${maxWidth}px,100%)">
      <div class="byot-shirt-body" style="background:${colorHex}"></div>
      <div class="byot-shirt-collar"></div>
      <div class="byot-shirt-chest" style="color:${ink}">${printArtHTML(kind, label)}</div>
    </div>`;
}

function printCellHTML(kind, label, meta, extra) {
  return `
    <div style="aspect-ratio:1.1;padding:26px;color:var(--color-text)">${printArtHTML(kind, label)}</div>
    <div style="padding:0 16px 18px">
      <div style="font-family:Archivo;font-weight:800;font-size:13px;letter-spacing:0.03em;text-transform:uppercase">${esc(label)}</div>
      <div style="font-size:10.5px;color:var(--color-neutral-700)">${esc(meta || '')}</div>
    </div>${extra || ''}`;
}

/* ---------------- NAVIGATION ---------------- */
function go(screen, extra) {
  state.screen = screen;
  if (extra) Object.assign(state, extra);
  render();
  window.scrollTo(0, 0);
}
function pickDesign(design, origin) {
  state.design = { ...design, origin };
  state.screen = 'studio';
  state.tab = 'DESIGN';
  render();
  window.scrollTo(0, 0);
}

/* ---------------- AI GENERATE (simulated, client-side only) ---------------- */
let genTimer = null;
function generate() {
  state.genStatus = 'working';
  state.genResults = [];
  render();
  clearTimeout(genTimer);
  genTimer = setTimeout(() => {
    const kinds = ['bars', 'block', 'type', 'circle', 'rule'];
    const word = (state.prompt.replace(/[^a-z ]/gi, '').trim().split(/\s+/).filter(w => w.length > 3)[0] || 'byot').toUpperCase();
    const seed = state.prompt.length;
    state.genStatus = 'done';
    state.genResults = [0, 1, 2, 3].map(i => ({
      id: 'gen' + seed + i, name: word + ' 0' + (i + 1), kind: kinds[(seed + i) % kinds.length], meta: 'Generated · 4 colour',
    }));
    render();
  }, 1200);
}

function addToCart() {
  const d = state.design || { id: 'blank', name: 'Blank', kind: 'rule', origin: 'library' };
  state.cart.push({
    key: Date.now(), design: d, fabric: getFabric(), color: getColor(),
    size: state.size, fit: state.fit, qty: state.qty, unit: unit(),
  });
  go('cart');
}
function removeFromCart(key) {
  state.cart = state.cart.filter(i => i.key !== key);
  render();
}
function placeOrder() {
  const item = state.cart[0];
  state.order = { id: 'BYOT-' + (4100 + state.cart.length * 7), item, paid: cartTotal() + 6 };
  state.cart = [];
  go('confirm');
}

/* ---------------- DOWNLOAD MOCKUP AS PNG ---------------- */
function drawPrintArtCanvas(ctx, kind, label, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (kind === 'bars') {
    const w = size * 0.7, gap = w * 0.14, bw = (w - gap * 3) / 4, h = size * 0.64;
    const heights = [1, 0.62, 0.86, 0.40];
    let x = cx - w / 2;
    heights.forEach(hf => { ctx.fillRect(x, cy + size * 0.32 - h * hf, bw, h * hf); x += bw + gap; });
  } else if (kind === 'block') {
    const s = size * 0.72;
    ctx.fillRect(cx - s / 2, cy - s / 2, s * 0.62, s * 0.62);
    ctx.lineWidth = 3;
    ctx.strokeRect(cx + s / 2 - s * 0.52, cy + s / 2 - s * 0.52, s * 0.52, s * 0.52);
  } else if (kind === 'type') {
    ctx.font = '800 ' + Math.round(size * 0.17) + 'px Archivo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((label || 'BYOT').toUpperCase().slice(0, 10), cx, cy);
    ctx.fillRect(cx - size * 0.41, cy + size * 0.08, size * 0.82, 3);
  } else if (kind === 'circle') {
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.37, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillRect(cx - size * 0.37, cy - 1.5, size * 0.74, 3);
  } else {
    const w = size * 0.78;
    ctx.fillRect(cx - w / 2, cy - size * 0.13, w, 4);
    ctx.fillRect(cx - w / 2, cy, w * 0.64, 4);
    ctx.fillRect(cx - w / 2, cy + size * 0.13, w * 0.34, 4);
  }
  ctx.restore();
}

async function downloadMockupPNG(colorHex, ink, kind, label, filename) {
  const canvas = document.createElement('canvas');
  const W = 900, H = 1000;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#faf9f6';
  ctx.fillRect(0, 0, W, H);

  const bodyW = 620, bodyH = 690, bx = (W - bodyW) / 2, by = 140;
  ctx.fillStyle = colorHex;
  ctx.beginPath();
  const pts = [
    [0.31, 0], [0.69, 0], [1, 0.13], [1, 0.34], [0.85, 0.36],
    [0.85, 1], [0.15, 1], [0.15, 0.36], [0, 0.34], [0, 0.13],
  ].map(([px, py]) => [bx + px * bodyW, by + py * bodyH]);
  ctx.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#eeece7';
  ctx.beginPath();
  ctx.ellipse(bx + bodyW / 2, by, bodyW * 0.09, bodyH * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();

  await document.fonts.load('800 60px Archivo');
  drawPrintArtCanvas(ctx, kind, label, bx + bodyW / 2, by + bodyH * 0.42, bodyW * 0.46, ink);

  ctx.fillStyle = '#1c1b19';
  ctx.font = '800 22px Archivo, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('B(RING)Y(OUR)O(WN)T', bx, by + bodyH + 60);
  ctx.font = '400 15px Archivo, sans-serif';
  ctx.fillStyle = '#5f5c56';
  ctx.fillText((label || 'Design') + ' · ' + colorHex.toUpperCase(), bx, by + bodyH + 88);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

  /* When running inside the Claude Artifact viewer, a plain <a download>
     click is inert — use the platform's downloads capability instead.
     When opened as a plain local file (or any other browser context),
     window.claude is absent, so we fall back to the classic anchor trick. */
  let handled = false;
  if (typeof window.claude !== 'undefined' && typeof window.claude.use === 'function') {
    try {
      const downloads = await window.claude.use('downloads');
      if (downloads) {
        await downloads.save({ filename, data: blob });
        handled = true;
      }
    } catch (err) {
      /* declined, rate_limited, etc. — fall through to the anchor method */
    }
  }

  if (!handled) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  showToast('Mockup downloaded ✓');
}

/* ---------------- TOAST ---------------- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('byot-toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------------- NAV ---------------- */
function renderNav() {
  const links = [['Home', 'home'], ['Library', 'browse'], ['Studio', 'studio'], ['Tracking', 'track']];
  document.getElementById('byot-navlinks').innerHTML = links.map(([label, screen]) => `
    <button class="${state.screen === screen ? 'active' : ''}" data-action="go" data-screen="${screen}">${label}</button>
  `).join('');
  document.getElementById('byot-cart-btn').textContent = state.cart.length ? 'BAG · ' + state.cart.length : 'BAG';
}

/* ---------------- HOME ---------------- */
function renderHome() {
  const galleryDouble = GALLERY.concat(GALLERY);
  return `
  <div>
    <div class="byot-hero" style="display:grid;grid-template-columns:1.15fr 1fr;border-bottom:2px solid var(--color-divider)">
      <div style="padding:64px 24px 56px;border-right:2px solid var(--color-divider)">
        <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--color-accent)">Custom print · minimum order one</div>
        <div style="font-family:Archivo;font-weight:800;font-size:clamp(48px,7vw,104px);line-height:0.88;letter-spacing:-0.04em;text-transform:uppercase;margin-top:20px;text-wrap:balance">Bring your own T.</div>
        <div style="height:2px;background:var(--color-divider);margin:32px 0 20px;max-width:620px"></div>
        <div style="font-size:17px;line-height:1.5;max-width:560px;color:var(--color-neutral-800)">Four fabrics. Six garment-dyed colours. Your artwork, ours, or one you write into existence in a sentence. Printed in Leeds on water-based ink and shipped inside 72 hours.</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:32px">
          <button class="btn btn-primary" data-action="go" data-screen="studio" style="min-height:52px;padding-inline:20px;font-size:14px;letter-spacing:0.08em;justify-content:flex-start;text-align:left;white-space:nowrap">START A DESIGN &rarr;</button>
          <button class="btn btn-secondary" data-action="go" data-screen="browse" style="min-height:52px;padding-inline:20px;font-size:14px;letter-spacing:0.08em;justify-content:flex-start;text-align:left;white-space:nowrap">BROWSE THE LIBRARY</button>
        </div>
      </div>
      <div style="background:var(--color-surface);display:grid;place-items:center;padding:40px 24px">
        ${shirtMockupHTML(getColor().hex, getColor().ink, state.design.kind, state.design.name, 340)}
      </div>
    </div>

    <div class="byot-grid-4" style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:2px solid var(--color-divider)">
      ${STATS.map(s => `
        <div style="padding:26px 24px;border-right:1px solid var(--color-divider)">
          <div style="font-family:Archivo;font-weight:800;font-size:40px;letter-spacing:-0.03em;line-height:1">${s.n}</div>
          <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-top:6px">${s.label}</div>
        </div>`).join('')}
    </div>

    <div class="byot-gallery">
      <div class="byot-gallery-head">
        <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--color-accent)">From the studio floor</div>
        <div style="font-family:Archivo;font-weight:800;font-size:clamp(24px,3.4vw,38px);letter-spacing:-0.02em;margin-top:8px">Fresh off the press</div>
      </div>
      <div class="byot-gallery-viewport">
        <div class="byot-gallery-track">
          ${galleryDouble.map(g => `
            <figure>
              <img src="https://picsum.photos/seed/${g.seed}/280/340" alt="${esc(g.cap)}" loading="lazy">
              <figcaption>${esc(g.cap)}</figcaption>
            </figure>`).join('')}
        </div>
      </div>
    </div>

    <div style="background:var(--color-accent);color:var(--color-bg);padding:64px 24px">
      <div style="max-width:1200px">
        <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.9">Generate</div>
        <div style="font-family:Archivo;font-weight:800;font-size:clamp(34px,5.4vw,76px);line-height:0.92;letter-spacing:-0.035em;margin-top:16px;text-transform:uppercase;max-width:20ch">Write a sentence. Wear it by Friday.</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:32px;max-width:860px">
          <button data-action="go" data-screen="studio" data-tab="DESIGN" data-src="AI" style="flex:1;min-width:260px;text-align:left;background:var(--color-bg);color:var(--color-neutral-700);border:0;padding:17px 18px;font-family:Archivo;font-size:16px;cursor:pointer">a brutalist grid, red on bone&hellip;</button>
          <button data-action="go" data-screen="studio" data-tab="DESIGN" data-src="AI" style="background:var(--color-text);color:var(--color-bg);border:0;padding:17px 22px;font-family:Archivo;font-weight:800;font-size:14px;letter-spacing:0.08em;cursor:pointer">GENERATE 4</button>
        </div>
        <div style="font-size:13px;margin-top:14px;opacity:0.9">Four print-ready variants in about eight seconds. Vectorised to four colours before it reaches the press.</div>
      </div>
    </div>

    <div class="byot-cols-3" style="display:grid;grid-template-columns:repeat(3,1fr);border-bottom:2px solid var(--color-divider)">
      ${ROUTES.map(r => `
        <div style="padding:40px 24px;border-right:1px solid var(--color-divider)">
          <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-accent)">${r.num}</div>
          <div style="font-family:Archivo;font-weight:800;font-size:26px;letter-spacing:-0.02em;line-height:1.05;margin-top:12px">${r.title}</div>
          <div style="font-size:14px;line-height:1.55;color:var(--color-neutral-800);margin-top:10px">${r.body}</div>
          <button class="btn btn-ghost" data-action="go" data-screen="${r.screen}" ${r.tab ? `data-tab="${r.tab}"` : ''} ${r.src ? `data-src="${r.src}"` : ''} style="font-size:11px;letter-spacing:0.08em;padding:8px 0;margin-top:14px;justify-content:flex-start;text-align:left;white-space:nowrap">${r.cta} &rarr;</button>
        </div>`).join('')}
    </div>

    <div style="padding:48px 24px 16px;display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div style="font-family:Archivo;font-weight:800;font-size:32px;letter-spacing:-0.025em">From the library</div>
      <button class="btn btn-secondary" data-action="go" data-screen="browse" style="font-size:11px;letter-spacing:0.08em;padding:9px 12px;justify-content:flex-start;text-align:left;white-space:nowrap">ALL 8 PRINTS &rarr;</button>
    </div>
    <div class="byot-grid-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:var(--color-divider);border-top:2px solid var(--color-divider);border-bottom:2px solid var(--color-divider)">
      ${LIBRARY.slice(0, 4).map(p => `
        <button data-action="pickDesign" data-id="${p.id}" data-origin="library" style="background:var(--color-bg);border:0;padding:0;cursor:pointer;text-align:left;display:block;color:var(--color-text)">
          ${printCellHTML(p.kind, p.name, p.meta)}
        </button>`).join('')}
    </div>
    <div style="padding:28px 24px 56px;font-size:12px;color:var(--color-neutral-700);max-width:600px;line-height:1.6">Water-based ink, printed in Leeds. Artwork is checked by a human before it goes to film. Returns inside 30 days, even on custom work.</div>
  </div>`;
}

/* ---------------- BROWSE ---------------- */
function renderBrowse() {
  const q = state.query.trim().toLowerCase();
  const results = LIBRARY.filter(p =>
    (state.filter === 'ALL' || p.tags.includes(state.filter)) &&
    (!q || p.name.toLowerCase().includes(q) || p.tags.join(' ').toLowerCase().includes(q)));
  const filters = ['ALL', 'GEOMETRIC', 'TYPE', 'MONO', 'LIMITED'];

  return `
  <div>
    <div style="padding:40px 24px 24px;display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;border-bottom:1px solid var(--color-divider)">
      <div style="flex:1;min-width:260px">
        <div style="font-family:Archivo;font-weight:800;font-size:40px;letter-spacing:-0.03em;line-height:1">Library</div>
        <div style="font-size:13px;color:var(--color-neutral-700);margin-top:6px">${results.length} prints ready to fit</div>
      </div>
      <input class="input" id="byot-search" value="${esc(state.query)}" placeholder="Search prints, type, tags" style="min-height:46px;max-width:320px">
    </div>
    <div style="display:flex;border-bottom:2px solid var(--color-divider);overflow-x:auto">
      ${filters.map(f => `
        <button data-action="filter" data-filter="${f}" style="font-family:Archivo,system-ui,sans-serif;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:11px;padding:13px 18px;white-space:nowrap;cursor:pointer;border:0;border-right:1px solid var(--color-divider);background:${state.filter === f ? 'var(--color-accent)' : 'transparent'};color:${state.filter === f ? 'var(--color-bg)' : 'var(--color-text)'}">${f}</button>`).join('')}
    </div>
    <div class="byot-grid-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:var(--color-divider);border-bottom:2px solid var(--color-divider)">
      ${results.map(p => `
        <button data-action="pickDesign" data-id="${p.id}" data-origin="library" style="background:var(--color-bg);border:0;padding:0;cursor:pointer;text-align:left;display:block;color:var(--color-text);outline:${state.design && state.design.id === p.id ? '2px solid var(--color-accent)' : 'none'};outline-offset:-2px">
          ${printCellHTML(p.kind, p.name, p.meta)}
        </button>`).join('')}
    </div>
  </div>`;
}

/* ---------------- STUDIO ---------------- */
function renderStudio() {
  const s = state, col = getColor(), fab = getFabric();
  const tabs = ['FABRIC', 'COLOR', 'DESIGN', 'SIZE'];
  const tabLabel = { FABRIC: 'FABRIC', COLOR: 'COLOUR', DESIGN: 'DESIGN', SIZE: 'SIZE' };

  const tabsHTML = tabs.map(t => `
    <button data-action="tab" data-tab="${t}" style="font-family:Archivo,system-ui,sans-serif;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:12px;padding:16px 12px;text-align:left;cursor:pointer;border:0;border-right:1px solid var(--color-divider);background:${s.tab === t ? 'var(--color-accent)' : 'transparent'};color:${s.tab === t ? 'var(--color-bg)' : 'var(--color-text)'}">${tabLabel[t]}</button>`).join('');

  let panel = '';
  if (s.tab === 'FABRIC') {
    panel = `
      <div>
        ${FABRICS.map(f => `
          <button data-action="setFabric" data-id="${f.id}" style="width:100%;display:flex;gap:14px;align-items:center;padding:18px 24px;cursor:pointer;text-align:left;border:0;border-bottom:1px solid var(--color-divider);background:${s.fabricId === f.id ? 'var(--color-accent-100)' : 'transparent'};color:var(--color-text)">
            <div style="width:16px;height:16px;flex:none;border:2px solid ${s.fabricId === f.id ? 'var(--color-accent)' : 'var(--color-divider)'};background:${s.fabricId === f.id ? 'var(--color-accent)' : 'transparent'}"></div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><span style="font-family:Archivo;font-weight:800;font-size:16px;text-transform:uppercase">${f.name}</span><span class="tag tag-neutral" style="font-size:9px;letter-spacing:0.1em">${f.gsm}</span></div>
              <div style="font-size:13px;color:var(--color-neutral-700);margin-top:3px">${f.note}</div>
            </div>
            <div style="font-family:Archivo;font-weight:800;font-size:16px">$${f.price}</div>
          </button>`).join('')}
        <div style="padding:18px 24px;font-size:12px;line-height:1.6;color:var(--color-neutral-700)">Heavier cloth holds a hard edge on large solids; tri-blend softens fine line work.</div>
      </div>`;
  } else if (s.tab === 'COLOR') {
    panel = `
      <div style="padding:24px">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
          ${COLORS.map(c => `
            <button data-action="setColor" data-id="${c.id}" style="background:transparent;border:0;padding:0;cursor:pointer;text-align:left">
              <div style="width:100%;aspect-ratio:1;background:${c.hex};border:1px solid var(--color-neutral-400);outline:${s.colorId === c.id ? '3px solid var(--color-accent)' : 'none'};outline-offset:3px;margin-bottom:10px"></div>
              <div style="font-family:Archivo,system-ui,sans-serif;font-weight:800;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:${s.colorId === c.id ? 'var(--color-accent)' : 'var(--color-text)'}">${c.name}</div>
              <div style="font-size:10px;color:var(--color-neutral-600)">${c.code}</div>
            </button>`).join('')}
        </div>
        <div style="height:2px;background:var(--color-divider);margin:26px 0 14px"></div>
        <div style="font-size:12px;line-height:1.6;color:var(--color-neutral-700)">Colours are garment-dyed lots — expect a half-shade of drift between runs. Order a swatch card for free.</div>
      </div>`;
  } else if (s.tab === 'DESIGN') {
    const sources = [['LIBRARY', 'LIB'], ['UPLOAD', 'UP'], ['AI', 'AI']];
    const sourcesHTML = sources.map(([label, id]) => `
      <button data-action="setSrc" data-id="${id}" style="font-family:Archivo,system-ui,sans-serif;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:12px;padding:16px 12px;text-align:left;cursor:pointer;border:0;border-right:1px solid var(--color-divider);background:${s.src === id ? 'var(--color-accent)' : 'transparent'};color:${s.src === id ? 'var(--color-bg)' : 'var(--color-text)'}">${label}</button>`).join('');

    let sub = '';
    if (s.src === 'AI') {
      const genPending = s.genStatus === 'working';
      const cells = genPending ? [0, 1, 2, 3].map(i => ({ pending: true, label: '0' + (i + 1) })) : s.genResults;
      const genCellsHTML = cells.map(g => g.pending ? `
          <button disabled style="background:var(--color-bg);border:0;padding:0;cursor:default;text-align:left;display:block;color:var(--color-text)">
            <div style="aspect-ratio:1.15;padding:22px;display:grid;place-items:center;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-neutral-600)">${g.label}</div>
            <div style="padding:0 14px 14px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;font-family:Archivo;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Rendering</div>
          </button>` : `
          <button data-action="pickDesign" data-id="${g.id}" data-origin="ai" data-kind="${g.kind}" data-name="${esc(g.name)}" style="background:var(--color-bg);border:0;padding:0;cursor:pointer;text-align:left;display:block;color:var(--color-text);outline:${s.design && s.design.id === g.id ? '2px solid var(--color-accent)' : 'none'};outline-offset:-2px">
            <div style="aspect-ratio:1.15;padding:22px">${printArtHTML(g.kind, g.name)}</div>
            <div style="padding:0 14px 14px;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;font-family:Archivo;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(g.name)}</div>
          </button>`).join('');

      sub = `
        <div style="padding:24px">
          <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-accent);margin-bottom:10px">Describe the print</div>
          <textarea class="input" id="byot-prompt" style="min-height:92px;font-size:15px;line-height:1.45">${esc(s.prompt)}</textarea>
          <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
            <button data-action="generate" class="btn btn-primary" style="flex:1;min-width:180px;min-height:48px;padding-inline:16px;letter-spacing:0.08em;justify-content:flex-start;white-space:nowrap">${genPending ? 'GENERATING…' : s.genResults.length ? 'GENERATE AGAIN' : 'GENERATE 4'}</button>
            <button data-action="shuffle" class="btn btn-secondary" style="min-height:48px;padding-inline:14px;font-size:11px;letter-spacing:0.08em;justify-content:flex-start;white-space:nowrap">SURPRISE ME</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">
            ${CHIPS.map(c => `<button data-action="setPrompt" data-value="${esc(c[0].toUpperCase() + c.slice(1))}" class="tag tag-outline" style="cursor:pointer;background:transparent;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;white-space:nowrap">${esc(c)}</button>`).join('')}
          </div>
          <div style="height:2px;background:var(--color-divider);margin:22px 0 14px"></div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px">
            <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-neutral-700)">${genPending ? 'Rendering four variants' : s.genResults.length ? 'Results — click to fit' : 'Results appear here'}</div>
            <div style="font-size:11px;color:var(--color-neutral-600)">+$4 / print</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--color-divider);border:1px solid var(--color-divider)">${genCellsHTML}</div>
          <div style="font-size:12px;line-height:1.6;color:var(--color-neutral-700);margin-top:14px">Generated files are vectorised to four colours before print. You own what you make here.</div>
        </div>`;
    } else if (s.src === 'UP') {
      sub = `
        <div style="padding:24px">
          <button data-action="fakeUpload" style="width:100%;border:2px dashed var(--color-divider);background:var(--color-surface);padding:48px 24px;cursor:pointer;text-align:left;display:block">
            <div style="font-family:Archivo;font-weight:800;font-size:24px;letter-spacing:-0.02em">Drop a file</div>
            <div style="font-size:13px;color:var(--color-neutral-700);margin-top:6px">PNG, SVG, PDF or AI · up to 40 MB</div>
            <div style="display:inline-flex;margin-top:18px;background:var(--color-accent);color:var(--color-bg);padding:12px 16px;font-family:Archivo;font-weight:800;font-size:12px;letter-spacing:0.08em">CHOOSE FILE</div>
          </button>
          ${s.uploaded ? `
          <div style="border:2px solid var(--color-divider);border-top:0;padding:16px 20px;display:flex;gap:14px;align-items:center;background:var(--color-bg)">
            <div style="width:52px;height:52px;flex:none;color:var(--color-text)">${printArtHTML('block', 'FILE')}</div>
            <div style="flex:1;min-width:0"><div style="font-family:Archivo;font-weight:800;font-size:14px;text-transform:uppercase">studio-nine-mark.svg</div><div style="font-size:11px;color:var(--color-neutral-700)">2480 &times; 3508 px &middot; 300 DPI &middot; CMYK</div></div>
            <span class="tag tag-accent" style="font-size:9px;letter-spacing:0.1em">PRINT READY</span>
          </div>` : ''}
          <div style="height:2px;background:var(--color-divider);margin:24px 0 12px"></div>
          <table class="table"><tbody>
            <tr><td>Minimum resolution</td><td style="text-align:right">300 DPI</td></tr>
            <tr><td>Max print area</td><td style="text-align:right">A4 / 210&times;297</td></tr>
            <tr><td>Ink colours</td><td style="text-align:right">Up to 6</td></tr>
          </tbody></table>
        </div>`;
    } else {
      sub = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--color-divider)">
          ${LIBRARY.map(p => `
            <button data-action="pickDesign" data-id="${p.id}" data-origin="library" style="background:var(--color-bg);border:0;padding:0;cursor:pointer;text-align:left;display:block;color:var(--color-text);outline:${s.design && s.design.id === p.id ? '2px solid var(--color-accent)' : 'none'};outline-offset:-2px">
              <div style="aspect-ratio:1.15;padding:24px">${printArtHTML(p.kind, p.name)}</div>
              <div style="padding:0 14px 16px"><div style="font-family:Archivo;font-weight:800;font-size:12px;letter-spacing:0.04em;text-transform:uppercase">${p.name}</div><div style="font-size:10.5px;color:var(--color-neutral-700)">${p.meta}</div></div>
            </button>`).join('')}
        </div>`;
    }
    panel = `<div><div style="display:grid;grid-template-columns:repeat(3,1fr);border-bottom:2px solid var(--color-divider)">${sourcesHTML}</div>${sub}</div>`;
  } else if (s.tab === 'SIZE') {
    const measures = SIZE_TABLE[s.size];
    const sizes = Object.keys(SIZE_TABLE);
    panel = `
      <div style="padding:24px">
        <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-neutral-700);margin-bottom:12px">Size</div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);border:1px solid var(--color-divider)">
          ${sizes.map(z => `<button data-action="setSize" data-id="${z}" style="font-family:Archivo,system-ui,sans-serif;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;font-size:12px;padding:15px 4px;text-align:center;cursor:pointer;border:0;border-right:1px solid var(--color-divider);background:${s.size === z ? 'var(--color-accent)' : 'transparent'};color:${s.size === z ? 'var(--color-bg)' : 'var(--color-text)'}">${z}</button>`).join('')}
        </div>
        <div style="display:flex;gap:16px;margin-top:16px">
          <label class="radio"><input type="radio" name="wfit" data-action="setFit" data-id="Regular" ${s.fit === 'Regular' ? 'checked' : ''}><span class="dot"></span>Regular</label>
          <label class="radio"><input type="radio" name="wfit" data-action="setFit" data-id="Boxy" ${s.fit === 'Boxy' ? 'checked' : ''}><span class="dot"></span>Boxy</label>
        </div>
        <div style="height:2px;background:var(--color-divider);margin:22px 0 6px"></div>
        <table class="table"><thead><tr><th>Measure</th><th style="text-align:right">${s.size}</th></tr></thead><tbody>
          <tr><td>Chest, flat</td><td style="text-align:right">${measures[0]}</td></tr>
          <tr><td>Body length</td><td style="text-align:right">${measures[1]}</td></tr>
          <tr><td>Shoulder</td><td style="text-align:right">${measures[2]}</td></tr>
        </tbody></table>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px">
          <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-neutral-700)">Quantity</div>
          <div style="display:flex;align-items:center;border:1px solid var(--color-divider)">
            <button data-action="qty" data-delta="-1" style="width:44px;height:44px;background:transparent;border:0;border-right:1px solid var(--color-divider);cursor:pointer;font-size:18px;color:var(--color-text)">&minus;</button>
            <div style="width:56px;text-align:center;font-family:Archivo;font-weight:800;font-size:17px">${s.qty}</div>
            <button data-action="qty" data-delta="1" style="width:44px;height:44px;background:transparent;border:0;border-left:1px solid var(--color-divider);cursor:pointer;font-size:18px;color:var(--color-text)">+</button>
          </div>
        </div>
      </div>`;
  }

  return `
  <div class="byot-split" style="display:grid;grid-template-columns:1fr 520px;align-items:start">
    <div style="position:sticky;top:64px;border-right:2px solid var(--color-divider);background:var(--color-surface);min-height:calc(100vh - 64px);display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;padding:18px 24px;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-neutral-700);border-bottom:1px solid var(--color-divider)">
        <span>${fab.gsm} &middot; ${fab.name}</span><span>${col.name}</span>
      </div>
      <div style="flex:1;display:grid;place-items:center;padding:40px 24px">
        ${shirtMockupHTML(col.hex, col.ink, s.design ? s.design.kind : 'rule', s.design ? s.design.name : 'No print selected', 400)}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:18px 24px;border-top:1px solid var(--color-divider)">
        <div style="font-family:Archivo;font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:0.01em">${s.design ? s.design.name : 'No print selected'}</div>
        <div style="font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-neutral-700)">${s.size} ${s.fit} &middot; &times;${s.qty}</div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;min-height:calc(100vh - 64px)">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:2px solid var(--color-divider)">${tabsHTML}</div>
      <div style="flex:1">${panel}</div>
      <div style="position:sticky;bottom:0;background:var(--color-bg);border-top:2px solid var(--color-divider);padding:16px 24px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="flex:none">
          <div style="font-family:Archivo;font-weight:800;font-size:28px;letter-spacing:-0.025em;line-height:1">$${unit()}</div>
          <div style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:var(--color-neutral-700)">${s.qty > 1 ? 'each · ' + s.qty + ' shirts' : 'each · incl. print'}</div>
        </div>
        <button data-action="download" class="btn btn-secondary" style="min-height:52px;padding-inline:16px;font-size:12px;letter-spacing:0.06em;white-space:nowrap">DOWNLOAD MOCKUP &darr;</button>
        <button data-action="addToCart" class="btn btn-primary" style="flex:1;min-height:52px;padding-inline:18px;font-size:14px;letter-spacing:0.08em;justify-content:flex-start">ADD TO CART &rarr;</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- CART ---------------- */
function renderCart() {
  const s = state;
  const itemsHTML = s.cart.length === 0 ? `
    <div style="padding:0 24px 40px">
      <div style="font-size:15px;color:var(--color-neutral-700);max-width:420px;line-height:1.55">Nothing in the bag yet. Pick a fabric, a colour and a print — one shirt is a perfectly good order.</div>
      <button data-action="go" data-screen="studio" class="btn btn-primary" style="min-height:50px;padding-inline:18px;letter-spacing:0.08em;margin-top:20px;justify-content:flex-start;text-align:left;white-space:nowrap">START A DESIGN &rarr;</button>
    </div>` : s.cart.map(i => `
    <div style="display:flex;gap:20px;padding:20px 24px;border-top:1px solid var(--color-divider)">
      <div style="width:104px;height:104px;flex:none;background:${i.color.hex};color:${i.color.ink};padding:18px">${printArtHTML(i.design.kind, i.design.name)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:Archivo;font-weight:800;font-size:17px;text-transform:uppercase">${i.design.name}</div>
        <div style="font-size:13px;color:var(--color-neutral-700);line-height:1.6;margin-top:4px">${i.fabric.name} &middot; ${i.fabric.gsm}<br>${i.color.name} &middot; ${i.size} ${i.fit} &middot; &times;${i.qty}</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:Archivo;font-weight:800;font-size:18px">$${i.unit * i.qty}</div>
        <button data-action="removeCart" data-key="${i.key}" class="btn btn-ghost" style="font-size:10px;letter-spacing:0.08em;padding:4px 0;justify-content:flex-start;text-align:left;white-space:nowrap">REMOVE</button>
      </div>
    </div>`).join('');

  const summary = s.cart.length === 0 ? '' : `
    <div style="padding:40px 24px">
      <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-accent);margin-bottom:12px">Summary</div>
      <table class="table"><tbody>
        <tr><td>Subtotal</td><td style="text-align:right">$${cartTotal()}</td></tr>
        <tr><td>Print setup</td><td style="text-align:right">Included</td></tr>
        <tr><td>Tracked shipping</td><td style="text-align:right">$6</td></tr>
      </tbody></table>
      <div style="display:flex;align-items:baseline;justify-content:space-between;border-top:2px solid var(--color-divider);padding-top:14px;margin-top:14px">
        <div style="font-family:Archivo;font-weight:800;font-size:17px;text-transform:uppercase;letter-spacing:0.02em">Total</div>
        <div style="font-family:Archivo;font-weight:800;font-size:32px;letter-spacing:-0.03em">$${cartTotal() + 6}</div>
      </div>
      <div class="field" style="margin-top:18px"><label>Deliver to</label><input class="input" value="Studio Nine, 14 Kirkgate, Leeds LS1"></div>
      <div class="field"><label>Email</label><input class="input" value="sam@studio-nine.co"></div>
      <button data-action="placeOrder" class="btn btn-primary btn-block" style="min-height:54px;padding-inline:18px;font-size:14px;letter-spacing:0.08em;margin-top:10px;justify-content:flex-start">PLACE ORDER &rarr;</button>
      <div style="font-size:11.5px;color:var(--color-neutral-700);margin-top:12px;line-height:1.6">Artwork is checked by a human before print. We call you if anything won't hold.</div>
    </div>`;

  return `
  <div class="byot-cart" style="display:grid;grid-template-columns:1fr 400px;align-items:start">
    <div style="border-right:2px solid var(--color-divider);min-height:60vh">
      <div style="padding:40px 24px 20px"><div style="font-family:Archivo;font-weight:800;font-size:40px;letter-spacing:-0.03em;line-height:1">Your order</div></div>
      ${itemsHTML}
    </div>
    ${summary}
  </div>`;
}

/* ---------------- CONFIRM ---------------- */
function renderConfirm() {
  const order = state.order, item = order ? order.item : null;
  const fab = item ? item.fabric : getFabric(), col = item ? item.color : getColor();
  const design = item ? item.design : state.design;
  return `
  <div>
    <div style="background:var(--color-accent);color:var(--color-bg);padding:64px 24px 56px">
      <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.9">Order confirmed</div>
      <div style="font-family:Archivo;font-weight:800;font-size:clamp(48px,8vw,112px);line-height:0.9;letter-spacing:-0.04em;margin-top:16px;text-transform:uppercase">On the press.</div>
      <div style="height:2px;background:var(--color-bg);opacity:0.5;margin:32px 0 16px;max-width:820px"></div>
      <div style="display:flex;gap:40px;flex-wrap:wrap;font-size:15px"><span>${order ? order.id : 'BYOT-4107'}</span><span>Fri 25 Sep</span><span>$${order ? order.paid : unit() + 6} paid</span></div>
    </div>
    <div class="byot-cart" style="display:grid;grid-template-columns:1fr 400px;align-items:start;border-bottom:2px solid var(--color-divider)">
      <div style="padding:40px 24px;border-right:2px solid var(--color-divider)">
        <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-accent);margin-bottom:14px">What we're printing</div>
        <table class="table"><tbody>
          <tr><td>Print</td><td style="text-align:right">${design.name}</td></tr>
          <tr><td>Fabric</td><td style="text-align:right">${fab.name} &middot; ${fab.gsm}</td></tr>
          <tr><td>Colour</td><td style="text-align:right">${col.name}</td></tr>
          <tr><td>Size</td><td style="text-align:right">${item ? item.size + ' ' + item.fit : state.size + ' ' + state.fit}</td></tr>
        </tbody></table>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">
          <button data-action="go" data-screen="track" class="btn btn-primary" style="min-height:50px;padding-inline:18px;letter-spacing:0.08em;justify-content:flex-start;text-align:left;white-space:nowrap">TRACK THIS ORDER</button>
          <button data-action="go" data-screen="home" class="btn btn-secondary" style="min-height:50px;padding-inline:18px;letter-spacing:0.08em;justify-content:flex-start;text-align:left;white-space:nowrap">BACK TO HOME</button>
        </div>
        <div style="font-size:12px;line-height:1.6;color:var(--color-neutral-700);margin-top:20px;max-width:520px">A receipt is on its way to sam@studio-nine.co. Changes are possible until the file goes to film.</div>
      </div>
      <div style="padding:40px 24px;display:grid;place-items:center;background:var(--color-surface);align-self:stretch">
        ${shirtMockupHTML(col.hex, col.ink, design.kind, design.name, 300)}
      </div>
    </div>
  </div>`;
}

/* ---------------- TRACK ---------------- */
function renderTrack() {
  const order = state.order, item = order ? order.item : null;
  const fab = item ? item.fabric : getFabric(), col = item ? item.color : getColor();
  const design = item ? item.design : state.design;
  return `
  <div>
    <div style="padding:40px 24px 28px;border-bottom:2px solid var(--color-divider)">
      <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-accent)">${order ? order.id : 'BYOT-4107'}</div>
      <div style="font-family:Archivo;font-weight:800;font-size:40px;letter-spacing:-0.03em;line-height:1.02;margin-top:10px">${design.name} &middot; ${item ? item.size + ' ' + item.fit : state.size + ' ' + state.fit}</div>
      <div style="font-size:13px;color:var(--color-neutral-700);margin-top:6px">${fab.name} &middot; ${fab.gsm} &middot; ${col.name} &middot; arrives Fri 25 Sep</div>
    </div>
    ${trackSteps(fab).map(([title, note, when, done]) => `
      <div style="display:flex;gap:20px;padding:22px 24px;border-bottom:1px solid var(--color-divider)">
        <div style="width:16px;height:16px;flex:none;margin-top:5px;background:${done ? 'var(--color-accent)' : 'transparent'};border:2px solid ${done ? 'var(--color-accent)' : 'var(--color-divider)'}"></div>
        <div style="flex:1">
          <div style="font-family:Archivo;font-weight:800;font-size:16px;text-transform:uppercase;letter-spacing:0.01em;color:${done ? 'var(--color-text)' : 'var(--color-neutral-600)'}">${title}</div>
          <div style="font-size:13px;color:var(--color-neutral-700);line-height:1.55">${note}</div>
        </div>
        <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-neutral-600);white-space:nowrap">${when}</div>
      </div>`).join('')}
    <div style="padding:28px 24px 56px"><button data-action="go" data-screen="home" class="btn btn-secondary" style="min-height:48px;padding-inline:18px;letter-spacing:0.08em;justify-content:flex-start;text-align:left;white-space:nowrap">DONE</button></div>
  </div>`;
}

/* ---------------- MAIN RENDER ---------------- */
function render() {
  renderNav();
  const app = document.getElementById('byot-app');
  const fns = { home: renderHome, browse: renderBrowse, studio: renderStudio, cart: renderCart, confirm: renderConfirm, track: renderTrack };
  app.innerHTML = (fns[state.screen] || renderHome)();
}

/* ---------------- EVENT DELEGATION ---------------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.getAttribute('data-action');

  switch (action) {
    case 'go': {
      const extra = {};
      if (el.dataset.tab) extra.tab = el.dataset.tab;
      if (el.dataset.src) extra.src = el.dataset.src;
      go(el.dataset.screen, extra);
      break;
    }
    case 'tab': state.tab = el.dataset.tab; render(); break;
    case 'setSrc': state.src = el.dataset.id; render(); break;
    case 'setFabric': state.fabricId = el.dataset.id; render(); break;
    case 'setColor': state.colorId = el.dataset.id; render(); break;
    case 'setSize': state.size = el.dataset.id; render(); break;
    case 'setFit': state.fit = el.dataset.id; render(); break;
    case 'qty': state.qty = Math.max(1, state.qty + parseInt(el.dataset.delta, 10)); render(); break;
    case 'pickDesign': {
      const id = el.dataset.id, origin = el.dataset.origin;
      if (origin === 'ai') {
        pickDesign({ id, name: el.dataset.name, kind: el.dataset.kind }, 'ai');
      } else {
        const p = LIBRARY.find(x => x.id === id);
        if (p) pickDesign(p, 'library');
      }
      break;
    }
    case 'setPrompt': state.prompt = el.dataset.value; render(); break;
    case 'shuffle': state.prompt = 'Concrete halftone circle, one colour, off-centre'; generate(); break;
    case 'generate': generate(); break;
    case 'fakeUpload': state.uploaded = true; state.design = { id: 'upload1', name: 'Studio Nine Mark', kind: 'block', origin: 'upload' }; render(); break;
    case 'addToCart': addToCart(); break;
    case 'removeCart': removeFromCart(Number(el.dataset.key)); break;
    case 'placeOrder': placeOrder(); break;
    case 'filter': state.filter = el.dataset.filter; render(); break;
    case 'download': {
      const col = getColor();
      downloadMockupPNG(col.hex, col.ink, state.design.kind, state.design.name, 'byot-' + (state.design.id || 'design') + '-mockup.png');
      break;
    }
  }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'byot-search') {
    const pos = e.target.selectionStart;
    state.query = e.target.value;
    render();
    const el = document.getElementById('byot-search');
    el.focus();
    el.setSelectionRange(pos, pos);
  }
  if (e.target.id === 'byot-prompt') { state.prompt = e.target.value; }
});

/* ---------------- INIT ---------------- */
render();
