/* =====================================================================
   MINIGAMES | cada passo da receita vira um jogo de mexer nos instrumentos
   Tudo funciona com o dedo ou o mouse (arrastar, girar, inclinar, puxar)
   e também pelo teclado. Todo jogo recebe (área, receita, passo, sinal) e
   devolve uma nota de 0 a 100; o sinal (AbortSignal) encerra o jogo se a
   cozinha fechar. No fim do arquivo: o teste de culinária e o item do prato.
   ===================================================================== */

// itens que não estão na receita: aparecem para confundir na despensa
const DESPENSA = ['Chocolate', 'Banana', 'Salmão', 'Pasta de amendoim', 'Leite de coco', 'Morango', 'Manjericão',
  'Muçarela', 'Mel', 'Canela', 'Arroz', 'Bacon', 'Camarão', 'Limão', 'Cogumelos', 'Iogurte', 'Gengibre', 'Repolho',
  'Batata', 'Abacaxi', 'Tofu', 'Páprica', 'Aveia', 'Pepino', 'Milho', 'Feijão', 'Cebola', 'Açúcar', 'Ovos', 'Leite'];
const DA_GALAXIA = ['Poeira de cometa', 'Geleia de nebulosa', 'Sal de asteroide', 'Pimenta de Marte', 'Leite de lua', 'Fermento de buraco negro'];

const FOGOS = {
  brando: { nome: 'fogo baixo', faixa: [30, 50] },
  medio: { nome: 'fogo médio', faixa: [52, 72] },
  alto: { nome: 'fogo alto', faixa: [70, 90] }
};

// dificuldade de cada passo: muda tempo, faixas e velocidade do jogo, e pesa na nota da aula
const DIFICULDADES = {
  facil: { id: 'facil', nome: 'Fácil', i: 0, peso: 0.85 },
  normal: { id: 'normal', nome: 'Normal', i: 1, peso: 1 },
  dificil: { id: 'dificil', nome: 'Difícil', i: 2, peso: 1.15 }
};
const nivelDo = (passo) => DIFICULDADES[passo.dificuldade] || DIFICULDADES.normal;
// o valor certo para o nível do passo: porNivel(passo, [fácil, normal, difícil])
const porNivel = (passo, valores) => valores[nivelDo(passo).i];
// a nota de um passo difícil vale mais; a de um fácil, menos (no máximo 100)
const notaComPeso = (nota, passo) => Math.min(100, Math.round(nota * nivelDo(passo).peso));
const seloNivel = (passo) => h('span', 'nivel nivel--' + nivelDo(passo).id, nivelDo(passo).nome);

const chaveTexto = (t) => String(t).trim().toLowerCase();
const lista = (v) => (Array.isArray(v) ? v : String(v || '').split(',')).map((x) => String(x).trim()).filter(Boolean);
const tecla = (ev, ...codigos) => codigos.includes(ev.code) || codigos.includes(ev.key);

// de 0 a 3 estrelas pela nota
const estrelasDa = (nota) => (nota >= 90 ? 3 : nota >= 70 ? 2 : nota >= 45 ? 1 : 0);
function estrelas(nota) {
  const n = estrelasDa(nota);
  const caixa = h('span', 'estrelas', ...[0, 1, 2].map((i) => h('span', 'estrela' + (i < n ? ' is-ganha' : ''), '★')));
  caixa.setAttribute('aria-label', n + (n === 1 ? ' estrela' : ' estrelas') + ' de 3');
  return caixa;
}

// tremidinha no celular para acerto e erro (onde o aparelho deixa)
function vibrar(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

// pedacinhos voando (respingo, farelo, faísca) a partir de um ponto do elemento
function particulas(alvo, x, y, cor, quantas) {
  for (let i = 0; i < quantas; i++) {
    const p = h('span', 'particula');
    const ang = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 40;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.background = cor;
    p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    p.style.setProperty('--dy', Math.sin(ang) * dist - 20 + 'px');
    alvo.append(p);
    setTimeout(() => p.remove(), 700);
  }
}

const DICAS = {
  separar: 'Leia o passo com calma: só vai para a bancada o que ele pede.',
  cortar: 'Não precisa correr: leve a faca devagar e solte em cima da marca.',
  misturar: 'Círculos largos e constantes. Mexer rápido demais só respinga.',
  medir: 'Comece a fechar a jarra antes da linha: o leite ainda escorre.',
  fogo: 'A panela demora a responder. Mexa no botão antes de precisar.',
  forno: 'A cor acelera no final. Fique com a pá pronta.',
  montar: 'De baixo para cima, como a receita manda.'
};

// abertura de cada passo: o que a receita pede, como jogar, a dica e o botão de começar
function abrirJogo(area, titulo, passo, comoJogar, iniciar) {
  return new Promise((resolve) => {
    const comecar = botao('Começar', 'botao--principal', () => iniciar(resolve));
    area.replaceChildren(
      h('div', 'jogo jogo--abertura',
        h('div', 'jogo__icone', pixelCanvas(passo.jogo, 64, ICONES_JOGOS)),
        h('h3', 'jogo__titulo', titulo, ' ', seloNivel(passo)),
        h('p', 'jogo__passo', passo.texto),
        h('p', 'jogo__instrucao', comoJogar),
        h('p', 'jogo__dica', h('strong', '', 'Dica da Vó: '), DICAS[passo.jogo]),
        h('div', 'jogo__acoes', comecar)));
    comecar.focus();
  });
}

function palcoDoJogo(area, titulo, passo, ...conteudo) {
  const palco = h('div', 'jogo', h('h3', 'jogo__titulo', titulo, ' ', seloNivel(passo)), h('p', 'jogo__passo', passo.texto), ...conteudo);
  area.replaceChildren(palco);
  return palco;
}

// o foco vai para o painel da nota, não para o botão: quem soltar a barra de espaço
// no fim do jogo não aperta "Continuar" sem querer
function fimDeJogo(palco, texto, nota, resolve) {
  const seguir = botao('Continuar', 'botao--principal', () => resolve(nota));
  const fim = h('div', 'jogo__fim',
    estrelas(nota),
    h('p', 'jogo__nota', 'Nota ', h('strong', '', nota), ' de 100'),
    h('p', 'jogo__comentario', texto),
    seguir);
  fim.tabIndex = -1;
  palco.append(fim);
  fim.focus();
  vibrar(nota >= 70 ? [30, 40, 30] : 60);
}

const retornoVivo = () => { const p = h('p', 'jogo__retorno'); p.setAttribute('aria-live', 'polite'); return p; };

function mostrarRetorno(el, texto, tipo) {
  el.textContent = texto;
  el.className = 'jogo__retorno' + (tipo ? ' is-' + tipo : '');
  void el.offsetWidth;
  el.classList.add('is-novo');
}

function relogio() {
  const r = h('div', 'relogio', h('div', 'relogio__barra'));
  return { el: r, marcar: (fracaoRestante) => { r.firstChild.style.width = limitar(fracaoRestante * 100, 0, 100) + '%'; } };
}

// laço de animação com relógio em tempo real; devolve a função que para
function animar(passo) {
  const inicio = performance.now();
  let anterior = inicio;
  let quadro = 0;
  let ativo = true;
  function tique(agora) {
    const dt = Math.min(0.05, (agora - anterior) / 1000);
    anterior = agora;
    if (passo(dt, (agora - inicio) / 1000) === false) ativo = false;
    if (ativo) quadro = requestAnimationFrame(tique);
  }
  quadro = requestAnimationFrame(tique);
  return () => { ativo = false; cancelAnimationFrame(quadro); };
}

// segurar e arrastar um instrumento (dedo ou mouse); devolve as posições desde o toque
function arrastar(el, { comecar, mover, soltar }) {
  el.style.touchAction = 'none';
  let ativo = false;
  let x0 = 0;
  let y0 = 0;
  el.addEventListener('pointerdown', (ev) => {
    if (ev.button > 0) return;
    ev.preventDefault();
    ativo = true;
    x0 = ev.clientX;
    y0 = ev.clientY;
    el.setPointerCapture(ev.pointerId);
    if (comecar) comecar(ev);
  });
  el.addEventListener('pointermove', (ev) => {
    if (ativo && mover) mover(ev, ev.clientX - x0, ev.clientY - y0);
  });
  const fim = (ev) => {
    if (!ativo) return;
    ativo = false;
    if (soltar) soltar(ev, ev.clientX - x0, ev.clientY - y0);
  };
  el.addEventListener('pointerup', fim);
  el.addEventListener('pointercancel', fim);
}

// a zona (bancada, despensa, prato) que está debaixo do dedo, ignorando o que está sendo arrastado
function zonaSob(x, y, arrastado) {
  const el = document.elementsFromPoint(x, y).find((e) => !arrastado.contains(e) && e.closest('[data-zona]'));
  return el ? el.closest('[data-zona]') : null;
}

/* Um ingrediente que se arrasta para uma zona, ou se toca (teclado e leitor de tela usam o toque). */
function ingredienteArrastavel(chip, { soltar, tocar }) {
  let arrastou = false;
  arrastar(chip, {
    comecar: () => { arrastou = false; },
    mover: (ev, dx, dy) => {
      if (!arrastou && Math.hypot(dx, dy) < 8) return;
      arrastou = true;
      chip.classList.add('is-arrastando');
      chip.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + limitar(dx / 20, -8, 8) + 'deg)';
    },
    soltar: (ev) => {
      chip.classList.remove('is-arrastando');
      chip.style.transform = '';
      if (arrastou) soltar(zonaSob(ev.clientX, ev.clientY, chip));
    }
  });
  chip.addEventListener('click', () => {
    if (arrastou) { arrastou = false; return; }
    tocar();
  });
}

function chipDeIngrediente(nome) {
  return botao('', 'chip-ingrediente', null, iconeIngrediente(nome, 24), h('span', '', nome));
}

/* ---------- Separar: levar os ingredientes do passo para a bancada ---------- */

function jogoSeparar(area, receita, passo, sinal) {
  const certos = (lista(passo.itens).length ? lista(passo.itens) : receita.ingredientes.map((i) => i.nome)).slice(0, 8);
  const naReceita = new Set(receita.ingredientes.map((i) => chaveTexto(i.nome)).concat(certos.map(chaveTexto)));
  const falsos = embaralhar(DESPENSA.filter((n) => !naReceita.has(chaveTexto(n))))
    .slice(0, Math.max(2, 9 - certos.length + porNivel(passo, [-2, 0, 3])))
    .concat(embaralhar(DA_GALAXIA).slice(0, 2));
  const opcoes = embaralhar(certos.concat(falsos));
  const TEMPO = Math.round((18 + certos.length * 2) * porNivel(passo, [1.5, 1, 0.7]));

  return abrirJogo(area, 'Separar', passo,
    'Arraste os ' + certos.length + ' ingredientes deste passo da despensa para a bancada (ou toque neles). Você tem ' + TEMPO + ' segundos.',
    (resolve) => {
      const tempo = relogio();
      const despensa = h('div', 'zona zona--despensa', h('p', 'zona__nome', 'Despensa'), h('div', 'zona__itens'));
      despensa.dataset.zona = 'despensa';
      const bancada = h('div', 'zona zona--bancada', h('p', 'zona__nome', 'Bancada'), h('div', 'zona__itens'));
      bancada.dataset.zona = 'bancada';
      const pronto = botao('Pronto, bancada separada', 'botao--principal');
      const palco = palcoDoJogo(area, 'Separar', passo, tempo.el, h('div', 'zonas', despensa, bancada), h('div', 'jogo__acoes', pronto));
      let encerrado = false;

      const mover = (chip, zona) => {
        if (encerrado || !zona || chip.parentElement === zona.lastChild) return;
        zona.lastChild.append(chip);
        chip.setAttribute('aria-pressed', String(zona === bancada));
        chip.classList.remove('is-caiu');
        void chip.offsetWidth;
        chip.classList.add('is-caiu');
        vibrar(15);
      };
      const chips = opcoes.map((nome) => {
        const chip = chipDeIngrediente(nome);
        chip.dataset.nome = nome;
        chip.setAttribute('aria-pressed', 'false');
        ingredienteArrastavel(chip, {
          soltar: (zona) => mover(chip, zona),
          tocar: () => mover(chip, chip.closest('[data-zona]') === bancada ? despensa : bancada)
        });
        despensa.lastChild.append(chip);
        return chip;
      });
      chips[0].focus();

      const parar = animar((dt, passou) => {
        tempo.marcar(1 - passou / TEMPO);
        if (passou >= TEMPO) { encerrar(); return false; }
        return true;
      });
      sinal.addEventListener('abort', parar, { once: true });

      function encerrar() {
        if (encerrado) return;
        encerrado = true;
        parar();
        const escolhidos = new Set(chips.filter((c) => c.closest('[data-zona]') === bancada).map((c) => c.dataset.nome));
        const acertos = certos.filter((n) => escolhidos.has(n)).length;
        const erros = [...escolhidos].filter((n) => !certos.includes(n)).length;
        chips.forEach((c) => {
          const nome = c.dataset.nome;
          c.disabled = true;
          if (certos.includes(nome)) c.classList.add(escolhidos.has(nome) ? 'is-certo' : 'is-faltou');
          else if (escolhidos.has(nome)) c.classList.add('is-errado');
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

/* ---------- Cortar: segurar a faca, mirar na marca e soltar ---------- */

function jogoCortar(area, receita, passo, sinal) {
  const CORTES = porNivel(passo, [4, 5, 6]);
  const MIRA = porNivel(passo, [1.4, 1, 0.75]); // quanto pode errar a marca
  const PRAZO = porNivel(passo, [3.6, 2.7, 2]); // segundos para cada marca
  const alvo = passo.alvo || (receita.ingredientes[0] && receita.ingredientes[0].nome) || 'os ingredientes';
  const comida = passo.alvo || (receita.ingredientes[0] && receita.ingredientes[0].nome) || alvo; // o ícone sai do nome

  return abrirJogo(area, 'Cortar ' + alvo, passo,
    'Segure a faca, leve até a marca pontilhada e solte para cortar. Cada marca tem pouco tempo e o meio vale mais. São ' + CORTES + ' cortes. No teclado: ← → movem a faca, espaço corta.',
    (resolve) => {
      const marca = h('div', 'tabua__marca');
      const prazo = h('div', 'tabua__prazo', h('div', 'tabua__prazo-barra'));
      const faca = h('div', 'tabua__faca', pixelCanvas('cortar', 72, ICONES_JOGOS));
      const peca = h('div', 'tabua__peca', iconeIngrediente(comida, 120));
      const tabua = h('div', 'tabua', peca, marca, faca, prazo);
      tabua.tabIndex = 0;
      tabua.setAttribute('role', 'slider');
      tabua.setAttribute('aria-label', 'Posição da faca');
      tabua.setAttribute('aria-valuemin', '0');
      tabua.setAttribute('aria-valuemax', '100');
      const placar = h('p', 'jogo__placar', 'Corte 1 de ' + CORTES);
      const retorno = retornoVivo();
      const palco = palcoDoJogo(area, 'Cortar ' + alvo, passo, placar, tabua, retorno);
      tabua.focus();

      const notas = [];
      let x = 0.5;
      let m = 0.5;
      let restante = PRAZO;
      let acabou = false;

      function posicionar() {
        faca.style.left = (x * 100) + '%';
        tabua.setAttribute('aria-valuenow', String(Math.round(x * 100)));
      }
      function novaMarca() {
        // a marca nova nasce longe da faca (algumas tentativas bastam)
        for (let tentativa = 0; tentativa < 8; tentativa++) {
          m = 0.15 + Math.random() * 0.7;
          if (Math.abs(m - x) >= 0.15) break;
        }
        restante = PRAZO - notas.length * 0.1;
        marca.style.left = (m * 100) + '%';
        marca.classList.remove('is-nova');
        void marca.offsetWidth;
        marca.classList.add('is-nova');
        placar.textContent = 'Corte ' + (notas.length + 1) + ' de ' + CORTES;
      }

      function cortar(demorou) {
        if (acabou) return;
        const d = Math.abs(x - m);
        let nota = 0;
        let texto = demorou ? 'Demorou: a marca passou' : 'Longe da marca';
        if (!demorou && d <= 0.012 * MIRA) { nota = 100; texto = 'Perfeito!'; }
        else if (!demorou && d <= 0.035 * MIRA) { nota = 75; texto = 'Bom corte'; }
        else if (!demorou && d <= 0.07 * MIRA) { nota = 30; texto = 'Quase'; }
        notas.push(nota);
        mostrarRetorno(retorno, texto, nota >= 75 ? 'bom' : 'ruim');
        faca.classList.remove('is-cortando');
        void faca.offsetWidth;
        faca.classList.add('is-cortando');
        if (!demorou) {
          const fatia = h('div', 'tabua__fatia');
          fatia.style.left = (x * 100) + '%';
          tabua.append(fatia);
          particulas(tabua, x * tabua.clientWidth, tabua.clientHeight * 0.55, '#f6e7c1', nota >= 75 ? 8 : 3);
        }
        vibrar(nota >= 75 ? 20 : 60);
        if (notas.length >= CORTES) {
          parar();
          const media = Math.round(notas.reduce((a, b) => a + b, 0) / CORTES);
          const perfeitos = notas.filter((n) => n === 100).length;
          fimDeJogo(palco, perfeitos + (perfeitos === 1 ? ' corte perfeito' : ' cortes perfeitos') + ' em ' + CORTES + '.', media, resolve);
          return;
        }
        novaMarca();
      }

      const xNaTabua = (ev) => limitar((ev.clientX - tabua.getBoundingClientRect().left) / tabua.clientWidth, 0.02, 0.98);
      arrastar(tabua, {
        comecar: (ev) => { x = xNaTabua(ev); faca.classList.add('is-segurando'); posicionar(); },
        mover: (ev) => { x = xNaTabua(ev); posicionar(); },
        soltar: () => { faca.classList.remove('is-segurando'); cortar(false); }
      });

      function teclado(ev) {
        if (ev.target !== tabua && ev.target !== document.body) return;
        if (tecla(ev, 'ArrowLeft')) { ev.preventDefault(); x = limitar(x - 0.015, 0.02, 0.98); posicionar(); }
        if (tecla(ev, 'ArrowRight')) { ev.preventDefault(); x = limitar(x + 0.015, 0.02, 0.98); posicionar(); }
        if (!ev.repeat && tecla(ev, 'Space', 'Enter')) { ev.preventDefault(); cortar(false); }
      }

      const pararAnimacao = animar((dt) => {
        restante -= dt;
        prazo.firstChild.style.width = limitar(restante / PRAZO, 0, 1) * 100 + '%';
        if (restante <= 0) cortar(true);
        return true;
      });

      function parar() {
        acabou = true;
        pararAnimacao();
        document.removeEventListener('keydown', teclado);
        prazo.remove();
        marca.remove();
      }

      document.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      posicionar();
      novaMarca();
    });
}

/* ---------- Misturar: girar a colher na tigela ---------- */

function jogoMisturar(area, receita, passo, sinal) {
  const LIMITE = porNivel(passo, [20, 16, 12]);
  const VOLTAS = porNivel(passo, [3, 4, 5]);
  const RAPIDO = porNivel(passo, [16, 13, 10]); // radianos por segundo: acima disso respinga
  const IDEAL = porNivel(passo, [10, 9, 8]); // segundos para terminar sem perder ponto

  return abrirJogo(area, 'Misturar', passo,
    'Segure a colher e gire em volta da tigela, sempre para o mesmo lado. São ' + VOLTAS + ' voltas; girar rápido demais respinga. No teclado, alterne ← e →.',
    (resolve) => {
      const massa = h('div', 'tigela__massa');
      const grumos = h('div', 'tigela__grumos');
      const colher = h('div', 'tigela__colher', instrumento('colher', 80));
      const tigela = h('div', 'tigela', massa, grumos, colher);
      tigela.tabIndex = 0;
      tigela.setAttribute('aria-label', 'Tigela: gire a colher ou use as setas');
      const barra = h('div', 'medidor', h('div', 'medidor__nivel'));
      barra.setAttribute('role', 'progressbar');
      barra.setAttribute('aria-label', 'Ponto da mistura');
      barra.setAttribute('aria-valuemin', '0');
      barra.setAttribute('aria-valuemax', '100');
      const tempo = relogio();
      const retorno = retornoVivo();
      const palco = palcoDoJogo(area, 'Misturar', passo, tempo.el, tigela, barra, retorno);
      tigela.focus();

      let acumulado = 0;
      let sentido = 0;
      let anguloAnterior = null;
      let ultimoMovimento = performance.now();
      let respingos = 0;
      let calmaAte = 0;
      let segundos = 0;
      let acabou = false;
      let ladoTeclado = '';
      let ultimaTecla = 0;

      const progresso = () => Math.min(100, (acumulado / (VOLTAS * Math.PI * 2)) * 100);

      function desenhar(angulo) {
        const p = progresso();
        barra.firstChild.style.width = p + '%';
        barra.setAttribute('aria-valuenow', String(Math.round(p)));
        grumos.style.opacity = String(1 - p / 100);
        massa.style.transform = 'rotate(' + acumulado + 'rad)';
        if (angulo !== undefined) colher.style.transform = 'rotate(' + angulo + 'rad)';
        if (p >= 100) terminar(true);
      }

      function respingar() {
        const agora = performance.now();
        if (agora < calmaAte) return;
        calmaAte = agora + 400;
        respingos++;
        mostrarRetorno(retorno, 'Devagar, está respingando!', 'ruim');
        particulas(tigela, tigela.clientWidth / 2, tigela.clientHeight / 2, '#e8c27a', 10);
        vibrar(50);
      }

      function girar(angulo) {
        if (acabou) return;
        const agora = performance.now();
        if (anguloAnterior !== null) {
          let da = angulo - anguloAnterior;
          if (da > Math.PI) da -= Math.PI * 2;
          if (da < -Math.PI) da += Math.PI * 2;
          const dt = Math.max(0.016, (agora - ultimoMovimento) / 1000);
          if (!sentido && Math.abs(da) > 0.05) sentido = Math.sign(da);
          if (sentido && Math.sign(da) === sentido) {
            const rapido = Math.abs(da) / dt > RAPIDO;
            if (rapido) respingar();
            acumulado += Math.abs(da) * (rapido ? 0.3 : 1);
          } else if (sentido && Math.abs(da) > 0.08) {
            mostrarRetorno(retorno, 'Para o outro lado!', 'ruim');
          }
        }
        anguloAnterior = angulo;
        ultimoMovimento = agora;
        desenhar(angulo);
      }

      const anguloNaTigela = (ev) => {
        const r = tigela.getBoundingClientRect();
        return Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2));
      };
      arrastar(tigela, {
        comecar: (ev) => { anguloAnterior = null; colher.classList.add('is-segurando'); girar(anguloNaTigela(ev)); },
        mover: (ev) => girar(anguloNaTigela(ev)),
        soltar: () => colher.classList.remove('is-segurando')
      });

      // teclado: cada troca de lado vale um quarto de volta
      function teclado(ev) {
        if (ev.repeat || acabou) return;
        const lado = tecla(ev, 'ArrowLeft', 'KeyA') ? 'esq' : tecla(ev, 'ArrowRight', 'KeyD') ? 'dir' : '';
        if (!lado) return;
        ev.preventDefault();
        const agora = performance.now();
        if (lado === ladoTeclado) mostrarRetorno(retorno, 'Para o outro lado!', 'ruim');
        else if (ultimaTecla && agora - ultimaTecla < 110) { respingar(); acumulado += Math.PI / 8; }
        else acumulado += Math.PI / 2;
        ladoTeclado = lado;
        ultimaTecla = agora;
        desenhar(lado === 'esq' ? Math.PI : 0);
      }

      function terminar(lisa) {
        if (acabou) return;
        acabou = true;
        parar();
        const nota = lisa
          ? limitar(Math.round(100 - respingos * 8 - Math.max(0, segundos - IDEAL) * 6), 0, 100)
          : limitar(Math.round(progresso() * 0.6 - respingos * 8), 0, 100);
        const texto = (lisa ? 'Mistura lisa em ' + segundos.toFixed(1) + ' s' : 'O tempo acabou com a mistura empelotada')
          + (respingos ? ', com ' + respingos + (respingos === 1 ? ' respingo.' : ' respingos.') : ', sem um respingo.');
        if (lisa) particulas(tigela, tigela.clientWidth / 2, tigela.clientHeight / 2, '#f6c978', 12);
        fimDeJogo(palco, texto, nota, resolve);
      }

      const pararAnimacao = animar((dt, passou) => {
        segundos = passou;
        tempo.marcar(1 - passou / LIMITE);
        if (passou >= LIMITE) { terminar(false); return false; }
        return true;
      });

      function parar() {
        pararAnimacao();
        document.removeEventListener('keydown', teclado);
      }

      document.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      desenhar(-Math.PI / 2);
    });
}

/* ---------- Medir: inclinar a jarra até a linha ---------- */

function jogoMedir(area, receita, passo, sinal) {
  const RODADAS = porNivel(passo, [2, 2, 3]);
  const FOLGA = porNivel(passo, [1.5, 1, 0.7]); // quanto pode errar a linha
  const VAZAO = porNivel(passo, [40, 55, 70]); // % do copo por segundo com a jarra deitada
  const alvo = passo.alvo || 'o líquido';

  return abrirJogo(area, 'Medir ' + alvo, passo,
    'Segure a jarra e arraste para baixo ou para a esquerda para inclinar: quanto mais inclina, mais rápido sai. Solte para endireitar; ainda escorre um pouco. São ' + RODADAS + ' medidas. No teclado, segure espaço.',
    (resolve) => {
      const linha = h('div', 'copo__linha');
      const nivel = h('div', 'copo__nivel');
      const copo = h('div', 'copo', nivel, linha);
      copo.setAttribute('role', 'meter');
      copo.setAttribute('aria-label', 'Quanto já tem no copo');
      copo.setAttribute('aria-valuemin', '0');
      copo.setAttribute('aria-valuemax', '100');
      copo.setAttribute('aria-valuenow', '0');
      const jato = h('div', 'medir__jato');
      const jarra = h('div', 'medir__jarra', instrumento('jarra', 112));
      jarra.tabIndex = 0;
      jarra.setAttribute('role', 'button');
      jarra.setAttribute('aria-label', 'Jarra: segure e arraste para despejar, ou segure espaço');
      const cena = h('div', 'medir', copo, jato, jarra);
      const placar = h('p', 'jogo__placar');
      const retorno = retornoVivo();
      const palco = palcoDoJogo(area, 'Medir ' + alvo, passo, placar, cena, retorno);
      jarra.focus();

      const notas = [];
      let meta = 0;
      let quanto = 0;
      let inclinacao = 0; // 0 em pé, 1 deitada
      let alvoInclinacao = 0;
      let segurando = false;
      let jaDespejou = false;
      let paradoHa = 0;
      let esperando = false;

      function novaRodada() {
        meta = 40 + Math.random() * 45;
        quanto = 0;
        inclinacao = 0;
        alvoInclinacao = 0;
        jaDespejou = false;
        paradoHa = 0;
        esperando = false;
        linha.style.bottom = meta + '%';
        nivel.style.height = '0%';
        placar.textContent = 'Medida ' + (notas.length + 1) + ' de ' + RODADAS;
        mostrarRetorno(retorno, '');
      }

      function avaliar() {
        esperando = true;
        const d = Math.abs(quanto - meta);
        let nota;
        let texto;
        if (quanto >= 100) { nota = 0; texto = 'Transbordou!'; }
        else if (d <= 2 * FOLGA) { nota = 100; texto = 'Na linha!'; }
        else if (d <= 5 * FOLGA) { nota = 80; texto = 'Quase exato'; }
        else if (d <= 10 * FOLGA) { nota = 50; texto = quanto > meta ? 'Passou um pouco' : 'Faltou um pouco'; }
        else { nota = limitar(Math.round(40 - d * 2), 0, 40); texto = quanto > meta ? 'Passou muito' : 'Faltou muito'; }
        notas.push(nota);
        mostrarRetorno(retorno, texto, nota >= 80 ? 'bom' : 'ruim');
        vibrar(nota >= 80 ? 20 : 60);
        if (notas.length >= RODADAS) {
          parar();
          const media = Math.round(notas.reduce((a, b) => a + b, 0) / RODADAS);
          fimDeJogo(palco, 'Medidas: ' + notas.join(' e ') + '.', media, resolve);
          return;
        }
        setTimeout(() => { if (!sinal.aborted) novaRodada(); }, 1000);
      }

      arrastar(jarra, {
        comecar: () => { if (!esperando) { segurando = true; jarra.classList.add('is-segurando'); } },
        mover: (ev, dx, dy) => { if (segurando) alvoInclinacao = limitar((dy - dx) / 150, 0, 1); },
        soltar: () => { segurando = false; alvoInclinacao = 0; jarra.classList.remove('is-segurando'); }
      });
      function teclaDesce(ev) { if (ev.code === 'Space' && !ev.repeat && !esperando) { ev.preventDefault(); segurando = true; alvoInclinacao = 0.75; } }
      function teclaSobe(ev) { if (ev.code === 'Space') { ev.preventDefault(); segurando = false; alvoInclinacao = 0; } }

      const pararAnimacao = animar((dt) => {
        // a jarra segue a mão com um pouco de atraso e volta sozinha quando solta
        const rapidez = segurando ? 10 : 5;
        inclinacao += (alvoInclinacao - inclinacao) * Math.min(1, rapidez * dt);
        jarra.style.transform = 'rotate(' + (-inclinacao * 95) + 'deg)';
        if (esperando) return true;
        const vazao = VAZAO * Math.pow(Math.max(0, inclinacao - 0.15) / 0.85, 1.3);
        quanto = Math.min(100, quanto + vazao * dt);
        nivel.style.height = quanto + '%';
        jato.style.opacity = vazao > 0.5 ? '1' : '0';
        jato.style.width = (2 + vazao / 8) + 'px';
        copo.setAttribute('aria-valuenow', String(Math.round(quanto)));
        if (vazao > 0.5) jaDespejou = true;
        if (jaDespejou && !segurando && vazao <= 0.5) {
          paradoHa += dt;
          if (paradoHa > 0.35) avaliar();
        }
        if (quanto >= 100) avaliar();
        return true;
      });

      function parar() {
        pararAnimacao();
        document.removeEventListener('keydown', teclaDesce);
        document.removeEventListener('keyup', teclaSobe);
        jato.style.opacity = '0';
      }

      document.addEventListener('keydown', teclaDesce);
      document.addEventListener('keyup', teclaSobe);
      sinal.addEventListener('abort', parar, { once: true });
      novaRodada();
    });
}

/* ---------- Fogo: girar o botão do fogão e segurar a panela na faixa ---------- */

function jogoFogo(area, receita, passo, sinal) {
  const DURACAO = porNivel(passo, [10, 10, 12]);
  const tipo = FOGOS[passo.fogo] || FOGOS.medio;
  const folga = porNivel(passo, [6, 0, -4]); // a faixa abre no fácil e fecha no difícil
  const baixo = tipo.faixa[0] - folga;
  const alto = tipo.faixa[1] + folga;
  const QUEIMA = porNivel(passo, [97, 94, 90]);
  const DEMORA = porNivel(passo, [0.9, 1.2, 1.5]); // quanto a panela demora a seguir o fogo
  const SUSTOS = porNivel(passo, [6, 9, 12]); // tamanho dos imprevistos

  return abrirJogo(area, 'Fogo: ' + tipo.nome, passo,
    'Gire o botão do fogão arrastando em volta dele. A panela demora a responder e às vezes uma corrente de ar mexe na temperatura. Mantenha a faixa de ' + tipo.nome + ' por ' + DURACAO + ' segundos; passou de ' + QUEIMA + ', queima. No teclado: ↑ e ↓.',
    (resolve) => {
      const zona = h('div', 'termometro__zona');
      zona.style.left = baixo + '%';
      zona.style.width = (alto - baixo) + '%';
      const nivel = h('div', 'termometro__nivel');
      const termometro = h('div', 'termometro', zona, nivel);
      termometro.setAttribute('role', 'meter');
      termometro.setAttribute('aria-valuemin', '0');
      termometro.setAttribute('aria-valuemax', '100');
      termometro.setAttribute('aria-label', 'Temperatura da panela');
      termometro.setAttribute('aria-valuenow', '15');
      const chama = h('div', 'fogao__chama', pixelCanvas('fogo', 96, ICONES_JOGOS));
      const fumaca = h('div', 'fogao__fumaca');
      const fogao = h('div', 'fogao', fumaca, h('div', 'fogao__panela', instrumento('panela', 160)), chama);
      const ponteiro = h('div', 'botao-fogao__ponteiro');
      const knob = h('div', 'botao-fogao', ponteiro);
      knob.tabIndex = 0;
      knob.setAttribute('role', 'slider');
      knob.setAttribute('aria-label', 'Botão do fogão');
      knob.setAttribute('aria-valuemin', '0');
      knob.setAttribute('aria-valuemax', '100');
      const estadoTexto = retornoVivo();
      const tempo = relogio();
      const palco = palcoDoJogo(area, 'Fogo: ' + tipo.nome, passo, tempo.el,
        h('div', 'cena-fogo', fogao, h('div', 'cena-fogo__controle', knob, h('p', 'botao-fogao__rotulo', 'Gire o botão'))),
        termometro, estadoTexto);
      knob.focus();

      let fogo = 0; // 0 apagado, 1 no máximo
      let temp = 15;
      let noPonto = 0;
      let queimando = 0;
      let proximoSusto = 2 + Math.random() * 2;

      function desenharBotao() {
        ponteiro.style.transform = 'rotate(' + (-135 + fogo * 270) + 'deg)';
        knob.setAttribute('aria-valuenow', String(Math.round(fogo * 100)));
        chama.style.transform = 'scale(' + (0.15 + fogo * 0.95) + ')';
        chama.style.opacity = fogo < 0.03 ? '0' : '1';
      }

      const anguloNoBotao = (ev) => {
        const r = knob.getBoundingClientRect();
        // 0 grau para cima; o botão vai de -135 (apagado) a +135 (máximo)
        let graus = Math.atan2(ev.clientX - (r.left + r.width / 2), -(ev.clientY - (r.top + r.height / 2))) * 180 / Math.PI;
        if (graus > 135 && fogo < 0.5) graus = -135;
        return limitar(graus, -135, 135);
      };
      arrastar(knob, {
        comecar: (ev) => { knob.classList.add('is-segurando'); fogo = (anguloNoBotao(ev) + 135) / 270; desenharBotao(); },
        mover: (ev) => { fogo = (anguloNoBotao(ev) + 135) / 270; desenharBotao(); },
        soltar: () => knob.classList.remove('is-segurando')
      });
      function teclado(ev) {
        if (tecla(ev, 'ArrowUp', 'ArrowRight')) { ev.preventDefault(); fogo = limitar(fogo + 0.04, 0, 1); desenharBotao(); }
        if (tecla(ev, 'ArrowDown', 'ArrowLeft')) { ev.preventDefault(); fogo = limitar(fogo - 0.04, 0, 1); desenharBotao(); }
      }

      function terminar() {
        parar();
        const nota = limitar(Math.round((noPonto / (DURACAO * 0.6)) * 100 - queimando * 15), 0, 100);
        const texto = queimando > 0.5
          ? 'Ficou ' + queimando.toFixed(1) + ' s queimando. O fundo da panela que o diga.'
          : 'Ficou ' + noPonto.toFixed(1) + ' s no ponto, de ' + DURACAO + ' s.';
        fimDeJogo(palco, texto, nota, resolve);
      }

      const pararAnimacao = animar((dt, passou) => {
        const alvoTemp = 12 + fogo * 88;
        temp += (alvoTemp - temp) * (1 - Math.exp(-dt / DEMORA));
        proximoSusto -= dt;
        if (proximoSusto <= 0) {
          const esfria = Math.random() < 0.6;
          temp = limitar(temp + (esfria ? -1 : 1) * SUSTOS * (0.6 + Math.random() * 0.6), 0, 100);
          mostrarRetorno(estadoTexto, esfria ? 'Uma corrente de ar esfriou a panela!' : 'A gordura esquentou de repente!', 'aviso');
          vibrar(30);
          proximoSusto = 2.5 + Math.random() * 2.5;
        }
        const dentro = temp >= baixo && temp <= alto;
        if (dentro) noPonto += dt;
        if (temp > QUEIMA) queimando += dt;
        nivel.style.width = temp + '%';
        termometro.setAttribute('aria-valuenow', String(Math.round(temp)));
        termometro.dataset.estado = temp > QUEIMA ? 'queima' : dentro ? 'ponto' : '';
        fogao.dataset.estado = termometro.dataset.estado;
        fumaca.style.opacity = temp > QUEIMA ? '1' : '0';
        tempo.marcar(1 - passou / DURACAO);
        if (passou >= DURACAO) { terminar(); return false; }
        return true;
      });

      function parar() {
        pararAnimacao();
        knob.removeEventListener('keydown', teclado);
      }

      knob.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      desenharBotao();
    });
}

/* ---------- Forno: puxar a pá quando dourar ---------- */

function jogoForno(area, receita, passo, sinal) {
  const RODADAS = porNivel(passo, [2, 2, 3]);
  const DOURADO = porNivel(passo, [[0.58, 0.82], [0.62, 0.78], [0.65, 0.75]]);

  return abrirJogo(area, 'Forno', passo,
    'O prato vai escurecendo, cada fornada num ritmo. Quando a cor chegar no dourado, segure a pá e puxe para baixo (ou toque nela, ou aperte espaço). São ' + RODADAS + ' fornadas.',
    (resolve) => {
      const arte = imagemDoPrato(receita, 128);
      const bandeja = h('div', 'forno__bandeja', arte);
      const janela = h('div', 'forno__janela', bandeja);
      const faixa = h('div', 'forno__faixa');
      faixa.style.left = DOURADO[0] * 100 + '%';
      faixa.style.width = (DOURADO[1] - DOURADO[0]) * 100 + '%';
      const ponteiro = h('div', 'forno__ponteiro');
      const escala = h('div', 'forno__escala', faixa, ponteiro);
      const pa = botao('', 'forno__pa', null, instrumento('pa', 96));
      pa.setAttribute('aria-label', 'Pá: puxe para tirar do forno');
      const forno = h('div', 'forno', h('div', 'forno__corpo', h('div', 'forno__luzes', h('i'), h('i'), h('i')), janela), escala, pa);
      const placar = h('p', 'jogo__placar');
      const retorno = retornoVivo();
      const palco = palcoDoJogo(area, 'Forno', passo, placar, forno, retorno);
      pa.focus();

      const notas = [];
      let cor = 0;
      let ritmo = 0;
      let esperando = false;
      let arrastou = false;

      function novaFornada() {
        cor = 0;
        ritmo = porNivel(passo, [0.06, 0.08, 0.11]) + Math.random() * porNivel(passo, [0.05, 0.07, 0.08]);
        esperando = false;
        bandeja.classList.remove('is-fora');
        bandeja.style.transform = '';
        placar.textContent = 'Fornada ' + (notas.length + 1) + ' de ' + RODADAS;
        mostrarRetorno(retorno, '');
      }

      function tirarAgora() {
        if (esperando) return;
        esperando = true;
        bandeja.classList.add('is-fora');
        const centro = (DOURADO[0] + DOURADO[1]) / 2;
        const d = Math.abs(cor - centro);
        let nota;
        let texto;
        if (cor >= 0.98) { nota = 0; texto = 'Carvão.'; }
        else if (d <= 0.03) { nota = 100; texto = 'Dourado perfeito!'; }
        else if (cor >= DOURADO[0] && cor <= DOURADO[1]) { nota = 80; texto = 'Bem dourado'; }
        else if (d <= 0.14) { nota = 45; texto = cor < centro ? 'Um pouco cru' : 'Passou do ponto'; }
        else { nota = 10; texto = cor < centro ? 'Cru' : 'Queimou'; }
        notas.push(nota);
        mostrarRetorno(retorno, texto, nota >= 80 ? 'bom' : 'ruim');
        if (nota >= 80) particulas(janela, janela.clientWidth / 2, janela.clientHeight / 2, '#ffd66e', 10);
        vibrar(nota >= 80 ? 20 : 60);
        if (notas.length >= RODADAS) {
          parar();
          const media = Math.round(notas.reduce((a, b) => a + b, 0) / RODADAS);
          fimDeJogo(palco, 'Fornadas: ' + notas.join(' e ') + '.', media, resolve);
          return;
        }
        setTimeout(() => { if (!sinal.aborted) novaFornada(); }, 1100);
      }

      arrastar(pa, {
        comecar: () => { arrastou = false; pa.classList.add('is-segurando'); },
        mover: (ev, dx, dy) => {
          if (esperando) return;
          const puxao = Math.max(0, dy);
          if (puxao > 6) arrastou = true;
          pa.style.transform = 'translateY(' + Math.min(puxao, 90) + 'px)';
          bandeja.style.transform = 'translateY(' + Math.min(puxao, 90) * 0.5 + 'px)';
          if (puxao > 70) tirarAgora();
        },
        soltar: () => { pa.classList.remove('is-segurando'); pa.style.transform = ''; if (!esperando) bandeja.style.transform = ''; }
      });
      pa.addEventListener('click', () => { if (arrastou) { arrastou = false; return; } tirarAgora(); });

      function teclado(ev) {
        if (ev.repeat || ev.target.tagName === 'BUTTON') return;
        if (tecla(ev, 'Space', 'Enter')) { ev.preventDefault(); tirarAgora(); }
      }

      const pararAnimacao = animar((dt) => {
        if (esperando) return true;
        ritmo += 0.01 * dt; // o forno vai esquentando
        cor = Math.min(1, cor + ritmo * dt);
        ponteiro.style.left = cor * 100 + '%';
        arte.style.filter = 'sepia(' + cor + ') saturate(' + (1 + cor) + ') brightness(' + (1.35 - cor * 0.95) + ')';
        if (cor >= 1) tirarAgora();
        return true;
      });

      function parar() {
        pararAnimacao();
        document.removeEventListener('keydown', teclado);
        pa.disabled = true;
      }

      document.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      novaFornada();
    });
}

/* ---------- Montar: arrastar as camadas para o prato, na ordem ---------- */

function jogoMontar(area, receita, passo, sinal) {
  const camadas = lista(passo.camadas);
  const MULTA = porNivel(passo, [8, 12, 18]);
  // no difícil, duas camadas que não fazem parte do prato aparecem para confundir
  const intrusas = nivelDo(passo).id === 'dificil'
    ? embaralhar(DESPENSA.filter((n) => !camadas.some((c) => chaveTexto(c) === chaveTexto(n)))).slice(0, 2)
    : [];

  return abrirJogo(area, 'Montar', passo,
    'Arraste as camadas para o prato na ordem, de baixo para cima (ou toque nelas). Cada camada fora de ordem custa pontos.',
    (resolve) => {
      const pilha = h('ol', 'pilha');
      pilha.setAttribute('aria-label', 'O que já está no prato');
      const prato = h('div', 'zona zona--prato', pilha, h('div', 'prato-base'));
      prato.dataset.zona = 'prato';
      const pecas = h('div', 'zona zona--pecas', h('p', 'zona__nome', 'Camadas'), h('div', 'zona__itens'));
      pecas.dataset.zona = 'pecas';
      const retorno = retornoVivo();
      const palco = palcoDoJogo(area, 'Montar', passo, h('div', 'montagem', prato, pecas), retorno);
      let feitas = 0;
      let erros = 0;
      let acabou = false;

      function colocar(chip, nome) {
        if (acabou || chip.disabled) return;
        if (chaveTexto(nome) === chaveTexto(camadas[feitas])) {
          chip.disabled = true;
          chip.classList.add('is-usado');
          pilha.append(h('li', 'pilha__camada', iconeIngrediente(nome, 20), h('span', '', nome)));
          feitas++;
          mostrarRetorno(retorno, feitas < camadas.length ? 'Agora: a próxima camada' : '', 'bom');
          vibrar(15);
          if (feitas === camadas.length) {
            acabou = true;
            const nota = limitar(100 - erros * MULTA, 0, 100);
            pecas.remove();
            particulas(prato, prato.clientWidth / 2, 20, '#f6c978', 12);
            fimDeJogo(palco, erros ? 'Montado, com ' + erros + (erros === 1 ? ' troca de ordem.' : ' trocas de ordem.') : 'Montado sem errar uma camada.', nota, resolve);
          }
        } else {
          erros++;
          mostrarRetorno(retorno, 'Ainda não: o que vai agora é outra coisa.', 'ruim');
          chip.classList.remove('is-errado');
          void chip.offsetWidth;
          chip.classList.add('is-errado');
          vibrar(60);
        }
      }

      const chips = embaralhar(camadas.concat(intrusas)).map((nome) => {
        const chip = chipDeIngrediente(nome);
        ingredienteArrastavel(chip, {
          soltar: (zona) => { if (zona === prato) colocar(chip, nome); },
          tocar: () => colocar(chip, nome)
        });
        pecas.lastChild.append(chip);
        return chip;
      });
      chips[0].focus();
      sinal.addEventListener('abort', () => { acabou = true; }, { once: true });
    });
}

/* ---------- Catálogo (usado pela cozinha e pelo cadastro) ---------- */

const JOGOS = {
  separar: { nome: 'Separar', faz: 'Separar ingredientes', descricao: 'Arrastar os ingredientes do passo da despensa para a bancada, contra o relógio.', detalhe: 'Ingredientes deste passo, separados por vírgula (vazio = todos)', jogar: jogoSeparar },
  cortar: { nome: 'Cortar', faz: 'Cortar, picar, fatiar', descricao: 'Segurar a faca, mirar na marca e soltar para cortar antes que ela suma.', detalhe: 'O que vai na tábua (ex.: a cebola)', jogar: jogoCortar },
  misturar: { nome: 'Misturar', faz: 'Bater, mexer, sovar', descricao: 'Girar a colher em volta da tigela, sempre para o mesmo lado, sem respingar.', detalhe: '', jogar: jogoMisturar },
  medir: { nome: 'Medir', faz: 'Despejar na medida', descricao: 'Inclinar a jarra para despejar e endireitar na hora certa para parar na linha.', detalhe: 'O que despejar (ex.: 300 ml de leite)', jogar: jogoMedir },
  fogo: { nome: 'Fogo', faz: 'Ferver, fritar, refogar', descricao: 'Girar o botão do fogão para manter a panela na faixa, com imprevistos no caminho.', detalhe: 'fogo', jogar: jogoFogo },
  forno: { nome: 'Forno', faz: 'Assar, tostar, gratinar', descricao: 'Puxar a pá quando a cor chegar no dourado. Cada fornada tem um ritmo.', detalhe: '', jogar: jogoForno },
  montar: { nome: 'Montar', faz: 'Montar camadas, empratar', descricao: 'Arrastar as camadas para o prato na ordem, de baixo para cima.', detalhe: 'Camadas de baixo para cima, separadas por vírgula', jogar: jogoMontar }
};

const MAX_PASSOS = 12;

// sugestão de aula a partir do modo de preparo (cada frase vira um passo pelo verbo)
const VERBOS = [
  ['cortar', /\b(cort|piqu|pica|fati|rale|ralar|descasq|trinch)/i],
  ['forno', /\b(ass[ae]|forno|tost|gratin)/i],
  ['fogo', /\b(ferv|frit|frig|refog|cozinh|dour|aque[cç]|grelh|sel[ae]|derret)/i],
  ['medir', /\b(me[cç]a|medir|despej|xícara|ml\b|litro|colher(es)? de)/i],
  ['montar', /\b(mont|sirv|empil|recheie|cubra|decore|finalize|arrume)/i],
  ['misturar', /\b(bat[ae]|bater|mistur|mex|sov|amass|incorpor|envolv)/i],
  ['separar', /\b(separ|lave|escolh|reserve os ingred)/i]
];

function sugerirPassos(preparo, ingredientes) {
  const passos = [];
  preparo.forEach((frase) => {
    const achado = VERBOS.find(([, rx]) => rx.test(frase));
    if (!achado) return;
    const jogo = achado[0];
    if (passos.length && passos[passos.length - 1].jogo === jogo) return;
    const passo = { jogo, texto: frase.length > 120 ? frase.slice(0, 117) + '...' : frase, dificuldade: 'normal' };
    if (jogo === 'fogo') passo.fogo = /\b(baixo|brando)\b/i.test(frase) ? 'brando' : /\b(alto|ferv|frit)/i.test(frase) ? 'alto' : 'medio';
    if (jogo === 'montar') passo.camadas = ingredientes.slice(0, 5).join(', ');
    passos.push(passo);
  });
  if (!passos.length || passos[0].jogo !== 'separar') passos.unshift({ jogo: 'separar', texto: 'Separe os ingredientes.', dificuldade: 'normal' });
  return passos.slice(0, MAX_PASSOS);
}

/* ---------- Teste de culinária (regras do Vortex) ---------- */

// receitas maiores pedem mais: CD 6, 8 ou 10, como as CDs de recuperação do Vortex
function dificuldadeDaReceita(receita) {
  const n = receita.ingredientes.length;
  if (n <= 6) return { cd: 6, nome: 'Fácil' };
  if (n <= 10) return { cd: 8, nome: 'Média' };
  return { cd: 10, nome: 'Difícil' };
}

// a média da aula vira bônus no teste, como o bônus de um equipamento
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

// a margem sobre a CD decide a raridade e quanto o prato dá a mais no descanso curto
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

// "+4 PV e +1 PE": os recursos que o prato dá a mais
const recursosDo = (q) => '+' + q.pv + ' PV' + (q.pe ? ' e +' + q.pe + ' PE' : '');

const REGRA_DOS_ALIMENTOS = 'Regra dos alimentos: consuma em um descanso curto; você recupera, de adicional, os recursos especificados.';

/* O item no formato de "Item geral" consumível do Vortex, com a imagem do prato como miniatura.
   Alimento só vale no descanso curto: por isso o "Bônus de recuperação" fica vazio
   (o Vortex usaria esse campo para curar em combate) e os recursos vão no efeito. */
function montarPrato(receita, ficha, teste, cd, qualidade, media, quantidade) {
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
      bonusRec: '',
      efeito: 'Alimento. Consumido num descanso curto, dá ' + recursosDo(qualidade) + ' além do que o descanso recupera. Rende 2 porções.',
      especial: REGRA_DOS_ALIMENTOS,
      lore: 'Receita "' + receita.nome + '"' + (receita.origem ? ' (' + receita.origem + ')' : '') + ', preparada por ' + ficha.nome + ' em ' + hoje
        + ' na Cozinha da Vó Galacta, numa aula de ' + receita.passos.length + ' passos. Nota da cozinha: ' + media + '/100. Teste de culinária: ' + teste.total + ' contra CD ' + cd + '.'
    },
    bonus: {},
    slots: { mods: [], props: [], accs: [] },
    thumb: receita.miniatura || pixelPNG(receita.arte),
    qty: quantidade,
    slot: ''
  };
}
