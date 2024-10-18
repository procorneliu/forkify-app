// Model Imports
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import searchView from './views/searchView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

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
    await model.recipeNutritionData(model.state.recipe.title.split(' ')[0]);

    recipeView.render(model.state.recipe);

    // Getting chart rendered at the end of recipe page load
    recipeView.generateNutritionChart();
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
    console.log(addRecipe);

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
};
init();
