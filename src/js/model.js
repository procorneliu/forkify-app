import { LineController } from 'chart.js';
import { API_URL, API_2_URL, RES_PER_PAGE, KEY_API_1, KEY_API_2 } from './config.js';
import { AJAX } from './helpers.js';

// Here is sorted all DATES
export const state = {
  recipe: {},
  search: {
    query: '',
    page: 1,
    resultsPerPage: RES_PER_PAGE,
    results: [],
  },
  bookmarks: [],
  ingredientsList: [],
  schedules: [],
  events: [],
};

// Make data of create recipe more structured
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

// Load recipe view when clicking certain recipe from search results view
export const loadRecipe = async function (id) {
  try {
    // Fetching data
    const data = await AJAX(`${API_URL}${id}?key=${KEY_API_1}`);

    state.recipe = createRecipeObject(data);

    // check if recipe is bookmarked
    if (state.bookmarks.some(bookmark => bookmark.id === id)) state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    // check if recipe is scheduled
    if (state.schedules.some(schedule => schedule.id === id)) state.recipe.scheduled = true;
    else state.recipe.scheduled = false;
  } catch (err) {
    throw err;
  }
};

// When searching for recipe in search field
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

// Data for pagination functionality: current page / all existing pages
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * RES_PER_PAGE;
  const end = page * RES_PER_PAGE;

  return state.search.results.slice(start, end);
};

// Recalculate ingredients from servings
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * (newServings / state.recipe.servings);
  });

  state.recipe.servings = newServings;
};

// Add recipe to bookmarks
export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  // Saving to local storage
  controlLocalStorage(state.bookmarks, 'bookmarks');
};

// Delete recipe from bookmarks
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);

  state.bookmarks.splice(index, 1);

  if (id === state.recipe.id) state.recipe.bookmarked = false;

  // Saving to local storage
  controlLocalStorage(state.bookmarks, 'bookmarks');
};

// Add schedule to MEALS LIST
export const addSchedule = function (recipe) {
  state.schedules.push(recipe);

  if (recipe.id === state.recipe.id) state.recipe.scheduled = true;

  // Saving to local storage
  controlLocalStorage(state.schedules, 'schedules');
};

// Delete schedule from MEALS LIST
export const deleteSchedule = function (id) {
  const index = state.schedules.findIndex(el => el.id === id);

  state.schedules.splice(index, 1);

  if (id === state.recipe.id) state.recipe.scheduled = false;

  // Saving to local storage
  controlLocalStorage(state.schedules, 'schedules');
};

// Adding new recipe ingredients to SHOPPING list
export const addIngredients = function (ingredients) {
  ingredients.forEach(ing => {
    const existingElement = state.ingredientsList.find(el => el.description === ing.description);

    // If ingredient already exist, add quantity to existing one
    if (existingElement) {
      existingElement.quantity += ing.quantity;
    } else state.ingredientsList.push({ ...ing });
  });

  // Saving to local storage
  controlLocalStorage(state.ingredientsList, 'ingredients');
};

/**
 * Removing ingredients from shopping list
 * @param {Number} index - Removing from what ingredient
 * @param {Number} lastIndex - How much ingredients delete. This param is default 1 to delete one ingredient, but can also be used to delete all ingredients
 */
export const deleteIngredient = function (index, lastIndex = 1) {
  state.ingredientsList.splice(index, lastIndex);

  // Saving to local storage
  controlLocalStorage(state.ingredientsList, 'ingredients');
};

// Adding new event to 'state' when dropping on calendar
export const addEvent = function (event) {
  const eventID = Date.now().toString();
  const eventHash = event.draggedEl.children[0].attributes[1].value;

  state.events.push({
    title: event.draggedEl.innerText.trim(),
    id: eventID,
    start: event.dateStr,
    extendedProps: {
      url: eventHash,
    },
  });
};

// Updating event data, when position on calendar is changhed
export const updateEvent = function (event) {
  const eventID = event.event.id;
  const index = state.events.findIndex(ev => ev.id === eventID);

  if (index < 0) return;

  // Save event, but 'start' property is changed
  const changedEvent = {
    title: event.event.title,
    id: event.event.id,
    start: event.event.start.toISOString().split('T')[0],
  };

  // Saving event is same place, with new 'start' property
  state.events[index] = changedEvent;

  // Saving to local storage
  controlLocalStorage(state.events, 'events');
};

// Remove all schedules and saving to localStorage
export const clearAllSchedules = function () {
  state.schedules = [];

  // Saving to local storage
  controlLocalStorage(state.schedules, 'schedules');
};

export const getEvents = function () {
  return state.events;
};

/**
 * Uploading recipe from 'Add Recipe' functionality to API
 * @param {{Object}} newRecipe - Recipe to add
 */
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

// Getting nutriotion data to calculate: CALORIES, CARBS, FAT and PROTEIN
export const recipeNutritionData = async function (query) {
  try {
    // Getting recipe id
    const recipeID = await AJAX(`${API_2_URL}recipes/complexSearch?query=${query}&number=1&includeNutrition=true&apiKey=${KEY_API_2}`);

    const id = recipeID.results[0].id;

    // // Search for product nutrients information
    const productData = await AJAX(`${API_2_URL}recipes/${id}/nutritionWidget.json?apiKey=${KEY_API_2}`);

    // Saving in structured format, only necesary data
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

/**
 *
 * @param {Object.path} path - Path to object 'state' that will be stored
 * @param {string} storageItem - Path destination in string format
 * @returns
 */
export const controlLocalStorage = function (path, storageItem) {
  if (!path) return;
  localStorage.setItem(storageItem, JSON.stringify(path));
};

// Remove a certain item from local storage
export const removeStorage = function (item) {
  localStorage.removeItem(item);
};

// Initialization function
// Getting and render dates saved in local storage
const init = function () {
  const storageBookmarks = localStorage.getItem('bookmarks');
  const storageIngredients = localStorage.getItem('ingredients');
  const storageSchedules = localStorage.getItem('schedules');
  const storageEvents = localStorage.getItem('events');

  if (storageBookmarks) state.bookmarks = JSON.parse(storageBookmarks);
  if (storageIngredients) state.ingredientsList = JSON.parse(storageIngredients);
  if (storageSchedules) state.schedules = JSON.parse(storageSchedules);
  if (storageEvents) state.events = JSON.parse(storageEvents);
};
init();
