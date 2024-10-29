// Imports
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
import { Calendar } from 'fullcalendar/index.js';
import { Chart } from 'chart.js/auto';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { clearCanvas } from 'chart.js/helpers';

// Hot module, reloading changes on page without page reload
if (module.hot) {
  module.hot.accept();
}

// Loading current recipe view
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    recipeView.renderSpinner();

    // Displaying any change on result view section
    resultsView.update(model.getSearchResultsPage());
    // Displaying any changes on bookmarks
    bookmarksView.update(model.state.bookmarks);
    await model.loadRecipe(id);
    // Displaying any changes on schedules
    scheduleView.update(model.state.schedules);

    // Getting recipe nutrition data from recipe title
    await model.recipeNutritionData(model.state.recipe.title.split(' ')[0]);

    // Rendering current recipe to the page
    recipeView.render(model.state.recipe);

    // Getting chart rendered at the end of recipe page load
    recipeView.generateNutritionChart();
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};

// When user search recipe
const controlSearchResults = async function () {
  try {
    // Getting value from search input field
    const query = searchView.getQuery();

    if (!query) return;

    resultsView.renderSpinner();

    // Loading asynchronous all result for 'query' value
    await model.loadSearchResults(query);

    // Render first page of recipe results
    resultsView.render(model.getSearchResultsPage());

    // Render first pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err.message);
    recipeView.renderError();
  }
};

// When clicking pagination buttons
const controlPagination = function (goTo) {
  // Render NEW recipe results
  resultsView.render(model.getSearchResultsPage(goTo));

  // Render NEW pagination buttons
  paginationView.render(model.state.search);
};

// When servings are changed
const controlServings = function (updateTo) {
  // Changing servings in 'state' data object
  model.updateServings(updateTo);

  // Updating recipe entirely
  recipeView.update(model.state.recipe);
};

// When bookmark button from recipe is clicked
const controlBookmarks = function () {
  // checking if recipe is already bookmarked
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

// Load all bookmarked recipes to the list when page is loaded
const controlBookmarksStorage = function () {
  bookmarksView.render(model.state.bookmarks);
};

// When schedule button from recipe is clicked
const controlSchedules = function () {
  // checking if recipe is already scheduled
  if (!model.state.recipe.scheduled) model.addSchedule(model.state.recipe);
  else model.deleteSchedule(model.state.recipe.id);

  recipeView.update(model.state.recipe);
  scheduleView.render(model.state.schedules);
};

// Removing all schedules, when 'Clear List' below schedules list in clicked
const controlClearScheduleList = function () {
  // Remove schedules from user view and display erro message
  scheduleView.renderError();

  // Removing schedules from 'state' and local storage
  model.clearAllSchedules();
};

// Load all scheduled recipes to the list when page is loaded
const controlSchedulesStorage = function () {
  scheduleView.render(model.state.schedules);
};

// When recipe is dropped on calendar
const controlCalendarDrop = function (event) {
  const eventID = event.draggedEl.children[0].attributes[1].value.slice(1);

  // Adding event/recipe to 'state' in 'events'
  model.addEvent(event);
  // Remove recipe from MEALS  LIST
  event.draggedEl.parentNode.removeChild(event.draggedEl);

  // Remove schedule from 'state'
  model.deleteSchedule(eventID);

  // Saving events to local storage
  model.controlLocalStorage(model.state.events, 'events');
};

// When event position on calendar is changed, save new data in 'state' and local storage
const controlEventChange = function (event) {
  model.updateEvent(event);
};

// Adding new recipe to API
const controlAddRecipe = async function (addRecipe) {
  try {
    addRecipeView.renderSpinner();

    // Upload asynchronous recipe to API
    await model.uploadRecipe(addRecipe);

    // Render that recipe to current page
    recipeView.render(model.state.recipe);

    // Show successfully message of loaded recipe
    addRecipeView.renderMessage();

    // Adding your own recipes as bookmarked
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // After certain time close add recipe window
    setTimeout(function () {
      addRecipeView.closeWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

// When "Add To Shopping List" button is clicked from recipe view
const controlShopList = function () {
  // Add all ingredients to 'state'
  model.addIngredients(model.state.recipe.ingredients);

  // Displaying ingredients in SHOPPING LIST
  shoppingListView.render(model.state.ingredientsList);
};

// Delete one ingredient from SHOPPING LIST
const deleteShopListElement = function (index, length) {
  model.deleteIngredient(index);

  if (length === 0) shoppingListView.renderMessage();
};

// When 'Clear List' is clicked, Delete ALL ingredients from SHOPPING LIST
const deleteAllShopList = function () {
  model.deleteIngredient(0, model.state.ingredientsList.length);

  shoppingListView.renderMessage();
};

// Load ingredients from local storage when page is loaded
const controlIngredientsStorage = function () {
  // Loading ingredients list from storage
  shoppingListView.render(model.state.ingredientsList);

  // Add event listener at page load
  shoppingListView.addHandlerClearList(deleteAllShopList);
};

// Calling function from model.js to remove item from local storage
const removeLocalStorageItem = function (item) {
  model.removeStorage(item);
};

/**
 * When page is loaded render calendar using current data
 * @param controlCalendarDrop - function(), when an event is dropped on calendar.
 * @param controlEventChange - function(), when event position is changed on calendar.
 * @param removeLocalStorageItem - function(), when clicking button "Delete All Event" to remove all events and from local storage too.
 * @param model.state.events - path/, getting events that are stored in 'state' to display them on calendar
 */
const controlCalendarEventsStorage = function () {
  scheduleView.renderCalendar(controlCalendarDrop, controlEventChange, removeLocalStorageItem, model.state.events);
};

// Initialization function
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarksStorage);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerServingsUpdate(controlServings);
  recipeView.addHandlerBookmark(controlBookmarks);
  recipeView.addHandlerSchedule(controlSchedules);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  recipeView.addHandlerAddToShop(controlShopList);
  shoppingListView.addHandlerDeleteIngredient(deleteShopListElement);
  shoppingListView.addHandlerRender(controlIngredientsStorage);
  scheduleView.addHandlerRender(controlSchedulesStorage);
  scheduleView.addHandlerRender(controlCalendarEventsStorage);
  scheduleView.addHandlerClearList(controlClearScheduleList);
};
init();
