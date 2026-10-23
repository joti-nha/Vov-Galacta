/* =====================================================================
   APP | estado global, navegação SPA, listagem, cadastro, conta
   e a cozinha (a aula em minigames + envio para o inventário do Vortex)
   ===================================================================== */

const CHAVE_RECEITAS = 'vovGalacta.receitas';
const CHAVE_FICHA = 'vovGalacta.ficha';
const CHAVE_RECORDES = 'vovGalacta.recordes';

// a melhor média de aula em cada receita, guardada neste navegador
function lerRecorde(id) {
  try { return (JSON.parse(localStorage.getItem(CHAVE_RECORDES)) || {})[id] || 0; } catch (e) { return 0; }
}
function guardarRecorde(id, media) {
  try {
    const todos = JSON.parse(localStorage.getItem(CHAVE_RECORDES)) || {};
    todos[id] = media;
    localStorage.setItem(CHAVE_RECORDES, JSON.stringify(todos));
  } catch (e) { /* sem armazenamento */ }
}

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
  fotoRascunho: null,  // a foto escolhida no cadastro: { src, img, doAparelho }
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

// tocar na imagem do card abre os detalhes, como o botão
function fotoQueAbre(r) {
  const b = h('button', 'cartao__arte', imagemDoPrato(r, 192));
  b.type = 'button';
  b.setAttribute('aria-label', 'Ver detalhes de ' + r.nome);
  b.addEventListener('click', () => abrirReceita(r));
  return b;
}

function cartaoReceita(r) {
  const resumo = [r.categoria, r.origem].filter(Boolean).join(', ');
  return h('article', 'cartao' + (r.fonte === 'casa' ? ' cartao--casa' : ''),
    fotoQueAbre(r),
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
    h('li', '', h('span', 'receita__ingrediente', iconeIngrediente(i.nome, 20), i.nome), i.medida ? h('span', 'medida', i.medida) : null)));
  const recorde = lerRecorde(r.id);

  const aula = h('ol', 'receita__aula', ...r.passos.map((p) =>
    h('li', '', h('strong', '', JOGOS[p.jogo].nome), ' ', seloNivel(p), ' ', p.texto)));

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
        h('div', 'receita__arte', imagemDoPrato(r, 256)),
        fatos,
        h('div', 'receita__acao', cozinhar, h('p', 'campo__dica', dica),
          recorde ? h('p', 'recorde', 'Seu recorde: ' + recorde + '/100 ', estrelas(recorde)) : null)),
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

// devolve false se o navegador não tiver mais espaço (fotos ocupam bastante)
function salvarCadastradas() {
  try {
    localStorage.setItem(CHAVE_RECEITAS, JSON.stringify(estado.cadastradas));
    return true;
  } catch (e) {
    return false;
  }
}

function montarCategoriasDoFormulario() {
  const sel = $('#r-categoria');
  sel.replaceChildren(h('option', '', 'Escolha uma categoria'), ...Object.values(CATEGORIAS).map((c) => h('option', '', c)));
  sel.firstChild.value = '';
}

function montarArtes() {
  const opcao = (valor, figura, nome, primeira) => {
    const radio = h('input');
    radio.type = 'radio';
    radio.name = 'arte';
    radio.value = valor;
    radio.defaultChecked = primeira;
    return h('label', 'arte' + (valor === 'foto' ? ' arte--foto' : ''), radio, figura, h('span', '', nome));
  };
  $('#r-artes').replaceChildren(
    opcao('foto', h('span', 'arte__mais', '+'), 'Sua foto', false),
    ...Object.keys(SPRITES).map((chave, i) => opcao(chave, pixelCanvas(chave, 64), SPRITES[chave].nome, i === 0)));
}

/* ---------- Foto própria no cadastro ---------- */

function desenharFotoRascunho() {
  const foto = estado.fotoRascunho;
  const previa = $('#r-foto-previa');
  const pixel = $('#r-foto-pixel').checked;
  const figura = $('.arte--foto .arte__mais, .arte--foto .foto');
  if (!foto) {
    previa.replaceChildren(h('p', 'campo__dica', 'Nenhuma foto escolhida ainda.'));
    figura.replaceWith(h('span', 'arte__mais', '+'));
    return;
  }
  const exemplo = { foto: foto.src, fotoPixel: pixel, arte: SPRITE_PADRAO, nome: 'escolhido' };
  previa.replaceChildren(imagemDoPrato(exemplo, 160));
  figura.replaceWith(imagemDoPrato(exemplo, 64));
}

async function usarFoto(promessa) {
  $('#erro-foto').textContent = '';
  $('#r-foto-previa').replaceChildren(h('p', 'campo__dica', 'Abrindo a foto...'));
  try {
    estado.fotoRascunho = await promessa;
  } catch (erro) {
    $('#erro-foto').textContent = erro.message;
  }
  desenharFotoRascunho();
}

$('#r-artes').addEventListener('change', () => {
  const comFoto = $('#form-receita').arte.value === 'foto';
  $('#r-foto-area').hidden = !comFoto;
  if (comFoto && !estado.fotoRascunho) desenharFotoRascunho();
});

$('#r-foto-arquivo').addEventListener('change', (ev) => {
  const arquivo = ev.target.files[0];
  if (arquivo) usarFoto(lerFotoDoAparelho(arquivo));
  ev.target.value = '';
});

$('#r-foto-usar-link').addEventListener('click', () => {
  const link = $('#r-foto-link').value.trim();
  if (!/^https?:\/\/\S+$/i.test(link)) {
    $('#erro-foto').textContent = 'O link precisa começar com http:// ou https://.';
    $('#r-foto-link').focus();
    return;
  }
  usarFoto(carregarImagem(link).then((img) => ({ src: link, img, doAparelho: false })));
});

$('#r-foto-pixel').addEventListener('change', desenharFotoRascunho);

function lerIngredientes(texto) {
  return texto.split('\n').map((linha) => linha.trim()).filter(Boolean).map((linha) => {
    const partes = linha.split(/\s+[-–—]\s+/);
    return { nome: partes[0].trim(), medida: partes.slice(1).join(' - ').trim() };
  });
}

/* o rascunho guarda um "detalhe" de texto por passo; ao salvar ele vira o campo do jogo */
function passoDoRascunho(p) {
  const passo = { jogo: p.jogo, texto: p.texto.trim(), dificuldade: p.dificuldade };
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
  return { jogo: p.jogo, texto: p.texto || '', detalhe, dificuldade: nivelDo(p).id };
}

const PASSOS_INICIAIS = () => [
  { jogo: 'separar', texto: 'Separe os ingredientes.', detalhe: '', dificuldade: 'normal' }
];

/* ---------- Vitrine de minigames: escolher o jogo, a dificuldade e pôr na aula ---------- */

const nivelNaVitrine = {}; // a dificuldade marcada em cada cartão da vitrine

function escolhaDeNivel(atual, rotulo, aoEscolher) {
  const grupo = h('div', 'niveis');
  grupo.setAttribute('role', 'radiogroup');
  grupo.setAttribute('aria-label', rotulo);
  Object.values(DIFICULDADES).forEach((n) => {
    const b = botao(n.nome, 'nivel-botao nivel--' + n.id, () => {
      grupo.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      aoEscolher(n.id);
    });
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(n.id === atual));
    grupo.append(b);
  });
  return grupo;
}

function montarVitrine() {
  $('#vitrine').replaceChildren(...Object.keys(JOGOS).map((k) => {
    const jogo = JOGOS[k];
    nivelNaVitrine[k] = nivelNaVitrine[k] || 'normal';
    const mais = botao('+', 'botao--principal vitrine__mais', () => adicionarPasso(k, nivelNaVitrine[k]));
    const rotuloMais = () => mais.setAttribute('aria-label', 'Pôr ' + jogo.nome + ' (' + DIFICULDADES[nivelNaVitrine[k]].nome + ') na aula');
    rotuloMais();
    const niveis = escolhaDeNivel(nivelNaVitrine[k], 'Dificuldade de ' + jogo.nome, (n) => { nivelNaVitrine[k] = n; rotuloMais(); });
    const experimentar = botao('Experimentar', 'botao--texto', () => abrirTreino(k, nivelNaVitrine[k]));
    return h('li', 'vitrine__item',
      h('div', 'vitrine__icone', pixelCanvas(k, 48, ICONES_JOGOS)),
      h('div', 'vitrine__texto',
        h('h4', 'vitrine__nome', jogo.nome),
        h('p', 'vitrine__faz', jogo.faz),
        h('p', 'vitrine__descricao', jogo.descricao)),
      niveis,
      h('div', 'vitrine__acoes', experimentar, mais));
  }));
}

function adicionarPasso(jogo, dificuldade) {
  if (estado.rascunhoPassos.length >= MAX_PASSOS) {
    avisar('A aula já tem ' + MAX_PASSOS + ' passos, o máximo. Tire um passo para pôr outro.');
    return;
  }
  estado.rascunhoPassos.push({ jogo, texto: '', detalhe: jogo === 'fogo' ? 'medio' : '', dificuldade });
  $('#erro-passos').textContent = '';
  renderizarPassos();
  $$('#r-passos .passo__texto').pop().focus();
  avisar(JOGOS[jogo].nome + ' (' + DIFICULDADES[dificuldade].nome + ') entrou como passo ' + estado.rascunhoPassos.length + '. Diga o que fazer nele.');
}

function renderizarPassos() {
  const passos = estado.rascunhoPassos;
  $('#contagem-passos').textContent = passos.length
    ? passos.length + (passos.length === 1 ? ' passo' : ' passos') + ' (de 2 a ' + MAX_PASSOS + ')'
    : 'Nenhum passo ainda: toque em + na vitrine.';
  $('#r-passos').replaceChildren(...passos.map((p, i) => {
    const n = i + 1;
    const texto = h('input', 'passo__texto');
    texto.value = p.texto;
    texto.placeholder = 'O que fazer neste passo (ex.: Pique a cebola)';
    texto.maxLength = 120;
    texto.setAttribute('aria-label', 'O que fazer no passo ' + n + ' (' + JOGOS[p.jogo].nome + ')');
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
      detalhe.setAttribute('aria-label', 'Intensidade do fogo no passo ' + n);
      detalhe.addEventListener('change', () => { p.detalhe = detalhe.value; });
    } else if (tipo) {
      detalhe = h('input', 'passo__detalhe');
      detalhe.value = p.detalhe;
      detalhe.placeholder = tipo;
      detalhe.setAttribute('aria-label', tipo + ' (passo ' + n + ')');
      detalhe.addEventListener('input', () => { p.detalhe = detalhe.value; });
    }

    const nivel = escolhaDeNivel(p.dificuldade, 'Dificuldade do passo ' + n, (d) => { p.dificuldade = d; });

    const mover = (de, para) => { passos.splice(para, 0, passos.splice(de, 1)[0]); renderizarPassos(); };
    const subir = botao('↑', 'botao--icone', () => mover(i, i - 1));
    subir.disabled = i === 0;
    subir.setAttribute('aria-label', 'Subir o passo ' + n);
    const descer = botao('↓', 'botao--icone', () => mover(i, i + 1));
    descer.disabled = i === passos.length - 1;
    descer.setAttribute('aria-label', 'Descer o passo ' + n);
    const tirar = botao('×', 'botao--icone', () => { passos.splice(i, 1); renderizarPassos(); });
    tirar.setAttribute('aria-label', 'Tirar o passo ' + n);

    return h('li', 'passo',
      h('div', 'passo__jogo', pixelCanvas(p.jogo, 32, ICONES_JOGOS), h('strong', '', JOGOS[p.jogo].nome)),
      h('div', 'passo__campos', texto, detalhe, nivel),
      h('div', 'passo__botoes', subir, descer, tirar));
  }));
}

$('#r-limpar-aula').addEventListener('click', () => {
  estado.rascunhoPassos = [];
  renderizarPassos();
});

/* Experimentar um jogo da vitrine, sem prato no fim */
async function abrirTreino(jogo, dificuldade) {
  const dialogo = $('#dialogo-cozinha');
  if (estado.cozinha) estado.cozinha.controle.abort();
  const controle = new AbortController();
  estado.cozinha = { controle, notas: [] };
  dialogo.addEventListener('close', () => controle.abort(), { once: true });
  const doFormulario = lerIngredientes($('#r-ingredientes').value);
  const receita = {
    nome: 'Treino',
    arte: SPRITE_PADRAO,
    fonte: 'casa',
    ingredientes: doFormulario.length >= 2 ? doFormulario : [{ nome: 'Farinha de trigo' }, { nome: 'Ovos' }, { nome: 'Leite' }, { nome: 'Manteiga' }]
  };
  const passo = { jogo, dificuldade, texto: 'Treino livre: nada vai para o inventário.', fogo: 'medio', camadas: ['Pão', 'Queijo', 'Tomate', 'Alface', 'Pão'] };
  const area = h('div', 'cozinha__area');
  $('#cozinha-corpo').replaceChildren(topoDialogo('Treino: ' + JOGOS[jogo].nome, 'cozinha-titulo'), area);
  if (!dialogo.open) dialogo.showModal();
  const nota = await JOGOS[jogo].jogar(area, receita, passo, controle.signal);
  if (controle.signal.aborted) return;
  const denovo = botao('Treinar de novo', 'botao--principal', () => abrirTreino(jogo, dificuldade));
  area.replaceChildren(h('div', 'jogo',
    h('h3', 'jogo__titulo', 'Treino de ' + JOGOS[jogo].nome, ' ', seloNivel(passo)),
    h('p', 'jogo__nota', 'Nota ', h('strong', '', nota), ' de 100'),
    h('div', 'jogo__acoes', denovo, botao('Fechar', 'botao--linha', () => dialogo.close()))));
  denovo.focus();
}

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
  if (dados.arte === 'foto' && !estado.fotoRascunho) erros.foto = 'Escolha uma foto do aparelho, cole um link ou escolha um dos desenhos.';
  const passos = dados.passos;
  const semTexto = passos.findIndex((p) => p.texto.length < 3);
  const montarCurto = passos.findIndex((p) => p.jogo === 'montar' && p.camadas.length < 2);
  if (passos.length < 2) erros.passos = 'A aula precisa de pelo menos 2 passos: toque em + num jogo da vitrine.';
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
  $('#erro-foto').textContent = erros.foto || '';
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
    const primeiro = { passos: $('#r-passos input') || $('.vitrine__mais'), foto: $('#r-foto-link') }[campos[0]] || $('#r-' + campos[0]);
    primeiro.focus();
    return;
  }

  if (dados.arte === 'foto') {
    const pixel = $('#r-foto-pixel').checked;
    Object.assign(dados, { foto: estado.fotoRascunho.src, fotoPixel: pixel, miniatura: miniaturaDaFoto(estado.fotoRascunho, pixel) });
  }
  const receita = normalizarCadastrada(Object.assign(dados, { id: 'casa-' + novoUid() }));
  estado.cadastradas.unshift(receita);
  if (!salvarCadastradas()) {
    estado.cadastradas.shift();
    mensagemCadastro('O navegador não tem mais espaço para guardar a receita. Apague uma receita antiga ou use um link no lugar da foto.', 'erro');
    return;
  }
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
  estado.fotoRascunho = null;
  $('#r-foto-area').hidden = true;
  setTimeout(desenharFotoRascunho); // depois do reset, que limpa a caixa de pixel art
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
    return h('li', '', imagemDoPrato(r, 32), abrir, h('span', 'lista-casa__cat', r.categoria), apagar);
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
  // passo difícil vale mais, fácil vale menos (notaComPeso, em minigames.js)
  const media = Math.round(receita.passos.reduce((soma, p, i) => soma + notaComPeso(notas[i], p), 0) / notas.length);
  const bonus = bonusDaCozinha(media);
  const dif = dificuldadeDaReceita(receita);
  const f = estado.ficha;

  const resumoJogos = h('ul', 'notas', ...receita.passos.map((p, i) =>
    h('li', '', h('span', '', (i + 1) + '. ' + JOGOS[p.jogo].nome), seloNivel(p), h('strong', '', notas[i]), estrelas(notas[i]))));

  const rolar = botao('Rolar o teste de culinária', 'botao--principal botao--grande', () => {
    mostrarResultado(area, receita, testeDeCulinaria(f, bonus), dif, media);
  });

  const recorde = lerRecorde(receita.id);
  const novoRecorde = media > recorde;
  if (novoRecorde) guardarRecorde(receita.id, media);

  area.replaceChildren(h('div', 'jogo',
    h('h3', 'jogo__titulo', 'Hora de servir'),
    resumoJogos,
    novoRecorde
      ? h('p', 'recorde recorde--novo', recorde ? 'Novo recorde nesta receita! Antes era ' + recorde + '.' : 'Primeira aula desta receita: ' + media + ' é o seu recorde.')
      : h('p', 'recorde', 'Seu recorde nesta receita: ' + recorde + '.'),
    h('p', 'jogo__instrucao', 'Média da aula, com o peso da dificuldade de cada passo: ' + media + '/100, o que dá +' + bonus + ' no teste. '
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
  const rec = recursosDo(q);
  const prato = h('div', 'prato prato--' + chaveBusca(q.raridade),
    imagemDoPrato(receita, 96),
    h('div', '',
      h('p', 'prato__raridade', q.raridade === 'Epica' ? 'Épica' : q.raridade),
      h('p', 'prato__nome', q.min < 1 ? receita.nome + ' (passou do ponto)' : receita.nome),
      h('p', 'prato__info', 'Alimento: consumido num descanso curto, dá ' + rec + ' além do que o descanso recupera. Item geral consumível, 2 porções, carga 0,25 cada.')));

  // quantos pratos fazer: todos saem com a mesma qualidade e vão juntos para o inventário
  let quantidade = 1;
  const QTD_MAX = 99;
  const valor = h('output', 'quantidade__valor', '1');
  const menos = botao('−', 'botao--icone', () => mudarQuantidade(-1));
  menos.setAttribute('aria-label', 'Um prato a menos');
  const mais = botao('+', 'botao--icone', () => mudarQuantidade(1));
  mais.setAttribute('aria-label', 'Um prato a mais');
  const seletor = h('div', 'quantidade', h('span', 'quantidade__rotulo', 'Quantos pratos?'), menos, valor, mais);
  const textoEnviar = (ficha) => 'Mandar ' + (quantidade === 1 ? 'o prato' : quantidade + ' pratos') + ' para o inventário de ' + ficha.nome;
  function mudarQuantidade(passo) {
    quantidade = limitar(quantidade + passo, 1, QTD_MAX);
    valor.textContent = String(quantidade);
    menos.disabled = quantidade === 1;
    mais.disabled = quantidade === QTD_MAX;
    const enviar = acoes.querySelector('.botao--enviar');
    if (enviar && estado.ficha) enviar.textContent = textoEnviar(estado.ficha);
  }
  menos.disabled = true;

  const acoes = h('div', 'jogo__acoes');
  const retorno = h('p', 'jogo__retorno');
  retorno.setAttribute('aria-live', 'polite');

  function botaoEnviar() {
    const ficha = estado.ficha;
    const enviar = botao(textoEnviar(ficha), 'botao--principal botao--enviar', async () => {
      enviar.disabled = true;
      seletor.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      retorno.textContent = 'Levando ' + (quantidade === 1 ? 'o prato' : 'os ' + quantidade + ' pratos') + ' até ' + ficha.nome + '...';
      try {
        const item = montarPrato(receita, ficha, teste, dif.cd, q, media, quantidade);
        const r = await gravarNoInventario(ficha.id, item);
        enviar.remove();
        seletor.remove();
        retorno.textContent = r.empilhou
          ? 'Pronto: agora ' + ficha.nome + ' tem ' + r.quantidade + ' desse prato no inventário.'
          : 'Pronto: ' + (quantidade === 1 ? 'o prato está' : 'os ' + quantidade + ' pratos estão') + ' no inventário de ' + ficha.nome + '. Se a ficha estiver aberta no Vortex, recarregue a página dela.';
        avisar(quantidade + ' × ' + item.name + ' no inventário de ' + ficha.nome + '.');
      } catch (erro) {
        enviar.disabled = false;
        mudarQuantidade(0);
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

  area.replaceChildren(h('div', 'jogo', h('h3', 'jogo__titulo', q.titulo), conta, prato, seletor, retorno, acoes));
  acoes.firstChild.focus();
}

/* ---------- Diálogos: fechar pelo × ou clicando fora ---------- */

$$('dialog').forEach((d) => {
  d.addEventListener('click', (ev) => {
    if (ev.target === d || ev.target.closest('[data-fechar]')) d.close();
  });
});

/* ---------- Início ---------- */

// ilustrações em pixel art marcadas no HTML: <span data-sprite="sopa" data-mapa="jogos">
function desenharSpritesDaPagina() {
  const mapas = { pratos: SPRITES, jogos: ICONES_JOGOS, ingredientes: INGREDIENTES_ICONES, instrumentos: INSTRUMENTOS };
  $$('[data-sprite]').forEach((el) => {
    const c = pixelCanvas(el.dataset.sprite, Number(el.dataset.tamanho) || 64, mapas[el.dataset.mapa] || SPRITES);
    c.removeAttribute('role');
    c.removeAttribute('aria-label');
    c.setAttribute('aria-hidden', 'true');
    el.replaceChildren(c);
  });
}

function iniciar() {
  aplicarTema();
  desenharSpritesDaPagina();
  estado.cadastradas = lerCadastradas();
  estado.rascunhoPassos = PASSOS_INICIAIS();
  montarCategoriasDoFormulario();
  montarArtes();
  montarVitrine();
  renderizarPassos();
  renderizarCadastradas();
  renderizarLista();
  desenharCozinheiro();
  const codigo = codigoDaConta();
  if (codigo) entrarNaConta(codigo, true);
  mostrarSecao(location.hash.slice(1) || 'inicio', false);
}

iniciar();
