/* =====================================================================
   APP | estado global, navegação SPA, listagem, cadastro, personagem
   e a cozinha (minigames + envio para o inventário do Vortex)
   ===================================================================== */

const CHAVE_RECEITAS = 'vovGalacta.receitas';
const CHAVE_FICHA = 'vovGalacta.ficha';
const LETRAS_INICIAIS = ['c', 'b', 'p'];
const IMAGEM_PADRAO = 'img/prato.svg';

// Estado global: tudo o que a página mostra sai daqui
const estado = {
  secao: 'inicio',
  receitasApi: [],     // o que veio da TheMealDB na última consulta
  cadastradas: [],     // receitas do formulário (salvas no navegador)
  filtro: { categoria: '', busca: '' },
  carregando: false,
  ficha: null,         // personagem do Vortex que está cozinhando
  sessao: null,        // login anônimo no Vortex (vortex-api.js)
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
  if (alvo === 'receitas' && !estado.receitasApi.length && !estado.carregando) carregarReceitas();
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

/* ---------- Listagem (API + cadastradas) ---------- */

function montarFiltros() {
  const caixa = $('#filtros');
  const opcoes = [['', 'Todas'], ['casa', 'Da tripulação']].concat(Object.keys(CATEGORIAS).map((k) => [k, CATEGORIAS[k]]));
  caixa.replaceChildren(...opcoes.map(([valor, nome]) => {
    const b = botao(nome, 'filtro', () => escolherCategoria(valor));
    b.dataset.valor = valor;
    return b;
  }));
  marcarFiltro();
}

function marcarFiltro() {
  $$('#filtros .filtro').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.valor === estado.filtro.categoria)));
}

async function consultar(promessa, aviso) {
  estado.carregando = true;
  $('#aviso-lista').textContent = aviso;
  $('#grade-receitas').setAttribute('aria-busy', 'true');
  try {
    estado.receitasApi = await promessa;
    renderizarLista();
  } catch (erro) {
    estado.receitasApi = [];
    renderizarLista();
    $('#aviso-lista').replaceChildren(erro.message + ' ', botao('Tentar de novo', 'botao--texto', () => carregarReceitas()));
  } finally {
    estado.carregando = false;
    $('#grade-receitas').removeAttribute('aria-busy');
  }
}

function carregarReceitas() {
  const { categoria, busca } = estado.filtro;
  if (busca) return consultar(receitasPorNome(busca), 'Procurando "' + busca + '" no caderno...');
  if (categoria && categoria !== 'casa') return consultar(receitasPorCategoria(categoria), 'Abrindo a página de ' + CATEGORIAS[categoria] + '...');
  if (categoria === 'casa') { estado.receitasApi = []; renderizarLista(); return Promise.resolve(); }
  return consultar(receitasPorLetras(LETRAS_INICIAIS), 'Folheando o caderno da Vó...');
}

function escolherCategoria(valor) {
  estado.filtro.categoria = valor;
  estado.filtro.busca = '';
  $('#campo-busca').value = '';
  marcarFiltro();
  carregarReceitas();
}

$('#form-busca').addEventListener('submit', (ev) => {
  ev.preventDefault();
  estado.filtro.busca = $('#campo-busca').value.trim();
  estado.filtro.categoria = '';
  marcarFiltro();
  carregarReceitas();
});

function receitasVisiveis() {
  const { categoria, busca } = estado.filtro;
  const termo = chaveTexto(busca);
  const daCasa = estado.cadastradas.filter((r) => {
    if (categoria === 'casa' || !categoria) return !termo || chaveTexto(r.nome).includes(termo);
    return r.categoria === CATEGORIAS[categoria];
  });
  return categoria === 'casa' ? daCasa : daCasa.concat(estado.receitasApi);
}

function cartaoReceita(r) {
  const img = h('img', 'cartao__foto');
  img.src = r.imagem ? (r.fonte === 'api' ? r.imagem + '/preview' : r.imagem) : IMAGEM_PADRAO;
  img.alt = '';
  img.loading = 'lazy';
  img.width = 300;
  img.height = 300;
  img.addEventListener('error', () => { img.src = IMAGEM_PADRAO; }, { once: true });

  const resumo = [r.categoria, r.origem].filter(Boolean).join(', ');
  const detalhe = r.completa ? r.ingredientes.length + ' ingredientes' : 'Toque para ver os ingredientes';
  const ver = botao('Ver receita', 'botao--linha botao--pequeno', () => abrirReceita(r));

  return h('article', 'cartao' + (r.fonte === 'casa' ? ' cartao--casa' : ''),
    img,
    h('div', 'cartao__corpo',
      r.fonte === 'casa' ? h('p', 'selo', 'Da tripulação') : null,
      h('h3', 'cartao__nome', r.nome),
      h('p', 'cartao__resumo', resumo),
      h('p', 'cartao__detalhe', detalhe),
      ver));
}

function renderizarLista() {
  const lista = receitasVisiveis();
  const grade = $('#grade-receitas');
  grade.replaceChildren(...lista.map(cartaoReceita));
  const { categoria, busca } = estado.filtro;
  let aviso = lista.length + (lista.length === 1 ? ' receita' : ' receitas');
  if (busca) aviso += ' para "' + busca + '"';
  else if (categoria === 'casa') aviso += ' da tripulação';
  else if (categoria) aviso += ' de ' + CATEGORIAS[categoria];
  if (!lista.length) {
    aviso = busca
      ? 'Nada com "' + busca + '". A base está em inglês: tente "chicken", "cake" ou "soup".'
      : categoria === 'casa' ? 'Ninguém cadastrou receita ainda. Que tal ser a primeira?' : 'Nenhuma receita nesta página.';
  }
  $('#aviso-lista').textContent = aviso;
}

/* ---------- Detalhe da receita ---------- */

async function abrirReceita(r) {
  const dialogo = $('#dialogo-receita');
  const corpo = $('#receita-corpo');
  let receita = r;
  if (!r.completa) {
    corpo.replaceChildren(h('p', 'carregando', 'Abrindo a receita...'));
    if (!dialogo.open) dialogo.showModal();
    try {
      receita = await receitaCompleta(r.idApi);
      const i = estado.receitasApi.findIndex((x) => x.id === r.id);
      if (i >= 0) estado.receitasApi[i] = receita;
    } catch (erro) {
      corpo.replaceChildren(topoDialogo(r.nome, 'receita-titulo'), h('p', 'mensagem mensagem--erro', erro.message));
      return;
    }
  }
  desenharReceita(receita);
  if (!dialogo.open) dialogo.showModal();
}

function topoDialogo(titulo, id) {
  const t = h('h2', '', titulo);
  t.id = id;
  const fechar = h('button', 'fechar', '×');
  fechar.type = 'button';
  fechar.setAttribute('aria-label', 'Fechar');
  fechar.dataset.fechar = '';
  return h('div', 'dialogo__topo', t, fechar);
}

function desenharReceita(r) {
  const dif = dificuldadeDaReceita(r);
  const img = h('img', 'receita__foto');
  img.src = r.imagem || IMAGEM_PADRAO;
  img.alt = 'Foto do prato ' + r.nome;
  img.addEventListener('error', () => { img.src = IMAGEM_PADRAO; }, { once: true });

  const fatos = h('dl', 'receita__fatos',
    h('dt', '', 'Categoria'), h('dd', '', r.categoria),
    r.origem ? [h('dt', '', 'Origem'), h('dd', '', r.origem)] : null,
    h('dt', '', 'Dificuldade'), h('dd', '', dif.nome + ' (CD ' + dif.cd + ')'));

  const ingredientes = h('ul', 'receita__ingredientes', ...r.ingredientes.map((i) =>
    h('li', '', h('span', '', i.nome), i.medida ? h('span', 'medida', i.medida) : null)));

  const preparo = h('div', 'receita__preparo', ...r.preparo.map((p) => h('p', '', p)));
  const links = [];
  if (r.video) { const a = h('a', '', 'Vídeo da receita'); a.href = r.video; a.target = '_blank'; a.rel = 'noopener'; links.push(a); }
  if (r.link) { const a = h('a', '', 'Receita original'); a.href = r.link; a.target = '_blank'; a.rel = 'noopener'; links.push(a); }

  const cozinhar = botao(estado.ficha ? 'Cozinhar com ' + estado.ficha.nome : 'Cozinhar com a Vó', 'botao--principal', () => {
    $('#dialogo-receita').close();
    abrirCozinha(r);
  });

  $('#receita-corpo').replaceChildren(
    topoDialogo(r.nome, 'receita-titulo'),
    h('div', 'receita',
      h('div', 'receita__lado', img, fatos, h('div', 'receita__acao', cozinhar,
        h('p', 'campo__dica', estado.ficha ? 'O prato pronto vai para o inventário de ' + estado.ficha.nome + '.' : 'Escolha um personagem do Vortex para guardar o prato no inventário.'))),
      h('div', 'receita__texto',
        h('h3', '', 'Ingredientes'), ingredientes,
        h('h3', '', 'Modo de preparo'),
        r.fonte === 'api' ? h('p', 'campo__dica', 'Texto original da TheMealDB, em inglês.') : null,
        preparo,
        links.length ? h('p', 'receita__links', ...links) : null)));
}

/* ---------- Cadastro ---------- */

function lerCadastradas() {
  try {
    const lista = JSON.parse(localStorage.getItem(CHAVE_RECEITAS));
    return Array.isArray(lista) ? lista : [];
  } catch (e) { return []; }
}

function salvarCadastradas() {
  try { localStorage.setItem(CHAVE_RECEITAS, JSON.stringify(estado.cadastradas)); } catch (e) { /* sem armazenamento */ }
}

function montarCategoriasDoFormulario() {
  const sel = $('#r-categoria');
  sel.replaceChildren(h('option', '', 'Escolha uma categoria'), ...Object.values(CATEGORIAS).map((c) => h('option', '', c)));
  sel.firstChild.value = '';
}

function lerIngredientes(texto) {
  return texto.split('\n').map((linha) => linha.trim()).filter(Boolean).map((linha) => {
    const partes = linha.split(/\s+[-–—]\s+/);
    return { nome: partes[0].trim(), medida: partes.slice(1).join(' - ').trim() };
  });
}

function validarReceita(dados) {
  const erros = {};
  if (dados.nome.length < 3) erros.nome = 'Dê um nome com pelo menos 3 letras.';
  else if (estado.cadastradas.some((r) => chaveTexto(r.nome) === chaveTexto(dados.nome))) erros.nome = 'Já existe uma receita sua com esse nome.';
  if (!dados.categoria) erros.categoria = 'Escolha a categoria do prato.';
  if (dados.imagem && !/^https?:\/\/\S+$/i.test(dados.imagem)) erros.imagem = 'O link precisa começar com http:// ou https://.';
  if (dados.ingredientes.length < 2) erros.ingredientes = 'Liste pelo menos 2 ingredientes, um por linha.';
  if (dados.preparo.join(' ').length < 30) erros.preparo = 'Explique o preparo com pelo menos 30 caracteres.';
  return erros;
}

function mostrarErros(erros) {
  ['nome', 'categoria', 'imagem', 'ingredientes', 'preparo'].forEach((campo) => {
    const entrada = $('#r-' + campo);
    $('#erro-' + campo).textContent = erros[campo] || '';
    entrada.setAttribute('aria-invalid', String(Boolean(erros[campo])));
  });
}

function mensagemCadastro(texto, tipo, extra) {
  const caixa = $('#mensagem-cadastro');
  caixa.className = 'mensagem mensagem--' + tipo;
  caixa.replaceChildren(h('span', '', texto), extra || null);
  caixa.hidden = false;
}

$('#form-receita').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const form = ev.target;
  const dados = {
    nome: form.nome.value.replace(/\s+/g, ' ').trim(),
    categoria: form.categoria.value,
    origem: form.origem.value.trim(),
    imagem: form.imagem.value.trim(),
    ingredientes: lerIngredientes(form.ingredientes.value),
    preparo: form.preparo.value.split('\n').map((p) => p.trim()).filter(Boolean)
  };

  const erros = validarReceita(dados);
  mostrarErros(erros);
  const campos = Object.keys(erros);
  if (campos.length) {
    mensagemCadastro(campos.length === 1 ? 'Falta corrigir 1 campo.' : 'Falta corrigir ' + campos.length + ' campos.', 'erro');
    $('#r-' + campos[0]).focus();
    return;
  }

  const receita = Object.assign(dados, { id: 'casa-' + novoUid(), fonte: 'casa', completa: true, video: '', link: '' });
  estado.cadastradas.unshift(receita);
  salvarCadastradas();
  renderizarLista();
  renderizarCadastradas();
  form.reset();
  mensagemCadastro(receita.nome + ' entrou no caderno.', 'sucesso',
    h('a', '', 'Ver na listagem'));
  const ver = $('#mensagem-cadastro a');
  ver.href = '#receitas';
  ver.dataset.secao = 'receitas';
});

$('#form-receita').addEventListener('reset', () => {
  mostrarErros({});
  $('#mensagem-cadastro').hidden = true;
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
    return h('li', '', abrir, h('span', 'lista-casa__cat', r.categoria), apagar);
  }));
}

/* ---------- Personagem do Vortex ---------- */

function desenharCozinheiro() {
  const f = estado.ficha;
  $('#cozinheiro-rotulo').textContent = f ? 'Cozinhando com' : 'Quem vai cozinhar?';
  $('#cozinheiro-nome').textContent = f ? f.nome : 'Escolher personagem';
  const foto = $('#cozinheiro-foto');
  foto.style.backgroundImage = f && f.foto ? 'url("' + f.foto + '")' : '';
  foto.textContent = f && !f.foto ? f.nome.charAt(0).toUpperCase() : '';
  $('#sair-personagem').hidden = !f;
}

function guardarFicha() {
  try {
    if (estado.ficha) localStorage.setItem(CHAVE_FICHA, JSON.stringify(estado.ficha));
    else localStorage.removeItem(CHAVE_FICHA);
  } catch (e) { /* sem armazenamento */ }
}

function textoTeste(f) {
  const of = f.culinaria ? ' + Ofício (' + f.profissao + ') ' + f.oficio : '';
  return 'Teste: 2d6 + Precisão ' + f.precisao + of;
}

function mostrarFichas(fichas, vazio) {
  const lista = $('#lista-fichas');
  $('#aviso-personagem').textContent = fichas.length ? '' : vazio;
  lista.replaceChildren(...fichas.map((f) => {
    const foto = h('span', 'ficha__foto', f.foto ? '' : f.nome.charAt(0).toUpperCase());
    if (f.foto) foto.style.backgroundImage = 'url("' + f.foto + '")';
    const escolher = botao('Cozinhar com ' + f.nome, 'botao--principal botao--pequeno', () => {
      estado.ficha = f;
      guardarFicha();
      desenharCozinheiro();
      $('#dialogo-personagem').close();
      avisar(f.nome + ' está na cozinha. ' + (f.culinaria ? 'O Ofício de culinária entra no teste.' : 'Sem Ofício de culinária, vale só a Precisão.'));
      if (estado.cozinha && estado.cozinha.aguardandoFicha) estado.cozinha.aguardandoFicha();
    });
    return h('li', 'ficha' + (estado.ficha && estado.ficha.id === f.id ? ' is-atual' : ''),
      foto,
      h('div', 'ficha__texto',
        h('p', 'ficha__nome', f.nome),
        h('p', 'ficha__info', [f.tipo, f.especie, f.itens + (f.itens === 1 ? ' item' : ' itens')].filter(Boolean).join(', ')),
        h('p', 'ficha__teste', textoTeste(f) + (f.profissao && !f.culinaria ? ' (Ofício de ' + f.profissao + ' não conta)' : ''))),
      escolher);
  }));
}

async function procurarFichas(promessa, aviso, vazio) {
  $('#aviso-personagem').textContent = aviso;
  $('#lista-fichas').replaceChildren();
  try {
    mostrarFichas(await promessa, vazio);
  } catch (erro) {
    $('#aviso-personagem').textContent = erro.message;
  }
}

$('#form-perfil').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const codigo = $('#campo-perfil').value.trim();
  if (!/^\d{1,6}$/.test(codigo)) { $('#aviso-personagem').textContent = 'O código do perfil tem de 1 a 6 números.'; return; }
  procurarFichas(fichasDoPerfil(codigo), 'Abrindo o perfil ' + codigo + '...', 'Esse perfil ainda não tem personagens.');
});

$('#form-nome').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const nome = $('#campo-nome').value.trim();
  if (nome.length < 2) { $('#aviso-personagem').textContent = 'Digite pelo menos 2 letras do nome.'; return; }
  procurarFichas(fichasPeloNome(nome), 'Procurando "' + nome + '" no Vortex...', 'Nenhuma ficha com "' + nome + '".');
});

$('#abrir-personagem').addEventListener('click', () => $('#dialogo-personagem').showModal());

$('#sair-personagem').addEventListener('click', () => {
  estado.ficha = null;
  guardarFicha();
  desenharCozinheiro();
  $('#lista-fichas').replaceChildren();
  avisar('Agora você cozinha sem personagem. O prato não vai para nenhum inventário.');
});

/* ---------- Cozinha: três jogos, o teste e o prato ---------- */

const ETAPAS = ['Ingredientes', 'Corte', 'Fogo', 'Prato'];

function desenharEtapas(atual) {
  return h('ol', 'etapas', ...ETAPAS.map((nome, i) => {
    const li = h('li', i < atual ? 'is-feita' : i === atual ? 'is-atual' : '', nome);
    if (i === atual) li.setAttribute('aria-current', 'step');
    return li;
  }));
}

async function abrirCozinha(receita) {
  const dialogo = $('#dialogo-cozinha');
  const corpo = $('#cozinha-corpo');
  const controle = new AbortController();
  estado.cozinha = { receita, controle, notas: [] };
  dialogo.addEventListener('close', () => controle.abort(), { once: true });

  const area = h('div', 'cozinha__area');
  const etapas = h('div', '');
  corpo.replaceChildren(topoDialogo('Aula: ' + receita.nome, 'cozinha-titulo'), etapas, area);
  if (!dialogo.open) dialogo.showModal();

  const jogos = [jogoIngredientes, jogoCorte, jogoFogo];
  for (let i = 0; i < jogos.length; i++) {
    etapas.replaceChildren(desenharEtapas(i));
    const nota = await jogos[i](area, receita, controle.signal);
    if (controle.signal.aborted) return;
    estado.cozinha.notas.push(nota);
  }
  etapas.replaceChildren(desenharEtapas(3));
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

  const resumoJogos = h('ul', 'notas', ...['Ingredientes', 'Corte', 'Fogo'].map((n, i) =>
    h('li', '', h('span', '', n), h('strong', '', notas[i]))));

  const rolar = botao('Rolar o teste de culinária', 'botao--principal botao--grande', () => {
    const teste = testeDeCulinaria(f, bonus);
    mostrarResultado(area, receita, teste, dif, media);
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
  const f = estado.ficha;
  const partes = [teste.dados[0] + ' + ' + teste.dados[1]];
  if (teste.atributo) partes.push('Precisão ' + teste.atributo);
  if (teste.pericia) partes.push(teste.perda ? 'Ofício anulado pela perda' : 'Ofício ' + teste.pericia);
  if (teste.critico && teste.atributo) partes.push('crítico +' + teste.atributo);
  if (teste.bonus) partes.push('cozinha +' + teste.bonus);

  const conta = h('div', 'rolagem',
    h('div', 'rolagem__dados', ...teste.dados.map(dadoDesenhado)),
    h('p', 'rolagem__conta', partes.join(' + ').replace('+ Ofício anulado', '· Ofício anulado')),
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
    h('p', 'prato__raridade', q.raridade === 'Epica' ? 'Épica' : q.raridade),
    h('p', 'prato__nome', q.min < 1 ? receita.nome + ' (passou do ponto)' : receita.nome),
    h('p', 'prato__info', 'Item geral, consumível, 2 porções, carga 0,25. Bônus de recuperação: ' + rec + '.'));

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

  if (f) {
    acoes.append(botaoEnviar(), denovo);
  } else {
    const escolher = botao('Escolher personagem para levar o prato', 'botao--principal', () => $('#dialogo-personagem').showModal());
    estado.cozinha.aguardandoFicha = () => { escolher.replaceWith(botaoEnviar()); };
    acoes.append(escolher, denovo);
  }

  area.replaceChildren(h('div', 'jogo',
    h('h3', 'jogo__titulo', q.titulo), conta, prato, retorno, acoes));
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
  estado.cadastradas = lerCadastradas();
  try { estado.ficha = JSON.parse(localStorage.getItem(CHAVE_FICHA)) || null; } catch (e) { estado.ficha = null; }
  montarFiltros();
  montarCategoriasDoFormulario();
  renderizarCadastradas();
  desenharCozinheiro();
  mostrarSecao(location.hash.slice(1) || 'inicio', false);
}

iniciar();
