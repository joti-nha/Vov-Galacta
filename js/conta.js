/* =====================================================================
   CONTA E TEMAS | o mesmo login e os mesmos temas do Vortex
   Este site e o Vortex moram no mesmo endereço (joti-nha.github.io),
   então dividem o armazenamento do navegador. A conta é o perfil do
   Vortex (código de 1 a 6 números) e fica na mesma chave que o Vortex
   usa: entrar aqui entra lá, e sair aqui sai lá. Os temas que você
   desbloqueou no Vortex aparecem aqui, e trocar o tema troca nos dois.
   ===================================================================== */

const CHAVE_PERFIL_VORTEX = 'vortex.profile.v1.fb.' + VORTEX.projectId;
const CHAVE_TEMAS_VORTEX = 'vortex.themes.v1';

const TEMAS = [
  { id: '', nome: 'Vortex', texto: 'Tempestade e lanterna.' },
  { id: 'ether', nome: 'Ether', texto: 'Violeta, ciano e energia instável.' },
  { id: 'claptrap', nome: 'Claptrap', texto: 'Amarelo de lata e capacete verde.' },
  { id: 'god', nome: 'God', texto: 'Ouro divino e céu ao amanhecer.' },
  { id: 'nyan', nome: 'Nyan Cat', texto: 'Espaço, estrelas e arco-íris.' },
  { id: 'vortice', nome: 'Vórtex ∞', texto: 'Cores girando sem parar.' }
];

function lerArmazenado(chave) {
  try { return localStorage.getItem(chave); } catch (e) { return null; }
}

function gravarArmazenado(chave, valor) {
  try {
    if (valor === null) localStorage.removeItem(chave); else localStorage.setItem(chave, valor);
  } catch (e) { /* sem armazenamento: vale só nesta visita */ }
}

/* ---------- Conta ---------- */

function codigoDaConta() {
  const codigo = lerArmazenado(CHAVE_PERFIL_VORTEX) || '';
  return /^\d{1,6}$/.test(codigo) ? codigo : '';
}

function guardarConta(codigo) {
  gravarArmazenado(CHAVE_PERFIL_VORTEX, codigo || null);
}

/* ---------- Temas ---------- */

// o mesmo formato do Vortex: { unlocked: ['ether', ...], active: 'ether' }
function lerTemas() {
  try {
    const v = JSON.parse(lerArmazenado(CHAVE_TEMAS_VORTEX)) || {};
    return { unlocked: Array.isArray(v.unlocked) ? v.unlocked : [], active: v.active || '' };
  } catch (e) {
    return { unlocked: [], active: '' };
  }
}

function temasLiberados() {
  const { unlocked } = lerTemas();
  return TEMAS.filter((t) => !t.id || unlocked.includes(t.id));
}

function aplicarTema() {
  const { unlocked, active } = lerTemas();
  const id = active && unlocked.includes(active) ? active : '';
  if (id) document.documentElement.dataset.theme = id; else delete document.documentElement.dataset.theme;
  efeitoNyan(id === 'nyan');
  return id;
}

function escolherTema(id) {
  const temas = lerTemas();
  if (id && !temas.unlocked.includes(id)) return;
  temas.active = id;
  gravarArmazenado(CHAVE_TEMAS_VORTEX, JSON.stringify(temas));
  aplicarTema();
}
