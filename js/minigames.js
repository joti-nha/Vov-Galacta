/* =====================================================================
   MINIGAMES | a aula de culinária em três desafios + o teste do Vortex
   Cada jogo recebe a área onde desenhar, a receita e um AbortSignal
   (fechar a cozinha encerra o jogo) e devolve uma nota de 0 a 100.
   ===================================================================== */

// itens que não estão na receita: aparecem para confundir na despensa
const DESPENSA = {
  api: ['Chocolate', 'Banana', 'Salmon', 'Peanut Butter', 'Coconut Milk', 'Strawberries', 'Basil', 'Mozzarella',
    'Honey', 'Cinnamon', 'Rice', 'Bacon', 'Prawns', 'Lemon', 'Mushrooms', 'Yogurt', 'Ginger', 'Cabbage',
    'Potatoes', 'Pineapple', 'Tofu', 'Paprika', 'Oats', 'Maple Syrup', 'Cucumber', 'Sweetcorn'],
  casa: ['Chocolate', 'Banana', 'Salmão', 'Pasta de amendoim', 'Leite de coco', 'Morango', 'Manjericão', 'Muçarela',
    'Mel', 'Canela', 'Arroz', 'Bacon', 'Camarão', 'Limão', 'Cogumelos', 'Iogurte', 'Gengibre', 'Repolho',
    'Batata', 'Abacaxi', 'Tofu', 'Páprica', 'Aveia', 'Pepino', 'Milho', 'Feijão']
};
const DA_GALAXIA = ['Poeira de cometa', 'Geleia de nebulosa', 'Sal de asteroide', 'Pimenta de Marte', 'Leite de lua', 'Fermento de buraco negro'];

const chaveTexto = (t) => String(t).trim().toLowerCase();

// tela de abertura de cada jogo: lê a instrução e começa quando quiser
function abrirJogo(area, titulo, instrucao, iniciar) {
  return new Promise((resolve) => {
    const comecar = botao('Começar', 'botao--principal', () => iniciar(resolve));
    area.replaceChildren(
      h('div', 'jogo',
        h('h3', 'jogo__titulo', titulo),
        h('p', 'jogo__instrucao', instrucao),
        h('div', 'jogo__acoes', comecar)));
    comecar.focus();
  });
}

// o foco vai para o painel da nota, não para o botão: quem soltar a barra de espaço
// no fim do jogo não aperta "Continuar" sem querer
function fimDeJogo(palco, texto, nota, resolve) {
  const seguir = botao('Continuar', 'botao--principal', () => resolve(nota));
  const fim = h('div', 'jogo__fim',
    h('p', 'jogo__nota', 'Nota ', h('strong', '', nota), ' de 100'),
    h('p', 'jogo__comentario', texto),
    seguir);
  fim.tabIndex = -1;
  palco.append(fim);
  fim.focus();
}

/* ---------- 1. Separar os ingredientes ---------- */

function jogoIngredientes(area, receita, sinal) {
  const certos = embaralhar(receita.ingredientes.map((i) => i.nome)).slice(0, 6);
  const naReceita = new Set(receita.ingredientes.map((i) => chaveTexto(i.nome)));
  const despensa = receita.fonte === 'api' ? DESPENSA.api : DESPENSA.casa;
  const falsos = embaralhar(despensa.filter((n) => !naReceita.has(chaveTexto(n))))
    .slice(0, Math.max(3, 8 - certos.length))
    .concat(embaralhar(DA_GALAXIA).slice(0, 2));
  const opcoes = embaralhar(certos.concat(falsos));
  const TEMPO = 25;

  return abrirJogo(area, 'Separe os ingredientes',
    'A Vó quer a bancada pronta antes de acender o fogo. Toque nos ' + certos.length + ' ingredientes desta receita e deixe o resto na despensa. Você tem ' + TEMPO + ' segundos.',
    (resolve) => {
      const escolhidos = new Set();
      const relogio = h('div', 'relogio', h('div', 'relogio__barra'));
      const barra = relogio.firstChild;
      const grade = h('div', 'despensa');
      const pronto = botao('Pronto, bancada separada', 'botao--principal');
      const palco = h('div', 'jogo', h('h3', 'jogo__titulo', 'Separe os ingredientes'), relogio, grade, h('div', 'jogo__acoes', pronto));
      area.replaceChildren(palco);

      const botoes = opcoes.map((nome) => {
        const b = botao(nome, 'despensa__item', () => {
          if (escolhidos.has(nome)) escolhidos.delete(nome); else escolhidos.add(nome);
          b.setAttribute('aria-pressed', String(escolhidos.has(nome)));
        });
        b.setAttribute('aria-pressed', 'false');
        grade.append(b);
        return b;
      });
      botoes[0].focus();

      const inicio = performance.now();
      let encerrado = false;
      const tique = setInterval(() => {
        const passou = (performance.now() - inicio) / 1000;
        barra.style.width = limitar(100 - (passou / TEMPO) * 100, 0, 100) + '%';
        if (passou >= TEMPO) encerrar();
      }, 100);
      sinal.addEventListener('abort', () => clearInterval(tique), { once: true });

      function encerrar() {
        if (encerrado) return;
        encerrado = true;
        clearInterval(tique);
        const acertos = certos.filter((n) => escolhidos.has(n)).length;
        const erros = [...escolhidos].filter((n) => !certos.includes(n)).length;
        botoes.forEach((b) => {
          const nome = b.textContent;
          b.disabled = true;
          if (certos.includes(nome)) b.classList.add(escolhidos.has(nome) ? 'is-certo' : 'is-faltou');
          else if (escolhidos.has(nome)) b.classList.add('is-errado');
        });
        pronto.remove();
        const nota = limitar(Math.round((acertos / certos.length) * 100 - erros * 20), 0, 100);
        const texto = erros
          ? acertos + ' de ' + certos.length + ' certos, mas ' + erros + (erros === 1 ? ' intruso foi' : ' intrusos foram') + ' parar na bancada.'
          : acertos === certos.length ? 'Bancada perfeita. A Vó nem precisou olhar.' : acertos + ' de ' + certos.length + ' ingredientes separados.';
        fimDeJogo(palco, texto, nota, resolve);
      }
      pronto.addEventListener('click', encerrar);
    });
}

/* ---------- 2. Cortar no ritmo ---------- */

function jogoCorte(area, receita, sinal) {
  const CORTES = 5;
  const alvo = (receita.ingredientes[0] && receita.ingredientes[0].nome) || 'os legumes';

  return abrirJogo(area, 'Corte no ritmo',
    'A faca corre de um lado para o outro. Corte quando ela estiver dentro da faixa clara: no meio vale mais. São ' + CORTES + ' cortes e a faca acelera. Use o botão Cortar ou a barra de espaço.',
    (resolve) => {
      const zona = h('div', 'tabua__zona');
      const faca = h('div', 'tabua__faca');
      const tabua = h('div', 'tabua', zona, faca);
      const placar = h('p', 'jogo__placar', 'Corte 1 de ' + CORTES);
      const retorno = h('p', 'jogo__retorno');
      retorno.setAttribute('aria-live', 'polite');
      const cortar = botao('Cortar', 'botao--principal botao--grande');
      const palco = h('div', 'jogo', h('h3', 'jogo__titulo', 'Corte ' + alvo), placar, tabua, retorno, h('div', 'jogo__acoes', cortar));
      area.replaceChildren(palco);
      cortar.focus();

      const notas = [];
      let pos = 0;
      let sentido = 1;
      let velocidade = 0.55; // larguras da tábua por segundo
      let centro = 0;
      let largura = 0;
      let anterior = performance.now();
      let quadro = 0;
      let ativo = true;

      function novaZona() {
        largura = 0.22 - notas.length * 0.025;
        centro = 0.15 + Math.random() * 0.7;
        zona.style.left = ((centro - largura / 2) * 100) + '%';
        zona.style.width = (largura * 100) + '%';
      }

      function animar(agora) {
        const dt = Math.min(0.05, (agora - anterior) / 1000);
        anterior = agora;
        pos += sentido * velocidade * dt;
        if (pos >= 1) { pos = 1; sentido = -1; }
        if (pos <= 0) { pos = 0; sentido = 1; }
        faca.style.left = (pos * 100) + '%';
        if (ativo) quadro = requestAnimationFrame(animar);
      }

      function cortarAgora() {
        if (!ativo) return;
        const d = Math.abs(pos - centro);
        const meia = largura / 2;
        let nota = 0;
        let texto = 'Errou a faixa';
        if (d <= meia * 0.35) { nota = 100; texto = 'Perfeito!'; }
        else if (d <= meia) { nota = 75; texto = 'Bom corte'; }
        else if (d <= meia + 0.06) { nota = 30; texto = 'Quase'; }
        notas.push(nota);
        retorno.textContent = texto;
        tabua.classList.remove('is-acerto', 'is-erro');
        void tabua.offsetWidth;
        tabua.classList.add(nota >= 75 ? 'is-acerto' : 'is-erro');

        if (notas.length >= CORTES) {
          parar();
          const media = Math.round(notas.reduce((a, b) => a + b, 0) / CORTES);
          const perfeitos = notas.filter((n) => n === 100).length;
          fimDeJogo(palco, perfeitos + (perfeitos === 1 ? ' corte perfeito' : ' cortes perfeitos') + ' em ' + CORTES + '.', media, resolve);
          return;
        }
        velocidade += 0.14;
        placar.textContent = 'Corte ' + (notas.length + 1) + ' de ' + CORTES;
        novaZona();
      }

      function teclado(ev) {
        if (ev.repeat || ev.target.tagName === 'BUTTON') return;
        if (ev.code === 'Space' || ev.key === 'Enter') { ev.preventDefault(); cortarAgora(); }
      }

      function parar() {
        ativo = false;
        cancelAnimationFrame(quadro);
        document.removeEventListener('keydown', teclado);
        cortar.remove();
      }

      cortar.addEventListener('click', cortarAgora);
      document.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      novaZona();
      quadro = requestAnimationFrame(animar);
    });
}

/* ---------- 3. Segurar o fogo no ponto ---------- */

function jogoFogo(area, receita, sinal) {
  const DURACAO = 12;
  const PONTO = [60, 78];

  return abrirJogo(area, 'Segure o fogo no ponto',
    'Segure o botão (ou a barra de espaço) para aumentar o fogo e solte para baixar. Mantenha a panela na faixa "no ponto" pelo máximo de tempo nos ' + DURACAO + ' segundos. Passou de 90, queima.',
    (resolve) => {
      const zona = h('div', 'termometro__zona');
      zona.style.left = PONTO[0] + '%';
      zona.style.width = (PONTO[1] - PONTO[0]) + '%';
      const nivel = h('div', 'termometro__nivel');
      const termometro = h('div', 'termometro', zona, nivel);
      termometro.setAttribute('role', 'meter');
      termometro.setAttribute('aria-valuemin', '0');
      termometro.setAttribute('aria-valuemax', '100');
      termometro.setAttribute('aria-label', 'Temperatura da panela');
      const estadoTexto = h('p', 'jogo__retorno', 'Fogo apagado');
      const relogio = h('div', 'relogio', h('div', 'relogio__barra'));
      const barra = relogio.firstChild;
      const segurar = botao('Segure para aumentar o fogo', 'botao--principal botao--grande');
      const palco = h('div', 'jogo', h('h3', 'jogo__titulo', 'Panela no fogo'), relogio, termometro, estadoTexto, h('div', 'jogo__acoes', segurar));
      area.replaceChildren(palco);
      segurar.focus();

      let temp = 15;
      let vel = 0;
      let segurando = false;
      let noPonto = 0;
      let queimando = 0;
      let passou = 0;
      const inicio = performance.now();
      let anterior = inicio;
      let quadro = 0;
      let ativo = true;

      function animar(agora) {
        const dt = Math.min(0.05, (agora - anterior) / 1000);
        anterior = agora;
        passou = (agora - inicio) / 1000; // o relógio segue o tempo real, mesmo se a tela travar
        vel = segurando ? Math.min(45, vel + 70 * dt) : Math.max(-30, vel - 80 * dt);
        temp = limitar(temp + vel * dt, 0, 100);
        if (temp === 0 || temp === 100) vel = 0;
        if (temp >= PONTO[0] && temp <= PONTO[1]) noPonto += dt;
        if (temp > 90) queimando += dt;

        nivel.style.width = temp + '%';
        termometro.setAttribute('aria-valuenow', String(Math.round(temp)));
        const texto = temp > 90 ? 'Queimando!' : temp > PONTO[1] ? 'Quente demais' : temp >= PONTO[0] ? 'No ponto' : temp > 30 ? 'Esquentando' : 'Fogo baixo';
        if (estadoTexto.textContent !== texto) estadoTexto.textContent = texto;
        termometro.dataset.estado = temp > 90 ? 'queima' : temp >= PONTO[0] && temp <= PONTO[1] ? 'ponto' : '';
        barra.style.width = limitar(100 - (passou / DURACAO) * 100, 0, 100) + '%';

        if (passou >= DURACAO) { terminar(); return; }
        if (ativo) quadro = requestAnimationFrame(animar);
      }

      // 70% do tempo no ponto já vale nota máxima (leva um tempo para esquentar)
      function terminar() {
        parar();
        const nota = limitar(Math.round((noPonto / (DURACAO * 0.7)) * 100 - queimando * 15), 0, 100);
        const texto = queimando > 0.5
          ? 'Ficou ' + queimando.toFixed(1) + ' s queimando. O fundo da panela que o diga.'
          : 'Ficou ' + noPonto.toFixed(1) + ' s no ponto, de ' + DURACAO + ' s.';
        fimDeJogo(palco, texto, nota, resolve);
      }

      const ligar = (ev) => { if (ev) ev.preventDefault(); segurando = true; segurar.classList.add('is-segurando'); };
      const desligar = () => { segurando = false; segurar.classList.remove('is-segurando'); };
      function teclaDesce(ev) { if (ev.code === 'Space' && !ev.repeat) ligar(ev); }
      function teclaSobe(ev) { if (ev.code === 'Space') { ev.preventDefault(); desligar(); } }

      function parar() {
        ativo = false;
        cancelAnimationFrame(quadro);
        document.removeEventListener('keydown', teclaDesce);
        document.removeEventListener('keyup', teclaSobe);
        segurar.remove();
      }

      segurar.addEventListener('pointerdown', ligar);
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((tipo) => segurar.addEventListener(tipo, desligar));
      segurar.addEventListener('contextmenu', (ev) => ev.preventDefault());
      document.addEventListener('keydown', teclaDesce);
      document.addEventListener('keyup', teclaSobe);
      sinal.addEventListener('abort', parar, { once: true });
      quadro = requestAnimationFrame(animar);
    });
}

/* ---------- Teste de culinária (regras do Vortex) ---------- */

// receitas maiores pedem mais: CD 6, 8 ou 10, como as CDs de recuperação do Vortex
function dificuldadeDaReceita(receita) {
  const n = receita.ingredientes.length;
  if (n <= 6) return { cd: 6, nome: 'Fácil' };
  if (n <= 10) return { cd: 8, nome: 'Média' };
  return { cd: 10, nome: 'Difícil' };
}

// a média dos três jogos vira bônus no teste, como o bônus de um equipamento
function bonusDaCozinha(media) {
  if (media >= 90) return 3;
  if (media >= 70) return 2;
  if (media >= 45) return 1;
  return 0;
}

/* 2d6 + Precisão + Ofício (só se o ofício for de culinária) + bônus da cozinha.
   Um 6 soma a Precisão de novo (um crítico por teste); um 1 é perda (anula a perícia);
   um 1 anula um 6; dois 1 são falha total. */
function testeDeCulinaria(ficha, bonus) {
  const dados = [1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)];
  const uns = dados.filter((d) => d === 1).length;
  const seis = dados.filter((d) => d === 6).length;
  const atributo = ficha ? ficha.precisao : 0;
  const pericia = ficha && ficha.culinaria ? ficha.oficio : 0;
  const critico = seis > 0 && uns === 0;
  const perda = uns === 1;
  const total = dados[0] + dados[1] + atributo + (perda ? 0 : pericia) + (critico ? atributo : 0) + bonus;
  return { dados, atributo, pericia, bonus, critico, perda, falhaTotal: uns >= 2, total };
}

// a margem sobre a CD decide a raridade e quanto o prato recupera
const QUALIDADES = [
  { min: 12, raridade: 'Lendária', titulo: 'Prato lendário', pv: 6, pe: 3 },
  { min: 9, raridade: 'Epica', titulo: 'Prato épico', pv: 5, pe: 2 },
  { min: 6, raridade: 'Rara', titulo: 'Prato raro', pv: 4, pe: 1 },
  { min: 3, raridade: 'Incomum', titulo: 'Prato caprichado', pv: 3, pe: 0 },
  { min: 1, raridade: 'Comum', titulo: 'Prato bem feito', pv: 2, pe: 0 },
  { min: -Infinity, raridade: 'Comum', titulo: 'Passou do ponto', pv: 1, pe: 0 }
];

function qualidadeDoPrato(teste, cd) {
  return QUALIDADES.find((q) => teste.total - cd >= q.min);
}

// o item no formato de "Item geral" consumível do Vortex
function montarPrato(receita, ficha, teste, cd, qualidade, media) {
  const rec = '+' + qualidade.pv + ' PV' + (qualidade.pe ? ', +' + qualidade.pe + ' PE' : '');
  const nome = (qualidade.min < 1 ? receita.nome + ' (passou do ponto)' : receita.nome).replace(/\s+/g, ' ').trim().slice(0, 60);
  const hoje = new Date().toLocaleDateString('pt-BR');
  return {
    uid: novoUid(),
    id: '',
    kind: 'item-geral',
    typeId: '',
    typeTitle: '',
    name: nome,
    values: {
      raridade: qualidade.raridade,
      carga: '0.25',
      tipoUso: 'Consumível',
      usos: '2',
      bonusRec: rec,
      efeito: 'Prato de ' + receita.categoria.toLowerCase() + ' da Cozinha da Vó Galacta. Rende 2 porções; comer uma porção recupera ' + rec.replace(/\+/g, '') + '.',
      lore: 'Receita "' + receita.nome + '"' + (receita.origem ? ' (' + receita.origem + ')' : '') + ', preparada por ' + ficha.nome + ' em ' + hoje
        + '. Nota da cozinha: ' + media + '/100. Teste de culinária: ' + teste.total + ' contra CD ' + cd + '.'
    },
    bonus: {},
    slots: { mods: [], props: [], accs: [] },
    thumb: receita.fonte === 'api' && receita.imagem ? receita.imagem + '/preview' : '',
    qty: 1,
    slot: ''
  };
}
