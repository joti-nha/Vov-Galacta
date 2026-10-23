/* =====================================================================
   CARDÁPIO | os pratos de verdade da TheMealDB que a Vó já ensina
   Cada prato tem o id na API, a pixel art, a tradução (nome, ingredientes
   e preparo) e a aula: a sequência de minigames na ordem das ações.
   Para pôr um prato novo: ache o id em themealdb.com, copie um bloco
   abaixo e troque os dados. As chaves de "ingredientes" são os nomes em
   inglês da API (sem diferença de maiúsculas).

   Jogos disponíveis (minigames.js):
     separar  · itens: os ingredientes do passo
     cortar   · alvo: o que vai na tábua
     misturar · bater, mexer, sovar
     medir    · alvo: o que despejar até a linha
     fogo     · fogo: 'brando', 'medio' ou 'alto'
     forno    · assar ou tostar até dourar
     montar   · camadas: a ordem de baixo para cima
   ===================================================================== */

const CARDAPIO = [
  {
    idApi: '52854',
    arte: 'panquecas',
    nome: 'Panquecas',
    ingredientes: {
      flour: ['Farinha de trigo', '100 g'],
      eggs: ['Ovos', '2 grandes'],
      milk: ['Leite', '300 ml'],
      'sunflower oil': ['Óleo de girassol', '1 colher de sopa'],
      sugar: ['Açúcar', 'para servir'],
      raspberries: ['Framboesas', 'para servir'],
      blueberries: ['Mirtilos', 'para servir']
    },
    preparo: [
      'Bata a farinha, os ovos, o leite, 1 colher de sopa de óleo e uma pitada de sal até virar uma massa lisa.',
      'Se der tempo, deixe a massa descansar por 30 minutos. Se não, pode cozinhar na hora.',
      'Aqueça uma frigideira média em fogo médio e passe um papel-toalha com um pouco de óleo.',
      'Cozinhe cada panqueca por cerca de 1 minuto de cada lado, até dourar. Mantenha as prontas aquecidas no forno baixo.',
      'Sirva com limão e açúcar, ou com a cobertura que preferir.',
      'Frias, as panquecas podem ser congeladas por até 2 meses, separadas por papel-manteiga.'
    ],
    passos: [
      { jogo: 'separar', texto: 'Separe a farinha, os ovos, o leite e o óleo.', itens: ['Farinha de trigo', 'Ovos', 'Leite', 'Óleo de girassol'] },
      { jogo: 'medir', texto: 'Meça 300 ml de leite.', alvo: '300 ml de leite' },
      { jogo: 'misturar', texto: 'Bata tudo com uma pitada de sal até a massa ficar lisa.' },
      { jogo: 'fogo', texto: 'Em fogo médio, doure cada panqueca por 1 minuto de cada lado.', fogo: 'medio' },
      { jogo: 'montar', texto: 'Empilhe as panquecas e cubra com as frutas e o açúcar.', camadas: ['Panqueca', 'Panqueca', 'Panqueca', 'Framboesas', 'Mirtilos', 'Açúcar'] }
    ]
  },

  {
    idApi: '52982',
    arte: 'macarrao',
    nome: 'Espaguete à carbonara',
    ingredientes: {
      spaghetti: ['Espaguete', '320 g'],
      'egg yolks': ['Gemas', '6'],
      salt: ['Sal', 'a gosto'],
      bacon: ['Bacon', '150 g'],
      pecorino: ['Pecorino', '50 g'],
      'black pepper': ['Pimenta-do-reino', 'a gosto']
    },
    preparo: [
      'Leve uma panela grande de água para ferver.',
      'Pique o bacon bem fino, tirando a casca. Rale o queijo bem fino.',
      'Bata os ovos numa tigela com um pouco de pimenta-do-reino e reserve.',
      'Salgue a água fervente e cozinhe o espaguete, tampado e em fervura leve, por cerca de 10 minutos, até ficar al dente.',
      'Amasse de leve dois dentes de alho com a lâmina da faca.',
      'Enquanto a massa cozinha, derreta manteiga numa frigideira grande e frite o bacon com o alho.',
      'Cozinhe em fogo médio por uns 5 minutos, mexendo sempre, até o bacon ficar dourado e crocante. Tire o alho.',
      'Abaixe o fogo. Passe a massa escorrida para a frigideira, guardando um pouco da água do cozimento.',
      'Misture quase todo o queijo aos ovos, deixando um punhado para o final.',
      'Fora do fogo, misture a massa com os ovos e o queijo bem rápido, para o molho engrossar sem talhar.',
      'Junte umas colheradas da água do cozimento para deixar cremoso. Acerte o sal.',
      'Enrole a massa nos pratos e sirva na hora, com o queijo reservado e mais pimenta.'
    ],
    passos: [
      { jogo: 'fogo', texto: 'Leve uma panela grande de água para ferver.', fogo: 'alto' },
      { jogo: 'cortar', texto: 'Pique o bacon bem fino.', alvo: 'o bacon' },
      { jogo: 'misturar', texto: 'Bata as gemas com a pimenta e quase todo o pecorino.' },
      { jogo: 'fogo', texto: 'Frite o bacon em fogo médio, mexendo, até dourar.', fogo: 'medio' },
      { jogo: 'misturar', texto: 'Fora do fogo, misture o espaguete com os ovos bem rápido, sem deixar talhar.' },
      { jogo: 'montar', texto: 'Enrole a massa no prato e finalize.', camadas: ['Espaguete', 'Molho de ovos', 'Bacon', 'Pecorino', 'Pimenta-do-reino'] }
    ]
  },

  {
    idApi: '53013',
    arte: 'hamburguer',
    nome: 'Big Mac caseiro',
    ingredientes: {
      'minced beef': ['Carne moída', '400 g'],
      'olive oil': ['Azeite', '2 colheres de sopa'],
      'sesame seed burger buns': ['Pão de hambúrguer com gergelim', '2'],
      onion: ['Cebola', 'picada'],
      'iceberg lettuce': ['Alface-americana', '1/4'],
      cheese: ['Queijo', '2 fatias'],
      'dill pickles': ['Picles', '2 grandes'],
      mayonnaise: ['Maionese', '1 xícara'],
      'white wine vinegar': ['Vinagre de vinho branco', '2 colheres de chá'],
      pepper: ['Pimenta', 'uma pitada'],
      mustard: ['Mostarda', '2 colheres de chá'],
      'onion salt': ['Sal de cebola', '1 e 1/2 colher de chá'],
      'garlic powder': ['Alho em pó', '1 e 1/2 colher de chá'],
      paprika: ['Páprica', '1/2 colher de chá']
    },
    preparo: [
      'Misture os ingredientes do molho numa tigela, tempere com sal e leve à geladeira até a hora de usar.',
      'Tempere a carne com sal e pimenta e modele quatro hambúrgueres finos, de uns 15 cm, sobre papel-manteiga. Frite em óleo bem quente, em duas levas, por 1 a 2 minutos de cada lado. Mantenha aquecidos.',
      'Corte cada pão em três fatias na horizontal e toste de leve.',
      'Monte em camadas: molho, cebola, alface, queijo, hambúrguer e picles; depois a fatia do meio do pão, repita as camadas e feche com o topo do pão.',
      'Espere meia hora depois de comer antes de sair para correr.'
    ],
    passos: [
      { jogo: 'separar', texto: 'Separe os ingredientes do molho.', itens: ['Maionese', 'Vinagre de vinho branco', 'Mostarda', 'Sal de cebola', 'Alho em pó', 'Páprica'] },
      { jogo: 'misturar', texto: 'Misture o molho e leve à geladeira.' },
      { jogo: 'fogo', texto: 'Frite os hambúrgueres em óleo bem quente, 1 a 2 minutos de cada lado.', fogo: 'alto' },
      { jogo: 'cortar', texto: 'Corte cada pão em três fatias.', alvo: 'os pães' },
      { jogo: 'forno', texto: 'Toste os pães de leve.' },
      { jogo: 'montar', texto: 'Monte o lanche em camadas, de baixo para cima.', camadas: ['Pão de baixo', 'Molho', 'Alface', 'Queijo', 'Hambúrguer', 'Picles', 'Pão do meio', 'Molho', 'Hambúrguer', 'Pão de cima'] }
    ]
  },

  {
    idApi: '52977',
    arte: 'sopa',
    nome: 'Çorba (sopa turca de lentilha)',
    ingredientes: {
      lentils: ['Lentilha', '1 xícara'],
      onion: ['Cebola', '1 grande'],
      carrots: ['Cenoura', '1 grande'],
      'tomato puree': ['Extrato de tomate', '1 colher de sopa'],
      cumin: ['Cominho', '2 colheres de chá'],
      paprika: ['Páprica', '1 colher de chá'],
      mint: ['Hortelã', '1/2 colher de chá'],
      thyme: ['Tomilho', '1/2 colher de chá'],
      'black pepper': ['Pimenta-do-reino', '1/4 de colher de chá'],
      'red pepper flakes': ['Pimenta calabresa', '1/4 de colher de chá'],
      'vegetable stock': ['Caldo de legumes', '4 xícaras'],
      water: ['Água', '1 xícara'],
      'sea salt': ['Sal marinho', 'uma pitada']
    },
    preparo: [
      'Escolha as lentilhas para tirar as sujeirinhas, lave 2 ou 3 vezes, escorra e reserve. Elas podem grudar umas nas outras.',
      'Numa panela grande, em fogo médio-alto, refogue a cebola no azeite com uma pitada de sal por uns 3 minutos. Junte a cenoura e cozinhe mais 3 minutos.',
      'Junte o extrato de tomate e mexa por 1 minuto. Junte os temperos e mexa por 10 segundos para tostar.',
      'Junte as lentilhas, a água, o caldo e o sal e deixe levantar fervura.',
      'Abaixe para fogo médio-baixo, tampe em parte e cozinhe por 15 a 20 minutos, até a lentilha desmanchar e a cenoura ficar macia.',
      'Bata a sopa até a consistência que preferir e acerte o sal.',
      'Para engrossar, use biscoito salgado esfarelado, pão ou um pouco de amido. Dura uma semana na geladeira.'
    ],
    passos: [
      { jogo: 'separar', texto: 'Escolha as lentilhas e separe a cebola e a cenoura.', itens: ['Lentilha', 'Cebola', 'Cenoura'] },
      { jogo: 'cortar', texto: 'Pique a cebola e a cenoura.', alvo: 'a cebola e a cenoura' },
      { jogo: 'fogo', texto: 'Refogue a cebola com uma pitada de sal e depois a cenoura.', fogo: 'medio' },
      { jogo: 'medir', texto: 'Junte as lentilhas, o caldo e a água.', alvo: '4 xícaras de caldo' },
      { jogo: 'fogo', texto: 'Cozinhe em fogo baixo, semitampado, até a lentilha desmanchar.', fogo: 'brando' },
      { jogo: 'misturar', texto: 'Bata a sopa até a textura que preferir.' }
    ]
  },

  {
    idApi: '52768',
    arte: 'torta',
    nome: 'Torta frangipane de maçã',
    ingredientes: {
      'digestive biscuits': ['Biscoito digestivo', '175 g'],
      butter: ['Manteiga', '75 g'],
      'bramley apples': ['Maçã verde', '200 g'],
      'salted butter': ['Manteiga com sal', '75 g'],
      'caster sugar': ['Açúcar refinado', '75 g'],
      'free-range eggs, beaten': ['Ovos batidos', '2'],
      'ground almonds': ['Amêndoas moídas', '75 g'],
      'almond extract': ['Essência de amêndoa', '1 colher de chá'],
      'flaked almonds': ['Amêndoas em lascas', '50 g']
    },
    preparo: [
      'Preaqueça o forno a 200 °C (180 °C com ventilação).',
      'Triture os biscoitos num saco até virarem uma farofa fina.',
      'Derreta a manteiga, misture a farofa, forre o fundo e as laterais da forma e leve à geladeira.',
      'Bata a manteiga com o açúcar até ficar claro e fofo. Junte os ovos, as amêndoas moídas e a essência.',
      'Descasque e fatie as maçãs bem fino só na hora de usar, para não escurecerem.',
      'Arrume as fatias de maçã sobre a base, espalhe o creme por cima e salpique as amêndoas em lascas.',
      'Asse por 20 a 25 minutos, até dourar e firmar.',
      'Deixe esfriar por 15 minutos e tire a lateral da forma.',
      'Passe a torta, ainda no fundo da forma, para um prato. Sirva morna com creme ou sorvete.'
    ],
    passos: [
      { jogo: 'separar', texto: 'Separe os ingredientes da base e do creme.', itens: ['Biscoito digestivo', 'Manteiga', 'Açúcar refinado', 'Ovos batidos', 'Amêndoas moídas'] },
      { jogo: 'misturar', texto: 'Bata a manteiga com o açúcar até ficar fofo; junte os ovos e as amêndoas.' },
      { jogo: 'cortar', texto: 'Descasque e fatie as maçãs bem fino.', alvo: 'as maçãs' },
      { jogo: 'montar', texto: 'Monte a torta na forma.', camadas: ['Base de biscoito', 'Fatias de maçã', 'Creme de amêndoas', 'Amêndoas em lascas'] },
      { jogo: 'forno', texto: 'Asse por 20 a 25 minutos, até dourar.' }
    ]
  },

  {
    idApi: '52813',
    arte: 'frango',
    nome: 'Frango frito do Kentucky',
    ingredientes: {
      chicken: ['Frango', '1 inteiro, em pedaços'],
      oil: ['Óleo', '2 litros, para fritar'],
      'egg white': ['Clara de ovo', '1'],
      flour: ['Farinha de trigo', '1 e 1/2 xícara'],
      'brown sugar': ['Açúcar mascavo', '1 colher de sopa'],
      salt: ['Sal', '1 colher de sopa'],
      paprika: ['Páprica', '1 colher de sopa'],
      'onion salt': ['Sal de cebola', '2 colheres de chá'],
      'chili powder': ['Pimenta em pó', '1 colher de chá'],
      'black pepper': ['Pimenta-do-reino', '1 colher de chá'],
      'celery salt': ['Sal de aipo', '1/2 colher de chá'],
      sage: ['Sálvia', '1/2 colher de chá'],
      'garlic powder': ['Alho em pó', '1/2 colher de chá'],
      allspice: ['Pimenta-da-jamaica', '1/2 colher de chá'],
      oregano: ['Orégano', '1/2 colher de chá'],
      basil: ['Manjericão', '1/2 colher de chá'],
      marjoram: ['Manjerona', '1/2 colher de chá']
    },
    preparo: [
      'Aqueça o óleo da fritadeira a 175 °C.',
      'Misture bem todos os temperos.',
      'Junte os temperos com a farinha, o açúcar mascavo e o sal.',
      'Passe cada pedaço de frango na clara e depois aperte na farinha temperada até cobrir bem.',
      'Deixe os pedaços empanados descansarem uns 5 minutos para a casquinha secar.',
      'Frite em levas. Peito e asa levam de 12 a 14 minutos; coxa e sobrecoxa, alguns minutos a mais. Está pronto quando a parte mais grossa chega a 74 °C.',
      'Escorra em papel-toalha e sirva quente.'
    ],
    passos: [
      { jogo: 'separar', texto: 'Separe os temperos da mistura secreta.', itens: ['Páprica', 'Sal de cebola', 'Pimenta em pó', 'Pimenta-do-reino', 'Sálvia', 'Alho em pó', 'Orégano', 'Manjericão'] },
      { jogo: 'misturar', texto: 'Misture os temperos com a farinha, o açúcar mascavo e o sal.' },
      { jogo: 'montar', texto: 'Empane cada pedaço: primeiro a clara, depois a farinha.', camadas: ['Pedaço de frango', 'Clara de ovo', 'Farinha temperada'] },
      { jogo: 'fogo', texto: 'Frite em óleo bem quente por 12 a 14 minutos, até dourar.', fogo: 'alto' }
    ]
  }
];
