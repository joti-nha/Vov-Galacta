/* =====================================================================
   TEMA NYAN CAT | a revoada, os rastros e o gato grande, portados do Vortex
   O código abaixo é o mesmo do Vortex (Vortex_aplication/app.js, bloco do
   Nyan Cat), com os caminhos das artes apontando para a pasta do Vortex,
   que está no mesmo endereço deste site (joti-nha.github.io):
   - a revoada: as variantes vão chegando ao fundo, em cerca de 10 minutos
     estão todas no céu; cada uma com o rastro dela (NYAN_TRAILS);
   - as faixas livres: cada gato procura uma altura onde não cruza os outros;
   - os cenários: enquanto um Nyan famoso passa, o fundo vira o cenário dele;
   - o gato grande: de tempos em tempos atravessa a tela numa direção sorteada;
   - a música, com o botão ♪ para pausar.
   O relógio da revoada usa a mesma chave do Vortex (vortex.nyanFlock.v1).
   Com "reduzir movimento", não há gatos voando.
   ===================================================================== */

(() => {
const NYAN_RAIZ = '/Vortex_aplication/';

/* Nyan Cat: de tempos em tempos o gato atravessa o fundo vindo de uma direção sorteada, com o rastro de
   arco-íris em degraus atrás dele. O gato é a arte original guardada no projeto (img/nyan/original.webp); se não carregar, ele não passa.
   A música (audio/nyan-cat.mp3) toca em loop a partir do primeiro toque, respeita o
   botão de som e o botão ♪ do canto pausa só ela. */
var NYAN_GIF = NYAN_RAIZ + 'img/nyan/original.webp'; // a arte original fica no projeto (img/nyan/), sem depender do nyan.cat
var NYAN_MP3 = NYAN_RAIZ + 'audio/nyan-cat.mp3';
var nyanOn = false, nyanMuted = false, nyanAudio = null, nyanTimer = null, nyanGifOk = null;
function nyanExtras(on) {
  if (on && !nyanOn) nyanMuted = false;
  nyanOn = on;
  clearTimeout(nyanTimer);
  nyanTimer = null;
  document.querySelectorAll('.nyan-fly').forEach((el) => el.remove());
  nyanFlock(on);
  const btn = document.querySelector('.nyan-music');
  if (!on) { if (btn) btn.remove(); nyanMusic(); return; }
  if (!btn) {
    const b = h('button', 'nyan-music', '♪');
    b.type = 'button';
    b.addEventListener('click', () => { nyanMuted = !nyanMuted; nyanMusic(); });
    document.body.append(b);
  }
  if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) nyanTimer = setTimeout(nyanFly, 1500 + Math.random() * 5000);
  nyanMusic();
}
/* Revoada: as variantes do Nyan Cat (só as que têm a arte original) vão aparecendo ao fundo, voando juntas da esquerda
   para a direita. Começa com o original e, em cerca de 10 minutos com o tema ligado, todas estão no céu.
   O relógio fica guardado (vortex.nyanFlock.v1) e zera ao trocar de tema. Cada uma usa a arte original dela em img/nyan/
   (.webp, ver NYAN_ART); se não carregar, aquele gato fica de fora. */
const NYAN_FLOCK_KEY = 'vortex.nyanFlock.v1';
const NYAN_FLOCK_MS = 10 * 60 * 1000;
const RAINBOW = ['#ff2a2a', '#ff9a2a', '#ffee2a', '#33ff4a', '#2aa8ff', '#7a2aff'];
const NYAN_VARIANTS = [
  'original', 'tacnayn', 'mexinyan', 'pumpkin', 'nyaninja', 'zombie', 'technyancolor', 'xmas', 'pirate', 'mummy',
  'star', 'vday', 'easter', 'paddy', 'newyear', 'bday', 'dub', 'melon', 'balloon', 'fiesta',
  'wtf', 'nyandoge', 'grumpy', 'wiki:terra', 'wiki:neapolitan', 'wiki:cookie', 'wiki:oreo', '16bit', 'angel', 'biker',
  'bubblegum', 'cherry', 'cowboy', 'disorder', 'demonic', 'levo', 'fancy', 'fat', 'floppy', 'golden',
  'kiminyan', 'liberty', 'magical', 'mintchoc', 'aoki', 'nyanboy', 'nyantendo', 'pumpkinspice', 'smurf',
  'strawberry', 'vintage', 'surfing', 'vapor', 'pikanyan', 'waffle', 'hazy'
];
/* Artes originais dos Nyan Cats (img/nyan/<variante>.webp), reduzidas a 1 pixel de arte e recortadas:
   [altura em pixels de arte, pixels de arte por pixel do Nyan original (quando a arte é mais fina),
   altura do meio do corpo, para o rastro sair dali e não do balão ou do chapéu]. Toda variante da revoada precisa estar aqui. */
const NYAN_ART = {
  original: [21], tacnayn: [21], mexinyan: [27, 1, 19], pumpkin: [21], nyaninja: [23, 1, 10], technyancolor: [21], xmas: [26, 1, 15],
  pirate: [21], pikanyan: [23, 1, 11], waffle: [27, 1, 15], hazy: [38, 1, 26], mummy: [21], bday: [37, 1, 26], balloon: [51, 1, 38], dub: [22], grumpy: [21], wtf: [171, 7.5], paddy: [33, 1, 23],
  'wiki:neapolitan': [21], 'wiki:oreo': [24, 1, 13], 'wiki:cookie': [21], 'wiki:terra': [26, 1, 13],
  '16bit': [21], angel: [24, 1, 13], biker: [36, 1, 11], bubblegum: [21], cherry: [21], cowboy: [26, 1, 15], disorder: [16],
  demonic: [28, 1, 11], levo: [42, 2], fancy: [34, 1, 24], fat: [36, 1.2], floppy: [24, 1, 13], golden: [21], kiminyan: [21],
  liberty: [27, 1, 13], magical: [34, 1, 17], mintchoc: [21], aoki: [29, 1, 11], nyanboy: [21],
  nyantendo: [39, 1, 28], pumpkinspice: [21], smurf: [21], strawberry: [73, 3.6], vintage: [21],
  fiesta: [27, 1, 13], melon: [32, 1, 18], newyear: [200, 8.5], easter: [26, 1, 14], nyandoge: [23, 1, 10], star: [24], surfing: [28, 1, 10],
  vapor: [21], vday: [21], zombie: [21]
};
/* Rastro de cada variante. As oficiais do nyan.cat têm o rastro oficial: o arco-íris ({}) ou a versão delas
   (pela wiki dos Nyan Cats e pelos exemplos do João): cinza no Tac Nayn, azul no Doge, verde-azulado no Caubói,
   vermelho, branco e verde no Natal e no Mexinyan, pastel no Pusheen e na Páscoa, azul até o roxo no Fiesta Dog,
   vermelho até o branco no Valentnyan, amarelo e laranja no Dourado, estrelas amarelas na Star Sheep, bandeira de
   caveira no Pirata, visualizador no Dubstep, cores girando no Technyancolor, falha no WTF. As artes de fã têm um rastro pelo que são: cores, um símbolo
   repetido ou um desenho (fumaça, xadrez...). O 16-bit tem o arco-íris em 16 bits. */
const NYAN_TRAILS = {
  original: {}, tacnayn: { trail: ['#1a1a1a', '#3a3a3a', '#5a5a5a', '#7a7a7a', '#9a9a9a', '#bababa'] }, mexinyan: { trail: ['#009933', '#ffffff', '#b60000'] },
  pumpkin: {}, nyaninja: {}, zombie: {},
  technyancolor: { hue: true }, xmas: { trail: ['#33cc00', '#ffffff', '#ff0000', '#ffffff', '#33cc00', '#dedede'] }, pirate: { none: true }, waffle: { trail: ['#fff0d0', '#fbd9a0', '#f2bd78', '#e09a50', '#c07830', '#8a5020'] }, hazy: { under: 0.5, trail: ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff'] }, pikanyan: { under: 0.7, trail: ['#f7e652', '#d6d6d6', '#f7e652', '#d6d6d6', '#f7e652', '#d6d6d6'] },
  mummy: {}, star: { glyph: '★', trail: ['#ffe23a', '#ffd700'] }, vday: { trail: ['#a60000', '#ff0000', '#ff4f4f', '#ff9191', '#ffc1c1', '#ffffff'] },
  easter: { trail: ['#ff84bd', '#ffad31', '#ffd684', '#5abd7b', '#7bceff', '#9c42a5'] }, paddy: {}, newyear: {},
  bday: {}, dub: { pattern: 'eq' }, melon: { trail: ['#efc5ff', '#de94ff', '#ce5aff', '#bd19ff', '#f719ff', '#94007b'] },
  balloon: { none: true }, fiesta: { under: 2.3, trail: ['#cedef7', '#9cc5f7', '#6ba5ef', '#2984e6', '#1942ff', '#000099'] }, wtf: { pattern: 'glitch' },
  nyandoge: { trail: ['#cadff9', '#9fc6f4', '#69a6ef', '#2c81e9', '#1544ff', '#000099'] }, grumpy: {}, '16bit': { pattern: '16bit' },
  angel: { trail: ['#ffffff', '#bfdfff', '#9dceff', '#6cb6ff', '#409fff', '#1a8cff'] }, biker: {}, bubblegum: { glyph: '●', trail: ['#3a6aff', '#ff7ad8', '#7ad8ff'] },
  cherry: { trail: ['#fc56bd', '#fb9278', '#ffe5ae', '#8bfbae', '#7d97ff', '#a052ea'] }, cowboy: { trail: ['#3aa2a4', '#308a97', '#2f5d88', '#244a6d', '#1d3f5e', '#173550'] }, disorder: { pattern: 'glitch', trail: ['#2a2a2a', '#9b9b9b', '#5a5a5a', '#ffffff'] },
  demonic: { trail: ['#ffa8a8', '#ff6c6c', '#ff0000', '#bb0000', '#8c0000', '#661a00'] }, levo: { trail: ['#0028fe', '#0055fe', '#0098fe', '#00f2fe', '#00feb3', '#00fe59'] }, fancy: { trail: ['#e5ffff', '#aaffff', '#00e5ff', '#00d0ff', '#00bdff', '#008cd8'] },
  fat: { trail: ['#fd9796', '#fdfd97', '#00cccb'] }, floppy: {}, golden: { trail: ['#fff36a', '#ffe23a', '#ffd700', '#ffcc00', '#ff9a1a', '#ff8a00'] },
  kiminyan: { glyph: '✧', trail: ['#3a2a6a', '#7a6ad8', '#ffffff'] }, liberty: { trail: ['#a3dad8', '#84c5c5', '#73bdbd', '#63b5b5', '#52adad', '#49949c'] },
  magical: { glyph: '✧', trail: ['#ffd700', '#b07aff', '#6aa04a'] }, mintchoc: { glyph: '•', trail: ['#3a2a1a', '#7af0b0'] }, aoki: { glyph: '♫', trail: ['#ff7ad8', '#7ad8ff'] },
  nyanboy: { trail: ['#193131', '#214a31', '#527b6b', '#4a523a', '#527b3a', '#adc542'] }, nyantendo: { pattern: 'pixel', trail: ['#c0c0c0', '#e32a2a', '#3a9a3a', '#2a2a2a'] }, pumpkinspice: { trail: ['#ffe23a', '#ffc02a', '#ff9a2a', '#ff7a2a', '#ff4a2a', '#e8202a'] },
  smurf: {}, strawberry: { glyph: '🍓', trail: ['#ff2a6a', '#ffffff'] }, vintage: { trail: ['#987d5f'] },
  surfing: { trail: ['#d62942', '#d66b29', '#d6b529', '#73d629', '#29add6', '#5a52de'] }, vapor: { pattern: 'wave', trail: ['#ff71ce', '#b967ff', '#01cdfe', '#05ffa1', '#fffb96'] }, 'wiki:neapolitan': { trail: ['#ffb3c8', '#ffb3c8', '#fff4e0', '#fff4e0', '#7a4a2a', '#7a4a2a'] },
  'wiki:oreo': { trail: ['#dd5589', '#dc8856', '#ddba55', '#abdc56', '#54ddde', '#7787ee'] }, 'wiki:cookie': { glyph: '●', trail: ['#c88a4a', '#4a2a1a'] }, 'wiki:terra': { trail: ['#ff0000', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#6633ff'] }
};
/* Rastro: as faixas saem em degraus como no Nyan Cat original (segmentos sobem e descem alternados); o 16-bit tem
   degraus mais finos e cada faixa com luz e sombra; os símbolos pulam; os desenhos (fumaça, xadrez...) correm. */
function nyanTrail(t) {
  const cols = t.trail || RAINBOW;
  const pat = t.glyph ? 'glyph' : t.pattern || 'steps';
  const stepped = ['steps', 'pixel', '16bit', 'wave', 'glitch', 'eq'].includes(pat);
  const el = h('span', 'nyan-flock__trail nyan-flock__trail--' + pat + (stepped && pat !== 'steps' ? ' nyan-flock__trail--steps' : ''));
  const bands = (list) => 'linear-gradient(' + list.map((c, k) => c + ' ' + (k * 100 / list.length).toFixed(2) + '% ' + ((k + 1) * 100 / list.length).toFixed(2) + '%').join(', ') + ')';
  // 16-bit: cada faixa com a metade de cima mais clara e uma linha escura embaixo
  const bands16 = (list) => 'linear-gradient(' + list.map((c, k) => {
    const a = k * 100 / list.length, b = (k + 1) * 100 / list.length, m = a + (b - a) * 0.4, e = b - (b - a) * 0.15;
    return 'color-mix(in srgb, ' + c + ' 65%, #fff) ' + a.toFixed(2) + '% ' + m.toFixed(2) + '%, ' + c + ' ' + m.toFixed(2) + '% ' + e.toFixed(2) + '%, color-mix(in srgb, ' + c + ' 70%, #000) ' + e.toFixed(2) + '% ' + b.toFixed(2) + '%';
  }).join(', ') + ')';
  const c0 = cols[0], c1 = cols[1 % cols.length];
  if (t.glyph) { // uma fila de símbolos, cada um de uma cor do rastro
    for (let k = 0; k < 6; k++) { const g = h('i', '', t.glyph); g.style.color = cols[k % cols.length]; el.append(g); }
  } else if (stepped) {
    const n = pat === '16bit' || pat === 'eq' ? 12 : 6, bg = pat === '16bit' ? bands16(cols) : bands(cols); // eq: o visualizador do Dubstep
    for (let k = 0; k < n; k++) { const seg = h('i'); seg.style.background = bg; seg.style.setProperty('--k', k); el.append(seg); }
    if (t.hue) el.style.animation = 'nyan-hue 2.4s linear infinite'; // Technyancolor: as cores giram
  } else if (pat === 'smoke') el.style.background = 'radial-gradient(circle at 20% 60%, ' + c1 + ' 0 18%, transparent 20%), radial-gradient(circle at 50% 40%, ' + c0 + ' 0 22%, transparent 24%), radial-gradient(circle at 80% 55%, ' + c1 + ' 0 26%, transparent 28%)';
  else if (pat === 'checker') el.style.background = 'repeating-conic-gradient(' + c0 + ' 0 25%, ' + c1 + ' 0 50%) 0 0 / calc(var(--s) * 0.31) calc(var(--s) * 0.31)';
  else if (pat === 'wrap') el.style.background = 'repeating-linear-gradient(-35deg, ' + c0 + ' 0 8%, ' + c1 + ' 8% 12%, ' + c0 + ' 12% 22%)';
  else if (pat === 'scribble') el.style.background = 'repeating-linear-gradient(-20deg, transparent 0 6%, ' + c0 + ' 6% 9%, transparent 9% 14%), ' + c1;
  return el;
}
let nyanFlockTimer = null;
function nyanFlockSince() {
  let t = 0;
  try { t = Number(localStorage.getItem(NYAN_FLOCK_KEY)) || 0; } catch (e) { /* sem armazenamento */ }
  if (!t || t > Date.now()) { t = Date.now(); try { localStorage.setItem(NYAN_FLOCK_KEY, String(t)); } catch (e) { /* vale até fechar */ } }
  return t;
}
function nyanFlock(on) {
  clearInterval(nyanFlockTimer);
  nyanFlockTimer = null;
  const old = document.querySelector('.nyan-flock');
  nyanSceneId = null;
  nyanVaporLast = -Infinity;
  document.documentElement.classList.remove('nyan-scene-on');
  if (!on) { if (old) old.remove(); try { localStorage.removeItem(NYAN_FLOCK_KEY); } catch (e) { /* nada */ } return; }
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = old || h('div', 'nyan-flock');
  box.setAttribute('aria-hidden', 'true');
  if (!old) document.body.prepend(box);
  const since = nyanFlockSince();
  // ordem de chegada sorteada, mas fixa pelo relógio guardado: ao recarregar, as mesmas variantes já estão no céu
  let seed = since % 2147483647 || 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const order = NYAN_VARIANTS.slice(1);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  order.splice(order.indexOf('vapor'), 1);
  order.unshift(NYAN_VARIANTS[0], 'vapor'); // o original chega primeiro e o Vaporwave (com o Sol Synthwave) logo depois
  let first = true;
  const grow = () => {
    if (!box.isConnected) { clearInterval(nyanFlockTimer); return; }
    const f = Math.min(1, (Date.now() - since) / NYAN_FLOCK_MS);
    const want = 1 + Math.floor(f * (NYAN_VARIANTS.length - 1));
    // conta pelo que já saiu (não pelos filhos da caixa: os cenários também moram nela, e um gato sem arte se retira)
    for (let i = Number(box.dataset.made || 0); i < want; i++) { box.append(nyanFlockCat(order[i], i, !first)); box.dataset.made = i + 1; }
    first = false;
    if (want >= NYAN_VARIANTS.length) { clearInterval(nyanFlockTimer); nyanFlockTimer = null; }
  };
  grow();
  if (Number(box.dataset.made) < NYAN_VARIANTS.length) nyanFlockTimer = setInterval(grow, 5000);
}
/* Para não se sobreporem: cada gato no céu guarda altura, tamanho, largura e o seu horário de voo. Uma passagem
   nova sorteia várias alturas e fica com a que menos cruza os outros no caminho (mesma faixa e no mesmo
   lugar ao mesmo tempo, contando as velocidades diferentes). */
const nyanSky = new Set();
function nyanFreeLane(me) {
  const W = window.innerWidth, H = window.innerHeight;
  const xAt = (c, t) => -c.w + (W + c.w + 20) * (t - c.t0) / c.dur; // ponta direita do gato no instante t
  const clash = (y) => {
    let n = 0;
    nyanSky.forEach((o) => {
      if (o === me || Math.abs(o.y - y) > (o.size + me.size) / 2 + 6) return;
      const a = Math.max(me.t0, o.t0), b = Math.min(me.t0 + me.dur, o.t0 + o.dur);
      if (a >= b) return;
      const d1 = xAt(me, a) - xAt(o, a), d2 = xAt(me, b) - xAt(o, b), gap = (me.w + o.w) / 2;
      if ((d1 > 0) !== (d2 > 0) || Math.min(Math.abs(d1), Math.abs(d2)) < gap) n++;
    });
    return n;
  };
  let best = 0, bestN = Infinity;
  for (let k = 0; k < 16 && bestN > 0; k++) {
    const y = H * 0.02 + Math.random() * Math.max(10, H * 0.92 - me.size);
    const n = clash(y);
    if (n < bestN) { best = y; bestN = n; }
  }
  return best;
}
/* Cada passagem sorteia altura, tamanho e velocidade; a cada volta o gato reaparece em outro lugar do céu.
   Ao recarregar, quem já estava no céu continua de um ponto sorteado do caminho, em vez de todos entrarem juntos. */
/* Fundos dos Nyan Cats mais famosos: enquanto um deles passa, o fundo da página vira o cenário dele (o Vaporwave traz o
   Sol Synthwave, o Natal traz neve, a Abóbora a noite de Halloween...). Cada cenário é pixel art (img/nyan/cenas/) com um detalhe animado no CSS
   e ficam na revoada, atrás dos gatos. Um cenário por vez: quem chega com outro aceso (ou logo depois de um) passa sem trocar o fundo, menos o Vaporwave. */
const NYAN_SCENES = new Set(['vapor', 'nyandoge', 'cowboy', 'tacnayn', 'xmas', 'pumpkin', 'pirate', 'paddy', 'vday', 'mexinyan', 'zombie', 'surfing', 'newyear', 'easter', 'star', 'cherry', 'liberty', 'angel', 'demonic', 'biker']);
let nyanSceneId = null, nyanSceneCalm = 0, nyanVaporLast = -Infinity;
const NYAN_VAPOR_GAP = 3 * 60 * 1000; // o Sol Synthwave tem a vez garantida, no máximo a cada 3 minutos
function nyanScene(cat, id, on) {
  const box = cat.parentNode;
  if (on) {
    // um cenário por vez, com uns 40 s de fundo normal entre um e outro. No rodízio puro o Vaporwave quase nunca
    // pegava a vez (são 20 cenários disputando), então ele fura a fila quando o último Sol foi há mais de 3 minutos
    const vapor = id === 'vapor' && performance.now() - nyanVaporLast > NYAN_VAPOR_GAP;
    if (!vapor && (nyanSceneId || performance.now() < nyanSceneCalm)) return;
    if (id === 'vapor') nyanVaporLast = performance.now();
    nyanSceneId = id;
  } else {
    if (nyanSceneId !== id) return;
    nyanSceneId = null;
    nyanSceneCalm = performance.now() + 40000;
  }
  if (!box) return;
  if (nyanSceneId && !box.querySelector('.nyan-scene--' + nyanSceneId)) {
    const el = h('div', 'nyan-scene nyan-scene--' + nyanSceneId);
    // o Synthwave é desenhado no CSS; os outros são pixel art em img/nyan/cenas/
    if (nyanSceneId !== 'vapor') { el.classList.add('nyan-scene--img'); el.style.setProperty('--cena', 'url(' + NYAN_RAIZ + 'img/nyan/cenas/' + nyanSceneId + '.png)'); }
    box.prepend(el);
    void el.offsetWidth; // o cenário novo nasce apagado e só então acende, para o fade de entrada acontecer
  }
  box.querySelectorAll('.nyan-scene').forEach((el) => el.classList.toggle('is-on', el.classList.contains('nyan-scene--' + nyanSceneId)));
  document.documentElement.classList.toggle('nyan-scene-on', !!nyanSceneId); // o painel de boas-vindas fica translúcido para o cenário aparecer
}
function nyanFlockCat(v, i, fresh) {
  const id = v;
  const cat = h('div', 'nyan-flock__cat');
  const tr = NYAN_TRAILS[id] || {};
  if (!tr.none) {
    const trail = nyanTrail(tr); // o Balloon Kitty vai pendurado no balão, sem rastro
    if (tr.under) { // Taco Dog, Pikanyan e Hazy: o GIF já traz o começo do rastro, e o rastro passa por baixo dele até o corpo
      trail.style.width = 'calc(var(--s) * 3.4 + var(--ih) * ' + tr.under + ')';
      trail.style.marginRight = 'calc(var(--ih) * -' + tr.under + ')';
    }
    cat.append(trail);
  }
  const img = h('img', 'nyan-flock__img');
  img.alt = '';
  img.onerror = () => cat.remove(); // sem a arte, o gato não voa
  // altura pela escala da arte (o Nyan de 21 pixels fica com 21/26 de --s) e rastro na altura do corpo
  const [ah, k = 1, mid = ah / 2] = NYAN_ART[id];
  img.src = NYAN_RAIZ + 'img/nyan/' + id.replace(':', '-') + '.webp';
  img.className += ' nyan-flock__img--art';
  cat.style.setProperty('--ih', 'calc(var(--s) * ' + (ah / k / 26).toFixed(3) + ')');
  cat.style.setProperty('--mid', (mid / ah - 0.5).toFixed(3));
  cat.append(img);
  const me = { y: 0, size: 0, w: 0, t0: 0, dur: 1 };
  const pass = (start) => {
    if (!cat.isConnected) { nyanSky.delete(me); return; }
    // céu cheio para o tamanho da tela (no celular cabem menos): espera um pouco e tenta de novo
    if (nyanSky.size >= Math.max(8, Math.floor(window.innerWidth * window.innerHeight / 26000))) { setTimeout(() => pass(0), 2000 + Math.random() * 4000); return; }
    const size = Math.round(30 + Math.random() * 26); // 30 a 56 px de --s
    const dur = (14 + Math.random() * 20) * 1000; // 14 a 34 s para cruzar
    const now = performance.now();
    Object.assign(me, { size, w: size * 4.5, dur, t0: now - (start || 0) * dur });
    me.y = nyanFreeLane(me);
    nyanSky.add(me);
    cat.style.setProperty('--s', size + 'px');
    cat.style.top = me.y.toFixed(0) + 'px';
    cat.style.opacity = (0.45 + Math.random() * 0.3).toFixed(2);
    const anim = cat.animate([{ transform: 'translateX(calc(-100% - 20px))' }, { transform: 'translateX(calc(100vw + 20px))' }], { duration: dur, easing: 'linear', fill: 'backwards' });
    if (start) anim.currentTime = start * dur;
    // enquanto um dos famosos passa, o fundo vira o cenário dele
    if (NYAN_SCENES.has(id)) nyanScene(cat, id, true);
    anim.onfinish = () => { nyanSky.delete(me); if (NYAN_SCENES.has(id)) nyanScene(cat, id, false); setTimeout(() => pass(0), NYAN_SCENES.has(id) ? 20000 + Math.random() * 40000 : 500 + Math.random() * 5000); }; // some e volta noutro lugar (os famosos demoram mais, para o cenário ser uma surpresa)
  };
  requestAnimationFrame(() => pass(fresh ? 0 : Math.random()));
  return cat;
}
function nyanFly() {
  if (!nyanOn) return;
  const next = () => { if (nyanOn) nyanTimer = setTimeout(nyanFly, 4000 + Math.random() * 12000); };
  if (document.hidden) { next(); return; }
  const W = window.innerWidth, H = window.innerHeight;
  // direção sorteada (dos lados, nas diagonais, de cima ou de baixo), mas sempre cruzando a tela inteira:
  // a inclinação é limitada para ele sair pelo lado oposto ao que entrou, e não pelo teto no meio do caminho
  const horiz = Math.random() < (W >= H ? 0.8 : 0.55);
  const A = horiz ? W : H, B = horiz ? H : W;
  const t = (Math.random() * 2 - 1) * Math.min(Math.tan(35 * Math.PI / 180), 0.7 * B / A);
  let ang = Math.atan(t) * 180 / Math.PI + (horiz ? 0 : 90);
  if (Math.random() < 0.5) ang += 180;
  const rad = ang * Math.PI / 180, dx = Math.cos(rad), dy = Math.sin(rad);
  const room = Math.max(0, 0.84 * B - Math.abs(t) * A) / 2; // folga para a linha não encostar nas outras bordas
  const mid = B / 2 + (Math.random() * 2 - 1) * room;
  const px = horiz ? W / 2 : mid, py = horiz ? mid : H / 2;
  const out = (sx, sy) => Math.min(sx > 0 ? (W - px) / sx : sx < 0 ? -px / sx : Infinity, sy > 0 ? (H - py) / sy : sy < 0 ? -py / sy : Infinity);
  const flip = dx < -0.01 ? ' scaleY(-1)' : '';
  const T = (x, y) => 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px) rotate(' + ang.toFixed(1) + 'deg)' + flip + ' translate(-100%,-50%)';
  const rainbow = h('span', 'nyan-fly__rainbow');
  for (let i = 0; i < 14; i++) rainbow.append(h('i'));
  const fly = h('div', 'nyan-fly', rainbow);
  fly.setAttribute('aria-hidden', 'true');
  if (nyanGifOk === false) { next(); return; } // a arte não carregou antes: sem gato grande
  const img = h('img', 'nyan-fly__cat');
  img.alt = '';
  fly.append(img);
  fly.style.visibility = 'hidden';
  document.body.append(fly);
  let gone = false;
  const go = () => { // só voa com o gato já carregado: aí dá para medir o tamanho de verdade
    if (gone) return;
    gone = true;
    if (!nyanOn || !fly.isConnected) { fly.remove(); return; }
    const img = fly.querySelector('img.nyan-fly__cat');
    // o rabo fica para trás do biscoito: o arco-íris entra por baixo da traseira
    if (img) rainbow.style.marginRight = -Math.round(img.getBoundingClientRect().width * 0.2) + 'px';
    const len = fly.getBoundingClientRect().width + fly.getBoundingClientRect().height; // comprimento + folga da inclinação
    const back = out(-dx, -dy) + 10, fwd = out(dx, dy) + len + 20; // entra com o focinho na borda, sai com o rastro inteiro
    fly.style.visibility = '';
    const dur = (back + fwd) / (180 + Math.random() * 160) * 1000; // 180 a 340 px por segundo
    const anim = fly.animate([{ transform: T(px - dx * back, py - dy * back) }, { transform: T(px + dx * fwd, py + dy * fwd) }], { duration: dur, easing: 'linear' });
    anim.onfinish = () => { fly.remove(); next(); };
  };
  const skip = () => { if (gone) return; gone = true; fly.remove(); next(); };
  img.onload = () => { nyanGifOk = true; go(); };
  img.onerror = () => { nyanGifOk = false; skip(); };
  setTimeout(skip, 4000); // arte lenta demais: fica para a próxima
  img.src = NYAN_GIF;
}
function nyanMusic() {
  const btn = document.querySelector('.nyan-music');
  const soundOn = typeof sfx === 'undefined' || !sfx || sfx.on;
  const want = nyanOn && !nyanMuted && soundOn;
  if (btn) {
    btn.classList.toggle('is-off', !want);
    btn.title = want ? 'Pausar a música do Nyan Cat' : (soundOn ? 'Tocar a música do Nyan Cat' : 'Som do site desligado');
    btn.setAttribute('aria-label', btn.title);
    btn.setAttribute('aria-pressed', String(want));
  }
  if (!want) { if (nyanAudio) nyanAudio.pause(); return; }
  if (!nyanAudio) { nyanAudio = new Audio(NYAN_MP3); nyanAudio.loop = true; nyanAudio.volume = 0.45; }
  const start = () => { if (nyanOn && !nyanMuted && soundOn) nyanAudio.play().catch(() => {}); };
  // sem nenhum toque ainda o navegador não deixa tocar som: espera o primeiro
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    const once = () => { ['pointerdown', 'keydown'].forEach((e) => document.removeEventListener(e, once, true)); start(); };
    ['pointerdown', 'keydown'].forEach((e) => document.addEventListener(e, once, true));
  } else start();
}

// o resto do site só conhece efeitoNyan(ligar), chamado ao aplicar o tema
window.efeitoNyan = (ligar) => { if (ligar !== nyanOn || ligar) nyanExtras(!!ligar); };
})();
