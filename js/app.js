/* =====================================================================
   APP | estado global, navegação SPA, listagem, cadastro, conta
   e a cozinha (a aula em minigames + envio para o inventário do Vortex)
   ===================================================================== */

const CHAVE_RECEITAS = 'vovGalacta.receitas';
const CHAVE_FICHA = 'vovGalacta.ficha';

// Estado global: tudo o que a página mostra sai daqui
const estado = {
  secao: 'inicio',
  receitas: [],        // o cardápio: pratos da TheMealDB com tradução e aula
  cadastradas: [],     // receitas do formulário (salvas no navegador)
  filtro: { categoria: '', busca: '' },
  carregando: false,
  conta: null,         // perfil do Vortex: { codigo, nome, fichas }
  ficha: null,         // personagem do perfil que está cozinhando
  sessao: null,        // login anônimo no Firebase do Vortex (vortex-api.js)
  rascunhoPassos: [],  // a aula sendo montada no cadastro
  cozinha: null        // a aula em andamento
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------- Avisos rápidos ---------- */

let tempoTorrada = 0;
function avisar(texto) {
  const t = $('#torrada');
  t.textContent = texto;
  t.classList.add('is-visivel');
  clearTimeout(tempoTorrada);
  tempoTorrada = setTimeout(() => t.classList.remove('is-visivel'), 4200);
}

/* ---------- Navegação SPA (classes CSS, sem recarregar) ---------- */

const SECOES = ['inicio', 'receitas', 'cadastro'];

function mostrarSecao(id, rolar) {
  const alvo = SECOES.includes(id) ? id : 'inicio';
  estado.secao = alvo;
  $$('.secao').forEach((s) => s.classList.toggle('is-ativa', s.id === alvo));
  $$('.menu a').forEach((a) => {
    const ativo = a.dataset.secao === alvo;
    a.classList.toggle('is-ativo', ativo);
    if (ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.title = { inicio: 'Cozinha da Vó Galacta', receitas: 'Receitas | Cozinha da Vó Galacta', cadastro: 'Nova receita | Cozinha da Vó Galacta' }[alvo];
  if (rolar) window.scrollTo({ top: 0, behavior: 'auto' });
  if (alvo === 'receitas' && !estado.receitas.length && !estado.carregando) carregarReceitas();
}

document.addEventListener('click', (ev) => {
  const link = ev.target.closest('[data-secao]');
  if (!link) return;
  ev.preventDefault();
  const id = link.dataset.secao;
  if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  mostrarSecao(id, true);
});

window.addEventListener('popstate', () => mostrarSecao(location.hash.slice(1), true));

/* ---------- Listagem (cardápio da API + cadastradas) ---------- */

async function carregarReceitas() {
  estado.carregando = true;
  $('#aviso-lista').textContent = 'Folheando o caderno da Vó...';
  $('#grade-receitas').setAttribute('aria-busy', 'true');
  try {
    const { receitas, falhas } = await carregarCardapio();
    estado.receitas = receitas;
    renderizarLista();
    if (falhas) {
      $('#aviso-lista').replaceChildren(
        'A base de receitas não respondeu para ' + falhas + (falhas === 1 ? ' prato' : ' pratos') + ': eles aparecem só com a tradução. ',
        botao('Tentar de novo', 'botao--texto', () => carregarReceitas()));
    }
  } finally {
    estado.carregando = false;
    $('#grade-receitas').removeAttribute('aria-busy');
  }
}

function todasAsReceitas() {
  return estado.cadastradas.concat(estado.receitas);
}

function montarFiltros() {
  const categorias = [...new Set(todasAsReceitas().map((r) => r.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const opcoes = [['', 'Todas'], ['casa', 'Da tripulação']].concat(categorias.map((c) => [c, c]));
  if (!opcoes.some(([v]) => v === estado.filtro.categoria)) estado.filtro.categoria = '';
  $('#filtros').replaceChildren(...opcoes.map(([valor, nome]) => {
    const b = botao(nome, 'filtro', () => {
      estado.filtro.categoria = valor;
      montarFiltros();
      renderizarLista();
    });
    b.dataset.valor = valor;
    b.setAttribute('aria-pressed', String(valor === estado.filtro.categoria));
    return b;
  }));
}

$('#form-busca').addEventListener('submit', (ev) => {
  ev.preventDefault();
  estado.filtro.busca = $('#campo-busca').value.trim();
  renderizarLista();
});

// a busca olha o nome, o nome original e os ingredientes
function combina(r, termo) {
  if (!termo) return true;
  const textos = [r.nome, r.original && r.original.nome].concat(r.ingredientes.map((i) => i.nome));
  return textos.some((t) => t && chaveBusca(t).includes(termo));
}

function receitasVisiveis() {
  const { categoria, busca } = estado.filtro;
  const termo = chaveBusca(busca);
  return todasAsReceitas().filter((r) => {
    if (categoria === 'casa' && r.fonte !== 'casa') return false;
    if (categoria && categoria !== 'casa' && r.categoria !== categoria) return false;
    return combina(r, termo);
  });
}

const nomesDosJogos = (r) => r.passos.map((p) => JOGOS[p.jogo].nome).join(', ');

function cartaoReceita(r) {
  const resumo = [r.categoria, r.origem].filter(Boolean).join(', ');
  return h('article', 'cartao' + (r.fonte === 'casa' ? ' cartao--casa' : ''),
    h('div', 'cartao__arte', pixelCanvas(r.arte, 192)),
    h('div', 'cartao__corpo',
      r.fonte === 'casa' ? h('p', 'selo', 'Da tripulação') : null,
      h('h3', 'cartao__nome', r.nome),
      h('p', 'cartao__resumo', resumo),
      h('p', 'cartao__detalhe', 'Aula de ' + r.passos.length + ' passos: ' + nomesDosJogos(r) + '.'),
      botao('Ver detalhes', 'botao--linha botao--pequeno', () => abrirReceita(r))));
}

function renderizarLista() {
  montarFiltros();
  const lista = receitasVisiveis();
  $('#grade-receitas').replaceChildren(...lista.map(cartaoReceita));
  const { categoria, busca } = estado.filtro;
  let aviso = lista.length + (lista.length === 1 ? ' receita' : ' receitas');
  if (busca) aviso += ' com "' + busca + '"';
  if (categoria === 'casa') aviso += ' da tripulação';
  else if (categoria) aviso += ' em ' + categoria;
  if (!lista.length) {
    aviso = busca ? 'Nada com "' + busca + '" no caderno.'
      : categoria === 'casa' ? 'Ninguém da tripulação cadastrou receita ainda. Que tal ser a primeira pessoa?' : 'Nenhuma receita por aqui.';
  }
  $('#aviso-lista').textContent = aviso;
}

/* ---------- Detalhe da receita ---------- */

function topoDialogo(titulo, id) {
  const t = h('h2', '', titulo);
  t.id = id;
  const fechar = h('button', 'fechar', '×');
  fechar.type = 'button';
  fechar.setAttribute('aria-label', 'Fechar');
  fechar.dataset.fechar = '';
  return h('div', 'dialogo__topo', t, fechar);
}

function abrirReceita(r) {
  desenharReceita(r, false);
  const dialogo = $('#dialogo-receita');
  if (!dialogo.open) dialogo.showModal();
}

function desenharReceita(r, verOriginal) {
  const dif = dificuldadeDaReceita(r);
  const texto = verOriginal ? r.original : r;

  const fatos = h('dl', 'receita__fatos',
    h('dt', '', 'Categoria'), h('dd', '', r.categoria),
    r.origem ? [h('dt', '', 'Origem'), h('dd', '', r.origem)] : null,
    h('dt', '', 'Dificuldade'), h('dd', '', dif.nome + ' (CD ' + dif.cd + ')'));

  const ingredientes = h('ul', 'receita__ingredientes', ...texto.ingredientes.map((i) =>
    h('li', '', h('span', '', i.nome), i.medida ? h('span', 'medida', i.medida) : null)));

  const aula = h('ol', 'receita__aula', ...r.passos.map((p) =>
    h('li', '', h('strong', '', JOGOS[p.jogo].nome), ' ', p.texto)));

  const links = [];
  if (r.video) { const a = h('a', '', 'Vídeo da receita'); a.href = r.video; a.target = '_blank'; a.rel = 'noopener'; links.push(a); }
  if (r.link) { const a = h('a', '', 'Receita original'); a.href = r.link; a.target = '_blank'; a.rel = 'noopener'; links.push(a); }

  let alternar = null;
  if (r.fonte === 'cardapio') {
    alternar = r.original
      ? botao(verOriginal ? 'Ver tradução' : 'Ver original (inglês)', 'botao--linha botao--pequeno', () => desenharReceita(r, !verOriginal))
      : h('p', 'campo__dica', 'O texto original não carregou: a base de receitas não respondeu.');
  }

  const cozinhar = botao(estado.ficha ? 'Cozinhar com ' + estado.ficha.nome : 'Cozinhar com a Vó', 'botao--principal', () => {
    $('#dialogo-receita').close();
    abrirCozinha(r);
  });
  const dica = estado.ficha ? 'O prato pronto vai para o inventário de ' + estado.ficha.nome + '.'
    : estado.conta ? 'Escolha um personagem na sua conta para guardar o prato.' : 'Entre com a conta do Vortex para guardar o prato no inventário.';

  $('#receita-corpo').replaceChildren(
    topoDialogo(texto.nome, 'receita-titulo'),
    h('div', 'receita',
      h('div', 'receita__lado',
        h('div', 'receita__arte', pixelCanvas(r.arte, 256)),
        fatos,
        h('div', 'receita__acao', cozinhar, h('p', 'campo__dica', dica))),
      h('div', 'receita__texto',
        alternar ? h('div', 'receita__idioma', alternar) : null,
        h('h3', '', 'Ingredientes'), ingredientes,
        h('h3', '', 'Modo de preparo'),
        h('div', 'receita__preparo', ...texto.preparo.map((p) => h('p', '', p))),
        h('h3', '', 'A aula, passo a passo'), aula,
        links.length ? h('p', 'receita__links', ...links) : null)));
}

/* ---------- Cadastro: a receita e a aula ---------- */

function lerCadastradas() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_RECEITAS));
    return Array.isArray(lista) ? lista.map(normalizarCadastrada) : [];
  } catch (e) { return []; }
}

// receitas salvas antes da pixel art e da aula ganham as duas
function normalizarCadastrada(r) {
  return Object.assign({ fonte: 'casa', origem: '', original: null, video: '', link: '' }, r, {
    arte: SPRITES[r.arte] ? r.arte : SPRITE_PADRAO,
    passos: Array.isArray(r.passos) && r.passos.length ? r.passos : sugerirPassos(r.preparo || [], (r.ingredientes || []).map((i) => i.nome))
  });
}

function salvarCadastradas() {
  try { localStorage.setItem(CHAVE_RECEITAS, JSON.stringify(estado.cadastradas)); } catch (e) { /* sem armazenamento */ }
}

function montarCategoriasDoFormulario() {
  const sel = $('#r-categoria');
  sel.replaceChildren(h('option', '', 'Escolha uma categoria'), ...Object.values(CATEGORIAS).map((c) => h('option', '', c)));
  sel.firstChild.value = '';
}

function montarArtes() {
  $('#r-artes').replaceChildren(...Object.keys(SPRITES).map((chave, i) => {
    const radio = h('input');
    radio.type = 'radio';
    radio.name = 'arte';
    radio.value = chave;
    radio.defaultChecked = i === 0;
    return h('label', 'arte', radio, pixelCanvas(chave, 64), h('span', '', SPRITES[chave].nome));
  }));
}

function lerIngredientes(texto) {
  return texto.split('\n').map((linha) => linha.trim()).filter(Boolean).map((linha) => {
    const partes = linha.split(/\s+[-–—]\s+/);
    return { nome: partes[0].trim(), medida: partes.slice(1).join(' - ').trim() };
  });
}

/* o rascunho guarda um "detalhe" de texto por passo; ao salvar ele vira o campo do jogo */
function passoDoRascunho(p) {
  const passo = { jogo: p.jogo, texto: p.texto.trim() };
  const d = p.detalhe.trim();
  if (p.jogo === 'separar' && d) passo.itens = lista(d);
  if (p.jogo === 'cortar' && d) passo.alvo = d;
  if (p.jogo === 'medir' && d) passo.alvo = d;
  if (p.jogo === 'fogo') passo.fogo = FOGOS[d] ? d : 'medio';
  if (p.jogo === 'montar') passo.camadas = lista(d);
  return passo;
}

function rascunhoDoPasso(p) {
  const detalhe = p.jogo === 'fogo' ? (p.fogo || 'medio') : p.itens ? lista(p.itens).join(', ') : p.camadas ? lista(p.camadas).join(', ') : p.alvo || '';
  return { jogo: p.jogo, texto: p.texto || '', detalhe };
}

const PASSOS_INICIAIS = () => [
  { jogo: 'separar', texto: 'Separe os ingredientes.', detalhe: '' },
  { jogo: 'misturar', texto: '', detalhe: '' }
];

function renderizarPassos() {
  const passos = estado.rascunhoPassos;
  $('#r-passos').replaceChildren(...passos.map((p, i) => {
    const jogo = h('select', 'passo__jogo', ...Object.keys(JOGOS).map((k) => {
      const o = h('option', '', JOGOS[k].nome);
      o.value = k;
      o.title = JOGOS[k].faz;
      o.selected = k === p.jogo;
      return o;
    }));
    jogo.setAttribute('aria-label', 'Minigame do passo ' + (i + 1));
    jogo.addEventListener('change', () => { p.jogo = jogo.value; p.detalhe = p.jogo === 'fogo' ? 'medio' : ''; renderizarPassos(); });

    const texto = h('input', 'passo__texto');
    texto.value = p.texto;
    texto.placeholder = 'O que fazer neste passo (ex.: Pique a cebola)';
    texto.maxLength = 120;
    texto.setAttribute('aria-label', 'O que fazer no passo ' + (i + 1));
    texto.addEventListener('input', () => { p.texto = texto.value; });

    let detalhe = null;
    const tipo = JOGOS[p.jogo].detalhe;
    if (tipo === 'fogo') {
      detalhe = h('select', 'passo__detalhe', ...Object.keys(FOGOS).map((k) => {
        const o = h('option', '', FOGOS[k].nome.charAt(0).toUpperCase() + FOGOS[k].nome.slice(1));
        o.value = k;
        o.selected = k === p.detalhe;
        return o;
      }));
      detalhe.setAttribute('aria-label', 'Intensidade do fogo no passo ' + (i + 1));
      detalhe.addEventListener('change', () => { p.detalhe = detalhe.value; });
    } else if (tipo) {
      detalhe = h('input', 'passo__detalhe');
      detalhe.value = p.detalhe;
      detalhe.placeholder = tipo;
      detalhe.setAttribute('aria-label', tipo + ' (passo ' + (i + 1) + ')');
      detalhe.addEventListener('input', () => { p.detalhe = detalhe.value; });
    }

    const mover = (de, para) => { passos.splice(para, 0, passos.splice(de, 1)[0]); renderizarPassos(); };
    const subir = botao('↑', 'botao--icone', () => mover(i, i - 1));
    subir.disabled = i === 0;
    subir.setAttribute('aria-label', 'Subir o passo ' + (i + 1));
    const descer = botao('↓', 'botao--icone', () => mover(i, i + 1));
    descer.disabled = i === passos.length - 1;
    descer.setAttribute('aria-label', 'Descer o passo ' + (i + 1));
    const tirar = botao('×', 'botao--icone', () => { passos.splice(i, 1); renderizarPassos(); });
    tirar.setAttribute('aria-label', 'Tirar o passo ' + (i + 1));

    return h('li', 'passo', h('div', 'passo__campos', jogo, texto, detalhe), h('div', 'passo__botoes', subir, descer, tirar));
  }));
  $('#r-mais-passo').disabled = passos.length >= 8;
}

$('#r-mais-passo').addEventListener('click', () => {
  estado.rascunhoPassos.push({ jogo: 'cortar', texto: '', detalhe: '' });
  renderizarPassos();
  $$('#r-passos .passo__texto').pop().focus();
});

$('#r-sugerir').addEventListener('click', () => {
  const preparo = $('#r-preparo').value.split('\n').map((p) => p.trim()).filter(Boolean);
  if (!preparo.length) {
    $('#erro-passos').textContent = 'Escreva o modo de preparo primeiro: a sugestão sai dos verbos de cada linha.';
    $('#r-preparo').focus();
    return;
  }
  const nomes = lerIngredientes($('#r-ingredientes').value).map((i) => i.nome);
  estado.rascunhoPassos = sugerirPassos(preparo, nomes).map(rascunhoDoPasso);
  $('#erro-passos').textContent = '';
  renderizarPassos();
  avisar('Aula sugerida com ' + estado.rascunhoPassos.length + ' passos. Confira e ajuste o que quiser.');
});

function validarReceita(dados) {
  const erros = {};
  if (dados.nome.length < 3) erros.nome = 'Dê um nome com pelo menos 3 letras.';
  else if (todasAsReceitas().some((r) => chaveBusca(r.nome) === chaveBusca(dados.nome))) erros.nome = 'Já existe uma receita com esse nome no caderno.';
  if (!dados.categoria) erros.categoria = 'Escolha a categoria do prato.';
  if (dados.ingredientes.length < 2) erros.ingredientes = 'Liste pelo menos 2 ingredientes, um por linha.';
  if (dados.preparo.join(' ').length < 30) erros.preparo = 'Explique o preparo com pelo menos 30 caracteres.';
  const passos = dados.passos;
  const semTexto = passos.findIndex((p) => p.texto.length < 3);
  const montarCurto = passos.findIndex((p) => p.jogo === 'montar' && p.camadas.length < 2);
  if (passos.length < 2) erros.passos = 'Monte pelo menos 2 passos na aula.';
  else if (semTexto >= 0) erros.passos = 'Diga o que fazer no passo ' + (semTexto + 1) + '.';
  else if (montarCurto >= 0) erros.passos = 'No passo ' + (montarCurto + 1) + ', liste pelo menos 2 camadas para montar, separadas por vírgula.';
  return erros;
}

function mostrarErros(erros) {
  ['nome', 'categoria', 'ingredientes', 'preparo'].forEach((campo) => {
    $('#erro-' + campo).textContent = erros[campo] || '';
    $('#r-' + campo).setAttribute('aria-invalid', String(Boolean(erros[campo])));
  });
  $('#erro-passos').textContent = erros.passos || '';
}

function mensagemCadastro(texto, tipo, extra) {
  const caixa = $('#mensagem-cadastro');
  caixa.className = 'mensagem mensagem--' + tipo;
  caixa.replaceChildren(...[h('span', '', texto), extra].filter(Boolean));
  caixa.hidden = false;
}

$('#form-receita').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const dados = {
    nome: form.nome.value.replace(/\s+/g, ' ').trim(),
    categoria: form.categoria.value,
    origem: form.origem.value.trim(),
    arte: form.arte.value,
    ingredientes: lerIngredientes(form.ingredientes.value),
    preparo: form.preparo.value.split('\n').map((p) => p.trim()).filter(Boolean),
    passos: estado.rascunhoPassos.map(passoDoRascunho)
  };

  const erros = validarReceita(dados);
  mostrarErros(erros);
  const campos = Object.keys(erros);
  if (campos.length) {
    mensagemCadastro(campos.length === 1 ? 'Falta corrigir 1 campo.' : 'Falta corrigir ' + campos.length + ' campos.', 'erro');
    const primeiro = campos[0] === 'passos' ? $('#r-passos input, #r-passos select') || $('#r-mais-passo') : $('#r-' + campos[0]);
    primeiro.focus();
    return;
  }

  const receita = normalizarCadastrada(Object.assign(dados, { id: 'casa-' + novoUid() }));
  estado.cadastradas.unshift(receita);
  salvarCadastradas();
  renderizarLista();
  renderizarCadastradas();
  form.reset();
  const ver = h('a', '', 'Ver na listagem');
  ver.href = '#receitas';
  ver.dataset.secao = 'receitas';
  mensagemCadastro(receita.nome + ' entrou no caderno, com uma aula de ' + receita.passos.length + ' passos.', 'sucesso', ver);
});

// o erro de um campo some assim que ele é corrigido
$('#form-receita').addEventListener('input', (ev) => {
  const campo = ev.target.id && ev.target.id.replace('r-', '');
  const erro = campo && document.getElementById('erro-' + campo);
  if (erro && erro.textContent) { erro.textContent = ''; ev.target.setAttribute('aria-invalid', 'false'); }
  if (ev.target.closest('#r-passos')) $('#erro-passos').textContent = '';
});

$('#form-receita').addEventListener('reset', () => {
  mostrarErros({});
  $('#mensagem-cadastro').hidden = true;
  estado.rascunhoPassos = PASSOS_INICIAIS();
  renderizarPassos();
});

function renderizarCadastradas() {
  const n = estado.cadastradas.length;
  $('#contagem-casa').textContent = n
    ? (n === 1 ? '1 receita sua está no caderno.' : n + ' receitas suas estão no caderno.')
    : 'Você ainda não cadastrou nenhuma receita.';
  $('#lista-casa').replaceChildren(...estado.cadastradas.map((r) => {
    const abrir = botao(r.nome, 'botao--texto', () => abrirReceita(r));
    const apagar = botao('Apagar', 'botao--texto botao--perigo', () => {
      estado.cadastradas = estado.cadastradas.filter((x) => x.id !== r.id);
      salvarCadastradas();
      renderizarCadastradas();
      renderizarLista();
      avisar(r.nome + ' saiu do caderno.');
    });
    apagar.setAttribute('aria-label', 'Apagar ' + r.nome);
    return h('li', '', pixelCanvas(r.arte, 32), abrir, h('span', 'lista-casa__cat', r.categoria), apagar);
  }));
}

/* ---------- Conta do Vortex, personagem e tema ---------- */

function desenharCozinheiro() {
  const { conta, ficha } = estado;
  $('#cozinheiro-rotulo').textContent = ficha ? 'Cozinhando com' : conta ? conta.nome : 'Conta do Vortex';
  $('#cozinheiro-nome').textContent = ficha ? ficha.nome : conta ? 'Escolher personagem' : 'Entrar';
  const foto = $('#cozinheiro-foto');
  foto.style.backgroundImage = ficha && ficha.foto ? 'url("' + ficha.foto + '")' : '';
  foto.textContent = ficha && !ficha.foto ? ficha.nome.charAt(0).toUpperCase() : '';
}

function textoTeste(f) {
  const of = f.culinaria ? ' + Ofício (' + f.profissao + ') ' + f.oficio : '';
  return 'Teste: 2d6 + Precisão ' + f.precisao + of;
}

function escolherFicha(f) {
  estado.ficha = f;
  try { if (f) localStorage.setItem(CHAVE_FICHA, f.id); else localStorage.removeItem(CHAVE_FICHA); } catch (e) { /* sem armazenamento */ }
  desenharCozinheiro();
  desenharConta();
}

function desenharConta() {
  const { conta } = estado;
  $('#conta-fora').hidden = Boolean(conta);
  $('#conta-dentro').hidden = !conta;
  if (!conta) return;
  $('#conta-nome').textContent = conta.nome;
  $('#conta-codigo').textContent = '(código ' + conta.codigo + ')';

  $('#lista-fichas').replaceChildren(...(conta.fichas.length ? conta.fichas.map((f) => {
    const atual = estado.ficha && estado.ficha.id === f.id;
    const foto = h('span', 'ficha__foto', f.foto ? '' : f.nome.charAt(0).toUpperCase());
    if (f.foto) foto.style.backgroundImage = 'url("' + f.foto + '")';
    const escolher = botao(atual ? 'Na cozinha' : 'Cozinhar com ' + f.nome, atual ? 'botao--linha botao--pequeno' : 'botao--principal botao--pequeno', () => {
      escolherFicha(f);
      $('#dialogo-conta').close();
      avisar(f.nome + ' está na cozinha. ' + (f.culinaria ? 'O Ofício de culinária entra no teste.' : 'Sem Ofício de culinária, vale só a Precisão.'));
      if (estado.cozinha && estado.cozinha.aguardandoFicha) estado.cozinha.aguardandoFicha();
    });
    escolher.disabled = atual;
    return h('li', 'ficha' + (atual ? ' is-atual' : ''),
      foto,
      h('div', 'ficha__texto',
        h('p', 'ficha__nome', f.nome),
        h('p', 'ficha__info', [f.tipo, f.especie, f.itens + (f.itens === 1 ? ' item' : ' itens')].filter(Boolean).join(', ')),
        h('p', 'ficha__teste', textoTeste(f) + (f.profissao && !f.culinaria ? ' (Ofício de ' + f.profissao + ' não conta)' : ''))),
      escolher);
  }) : [h('li', 'vazio', 'Este perfil ainda não tem personagens. Crie um no Vortex e entre de novo.')]));

  desenharTemas();
}

function desenharTemas() {
  const ativo = document.documentElement.dataset.theme || '';
  const liberados = temasLiberados();
  $('#lista-temas').replaceChildren(...liberados.map((t) => {
    const b = botao('', 'tema' + (t.id === ativo ? ' is-ativo' : ''), () => {
      escolherTema(t.id);
      desenharTemas();
      avisar('Tema ' + t.nome + ' ligado aqui e no Vortex.');
    });
    b.dataset.tema = t.id;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(t.id === ativo));
    b.append(h('span', 'tema__amostra'), h('span', 'tema__nome', t.nome), h('span', 'tema__texto', t.texto));
    return b;
  }));
  if (liberados.length === 1) {
    $('#lista-temas').append(h('p', 'campo__dica', 'Os outros temas se desbloqueiam com segredos espalhados pelo Vortex.'));
  }
}

async function entrarNaConta(codigo, silencioso) {
  const aviso = $('#aviso-conta');
  if (!silencioso) aviso.textContent = 'Abrindo o perfil ' + codigo + '...';
  try {
    const conta = await abrirPerfil(codigo);
    estado.conta = conta;
    guardarConta(codigo);
    let salva = '';
    try { salva = localStorage.getItem(CHAVE_FICHA) || ''; } catch (e) { /* sem armazenamento */ }
    estado.ficha = conta.fichas.find((f) => f.id === (estado.ficha ? estado.ficha.id : salva)) || (conta.fichas.length === 1 ? conta.fichas[0] : null);
    aviso.textContent = '';
    desenharCozinheiro();
    desenharConta();
    if (!silencioso) avisar('Você entrou como ' + conta.nome + '.');
  } catch (erro) {
    if (silencioso) return;
    aviso.textContent = erro.message;
  }
}

function sairDaConta() {
  estado.conta = null;
  guardarConta('');
  escolherFicha(null);
  avisar('Você saiu da conta aqui e no Vortex.');
}

$('#form-conta').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const codigo = $('#campo-conta').value.trim();
  if (!/^\d{1,6}$/.test(codigo)) { $('#aviso-conta').textContent = 'O código do perfil tem de 1 a 6 números.'; return; }
  entrarNaConta(codigo, false);
});

$('#sair-conta').addEventListener('click', sairDaConta);
$('#abrir-conta').addEventListener('click', () => { desenharConta(); $('#dialogo-conta').showModal(); });

// o Vortex aberto em outra aba trocou de tema ou de conta: este site acompanha
window.addEventListener('storage', (ev) => {
  if (ev.key === CHAVE_TEMAS_VORTEX) { aplicarTema(); if (estado.conta) desenharTemas(); }
  if (ev.key === CHAVE_PERFIL_VORTEX) {
    const codigo = codigoDaConta();
    if (codigo && (!estado.conta || estado.conta.codigo !== codigo)) entrarNaConta(codigo, true);
    if (!codigo && estado.conta) { estado.conta = null; escolherFicha(null); }
  }
});

/* ---------- Cozinha: um minigame por passo, o teste e o prato ---------- */

function desenharEtapas(receita, atual) {
  const nomes = receita.passos.map((p) => JOGOS[p.jogo].nome).concat('Prato');
  return h('ol', 'etapas', ...nomes.map((nome, i) => {
    const li = h('li', i < atual ? 'is-feita' : i === atual ? 'is-atual' : '', nome);
    if (i === atual) li.setAttribute('aria-current', 'step');
    return li;
  }));
}

async function abrirCozinha(receita) {
  const dialogo = $('#dialogo-cozinha');
  const corpo = $('#cozinha-corpo');
  if (estado.cozinha) estado.cozinha.controle.abort();
  const controle = new AbortController();
  estado.cozinha = { receita, controle, notas: [] };
  dialogo.addEventListener('close', () => controle.abort(), { once: true });

  const area = h('div', 'cozinha__area');
  const etapas = h('div', '');
  corpo.replaceChildren(topoDialogo('Aula: ' + receita.nome, 'cozinha-titulo'), etapas, area);
  if (!dialogo.open) dialogo.showModal();

  for (let i = 0; i < receita.passos.length; i++) {
    const passo = receita.passos[i];
    etapas.replaceChildren(desenharEtapas(receita, i));
    const nota = await JOGOS[passo.jogo].jogar(area, receita, passo, controle.signal);
    if (controle.signal.aborted) return;
    estado.cozinha.notas.push(nota);
  }
  etapas.replaceChildren(desenharEtapas(receita, receita.passos.length));
  telaDoTeste(area, receita);
}

function dadoDesenhado(valor) {
  const d = h('span', 'dado' + (valor === 6 ? ' dado--seis' : valor === 1 ? ' dado--um' : ''), valor);
  d.setAttribute('aria-label', 'dado ' + valor);
  return d;
}

function telaDoTeste(area, receita) {
  const notas = estado.cozinha.notas;
  const media = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length);
  const bonus = bonusDaCozinha(media);
  const dif = dificuldadeDaReceita(receita);
  const f = estado.ficha;

  const resumoJogos = h('ul', 'notas', ...receita.passos.map((p, i) =>
    h('li', '', h('span', '', (i + 1) + '. ' + JOGOS[p.jogo].nome), h('strong', '', notas[i]))));

  const rolar = botao('Rolar o teste de culinária', 'botao--principal botao--grande', () => {
    mostrarResultado(area, receita, testeDeCulinaria(f, bonus), dif, media);
  });

  area.replaceChildren(h('div', 'jogo',
    h('h3', 'jogo__titulo', 'Hora de servir'),
    resumoJogos,
    h('p', 'jogo__instrucao', 'Média da aula: ' + media + '/100, o que dá +' + bonus + ' no teste. '
      + (f ? textoTeste(f) + ' + ' + bonus + ', contra CD ' + dif.cd + ' (' + dif.nome.toLowerCase() + ').'
        : 'Sem personagem, o teste é 2d6 + ' + bonus + ' contra CD ' + dif.cd + '.')),
    h('div', 'jogo__acoes', rolar)));
  rolar.focus();
}

function mostrarResultado(area, receita, teste, dif, media) {
  const partes = [teste.dados[0] + ' + ' + teste.dados[1]];
  if (teste.atributo) partes.push('Precisão ' + teste.atributo);
  if (teste.pericia && !teste.perda) partes.push('Ofício ' + teste.pericia);
  if (teste.critico && teste.atributo) partes.push('crítico +' + teste.atributo);
  if (teste.bonus) partes.push('cozinha +' + teste.bonus);

  const conta = h('div', 'rolagem',
    h('div', 'rolagem__dados', ...teste.dados.map(dadoDesenhado)),
    h('p', 'rolagem__conta', partes.join(' + ') + (teste.pericia && teste.perda ? ' (o 1 anulou o Ofício)' : '')),
    h('p', 'rolagem__total', h('strong', '', teste.total), ' contra CD ' + dif.cd));

  const denovo = botao('Cozinhar de novo', 'botao--linha', () => abrirCozinha(receita));

  if (teste.falhaTotal) {
    area.replaceChildren(h('div', 'jogo',
      h('h3', 'jogo__titulo', 'A panela queimou'), conta,
      h('p', 'jogo__instrucao', 'Dois 1 no teste: falha total. A Vó abre a janela e diz que toda cozinheira já queimou uma panela.'),
      h('div', 'jogo__acoes', denovo)));
    denovo.focus();
    return;
  }

  const q = qualidadeDoPrato(teste, dif.cd);
  const rec = '+' + q.pv + ' PV' + (q.pe ? ', +' + q.pe + ' PE' : '');
  const prato = h('div', 'prato prato--' + chaveBusca(q.raridade),
    pixelCanvas(receita.arte, 96),
    h('div', '',
      h('p', 'prato__raridade', q.raridade === 'Epica' ? 'Épica' : q.raridade),
      h('p', 'prato__nome', q.min < 1 ? receita.nome + ' (passou do ponto)' : receita.nome),
      h('p', 'prato__info', 'Item geral, consumível, 2 porções, carga 0,25. Bônus de recuperação: ' + rec + '.')));

  const acoes = h('div', 'jogo__acoes');
  const retorno = h('p', 'jogo__retorno');
  retorno.setAttribute('aria-live', 'polite');

  function botaoEnviar() {
    const ficha = estado.ficha;
    const enviar = botao('Mandar para o inventário de ' + ficha.nome, 'botao--principal', async () => {
      enviar.disabled = true;
      retorno.textContent = 'Levando o prato até ' + ficha.nome + '...';
      try {
        const item = montarPrato(receita, ficha, teste, dif.cd, q, media);
        const r = await gravarNoInventario(ficha.id, item);
        enviar.remove();
        retorno.textContent = r.empilhou
          ? 'Pronto: agora ' + ficha.nome + ' tem ' + r.quantidade + ' desse prato no inventário.'
          : 'Pronto: o prato está no inventário de ' + ficha.nome + '. Se a ficha estiver aberta no Vortex, recarregue a página dela.';
        avisar(item.name + ' foi para o inventário de ' + ficha.nome + '.');
      } catch (erro) {
        enviar.disabled = false;
        retorno.textContent = erro.message + ' O prato continua aqui: tente de novo.';
      }
    });
    return enviar;
  }

  if (estado.ficha) {
    acoes.append(botaoEnviar(), denovo);
  } else {
    const entrar = botao(estado.conta ? 'Escolher personagem para levar o prato' : 'Entrar na conta para levar o prato', 'botao--principal', () => {
      desenharConta();
      $('#dialogo-conta').showModal();
    });
    estado.cozinha.aguardandoFicha = () => { entrar.replaceWith(botaoEnviar()); };
    acoes.append(entrar, denovo);
  }

  area.replaceChildren(h('div', 'jogo', h('h3', 'jogo__titulo', q.titulo), conta, prato, retorno, acoes));
  acoes.firstChild.focus();
}

/* ---------- Diálogos: fechar pelo × ou clicando fora ---------- */

$$('dialog').forEach((d) => {
  d.addEventListener('click', (ev) => {
    if (ev.target === d || ev.target.closest('[data-fechar]')) d.close();
  });
});

/* ---------- Início ---------- */

function iniciar() {
  aplicarTema();
  estado.cadastradas = lerCadastradas();
  estado.rascunhoPassos = PASSOS_INICIAIS();
  montarCategoriasDoFormulario();
  montarArtes();
  renderizarPassos();
  renderizarCadastradas();
  renderizarLista();
  desenharCozinheiro();
  const codigo = codigoDaConta();
  if (codigo) entrarNaConta(codigo, true);
  mostrarSecao(location.hash.slice(1) || 'inicio', false);
}

iniciar();
