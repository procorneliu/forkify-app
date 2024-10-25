import View from './View.js';
import { MAX_INGREDIENTS } from '../config.js';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _message = 'Recipe was succesefully added.';

  _window = document.querySelector('.add-recipe-window');
  _uploadColumn = document.querySelector('.upload__column');
  _overlay = document.querySelector('.overlay__add-recipe');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn__close--add-recipe');
  _btnAdd = document.querySelector('.add__ingredient');

  constructor() {
    super();
    this._addHandlerShowWindow();
    this._addHandlerCloseWindow();
    this.addHandlerAddIngredient();
  }

  // Show window
  closeWindow() {
    this._window.classList.add('hidden');
    this._overlay.classList.add('hidden');
  }

  // Hide window
  _toggleWindow() {
    this._window.classList.toggle('hidden');
    this._overlay.classList.toggle('hidden');
  }

  // When 'Add Recipe' button is clicked
  _addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this._toggleWindow.bind(this));
  }

  // When 'x' button or space around window is clicked
  _addHandlerCloseWindow() {
    this._btnClose.addEventListener('click', this.closeWindow.bind(this));
    this._overlay.addEventListener('click', this.closeWindow.bind(this));
  }

  // Adding more ingredients input fields to add recipe functionality
  _addNewIngredient() {
    // count of existing ingredients
    const countIng = Array.from(this._parentElement.querySelectorAll('.ingredients')).length;

    // Hide '+' button, if limit of ingredients is passed
    if (countIng + 1 === MAX_INGREDIENTS) this._btnAdd.classList.add('hidden');

    return `
          <label>Ingredient ${countIng + 1}</label>
          <div class="ingredients">
            <input value="" type="number" pattern="[0-9]*" required name="ingredient-${countIng + 1}_quantity" placeholder="Quantity" />
            <select name="ingredient-${countIng + 1}_unit">
              <option selected disabled hidden>Unit</option>
              <option value="gram">Gram</option>
              <option value="milligram">Milligram</option>
              <option value="kilogram">Kilogram</option>
              <option value="ounce">Ounce</option>
              <option value="pound">Pound</option>
              <option value="litre">Litre</option>
              <option value="millilitre">Millilitre</option>
            </select>
            <input value="" type="text" pattern="[A-Za-z]*" required name="ingredient-${
              countIng + 1
            }_description" placeholder="Description" />
          </div>
    `;
  }

  // When '+' button is clicked
  addHandlerAddIngredient() {
    this._btnAdd.addEventListener(
      'click',
      function () {
        this._btnAdd.insertAdjacentHTML('beforebegin', this._addNewIngredient());
      }.bind(this)
    );
  }

  // When 'Upload' button is clicked, get data for uploading to API
  addHandlerUpload(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      // Getting data from entire form
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);

      // Run function of uploading
      handler(data);
    });
  }
}

export default new AddRecipeView();
