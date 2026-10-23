/* =====================================================================
   RECEITAS | API pública TheMealDB (https://www.themealdb.com/api.php)
   O site busca, com fetch + async/await, cada prato do cardápio
   (cardapio.js) pelo id e junta o texto original com a tradução.
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
  Canadian: 'Canadá', Chinese: 'China', French: 'França', Greek: 'Grécia', Indian: 'Índia', Irish: 'Irlanda',
  Italian: 'Itália', Italy: 'Itália', Jamaican: 'Jamaica', Japanese: 'Japão', Mexican: 'México', Moroccan: 'Marrocos',
  Portuguese: 'Portugal', Russian: 'Rússia', Spanish: 'Espanha', Thai: 'Tailândia', Turkish: 'Turquia', Turkey: 'Turquia',
  Vietnamese: 'Vietnã', Unknown: ''
};

class ErroReceitas extends Error {}

async function buscarJSON(url) {
  let resposta;
  try {
    resposta = await fetch(url);
  } catch (erro) {
    throw new ErroReceitas('Sem conexão com a base de receitas.');
  }
  if (!resposta.ok) throw new ErroReceitas('A base de receitas respondeu com erro ' + resposta.status + '.');
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

// o texto como veio da API, para o botão "Ver original"
function originalDaApi(m) {
  const ingredientes = [];
  for (let i = 1; i <= 20; i++) {
    const nome = (m['strIngredient' + i] || '').trim();
    if (nome) ingredientes.push({ nome, medida: (m['strMeasure' + i] || '').trim() });
  }
  return {
    nome: m.strMeal,
    ingredientes,
    preparo: (m.strInstructions || '').replace(/\r/g, '').split(/\n+/).map((p) => p.trim()).filter(Boolean)
  };
}

// junta o prato do cardápio (tradução, arte e aula) com o que veio da API
function receitaDoCardapio(item, meal) {
  const original = meal ? originalDaApi(meal) : null;
  const ingredientes = original
    ? original.ingredientes.map((i) => {
      // primeiro o nome exato; depois só o começo ("butter, softened" vira "butter")
      const nome = i.nome.toLowerCase().trim();
      const t = item.ingredientes[nome] || item.ingredientes[nome.split(',')[0].trim()];
      return t ? { nome: t[0], medida: t[1] } : i;
    })
    : Object.values(item.ingredientes).map(([nome, medida]) => ({ nome, medida }));
  return {
    id: 'cardapio-' + item.idApi,
    fonte: 'cardapio',
    nome: item.nome,
    categoria: meal ? traduzirCategoria(meal.strCategory) : 'Variadas',
    origem: meal ? traduzirOrigem(meal.strArea || meal.strCountry) : '',
    arte: item.arte,
    ingredientes,
    preparo: item.preparo,
    passos: item.passos,
    original,
    video: (meal && meal.strYoutube) || '',
    link: (meal && meal.strSource) || ''
  };
}

// busca todos os pratos ao mesmo tempo; se a API falhar, o prato aparece só com a tradução
async function carregarCardapio() {
  const respostas = await Promise.allSettled(CARDAPIO.map((item) => buscarJSON(MEALDB + '/lookup.php?i=' + item.idApi)));
  const receitas = CARDAPIO.map((item, i) => {
    const r = respostas[i];
    return receitaDoCardapio(item, r.status === 'fulfilled' ? listaDeMeals(r.value)[0] : null);
  });
  return { receitas, falhas: respostas.filter((r) => r.status === 'rejected').length };
}
