/* =====================================================================
   VORTEX | fichas e inventário pela API REST do Firebase
   O Vortex (https://github.com/joti-nha/Vortex_aplication) guarda as fichas
   em characters/{id}; o inventário fica em sheet.inventory. Aqui o site:
     1. entra como visitante anônimo (como o próprio Vortex faz);
     2. abre o perfil (a conta) pelo código e lista as fichas dele;
     3. grava o prato pronto no inventário, no mesmo formato de um
        "Item geral" consumível do Vortex.
   ===================================================================== */

const VORTEX = {
  apiKey: 'AIzaSyDEaRWcliVKrFGSGslzO-YODgZDZxgI5yE',
  projectId: 'vortex-7faa5'
};
const VORTEX_RAIZ = 'projects/' + VORTEX.projectId + '/databases/(default)/documents';
const VORTEX_DOCS = 'https://firestore.googleapis.com/v1/' + VORTEX_RAIZ;
const CHAVE_SESSAO = 'vovGalacta.sessaoVortex';

class ErroVortex extends Error {}

/* ---------- Valores do Firestore <-> JavaScript ---------- */

function deValor(v) {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(deValor);
  if ('mapValue' in v) return deCampos(v.mapValue.fields || {});
  return null;
}

function deCampos(campos) {
  const obj = {};
  Object.keys(campos).forEach((k) => { obj[k] = deValor(campos[k]); });
  return obj;
}

function paraValor(x) {
  if (x === null || x === undefined) return { nullValue: null };
  if (Array.isArray(x)) return { arrayValue: x.length ? { values: x.map(paraValor) } : {} };
  if (typeof x === 'boolean') return { booleanValue: x };
  if (typeof x === 'number') return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  if (typeof x === 'object') {
    const campos = {};
    Object.keys(x).forEach((k) => { campos[k] = paraValor(x[k]); });
    return { mapValue: Object.keys(campos).length ? { fields: campos } : {} };
  }
  return { stringValue: String(x) };
}

const numero = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/* ---------- Sessão anônima (guardada neste navegador) ---------- */

function lerSessaoGuardada() {
  try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO)) || null; } catch (e) { return null; }
}

function guardarSessao(s) {
  try { localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s)); } catch (e) { /* sem armazenamento: vale só nesta visita */ }
}

function mensagemAuth(json) {
  const codigo = (json && json.error && json.error.message) || '';
  if (/OPERATION_NOT_ALLOWED|ADMIN_ONLY/.test(codigo)) return 'O login de visitante do Vortex está desligado no Firebase.';
  if (/API_KEY|API key/i.test(codigo)) return 'O Vortex recusou a chave de acesso deste site.';
  return 'Não foi possível entrar no Vortex' + (codigo ? ' (' + codigo + ')' : '') + '.';
}

async function pedirAuth(url, corpo, tipo) {
  let resposta;
  try {
    resposta = await fetch(url, { method: 'POST', headers: { 'Content-Type': tipo }, body: corpo });
  } catch (e) {
    throw new ErroVortex('Sem conexão com o Vortex. Confira a internet e tente de novo.');
  }
  const json = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new ErroVortex(mensagemAuth(json));
  return json;
}

async function entrarComoVisitante() {
  const j = await pedirAuth(
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + VORTEX.apiKey,
    JSON.stringify({ returnSecureToken: true }),
    'application/json'
  );
  return { idToken: j.idToken, refreshToken: j.refreshToken, uid: j.localId, expira: Date.now() + numero(j.expiresIn) * 1000 };
}

async function renovarSessao(refreshToken) {
  const j = await pedirAuth(
    'https://securetoken.googleapis.com/v1/token?key=' + VORTEX.apiKey,
    'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken),
    'application/x-www-form-urlencoded'
  );
  return { idToken: j.id_token, refreshToken: j.refresh_token, uid: j.user_id, expira: Date.now() + numero(j.expires_in) * 1000 };
}

async function sessaoVortex() {
  let s = estado.sessao || lerSessaoGuardada();
  if (s && s.expira > Date.now() + 60000) {
    estado.sessao = s;
    return s;
  }
  s = s && s.refreshToken ? await renovarSessao(s.refreshToken).catch(() => null) : null;
  if (!s) s = await entrarComoVisitante();
  guardarSessao(s);
  estado.sessao = s;
  return s;
}

/* ---------- Pedidos ao Firestore ---------- */

async function pedirVortex(caminho, metodo, corpo) {
  const s = await sessaoVortex();
  let resposta;
  try {
    resposta = await fetch(VORTEX_DOCS + caminho, {
      method: metodo || 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + s.idToken },
      body: corpo ? JSON.stringify(corpo) : undefined
    });
  } catch (e) {
    throw new ErroVortex('Sem conexão com o Vortex. Confira a internet e tente de novo.');
  }
  const texto = await resposta.text();
  const json = texto ? JSON.parse(texto) : {};
  if (!resposta.ok) {
    const erro = new ErroVortex(resposta.status === 403
      ? 'O Vortex não deixou este site mexer nessa ficha.'
      : 'O Vortex respondeu com erro ' + resposta.status + '.');
    erro.status = resposta.status;
    throw erro;
  }
  return json;
}

/* ---------- Fichas ---------- */

// mesmas regras do Vortex: atributo da ficha + UP (até 6) + ajuste manual
function resumoDaFicha(doc) {
  const d = deCampos(doc.fields || {});
  const s = d.sheet || {};
  const attrs = s.attrs || {};
  const precisao = Math.min(6, numero(attrs.precisao) + numero((s.upAttr || {}).precisao)) + numero((s.attrMod || {}).precisao);
  const profissao = String(s.oficio || '').trim();
  const culinaria = /culin|cozinh|chef|confeit|padeir|gastron|cuca/i.test(profissao);
  return {
    id: doc.name.split('/').pop(),
    nome: d.name || 'Sem nome',
    tipo: d.type === 'criatura' ? 'Criatura' : 'Personagem',
    especie: d.species || (s.specimen && s.specimen.name) || '',
    foto: d.thumb || '',
    precisao,
    oficio: numero((s.skills || {}).oficio),
    profissao,
    culinaria,
    itens: Array.isArray(s.inventory) ? s.inventory.length : 0
  };
}

// a "conta" é o perfil do Vortex: o código abre o nome e as fichas dele
async function abrirPerfil(codigo) {
  let perfil;
  try {
    perfil = await pedirVortex('/profiles/' + encodeURIComponent(codigo));
  } catch (e) {
    if (e.status === 404) throw new ErroVortex('Nenhum perfil do Vortex com o código ' + codigo + '.');
    throw e;
  }
  const dados = deCampos(perfil.fields || {});
  const ids = Array.isArray(dados.chars) ? dados.chars : [];
  let fichas = [];
  if (ids.length) {
    const lote = await pedirVortex(':batchGet', 'POST', {
      documents: ids.slice(0, 100).map((id) => VORTEX_RAIZ + '/characters/' + id)
    });
    fichas = lote.filter((x) => x.found).map((x) => resumoDaFicha(x.found));
  }
  return { codigo, nome: dados.name || 'Perfil ' + codigo, fichas };
}

// texto sem acento e em minúsculas, para buscas e comparações
const chaveBusca = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* ---------- Inventário ---------- */

// mesmo prato, mesma qualidade e fora das mãos: os pratos novos somam na pilha em vez de criar outro item
function mesmoPrato(valor, item) {
  const f = valor.mapValue && valor.mapValue.fields;
  if (!f) return false;
  const v = (f.values && f.values.mapValue && f.values.mapValue.fields) || {};
  const texto = (campo) => (campo && campo.stringValue) || '';
  return texto(f.kind) === 'item-geral'
    && texto(f.name) === item.name
    && texto(v.raridade) === item.values.raridade
    && texto(v.efeito) === item.values.efeito
    && !texto(f.slot);
}

async function gravarNoInventario(fichaId, item) {
  // duas tentativas: se a ficha mudou entre a leitura e a gravação, lê de novo
  for (let tentativa = 0; tentativa < 2; tentativa++) {
    const doc = await pedirVortex('/characters/' + encodeURIComponent(fichaId));
    const ficha = doc.fields && doc.fields.sheet && doc.fields.sheet.mapValue;
    // os itens que já estão lá voltam exatamente como vieram
    const itens = ficha && ficha.fields && ficha.fields.inventory && ficha.fields.inventory.arrayValue
      ? (ficha.fields.inventory.arrayValue.values || []).slice()
      : [];

    const pilha = itens.find((v) => mesmoPrato(v, item));
    if (pilha) {
      const f = pilha.mapValue.fields;
      f.qty = paraValor(Math.max(1, Math.round(f.qty ? numero(deValor(f.qty)) : 1)) + item.qty);
    } else {
      itens.push(paraValor(item));
    }

    const campos = ficha
      ? { sheet: { mapValue: { fields: { inventory: { arrayValue: { values: itens } } } } } }
      : { sheet: paraValor({ inventory: [item] }) }; // ficha nunca aberta: o Vortex completa o resto

    try {
      await pedirVortex(':commit', 'POST', {
        writes: [{
          update: { name: doc.name, fields: campos },
          updateMask: { fieldPaths: [ficha ? 'sheet.inventory' : 'sheet'] },
          updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: { updateTime: doc.updateTime }
        }]
      });
      const qtd = pilha ? deValor(pilha.mapValue.fields.qty) : item.qty;
      return { empilhou: Boolean(pilha), quantidade: qtd };
    } catch (e) {
      const conflito = e.status === 400 || e.status === 409 || e.status === 412;
      if (!conflito || tentativa === 1) throw e;
    }
  }
  return null;
}
