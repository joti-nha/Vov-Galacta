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
  const sprite = (mapa || SPRITES)[nome] || SPRITES[SPRITE_PADRAO];
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

// qual ícone combina com o nome do ingrediente (português ou inglês)
const ICONE_POR_PALAVRA = [
  ['estrela', /cometa|nebulosa|asteroide|marte|\blua\b|buraco negro/],
  ['ovo', /\bovo|egg|gema|clara/],
  ['leite', /leite|milk|creme|cream|iogurte|yogurt/],
  ['manteiga', /manteiga|butter/],
  ['farinha', /farinha|flour|amido|aveia|oat|biscoit|biscuit|farofa/],
  ['acucar', /a[cç]ucar|sugar|\bmel\b|honey|chocolate/],
  ['sal', /\bsal\b|salt/],
  ['frango', /frango|chicken/],
  ['peixe', /peixe|fish|salm|camar|prawn|shrimp/],
  ['carne', /carne|beef|bacon|porco|pork|cordeiro|lamb|hamb[uú]rguer|mince/],
  ['queijo', /queijo|cheese|pecorino|mu[cç]arela|parmes/],
  ['massa', /espaguete|spaghetti|macarr|\bmassa\b|pasta\b|penne/],
  ['pao', /\bp[aã]o\b|\bp[aã]es\b|\bbun|bread|torrada|crouton/],
  ['oleo', /[oó]leo|\boil\b|azeite/],
  ['molho', /molho|sauce|maionese|mayonnaise|mostarda|mustard|vinagre|vinegar|caldo|stock|extrato|pur[eé]e|[aá]gua|water|ess[eê]ncia|extract/],
  ['verdura', /alface|lettuce|repolho|cabbage|espinafre|folha|salada/],
  ['legume', /cenoura|carrot|cebola|onion|batata|potato|ab[oó]bora|tomate|tomato|lentilha|lentil|feij|milho|pepino|picles|pickle|cogumelo|mushroom|alho\b|garlic/],
  ['fruta', /morango|strawberr|framboesa|raspberr|mirtilo|blueberr|ma[cç][aã]|apple|banana|abacaxi|lim[aã]o|lemon|fruta|am[eê]ndoa|almond|nozes|castanha/],
  ['tempero', /pimenta|pepper|p[aá]prica|paprika|cominho|cumin|or[eé]gano|s[aá]lvia|sage|tomilho|thyme|manjeric|basil|canela|cinnamon|tempero|spice|hortel|mint|manjerona|aipo|celery|gengibre|ginger|chili/]
];

function iconeDoIngrediente(nome) {
  const t = String(nome).toLowerCase();
  const achado = ICONE_POR_PALAVRA.find(([, rx]) => rx.test(t));
  return achado ? achado[0] : 'pote';
}

// ícone pequeno ao lado de um texto (decorativo: quem lê o texto já sabe o que é)
function iconeIngrediente(nome, tamanho) {
  const c = pixelCanvas(iconeDoIngrediente(nome), tamanho || 20, INGREDIENTES_ICONES);
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
