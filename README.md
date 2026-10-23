# Cozinha da Vó Galacta

Plataforma de receitas culinárias no universo do **Vortex**. Você entra com a sua conta do Vortex, escolhe uma receita e cozinha cada passo dela num minigame. No fim, manda o prato pronto para o inventário do seu personagem.

**Site publicado:** https://joti-nha.github.io/Vov-Galacta/

Projeto individual de **Sistemas Web II** (professora Ana Paula). Feito com HTML, CSS e JavaScript puro, sem framework e sem etapa de build.

## O que tem em cada seção

| Requisito | Onde está |
| --- | --- |
| **Início:** negócio, imagem, Missão/Visão/Valores em Grid | `index.html` (seção `#inicio`), ilustração própria em `img/vo-galacta.svg`, grid em `.pilares` |
| **Listagem:** API pública com `fetch` + `async/await`, estado global, cards | `carregarCardapio()` em `js/receitas-api.js` (TheMealDB), `estado` no topo de `js/app.js`, `renderizarLista()` |
| **Cadastro:** formulário, validação, `preventDefault()`, mensagens, entra na lista na hora | `#form-receita` e `validarReceita()` em `js/app.js` |
| **Navegação SPA:** Início, Listagem e Cadastro sem recarregar | `mostrarSecao()` em `js/app.js` troca a classe `.is-ativa` das seções |
| **Visual próprio** | `css/estilo.css` (paleta e temas do Vortex, fontes Alegreya e Figtree) e a pixel art dos pratos em `js/pixel-arte.js` |

## O cardápio (pratos de verdade, traduzidos)

Os pratos da Vó são receitas reais da [TheMealDB](https://www.themealdb.com/), uma API pública. O site busca cada uma pelo id (`lookup.php?i=`) ao mesmo tempo e junta o texto da API com o que está em `js/cardapio.js`:

- **Tradução:** nome, ingredientes com medidas e modo de preparo em português. O botão **Ver original (inglês)** mostra o texto como veio da API.
- **Pixel art:** cada prato tem um desenho de 16 × 16 pixels (`js/pixel-arte.js`), sem foto.
- **Aula:** a sequência de minigames, na ordem das ações da receita.
- **Se a API falhar:** o prato aparece só com a tradução, e a listagem avisa quais pratos não carregaram.

Hoje são 6 pratos: Panquecas, Espaguete à carbonara, Big Mac caseiro, Çorba, Torta frangipane de maçã e Frango frito do Kentucky.

**Para pôr um prato novo:**
1. Ache o id dele em themealdb.com.
2. Copie um bloco de `CARDAPIO` em `js/cardapio.js` e troque o id, o nome, as traduções dos ingredientes (as chaves são os nomes em inglês da API), o preparo e os passos.
3. Escolha uma arte de `SPRITES` ou desenhe uma nova em `js/pixel-arte.js`.

## A aula: um minigame por passo — `js/minigames.js`

Os jogos são de mexer nos instrumentos com o dedo ou o mouse. Todos também funcionam pelo teclado.

| Jogo | Ação da receita | Como joga (toque) | Teclado |
| --- | --- | --- | --- |
| Separar | separar, escolher | arrastar da despensa (prateleiras com cada ingrediente no seu ícone) para a bancada, ou tocar. O primeiro Separar da aula pede **todos** os ingredientes da receita; os seguintes, só os do passo | Tab e Enter |
| Cortar | cortar, picar, fatiar | segurar a faca, levar até a marca e soltar; cada marca tem prazo | ← → e espaço |
| Misturar | bater, mexer, sovar | só a colher anda: ela segue o dedo e arrasta a massa (pixel art com as cores dos ingredientes do passo), que vai se misturando até ficar lisa. Sempre para o mesmo lado, sem respingar | ← e → alternados |
| Medir | despejar na medida | arrastar a jarra para inclinar; soltar endireita (ainda escorre um pouco) | segurar espaço |
| Fogo | ferver, fritar, refogar | girar o botão do fogão; a panela demora a responder e há imprevistos | ↑ e ↓ |
| Forno | assar, tostar | puxar a pá para baixo quando a cor chega no dourado | espaço |
| Montar | montar camadas, empratar | arrastar as camadas para o prato seguindo a **ficha da Vó** (a ordem, com a próxima em destaque), ou tocar. No difícil a ficha some depois de uns segundos | Tab e Enter |

Cada jogo mostra uma **dica da Vó** antes de começar e de 0 a 3 **estrelas** no fim. O site guarda o **recorde** de cada receita neste navegador.

**Dificuldade (Fácil, Normal, Difícil).** Cada passo tem a sua:
- **No jogo:** muda o tempo, a largura das faixas, a velocidade e os imprevistos. No Montar difícil, aparecem camadas intrusas.
- **Na nota:** pesa na média da aula. Uma nota de passo difícil vale 15% a mais, e uma de passo fácil, 15% a menos.

### Cadastro: a vitrine de minigames
Quem cadastra uma receita monta a aula pela **vitrine**:
- **Os cartões:** cada jogo tem nome, o que faz, a escolha de dificuldade, **Experimentar** (um treino, sem prato) e **+** para pôr o passo na aula. O mesmo jogo pode entrar mais de uma vez, até 12 passos.
- **Os passos:** em cada um se escreve o que fazer e o detalhe do jogo (ingredientes, o que cortar, a intensidade do fogo, as camadas). A dificuldade continua ajustável, e os botões ↑ ↓ × mudam a ordem ou tiram o passo.
- **Sugerir pelo modo de preparo:** monta uma primeira versão a partir dos verbos de cada linha do preparo.

A receita pode usar um dos desenhos ou **uma foto própria**, do aparelho ou por link, com a opção de transformar a foto em pixel art.

## O teste de culinária

A média da aula vira um bônus de +0 a +3 no teste, que segue as regras do Vortex:

- **Fórmula:** 2d6 + Precisão + Ofício. O Ofício só conta se a profissão da ficha for de culinária (cozinheiro, chef, confeiteiro...).
- **Crítico:** um 6 soma a Precisão de novo.
- **Perda:** um 1 anula a perícia, e um 1 também anula um 6.
- **Falha total:** dois 1. A panela queima e não sai prato.
- **CD da receita:** 6 até 6 ingredientes, 8 até 10 e 10 acima disso.

A margem acima da CD define a raridade do prato e quanto ele dá a mais no descanso curto (veja a regra dos alimentos abaixo):

| Margem | Raridade | A mais no descanso curto |
| --- | --- | --- |
| 12 ou mais | Lendária | +6 PV, +3 PE |
| 9 a 11 | Épica | +5 PV, +2 PE |
| 6 a 8 | Rara | +4 PV, +1 PE |
| 3 a 5 | Incomum | +3 PV |
| 1 a 2 | Comum | +2 PV |
| 0 ou menos | Comum (passou do ponto) | +1 PV |

### Regra dos alimentos

Todo prato segue a mesma regra: **consuma em um descanso curto e você recupera, de adicional, os recursos especificados** no item.

O Vortex ainda não aplica isso sozinho no descanso, então a regra vai escrita no próprio item, nos campos "Efeito" e "Especial". O campo "Bônus de recuperação" fica vazio de propósito, porque o Vortex usaria esse campo para tratar o prato como kit de cura em combate.

Na hora de servir, o seletor **− / +** escolhe quantos pratos fazer (até 99). Todos saem com a mesma qualidade e vão juntos para o inventário.

## Conta e temas do Vortex — `js/conta.js`

Este site e o Vortex estão no mesmo endereço (`joti-nha.github.io`), então dividem o armazenamento do navegador:

- **Conta:** a conta é o **perfil do Vortex** (código de 1 a 6 números), guardado na mesma chave que o Vortex usa (`vortex.profile.v1.fb.vortex-7faa5`). Entrar aqui entra no Vortex, e sair aqui sai do Vortex, neste navegador.
- **Personagens:** a lista de quem pode cozinhar são as fichas desse perfil.
- **Temas:** os temas desbloqueados no Vortex (`vortex.themes.v1`) aparecem aqui com as mesmas cores, e trocar o tema aqui troca lá também.
- **Abas abertas:** se o Vortex estiver aberto em outra aba e o tema ou a conta mudar lá, este site acompanha na hora.
- **Tema Nyan Cat:** os gatos voam ao fundo como no Vortex, usando as mesmas artes que o Vortex publica em `Vortex_aplication/img/nyan/` (por isso só aparecem no site publicado).
- **Limite:** os temas desbloqueados ficam guardados por aparelho, como no próprio Vortex; o perfil do Vortex não guarda temas.

## Inventário do Vortex — `js/vortex-api.js`

- **Login:** o site entra como visitante anônimo no Firebase do Vortex pela API REST.
- **O prato:** entra em `characters/{id}.sheet.inventory` como **Item geral consumível**, no mesmo formato do Vortex: raridade, carga 0,25, 2 usos, a regra dos alimentos no efeito, lore com o resultado da aula e a imagem do prato como miniatura (48 × 48).
- **Pilha:** pratos iguais (mesmo nome, raridade e efeito) somam na quantidade em vez de criar outro item.
- **Gravação segura:** só o campo `sheet.inventory` é gravado, e só se a ficha não mudou desde a leitura. Se mudou, o site lê de novo e tenta outra vez. Os itens que já estavam lá voltam exatamente como vieram.
- **Ficha aberta:** se ela estiver aberta no Vortex enquanto o prato chega, recarregue a página da ficha antes de editar.

## Estrutura

```
index.html          seções, menu e diálogos
css/estilo.css      identidade visual, temas do Vortex e layout (Grid e Flexbox)
js/util.js          funções pequenas usadas por todos os scripts
js/pixel-arte.js    os desenhos dos pratos, ingredientes e instrumentos, e a foto própria
js/cardapio.js      os pratos da API: tradução, arte e aula
js/receitas-api.js  TheMealDB
js/vortex-api.js    Firebase do Vortex (login, perfil, inventário)
js/conta.js         conta e temas divididos com o Vortex
js/tema-nyan.js     os gatos voando do tema Nyan Cat
js/minigames.js     os sete jogos de toque, as dificuldades, a sugestão de aula, o teste e o item do prato
js/app.js           estado global, navegação, listagem, cadastro, conta e cozinha
img/                ilustração do início e ícone
```

## Rodar localmente

```
python3 -m http.server 8000
```

e acesse http://localhost:8000. Rodando assim, o site fica em outro endereço, então não divide conta nem temas com o Vortex publicado.
