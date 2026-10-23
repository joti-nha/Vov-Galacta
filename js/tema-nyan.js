/* =====================================================================
   TEMA NYAN CAT | os gatos voando ao fundo, como no Vortex
   As artes são as mesmas que o Vortex já publica (Vortex_aplication/img/nyan/),
   no mesmo endereço deste site. Se uma arte não carregar, aquele gato não voa.
   O rastro de arco-íris é desenhado no CSS. Com "reduzir movimento" ligado,
   o céu fica parado.
   ===================================================================== */

const NYAN_PASTA = '/Vortex_aplication/img/nyan/';
const NYAN_ARTES = ['original', 'pumpkin', 'xmas', 'star', 'pirate', 'cowboy', 'angel', 'zombie', 'mummy',
  'fiesta', 'melon', 'cherry', 'strawberry', 'waffle', 'golden', 'vday', 'bday', 'floppy'];

let nyanCeu = null;

const sortearArte = () => NYAN_ARTES[Math.floor(Math.random() * NYAN_ARTES.length)];

function efeitoNyan(ligar) {
  const parado = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ligar || parado) {
    if (nyanCeu) nyanCeu.remove();
    nyanCeu = null;
    return;
  }
  if (nyanCeu) return;
  nyanCeu = h('div', 'nyan-ceu');
  nyanCeu.setAttribute('aria-hidden', 'true');
  document.body.prepend(nyanCeu);
  // mais gatos em telas maiores (de 4 a 9)
  const quantos = limitar(Math.floor((window.innerWidth * window.innerHeight) / 120000), 4, 9);
  for (let i = 0; i < quantos; i++) soltarGato(i === 0 ? 'original' : sortearArte(), true);
}

function soltarGato(arte, noMeioDoCaminho) {
  if (!nyanCeu) return;
  const rastro = h('span', 'nyan-gato__rastro', ...Array.from({ length: 6 }, () => h('i')));
  const img = h('img', 'nyan-gato__arte');
  img.alt = '';
  const gato = h('div', 'nyan-gato', rastro, img);
  img.addEventListener('error', () => gato.remove(), { once: true });
  img.src = NYAN_PASTA + arte + '.webp';

  gato.style.setProperty('--s', Math.round(26 + Math.random() * 28) + 'px');
  gato.style.top = (4 + Math.random() * 86).toFixed(1) + '%';
  gato.style.opacity = (0.45 + Math.random() * 0.35).toFixed(2);
  nyanCeu.append(gato);

  const duracao = 14000 + Math.random() * 20000; // de 14 a 34 s para cruzar a tela
  const voo = gato.animate(
    [{ transform: 'translateX(calc(-100% - 20px))' }, { transform: 'translateX(calc(100vw + 20px))' }],
    { duration: duracao, easing: 'linear', fill: 'both' });
  if (noMeioDoCaminho) voo.currentTime = Math.random() * duracao;
  voo.onfinish = () => {
    gato.remove();
    setTimeout(() => soltarGato(sortearArte(), false), 500 + Math.random() * 4000);
  };
}
