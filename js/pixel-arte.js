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
