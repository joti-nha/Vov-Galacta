/* =====================================================================
   UTILIDADES usadas por todos os scripts
   ===================================================================== */

// cria um elemento: h('p', 'classe', 'texto', outroElemento...)
function h(tag, classe, ...filhos) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  filhos.flat().forEach((f) => {
    if (f === null || f === undefined || f === false) return;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  });
  return el;
}

const limitar = (n, min, max) => Math.max(min, Math.min(max, n));

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function botao(texto, classe, aoClicar) {
  const b = h('button', 'botao ' + (classe || ''), texto);
  b.type = 'button';
  if (aoClicar) b.addEventListener('click', aoClicar);
  return b;
}

const novoUid = () => (window.crypto && crypto.randomUUID
  ? crypto.randomUUID()
  : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
