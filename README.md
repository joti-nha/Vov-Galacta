# Cozinha da Vó Galacta

Plataforma de receitas culinárias no universo do **Vortex**. Você escolhe uma receita, aprende cozinhando em três minigames e manda o prato pronto para o inventário do seu personagem do Vortex.

**Site publicado:** https://joti-nha.github.io/Vov-Galacta/

Projeto individual de **Sistemas Web II** (professora Ana Paula). Feito com HTML, CSS e JavaScript puro, sem framework e sem etapa de build.

## O que tem em cada seção

| Requisito | Onde está |
| --- | --- |
| **Início:** negócio, imagem, Missão/Visão/Valores em Grid | `index.html` (seção `#inicio`), ilustração própria em `img/vo-galacta.svg`, grid em `.pilares` |
| **Listagem:** API pública com `fetch` + `async/await`, estado global, cards | `js/receitas-api.js` (TheMealDB), `estado` no topo de `js/app.js`, `renderizarLista()` |
| **Cadastro:** formulário, validação, `preventDefault()`, mensagens, entra na lista na hora | `#form-receita` e `validarReceita()` em `js/app.js` |
| **Navegação SPA:** Início, Listagem e Cadastro sem recarregar | `mostrarSecao()` em `js/app.js` troca a classe `.is-ativa` das seções |
| **Visual próprio** | `css/estilo.css`: paleta do Vortex (azul-tempestade, âmbar e maré), fontes Alegreya e Figtree |

## Como funciona

### Receitas (API TheMealDB)
- Ao abrir a listagem, o site busca as receitas que começam com C, B e P (`search.php?f=`).
- Há busca pelo nome (`search.php?s=`) e filtro por categoria (`filter.php?c=`). O filtro só traz o resumo, e a receita completa é buscada ao abrir (`lookup.php?i=`).
- A API só tem textos em inglês. Categorias e origens aparecem traduzidas; ingredientes e modo de preparo ficam no original.

### Receitas cadastradas
- Ficam em `estado.cadastradas` e no `localStorage` do navegador (chave `vovGalacta.receitas`).
- Aparecem primeiro na listagem, com o selo "Da tripulação", e podem ser cozinhadas como as outras.

### A aula (minigames) — `js/minigames.js`
1. **Separe os ingredientes:** escolher os ingredientes da receita entre itens da despensa, em 25 s.
2. **Corte no ritmo:** cortar quando a faca passa pela faixa clara, 5 vezes, cada vez mais rápido.
3. **Segure o fogo no ponto:** segurar para esquentar e soltar para esfriar, mantendo a panela no ponto por 12 s.

A média das três notas vira um bônus de +0 a +3 no **teste de culinária**, que segue as regras do Vortex:

- **Fórmula:** 2d6 + Precisão + Ofício. O Ofício só conta se a profissão da ficha for de culinária (cozinheiro, chef, confeiteiro...), como a Medicina na cura.
- **Crítico:** um 6 soma a Precisão de novo.
- **Perda:** um 1 anula a perícia, e um 1 também anula um 6.
- **Falha total:** dois 1. A panela queima e não sai prato.
- **CD da receita:** 6 até 6 ingredientes, 8 até 10 e 10 acima disso.

A margem acima da CD define a raridade do prato e quanto ele recupera:

| Margem | Raridade | Recupera |
| --- | --- | --- |
| 12 ou mais | Lendária | +6 PV, +3 PE |
| 9 a 11 | Épica | +5 PV, +2 PE |
| 6 a 8 | Rara | +4 PV, +1 PE |
| 3 a 5 | Incomum | +3 PV |
| 1 a 2 | Comum | +2 PV |
| 0 ou menos | Comum (passou do ponto) | +1 PV |

### Integração com o Vortex — `js/vortex-api.js`
- **Login:** o site entra como visitante anônimo no Firebase do Vortex (projeto `vortex-7faa5`), pela API REST. O token fica guardado no navegador e é renovado sozinho.
- **Achar a ficha:** pelo **código do perfil** (`profiles/{código}` → lista de fichas) ou pelo **nome** (o campo `searchKeys` das fichas).
- **Guardar o prato:** ele entra em `characters/{id}.sheet.inventory` como um **Item geral consumível**, no mesmo formato do Vortex: `kind: 'item-geral'`, raridade, carga 0,25, 2 usos, "Bônus de recuperação" e lore com quem cozinhou e o resultado do teste. O Vortex lê esse bônus e aceita o prato como item de cura na arena.
- **Pilha:** um prato igual (mesmo nome, raridade e bônus) soma na quantidade em vez de criar outro item.
- **Gravação segura:** só o campo `sheet.inventory` é gravado, e só se a ficha não mudou desde a leitura. Se mudou, o site lê de novo e tenta outra vez. Os itens que já estavam lá voltam exatamente como vieram.
- **Ficha aberta:** se ela estiver aberta no Vortex enquanto o prato chega, recarregue a página da ficha antes de editar, para o Vortex não salvar por cima.

## Estrutura

```
index.html          seções, menu e diálogos
css/estilo.css      identidade visual e layout (Grid e Flexbox)
js/util.js          funções pequenas usadas por todos os scripts
js/receitas-api.js  TheMealDB
js/vortex-api.js    Firebase do Vortex (login, fichas, inventário)
js/minigames.js     os três jogos, o teste de culinária e o item do prato
js/app.js           estado global, navegação, listagem, cadastro, personagem e cozinha
img/                ilustração do início, ícone e foto padrão de prato
```

## Rodar localmente

Abra a pasta com qualquer servidor estático, por exemplo:

```
python3 -m http.server 8000
```

e acesse http://localhost:8000.
