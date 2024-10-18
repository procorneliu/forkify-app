import { API_URL, API_2_URL, RES_PER_PAGE, KEY_API_1, KEY_API_2 } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    page: 1,
    resultsPerPage: RES_PER_PAGE,
    results: [],
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY_API_1}`);

    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY_API_1}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * RES_PER_PAGE;
  const end = page * RES_PER_PAGE;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
  });

  state.recipe.servings = newServings;
};

const localStorageBookmarks = function () {
  if (!state.bookmarks) return;
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  localStorageBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);

  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  localStorageBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => {
        return (
          entry[0].startsWith('ingredient') &&
          (entry[0].includes('_quantity') || entry[0].includes('_unit') || entry[0].includes('_description')) &&
          entry[1] !== ''
        );
      })
      .reduce((acc, key) => {
        const match = key[0].match(/ingredient(-\d+)(_quantity|_unit|_description)/);

        const index = match[1].replace('-', '') - 1;
        const type = match[2].replace('_', '');

        if (!acc[index]) acc[index] = { quantity: null, unit: '', description: '' };

        acc[index][type] = key[1];

        return acc;
      }, []);

    // console.log(ingredients);

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${KEY_API_1}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

// export const uploadRecipe = async function (newRecipe) {
//   try {
//     const ingredients = Object.entries(newRecipe)
//       .filter(entry => {
//         entry[0].startsWith('ingredient') && entry[1] !== '';
//         console.log(entry);
//       })
//       .map(ing => {
//         const ingArr = ing[1].split(',').map(el => el.trim());
//         // console.log(ingArr);

//         if (ingArr.length !== 3) throw new Error('Wrong data format. Please enter correct one!');

//         const [quantity, unit, description] = ingArr;

//         return { quantity: quantity ? +quantity : null, unit, description };
//       });
//     const recipe = {
//       title: newRecipe.title,
//       source_url: newRecipe.sourceUrl,
//       image_url: newRecipe.image,
//       publisher: newRecipe.publisher,
//       cooking_time: +newRecipe.cookingTime,
//       servings: +newRecipe.servings,
//       ingredients,
//     };

//     const data = await AJAX(`${API_URL}?key=${KEY_API_1}`, recipe);
//     state.recipe = createRecipeObject(data);
//     addBookmark(state.recipe);
//     // console.log(state.recipe);
//   } catch (err) {
//     throw err;
//   }
// };

export const recipeNutritionData = async function (query) {
  try {
    // Getting recipe id
    const recipeID = await AJAX(`${API_2_URL}recipes/complexSearch?query=${query}&number=1&includeNutrition=true&apiKey=${KEY_API_2}`);

    const id = recipeID.results[0].id;

    // // Search for product nutrients information
    const productData = await AJAX(`${API_2_URL}recipes/${id}/nutritionWidget.json?apiKey=${KEY_API_2}`);

    const nutritionData = {
      calories: productData.calories,
      carbs: productData.carbs,
      fat: productData.fat,
      protein: productData.protein,
      caloricBreakdown: {
        percentCarbs: productData.caloricBreakdown.percentCarbs,
        percentFat: productData.caloricBreakdown.percentFat,
        percentProtein: productData.caloricBreakdown.percentProtein,
      },
    };

    // Save nutrition data in recipe object
    state.recipe.nutrition = nutritionData;
  } catch (err) {
    console.log(err.message);
  }
};
