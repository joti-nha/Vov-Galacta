/* =====================================================================
   PIXEL ART | cada prato é um desenho de 16 x 16 pixels
   Cada letra da grade é uma cor da paleta; "." é transparente.
   Os desenhos viram <canvas> (na página) ou PNG (no item do Vortex).
   ===================================================================== */

const CORES_BASE = {
  K: '#24181c', // contorno
  W: '#f4f1ea', // louça
  w: '#b9c4cc'  // sombra da louça
};

const SPRITES = {
  panquecas: {
    nome: 'Panquecas',
    cores: { R: '#e0405a', r: '#a82a40', B: '#5b6fe0', b: '#2f3c8f', y: '#f2c46d', o: '#c98a3c', s: '#9a4f17' },
    linhas: [
      '................',
      '......R..B......',
      '.....RrRBbB.....',
      '...KKKKKKKKKK...',
      '..KyyyysyyyyyK..',
      '..KoosssooooKK..',
      '..KKKKsKKKKKKK..',
      '..KyyysyyyyyyK..',
      '..KooooooooooK..',
      '..KKKKKKKKKKKK..',
      '..KyyyyyyyyyyK..',
      '..KooooooooooK..',
      '.KKKKKKKKKKKKKK.',
      'KWWWWWWWWWWWWWWK',
      '.KwwwwwwwwwwwwK.',
      '..KKKKKKKKKKKK..'
    ]
  },

  macarrao: {
    nome: 'Macarrão',
    cores: { Y: '#f6de8f', y: '#d9b24f', b: '#c4553c', p: '#2b2424' },
    linhas: [
      '................',
      '................',
      '................',
      '.....KKKKKK.....',
      '...KKYyYYyYKK...',
      '..KYyYpYyYbYyK..',
      '..KyYbYyYyYyYK..',
      '.KYyYyYyYpYyYyK.',
      '.KyYyYbYyYyYbYK.',
      '..KYpYyYyYbYyK..',
      '.KKKKKKKKKKKKKK.',
      'KWWWWWWWWWWWWWWK',
      'KwWWWWWWWWWWWWwK',
      '.KwwwwwwwwwwwwK.',
      '..KKKKKKKKKKKK..',
      '................'
    ]
  },

  hamburguer: {
    nome: 'Hambúrguer',
    cores: { O: '#d98b3a', o: '#f6e7c1', M: '#6b3b22', c: '#f2c230', G: '#6cc04a', A: '#e8a85a', P: '#7aa83a' },
    linhas: [
      '................',
      '.....KKKKKK.....',
      '...KKOoOOOoKK...',
      '..KOOOOOoOOOOK..',
      '..KOoOOOOOOoOK..',
      '..KKKKKKKKKKKK..',
      '..KMMMMMMMMMMK..',
      '..KcGcGcGcGcGK..',
      '..KAAAAAAAAAAK..',
      '..KMMMMMMMMMMK..',
      '..KGPGcGPGcGPK..',
      '..KAAAAAAAAAAK..',
      '...KKKKKKKKKK...',
      '.KWWWWWWWWWWWWK.',
      '..KwwwwwwwwwwK..',
      '...KKKKKKKKKK...'
    ]
  },

  sopa: {
    nome: 'Sopa',
    cores: { s: '#dfe8ee', S: '#e0782e', c: '#f2b06a', m: '#6cc04a', B: '#3b6fb0', b: '#29507f' },
    linhas: [
      '................',
      '.....s....s.....',
      '......s....s....',
      '.....s....s.....',
      '......s....s....',
      '................',
      '.KKKKKKKKKKKKKK.',
      'KSScSSSmSSScSSSK',
      'KSSSSmSSSScSSSSK',
      'KBBBBBBBBBBBBBBK',
      '.KBBBBBBBBBBBbK.',
      '.KbBBBBBBBBBBbK.',
      '..KbBBBBBBBBbK..',
      '...KKbbbbbbKK...',
      '....KKKKKKKK....',
      '................'
    ]
  },

  torta: {
    nome: 'Torta',
    cores: { a: '#f4e2a1', A: '#9fc23a', c: '#f5d98a', C: '#c4823d', d: '#8a5526', l: '#efe4c8' },
    linhas: [
      '................',
      '................',
      '................',
      '....KKKKKKKK....',
      '..KKaAaAlaAaKK..',
      '.KaAaAaAaAalAaK.',
      '.KAaAlaAaAaAaAK.',
      '.KccccccccccccK.',
      '.KCdCCdCCdCCdCK.',
      '.KCCCCCCCCCCCCK.',
      '..KKKKKKKKKKKK..',
      '.KWWWWWWWWWWWWK.',
      '..KwwwwwwwwwwK..',
      '...KKKKKKKKKK...',
      '................',
      '................'
    ]
  },

  frango: {
    nome: 'Frango frito',
    cores: { F: '#d48a2c', f: '#a85d1a', g: '#f2b552', o: '#f6efe2', R: '#d8393b', r: '#a52428' },
    linhas: [
      '....KK...KK.....',
      '...KooK.KooK....',
      '...KKoK.KoKK....',
      '...KFgFKKgFK....',
      '..KFgFfFFgFfK...',
      '..KgFfFgFfFgK...',
      '.KKKKKKKKKKKKKK.',
      '.KRRWRRWRRWRRWK.',
      '.KRRWRRWRRWRRWK.',
      '..KRWRRWRRWRRK..',
      '..KRWRRWRRWRRK..',
      '..KrWrrWrrWrrK..',
      '...KWrrWrrWrK...',
      '...KKKKKKKKKK...',
      '................',
      '................'
    ]
  },

  salada: {
    nome: 'Salada',
    cores: { G: '#6cc04a', g: '#3f8a2c', T: '#e0453a', o: '#f2c230', P: '#8f5bd6', B: '#e9f2f6', b: '#9fb6c4' },
    linhas: [
      '................',
      '................',
      '....g.G..G.g....',
      '...GgGTGoGgGG...',
      '..GTGgGPGgTGgG..',
      '.KKKKKKKKKKKKKK.',
      'KGgGoGgTGgPGgGGK',
      'KBBBBBBBBBBBBBBK',
      '.KBBBBBBBBBBBbK.',
      '.KbBBBBBBBBBBbK.',
      '..KbBBBBBBBBbK..',
      '...KKbbbbbbKK...',
      '....KKKKKKKK....',
      '................',
      '................',
      '................'
    ]
  },

  peixe: {
    nome: 'Peixe',
    cores: { F: '#e58f62', f: '#b8603d', e: '#24181c', L: '#f2df5a', G: '#6cc04a' },
    linhas: [
      '................',
      '................',
      '................',
      '..........KK....',
      '.KKK....KKFFK...',
      '.KFFK.KKFFFFFK..',
      '..KFFKFFfFfFeFK.',
      '..KFFFFfFfFFFFK.',
      '..KFFKFFfFfFFK..',
      '.KFFK.KKFFFFK.L.',
      '.KKK....KKKK.LLG',
      '.KKKKKKKKKKKKKK.',
      'KWWWWWWWWWWWWWWK',
      '.KwwwwwwwwwwwwK.',
      '..KKKKKKKKKKKK..',
      '................'
    ]
  },

  bolo: {
    nome: 'Bolo',
    cores: { R: '#e0405a', p: '#f7d3dc', P: '#e78aa3', c: '#f4e0b0', C: '#6b3b22' },
    linhas: [
      '................',
      '.......R........',
      '......KRK.......',
      '....KKKKKKK.....',
      '...KpppppppK....',
      '...KpPpPpPpK....',
      '...KCCCCCCCK....',
      '...KcccccccK....',
      '...KCCCCCCCK....',
      '...KcccccccK....',
      '...KCCCCCCCK....',
      '...KKKKKKKKK....',
      '.KWWWWWWWWWWWK..',
      '..KwwwwwwwwwK...',
      '...KKKKKKKKK....',
      '................'
    ]
  },

  pao: {
    nome: 'Pão',
    cores: { O: '#d58b3c', o: '#f0c27a', d: '#9a5a23', T: '#c9a46a' },
    linhas: [
      '................',
      '................',
      '................',
      '................',
      '....KKKKKKKK....',
      '..KKOoOOoOOoKK..',
      '.KOOdOOOdOOOdOK.',
      '.KOoOdOoOdOoOdK.',
      '.KOOOOOOOOOOOOK.',
      '.KdOOOOOOOOOOdK.',
      '..KddddddddddK..',
      '.KTTTTTTTTTTTTK.',
      '.KKKKKKKKKKKKKK.',
      '................',
      '................',
      '................'
    ]
  }
};

const SPRITE_PADRAO = 'pao';

// ícones da vitrine de minigames (12 x 12)
const ICONES_JOGOS = {
  separar: {
    nome: 'Cesta de ingredientes',
    cores: { G: '#6cc04a', R: '#e0453a', O: '#f2a541', T: '#d9a35a', t: '#a8742f' },
    linhas: [
      '............',
      '...G..R.....',
      '..GGG.RR.O..',
      '...G.RRR.OO.',
      '.KKKKKKKKKK.',
      'KTtTtTtTtTtK',
      '.KtTtTtTtTK.',
      '.KTtTtTtTtK.',
      '..KtTtTtTK..',
      '..KKKKKKKK..',
      '............',
      '............'
    ]
  },
  cortar: {
    nome: 'Faca',
    cores: { L: '#dfe8ee', B: '#8a5526' },
    linhas: [
      '............',
      '..........K.',
      '.........KLK',
      '........KLLK',
      '.......KLLK.',
      '......KLLK..',
      '.....KLLK...',
      '....KLLK....',
      '...KBBK.....',
      '..KBBK......',
      '.KBBK.......',
      '..KK........'
    ]
  },
  misturar: {
    nome: 'Tigela e colher',
    cores: { L: '#dfe8ee', Y: '#f2d27a', B: '#3b6fb0' },
    linhas: [
      '........K...',
      '.......KLK..',
      '......KLK...',
      '.....KLK....',
      '....KLK.....',
      'KKKKKKKKKKKK',
      'KYYYLYYYYYYK',
      '.KBBBBBBBBK.',
      '.KBBBBBBBBK.',
      '..KBBBBBBK..',
      '...KKKKKK...',
      '............'
    ]
  },
  medir: {
    nome: 'Copo medidor',
    cores: { c: '#cfe3ec', M: '#63d6e8', L: '#29507f' },
    linhas: [
      '............',
      '..KKKKKKK...',
      '..KcccccKKK.',
      '..KcLcccK.K.',
      '..KcccccK.K.',
      '..KMMMMMKKK.',
      '..KMLMMMK...',
      '..KMMMMMK...',
      '..KMLMMMK...',
      '..KMMMMMK...',
      '..KKKKKKK...',
      '............'
    ]
  },
  fogo: {
    nome: 'Chama',
    cores: { R: '#e0453a', O: '#f28a2e', Y: '#f6d35a', L: '#fff6d8' },
    linhas: [
      '.....R......',
      '....RR......',
      '....RRR..R..',
      '...RROR..RR.',
      '..RROOORRR..',
      '..ROOYOORR..',
      '.RROYYYORR..',
      '.ROOYYYOOR..',
      '.ROYYLYYOR..',
      '..ROYYYOR...',
      '...RROORR...',
      '....RRRR....'
    ]
  },
  forno: {
    nome: 'Forno',
    cores: { G: '#9fb0bc', R: '#e0453a', O: '#f28a2e', Y: '#e9b45a' },
    linhas: [
      'KKKKKKKKKKKK',
      'KGGGGGGGGGGK',
      'KGRGGRGGRGGK',
      'KKKKKKKKKKKK',
      'KGKKKKKKKKGK',
      'KGKOOOOOOKGK',
      'KGKOYYYYOKGK',
      'KGKOOOOOOKGK',
      'KGKKKKKKKKGK',
      'KGGGGGGGGGGK',
      'KKKKKKKKKKKK',
      '.K........K.'
    ]
  },
  montar: {
    nome: 'Camadas',
    cores: { O: '#d98b3a', o: '#f6e7c1', G: '#6cc04a', M: '#6b3b22', Y: '#f2c230' },
    linhas: [
      '............',
      '...KKKKKK...',
      '..KOOOOOOK..',
      '.KOoOOOoOOK.',
      '.KKKKKKKKKK.',
      '.KGGGGGGGGK.',
      '.KMMMMMMMMK.',
      '.KYYYYYYYYK.',
      '.KOOOOOOOOK.',
      '..KKKKKKKK..',
      '............',
      '............'
    ]
  }
};


// desenha num canvas; "tamanho" é o lado final em pixels de tela; "mapa" troca os pratos pelos ícones
function pixelCanvas(nome, tamanho, mapa) {
  // "nome" também pode ser o próprio desenho (os ícones de ingrediente com cor própria)
  const sprite = typeof nome === 'object' ? nome : (mapa || SPRITES)[nome] || SPRITES[SPRITE_PADRAO];
  const lado = sprite.linhas.length;
  const escala = Math.max(1, Math.floor(tamanho / lado));
  const canvas = document.createElement('canvas');
  canvas.width = lado * escala;
  canvas.height = lado * escala;
  const ctx = canvas.getContext('2d');
  const cores = Object.assign({}, CORES_BASE, sprite.cores);
  sprite.linhas.forEach((linha, y) => {
    [...linha].forEach((letra, x) => {
      if (letra === '.') return;
      ctx.fillStyle = cores[letra] || '#ff00ff';
      ctx.fillRect(x * escala, y * escala, escala, escala);
    });
  });
  canvas.className = 'pixel';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Pixel art: ' + sprite.nome);
  return canvas;
}

// PNG pequeno (48 x 48) para guardar junto com o item no Vortex
function pixelPNG(nome) {
  return pixelCanvas(nome, 48).toDataURL('image/png');
}

/* ---------- Foto própria (receitas da tripulação) ---------- */

function carregarImagem(src) {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => falha(new Error('Não deu para abrir essa imagem. Tente uma foto JPG ou PNG.'));
    img.src = src;
  });
}

// recorta o centro da imagem num quadrado de "lado" pixels
function recorteQuadrado(img, lado, suave) {
  const canvas = document.createElement('canvas');
  canvas.width = lado;
  canvas.height = lado;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = suave !== false;
  const menor = Math.min(img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, (img.naturalWidth - menor) / 2, (img.naturalHeight - menor) / 2, menor, menor, 0, 0, lado, lado);
  return canvas;
}

// a foto do aparelho vira um JPEG pequeno (cabe no armazenamento do navegador)
async function lerFotoDoAparelho(arquivo) {
  if (!arquivo.type.startsWith('image/')) throw new Error('Esse arquivo não é uma imagem.');
  const endereco = URL.createObjectURL(arquivo);
  try {
    const img = await carregarImagem(endereco);
    const escala = Math.min(1, 480 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * escala);
    canvas.height = Math.round(img.naturalHeight * escala);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const src = canvas.toDataURL('image/jpeg', 0.82);
    return { src, img: await carregarImagem(src), doAparelho: true };
  } finally {
    URL.revokeObjectURL(endereco);
  }
}

// miniatura de 48 x 48 para o item no Vortex (foto de link vai como o próprio link)
function miniaturaDaFoto(foto, pixelada) {
  if (!foto.doAparelho) return foto.src;
  if (!pixelada) return recorteQuadrado(foto.img, 48).toDataURL('image/jpeg', 0.8);
  const grande = document.createElement('canvas');
  grande.width = 48;
  grande.height = 48;
  const ctx = grande.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(recorteQuadrado(foto.img, 24), 0, 0, 48, 48);
  return grande.toDataURL('image/png');
}

// a imagem de um prato: a foto (normal ou em pixel art) ou o desenho escolhido
function imagemDoPrato(r, tamanho) {
  if (!r.foto) return pixelCanvas(r.arte, tamanho);
  const reserva = () => pixelCanvas(r.arte, tamanho);
  if (r.fotoPixel) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    canvas.className = 'pixel foto';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Foto em pixel art: ' + r.nome);
    carregarImagem(r.foto)
      .then((img) => canvas.getContext('2d').drawImage(recorteQuadrado(img, 32), 0, 0))
      .catch(() => canvas.replaceWith(reserva()));
    return canvas;
  }
  const img = document.createElement('img');
  img.className = 'foto';
  img.src = r.foto;
  img.alt = 'Foto do prato ' + r.nome;
  img.loading = 'lazy';
  img.addEventListener('error', () => img.replaceWith(reserva()), { once: true });
  return img;
}

/* ---------- Ícones de ingredientes (10 x 10) ---------- */

const GARRAFA = [
  '...KKK....',
  '...KCK....',
  '...KCK....',
  '..KKKKK...',
  '.KCCCCCK..',
  '.KCWWWCK..',
  '.KCWCWCK..',
  '.KCWWWCK..',
  '.KCCCCCK..',
  '..KKKKK...'
];

const INGREDIENTES_ICONES = {
  ovo: { nome: 'Ovo', cores: { W: '#fbf3e0', w: '#d9c8a3' }, linhas: ['....KK....', '...KWWK...', '..KWWWWK..', '.KWWWWWWK.', '.KWWWWWWK.', '.KWWWWWwK.', '.KWWWWwwK.', '..KWwwwK..', '...KKKK...', '..........'] },
  leite: { nome: 'Leite', cores: { B: '#4a8fd8', W: '#f4f1ea' }, linhas: ['...KKKK...', '..KBBBBK..', '.KBBBBBBK.', '.KKKKKKKK.', '.KWWWWWWK.', '.KWBBBBWK.', '.KWBWWBWK.', '.KWBBBBWK.', '.KWWWWWWK.', '.KKKKKKKK.'] },
  farinha: { nome: 'Farinha', cores: { S: '#efe6d2', s: '#c9b48c' }, linhas: ['..K....K..', '..KKKKKK..', '.KSSSSSSK.', '.KSSSSSSK.', 'KSSsSSsSSK', 'KSSSssSSSK', 'KSSSSSSSSK', 'KSSSSSSSSK', '.KSSSSSSK.', '..KKKKKK..'] },
  manteiga: { nome: 'Manteiga', cores: { Y: '#f6dd7a', y: '#d9b84a' }, linhas: ['..........', '..........', '...KKKKKK.', '..KYYYYYKK', '.KYYYYYKyK', 'KKKKKKKyyK', 'KYYYYYKyK.', 'KYYYYYKK..', 'KKKKKKK...', '..........'] },
  acucar: { nome: 'Açúcar', cores: { R: '#e0405a', W: '#ffffff', L: '#c9d6de' }, linhas: ['..KKKKKK..', '..KRRRRK..', '.KKKKKKKK.', '.KWWWWWWK.', '.KWLWWLWK.', '.KWWWLWWK.', '.KWWWWWWK.', '.KWLWWWLK.', '.KWWWWWWK.', '..KKKKKK..'] },
  sal: { nome: 'Sal', cores: { G: '#b9c4cc', g: '#6f8fa5', W: '#ffffff' }, linhas: ['...KKKK...', '..KGgGgK..', '..KGGGGK..', '..KKKKKK..', '..KWWWWK..', '.KWWWWWWK.', '.KWWWWWWK.', '.KWWWWWWK.', '.KWWWWWWK.', '..KKKKKK..'] },
  tempero: { nome: 'Tempero', cores: { D: '#8a5526', R: '#d9552f', r: '#a8341f' }, linhas: ['...KKKK...', '..KDDDDK..', '..KKKKKK..', '.KRRRRRRK.', '.KRrRRrRK.', '.KRRRrRRK.', '.KRrRRRRK.', '.KRRRRrRK.', '.KRRRRRRK.', '..KKKKKK..'] },
  carne: { nome: 'Carne', cores: { M: '#c4453a', W: '#f3d6cc' }, linhas: ['..........', '...KKKK...', '..KMMMMKK.', '.KMMWMMMMK', 'KMMMMWMMMK', 'KMMMMMWMMK', 'KMMMMMMWMK', '.KMMMMMMK.', '..KKKKKK..', '..........'] },
  frango: { nome: 'Frango', cores: { F: '#d48a2c', f: '#a85d1a', W: '#f6efe2' }, linhas: ['........KK', '.......KWK', '......KWK.', '..KKKKWK..', '.KFFFFK...', 'KFfFFFFK..', 'KFFFFfFK..', 'KFFfFFFK..', '.KFFFFK...', '..KKKK....'] },
  peixe: { nome: 'Peixe', cores: { F: '#e58f62', f: '#b8603d', e: '#24181c' }, linhas: ['..........', '....KKKK..', 'KK.KFFFFK.', 'KFKFFfFFeK', '.KFFFFFFFK', 'KFKFFfFFFK', 'KK.KFFFFK.', '....KKKK..', '..........', '..........'] },
  queijo: { nome: 'Queijo', cores: { Y: '#f2c230', y: '#c99a1a' }, linhas: ['..........', '........K.', '......KKYK', '....KKYYYK', '..KKYYyYYK', 'KKYYYYYYYK', 'KYYyYYYYyK', 'KYYYYYyYYK', 'KKKKKKKKKK', '..........'] },
  verdura: { nome: 'Verdura', cores: { G: '#6cc04a', g: '#3f8a2c' }, linhas: ['....GG....', '...GgGG...', '..GGgGGG..', '.GGGgGGGG.', '.GGGGgGGG.', 'GGGGGgGGGG', '.GGGGgGGG.', '..GGGgGG..', '....g.....', '....g.....'] },
  legume: { nome: 'Legume', cores: { O: '#f28a2e', o: '#c4651f', G: '#6cc04a' }, linhas: ['......G.G.', '.......GG.', '......KKG.', '.....KOOK.', '....KOoOK.', '...KOOOK..', '..KOoOK...', '.KOOOK....', '.KOK......', '..K.......'] },
  fruta: { nome: 'Fruta', cores: { R: '#e0405a', y: '#f6e7a0', G: '#6cc04a' }, linhas: ['...G.G....', '..GGGGG...', '.KRRRRRK..', 'KRRyRRyRK.', 'KRRRRRRRK.', 'KRyRRyRRK.', '.KRRRRRK..', '..KRyRK...', '...KRK....', '....K.....'] },
  pao: { nome: 'Pão', cores: { O: '#d58b3c', o: '#f0c27a', d: '#9a5a23' }, linhas: ['..........', '..........', '...KKKKK..', '.KKOoOoOKK', 'KOOdOOdOOK', 'KOOOOOOOOK', 'KdOOOOOOdK', '.KddddddK.', '..KKKKKK..', '..........'] },
  molho: { nome: 'Molho', cores: { C: '#d8393b', W: '#f6efe2' }, linhas: GARRAFA },
  oleo: { nome: 'Óleo', cores: { C: '#e9c23a', W: '#f6efe2' }, linhas: GARRAFA },
  massa: { nome: 'Massa', cores: { Y: '#f6de8f', y: '#d9b24f' }, linhas: ['..........', '..KKKKKK..', '.KYyYyYyK.', 'KYyYyYyYyK', 'KyYyYyYyYK', 'KYyYyYyYyK', '.KyYyYyYK.', '..KKKKKK..', '..........', '..........'] },
  estrela: { nome: 'Coisa da galáxia', cores: { S: '#c38bff' }, linhas: ['....K.....', '...KSK....', '...KSK....', 'KKKKSKKKK.', '.KSSSSSK..', '..KSSSK...', '..KSKSK...', '.KSK.KSK..', '.KK...KK..', '..........'] },
  pote: { nome: 'Ingrediente', cores: { D: '#8a5526', C: '#d9b06a', W: '#f6efe2' }, linhas: ['..KKKKKK..', '..KDDDDK..', '.KKKKKKKK.', '.KCCCCCCK.', '.KCWWWWCK.', '.KCWCCWCK.', '.KCWWWWCK.', '.KCCCCCCK.', '.KCCCCCCK.', '..KKKKKK..'] }
};

// formas que se repetem com outra cor (bisnaga de mostarda, garrafa de azeite, pote de páprica...)
Object.assign(INGREDIENTES_ICONES, {
  alho: { nome: 'Alho', cores: { W: '#f4efe2', w: '#d8cdb5' }, linhas: ['....KK....', '....WK....', '...KWWK...', '..KWwWWK..', '.KWWwWWwK.', '.KWwWWwWK.', '.KWWwWWwK.', '..KWWwWK..', '...KKKK...', '..........'] },
  cebola: { nome: 'Cebola', cores: { O: '#c97a3a', o: '#a85d2a', G: '#6cc04a', r: '#e9dcc0' }, linhas: ['....G.....', '....GK....', '...KOOK...', '..KOoOOK..', '.KOOoOOOK.', '.KOoOOoOK.', '.KOOoOOOK.', '..KOOoOK..', '...KKKK...', '....rr....'] },
  tomate: { nome: 'Tomate', cores: { G: '#4f9a3a', R: '#e0453a', W: '#ffb0a0' }, linhas: ['....G.....', '..GGGGG...', '.KRRGRRK..', 'KRRRRRRRK.', 'KRWRRRRRK.', 'KRRRRRRRK.', 'KRRRRRRRK.', '.KRRRRRK..', '..KKKKK...', '..........'] },
  batata: { nome: 'Batata', cores: { B: '#c9995a', b: '#8a6a3a' }, linhas: ['..........', '...KKKK...', '..KBBBBKK.', '.KBbBBBBBK', 'KBBBBBbBBK', 'KBBbBBBBBK', '.KBBBBBbK.', '..KKKKKK..', '..........', '..........'] },
  cogumelo: { nome: 'Cogumelo', cores: { R: '#a8744a', W: '#f4efe2' }, linhas: ['..........', '...KKKK...', '.KKRRRRKK.', 'KRRWRRWRRK', 'KRRRRRRRRK', 'KKKKKKKKKK', '...KWWK...', '...KWWK...', '...KWWK...', '...KKKK...'] },
  limao: { nome: 'Limão', cores: { Y: '#8fd64a', W: '#d6f2a8' }, linhas: ['..........', '..........', '...KKKK...', '..KYYYYKK.', '.KYYWYYYYK', 'KKYYYYYYK.', '.KYYYYYYK.', '..KKYYKK..', '....KK....', '..........'] },
  banana: { nome: 'Banana', cores: { Y: '#f6dd4a' }, linhas: ['........KK', '.......KYK', '......KYYK', '.....KYYK.', '...KKYYYK.', 'KKKYYYYK..', 'KYYYYYK...', '.KKKKK....', '..........', '..........'] },
  abacaxi: { nome: 'Abacaxi', cores: { G: '#6cc04a', Y: '#f2c230', y: '#c9902a' }, linhas: ['...G.G.G..', '....GGG...', '...KKKKK..', '..KYyYyYK.', '..KyYyYyK.', '..KYyYyYK.', '..KyYyYyK.', '..KYyYyYK.', '...KKKKK..', '..........'] },
  maca: { nome: 'Maçã', cores: { G: '#6cc04a', R: '#d8393b', W: '#ffb0a0' }, linhas: ['....K.G...', '....KGG...', '..KKKKKK..', '.KRRRRRRK.', 'KRWRRRRRRK', 'KRRRRRRRRK', 'KRRRRRRRRK', '.KRRRRRRK.', '..KKKKKK..', '..........'] },
  milho: { nome: 'Milho', cores: { Y: '#f6d35a', y: '#d9a92a', G: '#6cc04a' }, linhas: ['....KK....', '...KYYK...', '..KYyYYK..', '..KYYyYK..', '..KyYYyK..', '..KYYyYK..', '..KYyYYK..', '.GKKYYKKG.', '..GG..GG..', '..........'] },
  pepino: { nome: 'Pepino', cores: { G: '#4f9a3a', g: '#8fd66a' }, linhas: ['..........', '......KKK.', '.....KGgGK', '....KGgGK.', '...KGgGK..', '..KGgGK...', '.KGgGK....', '.KGGK.....', '..KK......', '..........'] },
  tofu: { nome: 'Bloco', cores: { W: '#f4f1ea', w: '#d9d2c0' }, linhas: ['..........', '..KKKKKKK.', '.KWWWWWWKK', 'KWWWWWWKwK', 'KKKKKKKwwK', 'KWWWWWKwwK', 'KWWWWWKwK.', 'KWWWWWKK..', 'KKKKKKK...', '..........'] },
  camarao: { nome: 'Camarão', cores: { O: '#f28a6a', o: '#c4553c' }, linhas: ['..........', '...KKKK...', '..KOOOOKK.', '.KOoKKOOOK', '.KOK..KOOK', '..K...KOOK', '....KKOOK.', '...KOOOK..', '..KOOKK...', '...KK.....'] },
  chocolate: { nome: 'Chocolate', cores: { C: '#6b3b22', c: '#4a2716', W: '#c9d6de', R: '#e0453a' }, linhas: ['..........', '.KKKKKKKK.', '.KCcCcCcK.', '.KccccccK.', '.KCcCcCcK.', '.KccccccK.', '.KWWWWWWK.', '.KRRRRRRK.', '.KKKKKKKK.', '..........'] },
  mel: { nome: 'Mel', cores: { D: '#8a5526', H: '#f2a52e', h: '#d9821e', W: '#c8904a' }, linhas: ['......K...', '.....KW...', '..KKKKWKK.', '.KDDDKWDDK', '.KHHHHHHHK', '.KHhHHHhHK', '.KHHHHHHHK', '..KHHhHHK.', '...KKKKK..', '..........'] },
  coco: { nome: 'Coco', cores: { B: '#7a5230', b: '#5a3a20' }, linhas: ['..........', '...KKKK...', '..KBBBBK..', '.KBbBBbBK.', '.KBBBBBBK.', '.KBBbBBBK.', '..KBBBBK..', '...KKKK...', '..........', '..........'] },
  tigela: { nome: 'Tigela', cores: { C: '#ffffff', c: '#dfe8ee', B: '#3b6fb0' }, linhas: ['..........', '..........', '...CcCcC..', '..CcCcCcC.', 'KKKKKKKKKK', 'KBBBBBBBBK', '.KBBBBBBK.', '..KBBBBK..', '...KKKK...', '..........'] },
  pimenta: { nome: 'Pimenta', cores: { G: '#4f9a3a', R: '#e0453a' }, linhas: ['......G...', '.....GG...', '....KRRK..', '...KRRRK..', '..KRRRK...', '.KRRRK....', '.KRRK.....', '..KK......', '..........', '..........'] },
  ervas: { nome: 'Ervas', cores: { G: '#4f9a3a', g: '#8fd66a' }, linhas: ['..........', '...G.G....', '..GgG.G...', '...G.GgG..', '..GgGG.G..', '....G.....', '....g.....', '....g.....', '..........', '..........'] },
  rocha: { nome: 'Pedra', cores: { R: '#9fb0bc', r: '#6f8fa5' }, linhas: ['..........', '...KKKK...', '..KRRrRKK.', '.KRrRRRRK.', '.KRRRRrRK.', '.KRrRRRRK.', '..KRRRrK..', '...KKKK...', '..........', '..........'] },
  esfera: { nome: 'Buraco negro', cores: { P: '#c38bff' }, linhas: ['..........', '...KKKK...', '..KKKKKK..', 'PPKKKKKKPP', 'PPPKKKKPPP', '..KKKKKK..', '...KKKK...', '..........', '..........', '..........'] },
  brilho: { nome: 'Poeira de cometa', cores: { S: '#9fd8ff', W: '#ffffff' }, linhas: ['....S.....', '...SWS....', '....S...S.', '.......SWS', '..S.....S.', '.SWS......', '..S...S...', '......S...', '.....SWS..', '......S...'] },
  copo: { nome: 'Copo', cores: { W: '#cfe3ec', C: '#f4f1ea' }, linhas: ['..........', '.KKKKKKKK.', '.KWWWWWWK.', '.KCCCCCCK.', '..KCCCCK..', '..KCWWCK..', '..KCCCCK..', '..KCCCCK..', '...KKKK...', '..........'] },
  bisnaga: { nome: 'Bisnaga', cores: { C: '#e0453a', B: '#f6efd2', W: '#ffffff' }, linhas: ['....K.....', '...KCK....', '...KCK....', '..KKKKK...', '.KBBBBBK..', '.KBWWBBK..', '.KBBBBBK..', '.KBBBBBK..', '.KBBBBBK..', '..KKKKK...'] },
  frasco: { nome: 'Garrafa', cores: { C: '#e9e4c8', W: '#ffffff' }, linhas: ['....KK....', '....KK....', '...KCCK...', '...KCCK...', '..KCCCCK..', '.KCCCCCCK.', '.KCWCCCCK.', '.KCWCCCCK.', '.KCCCCCCK.', '..KKKKKK..'] }
});

/* Qual desenho (e qual cor) combina com o nome do ingrediente, em português ou inglês.
   Do mais específico para o mais geral: "alho em pó" antes de "alho", "sal de cebola" antes de "sal". */
const ICONE_POR_PALAVRA = [
  // coisas da galáxia (as pegadinhas da despensa)
  [/poeira de cometa/, 'brilho'],
  [/geleia de nebulosa/, 'pote', { C: '#7a2aff', W: '#c38bff', D: '#2a1a5a' }],
  [/sal de asteroide/, 'rocha'],
  [/pimenta de marte/, 'pimenta', { R: '#ff4f2a', G: '#7a2aff' }],
  [/leite de lua/, 'frasco', { C: '#d8e8ff', W: '#ffffff' }],
  [/buraco negro/, 'esfera'],
  // molhos e líquidos
  [/maionese|mayonnaise/, 'bisnaga', { B: '#f6efd2', C: '#e0453a' }],
  [/mostarda|mustard/, 'bisnaga', { B: '#f2c230', C: '#c99a1a' }],
  [/ketchup|molho de tomate|tomato sauce/, 'bisnaga', { B: '#d8393b', C: '#2f7a2a' }],
  [/vinagre|vinegar/, 'frasco', { C: '#ece6c6' }],
  [/azeite|olive oil/, 'frasco', { C: '#9fae3a' }],
  [/shoyu|soy sauce|molho de soja/, 'frasco', { C: '#3a2010', W: '#7a5230' }],
  [/essencia|extract|baunilha|vanilla/, 'frasco', { C: '#8a5526', W: '#c8904a' }],
  [/oleo|\boil\b/, 'frasco', { C: '#f2d24a' }],
  [/caldo|stock|broth/, 'tigela', { C: '#c9995a', c: '#a8744a' }],
  [/agua|water/, 'copo', { C: '#9fd8ff' }],
  [/extrato de tomate|tomato puree|polpa de tomate/, 'pote', { C: '#d8393b', W: '#f6efe2' }],
  [/leite de coco|coconut milk/, 'leite', { B: '#7a5230' }],
  [/iogurte|yogurt/, 'copo', { C: '#f4f1ea', W: '#e78aa3' }],
  [/creme|cream|nata/, 'copo', { C: '#f6efd2' }],
  [/molho|sauce/, 'garrafaMolho'],
  // potes e doces
  [/\bmel\b|honey/, 'mel'],
  [/pasta de amendoim|peanut butter/, 'pote', { C: '#a8744a', W: '#e0453a', D: '#e0453a' }],
  [/geleia|\bjam\b/, 'pote', { C: '#a52a4a', W: '#f6efe2' }],
  [/chocolate|cacau|cocoa/, 'chocolate'],
  [/acucar mascavo|brown sugar/, 'acucar', { W: '#b9874a', L: '#8a5a2a', R: '#6b3b22' }],
  [/acucar|sugar/, 'acucar'],
  [/fermento|yeast|baking/, 'farinha', { S: '#f6efd2', s: '#e0453a' }],
  [/biscoito|biscuit|bolacha|cookie/, 'tofu', { W: '#d9a35a', w: '#a8742f' }],
  [/farinha|flour|amido|starch|farofa/, 'farinha'],
  // laticínios e ovos
  [/leite|milk/, 'leite'],
  [/manteiga com sal|salted butter/, 'manteiga', { Y: '#f6e7a0', y: '#e0453a' }],
  [/manteiga|butter/, 'manteiga'],
  [/\bovo|egg|gema|clara/, 'ovo'],
  [/queijo|cheese|pecorino|mucarela|mozzarella|parmes/, 'queijo'],
  [/tofu/, 'tofu'],
  // temperos (pós e sais com a cor de cada um)
  [/alho em po|garlic powder/, 'tempero', { R: '#efe6d2', r: '#c9b48c' }],
  [/sal de cebola|onion salt/, 'sal', { W: '#e8d6b0' }],
  [/sal de aipo|celery salt/, 'sal', { W: '#d6e8b0' }],
  [/sal marinho|sea salt/, 'sal', { W: '#e0f0ff', G: '#63d6e8' }],
  [/\bsal\b|salt/, 'sal'],
  [/paprica|paprika/, 'tempero', { R: '#d9552f', r: '#a8341f' }],
  [/pimenta-do-reino|black pepper|pimenta preta/, 'tempero', { R: '#4a4a4a', r: '#1f1f1f', D: '#3a3a3a' }],
  [/pimenta calabresa|red pepper flakes|chili powder|pimenta em po/, 'tempero', { R: '#e0453a', r: '#ff9a2a', D: '#e0453a' }],
  [/pimenta-da-jamaica|allspice/, 'tempero', { R: '#6b3b22', r: '#4a2716' }],
  [/cominho|cumin/, 'tempero', { R: '#b0803a', r: '#7a5230' }],
  [/canela|cinnamon/, 'tempero', { R: '#8a4a22', r: '#6b3318' }],
  [/noz-moscada|nutmeg/, 'coco', { B: '#a8744a', b: '#7a5230' }],
  [/gengibre|ginger/, 'batata', { B: '#e0b070', b: '#b08040' }],
  [/hortela|mint/, 'ervas', { G: '#2fae5a', g: '#9ff0b0' }],
  [/salvia|sage/, 'ervas', { G: '#7f9a7a', g: '#b9cdb4' }],
  [/oregano|tomilho|thyme|manjerona|marjoram|louro|bay leaf/, 'ervas', { G: '#5a7a2a', g: '#a8c46a' }],
  [/manjeric|basil|salsa\b|coentro|cilantro|parsley|cebolinha/, 'ervas'],
  [/pimenta|pepper|chili|jalapeno/, 'pimenta'],
  // grãos
  [/aveia|oat/, 'tigela', { C: '#e8d6b0', c: '#c9b48c' }],
  [/arroz|rice/, 'tigela'],
  [/feijao|bean/, 'tigela', { C: '#5a2a1a', c: '#3a1a10' }],
  [/lentilha|lentil/, 'tigela', { C: '#c9702a', c: '#a8541a' }],
  [/amendoa|almond|castanha|nozes|amendoim|peanut/, 'coco', { B: '#c99a6a', b: '#a8744a' }],
  [/espaguete|spaghetti|macarrao|\bmassa\b|penne|lasanha/, 'massa'],
  [/\bpao\b|\bpaes\b|\bbun|bread|torrada|crouton/, 'pao'],
  // carnes e peixes
  [/frango|chicken/, 'frango'],
  [/camarao|prawn|shrimp/, 'camarao'],
  [/salmao|salmon/, 'peixe', { F: '#f28a6a', f: '#e0653a' }],
  [/peixe|fish|bacalhau|atum|tuna/, 'peixe'],
  [/bacon|pancetta/, 'carne', { M: '#e06a5a', W: '#f6d6c8' }],
  [/carne|beef|porco|pork|cordeiro|lamb|hamburguer|mince/, 'carne'],
  // hortaliças e frutas
  [/repolho|cabbage/, 'verdura', { G: '#9fd66a', g: '#5aa83a' }],
  [/alface|lettuce|espinafre|spinach|couve|folha/, 'verdura'],
  [/\balho\b|garlic/, 'alho'],
  [/cebola|onion/, 'cebola'],
  [/cenoura|carrot/, 'legume'],
  [/batata|potato/, 'batata'],
  [/abobora|pumpkin|squash/, 'maca', { R: '#f28a2e', W: '#ffc890', G: '#4f9a3a' }],
  [/tomate|tomato/, 'tomate'],
  [/cogumelo|mushroom|champignon/, 'cogumelo'],
  [/pepino|cucumber|picles|pickle/, 'pepino'],
  [/milho|corn/, 'milho'],
  [/limao|lemon|lime/, 'limao'],
  [/banana/, 'banana'],
  [/abacaxi|pineapple/, 'abacaxi'],
  [/maca verde|bramley|green apple/, 'maca', { R: '#8fd64a', W: '#d6f2a8' }],
  [/\bmaca|apple/, 'maca'],
  [/coco|coconut/, 'coco'],
  [/framboesa|raspberr/, 'fruta', { R: '#c42a5a' }],
  [/mirtilo|blueberr/, 'fruta', { R: '#4a5fd0', y: '#9fb0ff' }],
  [/morango|strawberr|fruta|fruit/, 'fruta'],
  [/tempero|spice|aipo|celery/, 'tempero']
];

INGREDIENTES_ICONES.garrafaMolho = INGREDIENTES_ICONES.molho;

const semAcento = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// o desenho do ingrediente, já com as cores dele
function spriteDoIngrediente(nome) {
  const t = semAcento(nome);
  const achado = ICONE_POR_PALAVRA.find(([rx]) => rx.test(t));
  const base = INGREDIENTES_ICONES[achado ? achado[1] : 'pote'];
  if (!achado || !achado[2]) return base;
  return { nome: base.nome, linhas: base.linhas, cores: Object.assign({}, base.cores, achado[2]) };
}

// ícone pequeno ao lado de um texto (decorativo: quem lê o texto já sabe o que é)
function iconeIngrediente(nome, tamanho) {
  const c = pixelCanvas(spriteDoIngrediente(nome), tamanho || 20);
  c.removeAttribute('role');
  c.removeAttribute('aria-label');
  c.setAttribute('aria-hidden', 'true');
  return c;
}

/* ---------- Instrumentos dos jogos (16 x 16) ---------- */

const INSTRUMENTOS = {
  jarra: {
    nome: 'Jarra de leite',
    cores: { W: '#cfe3ec', B: '#f4f1ea' },
    linhas: [
      '................',
      '....KKKKKKK.....',
      '...KWWWWWWWK....',
      '..KWWWWWWWWK....',
      'KKWWWWWWWWWKKK..',
      '.KWWWWWWWWWK.KK.',
      '..KWWWWWWWWK..K.',
      '..KBBBBBBBBK..K.',
      '..KBBBBBBBBK..K.',
      '..KBBBBBBBBK.KK.',
      '..KBBBBBBBBKKK..',
      '..KBBBBBBBBK....',
      '..KBBBBBBBBK....',
      '..KBBBBBBBBK....',
      '...KKKKKKKK.....',
      '................'
    ]
  },
  colher: {
    nome: 'Colher de pau',
    cores: { W: '#c8904a' },
    linhas: [
      '..........KKK...',
      '.........KWWWK..',
      '........KWWWWWK.',
      '........KWWWWWK.',
      '........KWWWWWK.',
      '.........KWWWK..',
      '........KWKKK...',
      '.......KWK......',
      '......KWK.......',
      '.....KWK........',
      '....KWK.........',
      '...KWK..........',
      '..KWK...........',
      '.KWK............',
      '.KK.............',
      '................'
    ]
  },
  pa: {
    nome: 'Pá de forno',
    cores: { W: '#c8904a', w: '#9a6a2f' },
    linhas: [
      '..KKKKKKKKKKKK..',
      '.KWWWWWWWWWWWWK.',
      '.KWWwWWWWWWwWWK.',
      '.KWWWWWWWWWWWWK.',
      '.KWWWWWwWWWWWWK.',
      '.KWWWWWWWWWWWWK.',
      '..KWWWWWWWWWWK..',
      '...KKKKWWKKKK...',
      '......KWWK......',
      '......KWwK......',
      '......KWWK......',
      '......KWWK......',
      '......KwWK......',
      '......KWWK......',
      '......KWWK......',
      '......KKKK......'
    ]
  },
  panela: {
    nome: 'Frigideira',
    cores: { G: '#4a5560', g: '#2c343b', M: '#8a5526', O: '#f0b85a' },
    linhas: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '..OOO...O.......',
      'KKKKKKKKKKKK....',
      'KGGGGGGGGGGKKKKK',
      'KgGGGGGGGGgKMMMK',
      '.KgggggggggKKKKK',
      '..KKKKKKKKK.....',
      '................',
      '................',
      '................',
      '................',
      '................'
    ]
  }
};

function instrumento(nome, tamanho) {
  const c = pixelCanvas(nome, tamanho, INSTRUMENTOS);
  c.removeAttribute('role');
  c.removeAttribute('aria-label');
  c.setAttribute('aria-hidden', 'true');
  c.draggable = false;
  return c;
}
