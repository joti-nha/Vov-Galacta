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

// desenha num canvas; "tamanho" é o lado final em pixels de tela
function pixelCanvas(nome, tamanho) {
  const sprite = SPRITES[nome] || SPRITES[SPRITE_PADRAO];
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
