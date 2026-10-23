/* =====================================================================
   RECEITAS | API pública TheMealDB (https://www.themealdb.com/api.php)
   Busca, filtro por categoria e receita completa, com fetch + async/await.
   Tudo volta no mesmo formato de receita usado pelo resto do site.
   ===================================================================== */

const MEALDB = 'https://www.themealdb.com/api/json/v1/1';

// A API só tem textos em inglês: categorias e origens aparecem traduzidas
const CATEGORIAS = {
  Beef: 'Carne bovina',
  Chicken: 'Frango',
  Pork: 'Porco',
  Lamb: 'Cordeiro',
  Goat: 'Cabrito',
  Seafood: 'Frutos do mar',
  Pasta: 'Massas',
  Vegetarian: 'Vegetariana',
  Vegan: 'Vegana',
  Starter: 'Entrada',
  Side: 'Acompanhamento',
  Breakfast: 'Café da manhã',
  Dessert: 'Sobremesa',
  Miscellaneous: 'Variadas'
};

const ORIGENS = {
  American: 'Estados Unidos', 'United States': 'Estados Unidos', British: 'Reino Unido', 'United Kingdom': 'Reino Unido',
  Canadian: 'Canadá', Canada: 'Canadá', Chinese: 'China', China: 'China', Croatian: 'Croácia', Dutch: 'Holanda',
  Egyptian: 'Egito', Filipino: 'Filipinas', French: 'França', France: 'França', Greek: 'Grécia', Indian: 'Índia',
  Irish: 'Irlanda', Italian: 'Itália', Italy: 'Itália', Jamaican: 'Jamaica', Japanese: 'Japão', Kenyan: 'Quênia',
  Malaysian: 'Malásia', Mexican: 'México', Mexico: 'México', Moroccan: 'Marrocos', Polish: 'Polônia',
  Portuguese: 'Portugal', Russian: 'Rússia', Russia: 'Rússia', Spanish: 'Espanha', Thai: 'Tailândia',
  Tunisian: 'Tunísia', Turkish: 'Turquia', Ukrainian: 'Ucrânia', Vietnamese: 'Vietnã', Algerian: 'Argélia',
  Argentina: 'Argentina', Argentinian: 'Argentina', Australian: 'Austrália', Norwegian: 'Noruega',
  Venezuela: 'Venezuela', Venezulan: 'Venezuela', Uruguayan: 'Uruguai', Syrian: 'Síria', Slovakian: 'Eslováquia',
  'Saudi Arabian': 'Arábia Saudita', Unknown: ''
};

class ErroReceitas extends Error {}

async function buscarJSON(url) {
  let resposta;
  try {
    resposta = await fetch(url);
  } catch (erro) {
    throw new ErroReceitas('Sem conexão com a base de receitas. Confira a internet e tente de novo.');
  }
  if (!resposta.ok) {
    throw new ErroReceitas('A base de receitas respondeu com erro ' + resposta.status + '. Tente de novo em instantes.');
  }
  return resposta.json();
}

// A API devolve null (ou o texto "no data found") quando não acha nada
function listaDeMeals(json) {
  return Array.isArray(json.meals) ? json.meals : [];
}

function traduzirCategoria(cat) {
  return CATEGORIAS[cat] || cat || 'Variadas';
}

function traduzirOrigem(area) {
  if (!area) return '';
  return area in ORIGENS ? ORIGENS[area] : area;
}

// receita completa (search.php e lookup.php trazem tudo)
function receitaDaApi(m) {
  const ingredientes = [];
  for (let i = 1; i <= 20; i++) {
    const nome = (m['strIngredient' + i] || '').trim();
    if (nome) ingredientes.push({ nome, medida: (m['strMeasure' + i] || '').trim() });
  }
  return {
    id: 'mealdb-' + m.idMeal,
    idApi: m.idMeal,
    fonte: 'api',
    completa: true,
    nome: m.strMeal,
    categoria: traduzirCategoria(m.strCategory),
    origem: traduzirOrigem(m.strArea || m.strCountry),
    imagem: m.strMealThumb || '',
    ingredientes,
    preparo: (m.strInstructions || '').replace(/\r/g, '').split(/\n+/).map((p) => p.trim()).filter(Boolean),
    video: m.strYoutube || '',
    link: m.strSource || ''
  };
}

// resumo (filter.php só traz id, nome e foto): o resto é buscado ao abrir
function resumoDaApi(m, categoriaApi) {
  return {
    id: 'mealdb-' + m.idMeal,
    idApi: m.idMeal,
    fonte: 'api',
    completa: false,
    nome: m.strMeal,
    categoria: traduzirCategoria(categoriaApi),
    origem: '',
    imagem: m.strMealThumb || '',
    ingredientes: [],
    preparo: [],
    video: '',
    link: ''
  };
}

async function receitasPorLetras(letras) {
  const respostas = await Promise.all(letras.map((l) => buscarJSON(MEALDB + '/search.php?f=' + l)));
  const vistas = new Set();
  const lista = [];
  respostas.forEach((json) => listaDeMeals(json).forEach((m) => {
    if (vistas.has(m.idMeal)) return;
    vistas.add(m.idMeal);
    lista.push(receitaDaApi(m));
  }));
  return lista;
}

async function receitasPorNome(texto) {
  const json = await buscarJSON(MEALDB + '/search.php?s=' + encodeURIComponent(texto));
  return listaDeMeals(json).map(receitaDaApi);
}

async function receitasPorCategoria(categoriaApi) {
  const json = await buscarJSON(MEALDB + '/filter.php?c=' + encodeURIComponent(categoriaApi));
  return listaDeMeals(json).map((m) => resumoDaApi(m, categoriaApi));
}

async function receitaCompleta(idApi) {
  const json = await buscarJSON(MEALDB + '/lookup.php?i=' + encodeURIComponent(idApi));
  const m = listaDeMeals(json)[0];
  if (!m) throw new ErroReceitas('Essa receita não existe mais na base.');
  return receitaDaApi(m);
}
