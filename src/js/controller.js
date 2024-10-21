// Model Imports
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import searchView from './views/searchView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import shoppingListView from './views/shoppingListView.js';
import scheduleView from './views/scheduleView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);
    await model.loadRecipe(id);

    // getting recipe nutrition data from recipe title
    // await model.recipeNutritionData(model.state.recipe.title.split(' ')[0]);

    recipeView.render(model.state.recipe);

    // Getting chart rendered at the end of recipe page load
    // recipeView.generateNutritionChart();
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    const query = searchView.getQuery();

    if (!query) return;

    resultsView.renderSpinner();

    await model.loadSearchResults(query);

    // Render first recipe results
    resultsView.render(model.getSearchResultsPage());

    // Render first pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err.message);
    recipeView.renderError();
  }
};

const controlPagination = function (goTo) {
  // Render NEW recipe results
  resultsView.render(model.getSearchResultsPage(goTo));

  // Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (updateTo) {
  model.updateServings(updateTo);

  // Updating recipe entirely
  recipeView.update(model.state.recipe);
};

const controlBookmarks = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarksStorage = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (addRecipe) {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(addRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function () {
      addRecipeView.closeWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const controlShopList = function () {
  model.addIngredients(model.state.recipe.ingredients);
  // console.log(model.state.recipe.ingredients);

  shoppingListView.render(model.state.ingredientsList);
};

const deleteShopListElement = function (index, length) {
  model.deleteIngredient(index);

  if (length === 0) shoppingListView.renderMessage();
};

const deleteAllShopList = function () {
  model.deleteIngredient(0, model.state.ingredientsList.length);

  shoppingListView.renderMessage();
};

const controlIngredientsStorage = function () {
  // Loading ingredients list from storage
  shoppingListView.render(model.state.ingredientsList);

  // Add event listener at page load
  shoppingListView.addHandlerClearList(deleteAllShopList);
};

// const getDataNutrition = async function () {
//   try {
//     await model.recipeNutritionData('pizza');
//   } catch (err) {
//     console.log(err.message);
//   }
// };
// getDataNutrition();

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarksStorage);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerServingsUpdate(controlServings);
  recipeView.addHandlerBookmark(controlBookmarks);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  recipeView.addHandlerAddToShop(controlShopList);
  shoppingListView.addHandlerDeleteIngredient(deleteShopListElement);
  shoppingListView.addHandlerRender(controlIngredientsStorage);
};
init();
