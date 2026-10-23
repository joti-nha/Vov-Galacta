/* =====================================================================
   MINIGAMES | cada passo da receita vira um jogo da ação daquele passo
   Todo jogo recebe (área, receita, passo, sinal) e devolve uma nota de
   0 a 100. O sinal (AbortSignal) encerra o jogo se a cozinha fechar.
   No fim do arquivo: o teste de culinária do Vortex e o item do prato.
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

const chaveTexto = (t) => String(t).trim().toLowerCase();
const lista = (v) => (Array.isArray(v) ? v : String(v || '').split(',')).map((x) => String(x).trim()).filter(Boolean);
const tecla = (ev, ...codigos) => codigos.includes(ev.code) || codigos.includes(ev.key);

// abertura de cada passo: o que a receita pede, como jogar e o botão de começar
function abrirJogo(area, titulo, passo, comoJogar, iniciar) {
  return new Promise((resolve) => {
    const comecar = botao('Começar', 'botao--principal', () => iniciar(resolve));
    area.replaceChildren(
      h('div', 'jogo',
        h('h3', 'jogo__titulo', titulo),
        h('p', 'jogo__passo', passo.texto),
        h('p', 'jogo__instrucao', comoJogar),
        h('div', 'jogo__acoes', comecar)));
    comecar.focus();
  });
}

function palcoDoJogo(area, titulo, passo, ...conteudo) {
  const palco = h('div', 'jogo', h('h3', 'jogo__titulo', titulo), h('p', 'jogo__passo', passo.texto), ...conteudo);
  area.replaceChildren(palco);
  return palco;
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

const retornoVivo = () => { const p = h('p', 'jogo__retorno'); p.setAttribute('aria-live', 'polite'); return p; };

function relogio() {
  const r = h('div', 'relogio', h('div', 'relogio__barra'));
  return { el: r, marcar: (fracaoRestante) => { r.firstChild.style.width = limitar(fracaoRestante * 100, 0, 100) + '%'; } };
}

// botão de segurar (mouse, toque ou barra de espaço)
function segurarCom(alvo, aoMudar) {
  const ligar = (ev) => { if (ev) ev.preventDefault(); alvo.classList.add('is-segurando'); aoMudar(true); };
  const desligar = () => { alvo.classList.remove('is-segurando'); aoMudar(false); };
  const desce = (ev) => { if (ev.code === 'Space' && !ev.repeat) ligar(ev); };
  const sobe = (ev) => { if (ev.code === 'Space') { ev.preventDefault(); desligar(); } };
  alvo.addEventListener('pointerdown', ligar);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => alvo.addEventListener(t, desligar));
  alvo.addEventListener('contextmenu', (ev) => ev.preventDefault());
  document.addEventListener('keydown', desce);
  document.addEventListener('keyup', sobe);
  return () => { document.removeEventListener('keydown', desce); document.removeEventListener('keyup', sobe); };
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

/* ---------- Separar: tocar nos ingredientes do passo ---------- */

function jogoSeparar(area, receita, passo, sinal) {
  const certos = (lista(passo.itens).length ? lista(passo.itens) : receita.ingredientes.map((i) => i.nome)).slice(0, 8);
  const naReceita = new Set(receita.ingredientes.map((i) => chaveTexto(i.nome)).concat(certos.map(chaveTexto)));
  const falsos = embaralhar(DESPENSA.filter((n) => !naReceita.has(chaveTexto(n))))
    .slice(0, Math.max(3, 9 - certos.length))
    .concat(embaralhar(DA_GALAXIA).slice(0, 2));
  const opcoes = embaralhar(certos.concat(falsos));
  const TEMPO = 18 + certos.length * 2;

  return abrirJogo(area, 'Separar', passo,
    'Toque nos ' + certos.length + ' ingredientes deste passo e deixe o resto na despensa. Você tem ' + TEMPO + ' segundos.',
    (resolve) => {
      const escolhidos = new Set();
      const tempo = relogio();
      const grade = h('div', 'despensa');
      const pronto = botao('Pronto, bancada separada', 'botao--principal');
      const palco = palcoDoJogo(area, 'Separar', passo, tempo.el, grade, h('div', 'jogo__acoes', pronto));

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

      let encerrado = false;
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

/* ---------- Cortar: acertar a faca na faixa ---------- */

function jogoCortar(area, receita, passo, sinal) {
  const CORTES = 5;
  const alvo = passo.alvo || (receita.ingredientes[0] && receita.ingredientes[0].nome) || 'os ingredientes';

  return abrirJogo(area, 'Cortar ' + alvo, passo,
    'A faca corre de um lado para o outro. Corte quando ela estiver na faixa clara: no meio vale mais. São ' + CORTES + ' cortes e a faca acelera. Use o botão Cortar ou a barra de espaço.',
    (resolve) => {
      const zona = h('div', 'tabua__zona');
      const faca = h('div', 'tabua__faca');
      const tabua = h('div', 'tabua', zona, faca);
      const placar = h('p', 'jogo__placar', 'Corte 1 de ' + CORTES);
      const retorno = retornoVivo();
      const cortar = botao('Cortar', 'botao--principal botao--grande');
      const palco = palcoDoJogo(area, 'Cortar ' + alvo, passo, placar, tabua, retorno, h('div', 'jogo__acoes', cortar));
      cortar.focus();

      const notas = [];
      let pos = 0;
      let sentido = 1;
      let velocidade = 0.55;
      let centro = 0;
      let largura = 0;

      function novaZona() {
        largura = 0.22 - notas.length * 0.025;
        centro = 0.15 + Math.random() * 0.7;
        zona.style.left = ((centro - largura / 2) * 100) + '%';
        zona.style.width = (largura * 100) + '%';
      }

      const pararAnimacao = animar((dt) => {
        pos += sentido * velocidade * dt;
        if (pos >= 1) { pos = 1; sentido = -1; }
        if (pos <= 0) { pos = 0; sentido = 1; }
        faca.style.left = (pos * 100) + '%';
        return true;
      });

      function cortarAgora() {
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
        if (tecla(ev, 'Space', 'Enter')) { ev.preventDefault(); cortarAgora(); }
      }

      function parar() {
        pararAnimacao();
        document.removeEventListener('keydown', teclado);
        cortar.remove();
      }

      cortar.addEventListener('click', cortarAgora);
      document.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      novaZona();
    });
}

/* ---------- Misturar: colher para um lado e para o outro, no ritmo ---------- */

function jogoMisturar(area, receita, passo, sinal) {
  const LIMITE = 15;

  return abrirJogo(area, 'Misturar', passo,
    'Mexa alternando os lados: ← e → no teclado (ou os dois botões). Repetir o mesmo lado ou mexer rápido demais respinga. Deixe a mistura lisa antes de ' + LIMITE + ' segundos.',
    (resolve) => {
      const colher = h('div', 'tigela__colher');
      const grumos = h('div', 'tigela__grumos');
      const tigela = h('div', 'tigela', grumos, colher);
      const barra = h('div', 'medidor', h('div', 'medidor__nivel'));
      barra.setAttribute('role', 'progressbar');
      barra.setAttribute('aria-label', 'Ponto da mistura');
      barra.setAttribute('aria-valuemin', '0');
      barra.setAttribute('aria-valuemax', '100');
      const tempo = relogio();
      const retorno = retornoVivo();
      const esq = botao('← Mexe', 'botao--principal botao--grande');
      const dir = botao('Mexe →', 'botao--principal botao--grande');
      const palco = palcoDoJogo(area, 'Misturar', passo, tempo.el, tigela, barra, retorno, h('div', 'jogo__acoes jogo__acoes--par', esq, dir));
      esq.focus();

      let lado = '';
      let ultimo = 0;
      let progresso = 0;
      let respingos = 0;
      let segundos = 0;
      let acabou = false;

      function desenhar() {
        barra.firstChild.style.width = progresso + '%';
        barra.setAttribute('aria-valuenow', String(Math.round(progresso)));
        grumos.style.opacity = String(1 - progresso / 100);
      }

      function mexer(novo) {
        if (acabou) return;
        const agora = performance.now();
        if (novo === lado) {
          respingos++;
          retorno.textContent = 'Para o outro lado!';
        } else if (ultimo && agora - ultimo < 110) {
          respingos++;
          progresso += 2;
          retorno.textContent = 'Devagar, está respingando';
        } else {
          progresso += 6;
          retorno.textContent = '';
        }
        lado = novo;
        ultimo = agora;
        colher.dataset.lado = novo;
        progresso = Math.min(100, progresso);
        desenhar();
        if (progresso >= 100) terminar(true);
      }

      function terminar(lisa) {
        if (acabou) return;
        acabou = true;
        parar();
        const nota = lisa
          ? limitar(Math.round(100 - respingos * 8 - Math.max(0, segundos - 7) * 6), 0, 100)
          : limitar(Math.round(progresso * 0.6 - respingos * 8), 0, 100);
        const texto = (lisa ? 'Mistura lisa em ' + segundos.toFixed(1) + ' s' : 'O tempo acabou com a mistura empelotada')
          + (respingos ? ', com ' + respingos + (respingos === 1 ? ' respingo.' : ' respingos.') : ', sem um respingo.');
        fimDeJogo(palco, texto, nota, resolve);
      }

      const pararAnimacao = animar((dt, passou) => {
        segundos = passou;
        tempo.marcar(1 - passou / LIMITE);
        if (passou >= LIMITE) { terminar(false); return false; }
        return true;
      });

      function teclado(ev) {
        if (ev.repeat) return;
        if (tecla(ev, 'ArrowLeft', 'KeyA')) { ev.preventDefault(); mexer('esq'); }
        if (tecla(ev, 'ArrowRight', 'KeyD')) { ev.preventDefault(); mexer('dir'); }
      }

      function parar() {
        pararAnimacao();
        document.removeEventListener('keydown', teclado);
        esq.remove();
        dir.remove();
      }

      esq.addEventListener('click', () => mexer('esq'));
      dir.addEventListener('click', () => mexer('dir'));
      document.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      desenhar();
    });
}

/* ---------- Medir: despejar até a linha ---------- */

function jogoMedir(area, receita, passo, sinal) {
  const RODADAS = 2;
  const alvo = passo.alvo || 'o líquido';

  return abrirJogo(area, 'Medir ' + alvo, passo,
    'Segure para despejar e solte na linha. O líquido acelera e ainda escorre um pouco depois que você solta. São ' + RODADAS + ' medidas.',
    (resolve) => {
      const linha = h('div', 'copo__linha');
      const nivel = h('div', 'copo__nivel');
      const copo = h('div', 'copo', nivel, linha);
      copo.setAttribute('role', 'meter');
      copo.setAttribute('aria-label', 'Quanto já tem no copo');
      copo.setAttribute('aria-valuemin', '0');
      copo.setAttribute('aria-valuemax', '100');
      copo.setAttribute('aria-valuenow', '0');
      const placar = h('p', 'jogo__placar');
      const retorno = retornoVivo();
      const despejar = botao('Segure para despejar', 'botao--principal botao--grande');
      const palco = palcoDoJogo(area, 'Medir ' + alvo, passo, placar, copo, retorno, h('div', 'jogo__acoes', despejar));
      despejar.focus();

      const notas = [];
      let meta = 0;
      let quanto = 0;
      let vel = 0;
      let segurando = false;
      let jaDespejou = false;
      let paradoHa = 0;
      let esperando = false;

      function novaRodada() {
        meta = 40 + Math.random() * 45;
        quanto = 0;
        vel = 0;
        jaDespejou = false;
        paradoHa = 0;
        esperando = false;
        linha.style.bottom = meta + '%';
        placar.textContent = 'Medida ' + (notas.length + 1) + ' de ' + RODADAS;
      }

      function avaliar() {
        const d = Math.abs(quanto - meta);
        let nota;
        let texto;
        if (quanto >= 100) { nota = 0; texto = 'Transbordou!'; }
        else if (d <= 2) { nota = 100; texto = 'Na linha!'; }
        else if (d <= 5) { nota = 80; texto = 'Quase exato'; }
        else if (d <= 10) { nota = 50; texto = quanto > meta ? 'Passou um pouco' : 'Faltou um pouco'; }
        else { nota = limitar(Math.round(40 - d * 2), 0, 40); texto = quanto > meta ? 'Passou muito' : 'Faltou muito'; }
        notas.push(nota);
        retorno.textContent = texto;
        if (notas.length >= RODADAS) {
          parar();
          const media = Math.round(notas.reduce((a, b) => a + b, 0) / RODADAS);
          fimDeJogo(palco, 'Medidas: ' + notas.join(' e ') + '.', media, resolve);
          return;
        }
        esperando = true;
        setTimeout(() => { if (!sinal.aborted) novaRodada(); }, 900);
      }

      const pararAnimacao = animar((dt) => {
        if (esperando) return true;
        vel = segurando ? Math.min(55, vel + 45 * dt) : Math.max(0, vel - 160 * dt);
        quanto = Math.min(100, quanto + vel * dt);
        nivel.style.height = quanto + '%';
        copo.setAttribute('aria-valuenow', String(Math.round(quanto)));
        if (segurando) jaDespejou = true;
        if (jaDespejou && !segurando && vel === 0) {
          paradoHa += dt;
          if (paradoHa > 0.3) avaliar();
        }
        if (quanto >= 100) avaliar();
        return true;
      });

      const soltarTeclas = segurarCom(despejar, (on) => { segurando = on && !esperando; });

      function parar() {
        pararAnimacao();
        soltarTeclas();
        despejar.remove();
      }

      sinal.addEventListener('abort', parar, { once: true });
      novaRodada();
    });
}

/* ---------- Fogo: manter a panela na faixa do passo ---------- */

function jogoFogo(area, receita, passo, sinal) {
  const DURACAO = 10;
  const tipo = FOGOS[passo.fogo] || FOGOS.medio;
  const [baixo, alto] = tipo.faixa;

  return abrirJogo(area, 'Fogo: ' + tipo.nome, passo,
    'Segure o botão (ou a barra de espaço) para aumentar o fogo e solte para baixar. Mantenha a panela na faixa de ' + tipo.nome + ' pelo máximo de tempo em ' + DURACAO + ' segundos. Passou de 94, queima.',
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
      const estadoTexto = h('p', 'jogo__retorno', 'Fogo apagado');
      const tempo = relogio();
      const segurar = botao('Segure para aumentar o fogo', 'botao--principal botao--grande');
      const palco = palcoDoJogo(area, 'Fogo: ' + tipo.nome, passo, tempo.el, termometro, estadoTexto, h('div', 'jogo__acoes', segurar));
      segurar.focus();

      let temp = 15;
      let vel = 0;
      let segurando = false;
      let noPonto = 0;
      let queimando = 0;

      // 60% do tempo no ponto já vale nota máxima (leva um tempo para esquentar)
      function terminar() {
        parar();
        const nota = limitar(Math.round((noPonto / (DURACAO * 0.6)) * 100 - queimando * 15), 0, 100);
        const texto = queimando > 0.5
          ? 'Ficou ' + queimando.toFixed(1) + ' s queimando. O fundo da panela que o diga.'
          : 'Ficou ' + noPonto.toFixed(1) + ' s no ponto, de ' + DURACAO + ' s.';
        fimDeJogo(palco, texto, nota, resolve);
      }

      const pararAnimacao = animar((dt, passou) => {
        // o fogo responde rápido ao soltar, mas a panela ainda sobe um pouco: dá para controlar antecipando
        vel = segurando ? Math.min(40, vel + 70 * dt) : Math.max(-28, vel - 150 * dt);
        temp = limitar(temp + vel * dt, 0, 100);
        if (temp === 0 || temp === 100) vel = 0;
        const dentro = temp >= baixo && temp <= alto;
        if (dentro) noPonto += dt;
        if (temp > 94) queimando += dt;

        nivel.style.width = temp + '%';
        termometro.setAttribute('aria-valuenow', String(Math.round(temp)));
        const texto = temp > 94 ? 'Queimando!' : temp > alto ? 'Quente demais' : dentro ? 'No ponto' : 'Fraco demais';
        if (estadoTexto.textContent !== texto) estadoTexto.textContent = texto;
        termometro.dataset.estado = temp > 94 ? 'queima' : dentro ? 'ponto' : '';
        tempo.marcar(1 - passou / DURACAO);
        if (passou >= DURACAO) { terminar(); return false; }
        return true;
      });

      const soltarTeclas = segurarCom(segurar, (on) => { segurando = on; });

      function parar() {
        pararAnimacao();
        soltarTeclas();
        segurar.remove();
      }

      sinal.addEventListener('abort', parar, { once: true });
    });
}

/* ---------- Forno: tirar quando dourar ---------- */

function jogoForno(area, receita, passo, sinal) {
  const RODADAS = 2;
  const DOURADO = [0.62, 0.78];

  return abrirJogo(area, 'Forno', passo,
    'O prato vai escurecendo no forno, cada vez num ritmo. Tire quando a cor chegar na faixa dourada: cru não vale, queimado menos ainda. Use o botão ou a barra de espaço. São ' + RODADAS + ' fornadas.',
    (resolve) => {
      const arte = pixelCanvas(receita.arte, 128);
      const janela = h('div', 'forno__janela', arte);
      const faixa = h('div', 'forno__faixa');
      faixa.style.left = DOURADO[0] * 100 + '%';
      faixa.style.width = (DOURADO[1] - DOURADO[0]) * 100 + '%';
      const ponteiro = h('div', 'forno__ponteiro');
      const escala = h('div', 'forno__escala', faixa, ponteiro);
      const forno = h('div', 'forno', janela, escala);
      const placar = h('p', 'jogo__placar');
      const retorno = retornoVivo();
      const tirar = botao('Tirar do forno', 'botao--principal botao--grande');
      const palco = palcoDoJogo(area, 'Forno', passo, placar, forno, retorno, h('div', 'jogo__acoes', tirar));
      tirar.focus();

      const notas = [];
      let cor = 0;
      let ritmo = 0;
      let esperando = false;

      function novaFornada() {
        cor = 0;
        ritmo = 0.08 + Math.random() * 0.07;
        esperando = false;
        placar.textContent = 'Fornada ' + (notas.length + 1) + ' de ' + RODADAS;
        retorno.textContent = '';
      }

      function tirarAgora() {
        if (esperando) return;
        esperando = true;
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
        retorno.textContent = texto;
        if (notas.length >= RODADAS) {
          parar();
          const media = Math.round(notas.reduce((a, b) => a + b, 0) / RODADAS);
          fimDeJogo(palco, 'Fornadas: ' + notas.join(' e ') + '.', media, resolve);
          return;
        }
        setTimeout(() => { if (!sinal.aborted) novaFornada(); }, 900);
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

      function teclado(ev) {
        if (ev.repeat || ev.target.tagName === 'BUTTON') return;
        if (tecla(ev, 'Space', 'Enter')) { ev.preventDefault(); tirarAgora(); }
      }

      function parar() {
        pararAnimacao();
        document.removeEventListener('keydown', teclado);
        tirar.remove();
      }

      tirar.addEventListener('click', tirarAgora);
      document.addEventListener('keydown', teclado);
      sinal.addEventListener('abort', parar, { once: true });
      novaFornada();
    });
}

/* ---------- Montar: as camadas na ordem certa ---------- */

function jogoMontar(area, receita, passo, sinal) {
  const camadas = lista(passo.camadas);

  return abrirJogo(area, 'Montar', passo,
    'Toque nas camadas na ordem, de baixo para cima. Cada camada fora de ordem custa pontos.',
    (resolve) => {
      const pilha = h('ol', 'pilha');
      pilha.setAttribute('aria-label', 'O que já está montado');
      const pecas = h('div', 'despensa');
      const retorno = retornoVivo();
      const palco = palcoDoJogo(area, 'Montar', passo, h('div', 'montagem', pilha, pecas), retorno);
      let feitas = 0;
      let erros = 0;

      const botoes = embaralhar(camadas.map((nome, i) => ({ nome, i }))).map(({ nome }) => {
        const b = botao(nome, 'despensa__item', () => {
          if (b.disabled) return;
          if (chaveTexto(nome) === chaveTexto(camadas[feitas])) {
            b.disabled = true;
            b.classList.add('is-usado');
            pilha.append(h('li', 'pilha__camada', nome));
            feitas++;
            retorno.textContent = '';
            if (feitas === camadas.length) {
              const nota = limitar(100 - erros * 12, 0, 100);
              pecas.remove();
              fimDeJogo(palco, erros ? 'Montado, com ' + erros + (erros === 1 ? ' troca de ordem.' : ' trocas de ordem.') : 'Montado sem errar uma camada.', nota, resolve);
            }
          } else {
            erros++;
            retorno.textContent = 'Ainda não: o que vai agora é outra coisa.';
            b.classList.remove('is-errado');
            void b.offsetWidth;
            b.classList.add('is-errado');
          }
        });
        pecas.append(b);
        return b;
      });
      botoes[0].focus();
      sinal.addEventListener('abort', () => pecas.remove(), { once: true });
    });
}

/* ---------- Catálogo (usado pela cozinha e pelo cadastro) ---------- */

const JOGOS = {
  separar: { nome: 'Separar', faz: 'Separar ingredientes', detalhe: 'Ingredientes deste passo, separados por vírgula (vazio = todos)', jogar: jogoSeparar },
  cortar: { nome: 'Cortar', faz: 'Cortar, picar, fatiar', detalhe: 'O que vai na tábua (ex.: a cebola)', jogar: jogoCortar },
  misturar: { nome: 'Misturar', faz: 'Bater, mexer, sovar', detalhe: '', jogar: jogoMisturar },
  medir: { nome: 'Medir', faz: 'Despejar na medida', detalhe: 'O que despejar (ex.: 300 ml de leite)', jogar: jogoMedir },
  fogo: { nome: 'Fogo', faz: 'Ferver, fritar, refogar', detalhe: 'fogo', jogar: jogoFogo },
  forno: { nome: 'Forno', faz: 'Assar, tostar, gratinar', detalhe: '', jogar: jogoForno },
  montar: { nome: 'Montar', faz: 'Montar camadas, empratar', detalhe: 'Camadas de baixo para cima, separadas por vírgula', jogar: jogoMontar }
};

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
    const passo = { jogo, texto: frase.length > 120 ? frase.slice(0, 117) + '...' : frase };
    if (jogo === 'fogo') passo.fogo = /\b(baixo|brando)\b/i.test(frase) ? 'brando' : /\b(alto|ferv|frit)/i.test(frase) ? 'alto' : 'medio';
    if (jogo === 'montar') passo.camadas = ingredientes.slice(0, 5).join(', ');
    passos.push(passo);
  });
  if (!passos.length || passos[0].jogo !== 'separar') passos.unshift({ jogo: 'separar', texto: 'Separe os ingredientes.' });
  return passos.slice(0, 8);
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

// o item no formato de "Item geral" consumível do Vortex, com a pixel art como miniatura
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
        + ' numa aula de ' + receita.passos.length + ' passos. Nota da cozinha: ' + media + '/100. Teste de culinária: ' + teste.total + ' contra CD ' + cd + '.'
    },
    bonus: {},
    slots: { mods: [], props: [], accs: [] },
    thumb: pixelPNG(receita.arte),
    qty: 1,
    slot: ''
  };
}
