import icons from 'url:../../img/icons.svg';
import View from './View';
import { mark } from 'regenerator-runtime';
import Fraction from 'fraction.js';

class ShoppingListView extends View {
  _parentElement = document.querySelector('.shop__list');
  _shopButtons = document.querySelector('.shop__btn');
  _shopCountContainer = document.querySelector('.shop__count');
  _message = 'Plan your shopping list here...';
  _errorMessage = 'There is no products...';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  // HTML for SHOPPING list view
  _generateMarkup() {
    return this._generateMarkupShopList().concat(this._generateMarkupButtons());
  }

  // Display for how much ingredients are in SHOPPING list.
  _shopCount(count = 0) {
    this._shopCountContainer.textContent = count;
  }

  // HTML for ingredients list
  _generateMarkupShopList() {
    let html = this._data.reduce((acc, curr) => {
      if (!curr.description.includes(':')) {
        acc += `
            <li>
            <p><span class="remove__ingredient">&#10005;</span><span>${curr.quantity ? new Fraction(curr.quantity).toFraction(true) : ''} ${
          curr.unit
        }</span> ${curr.description}</p>
            <hr />
            </li>`;
      } else acc += '';

      return acc;
    }, '');

    this._shopCount(this._data.length);

    return html;
  }

  // HTML for buttons on SHOPPING list view
  _generateMarkupButtons() {
    return `
        <div class="shop__btn">
            <button class="btn--small recipe__btn shop__btn__clear">
            <span>&#10005;</span>
            <span>Clear list</span>
            </button>
            <button class="btn--small recipe__btn buy--now">
            <svg class="search__icon">
                <use href="${icons}#icon-buy"></use>
            </svg>
            <span>Buy Now</span>
            </button>
        </div>`;
  }

  // Handler for 'Clear List' button
  addHandlerClearList(handler) {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        const btn = e.target.closest('.shop__btn__clear');
        if (!btn) return;

        this._shopCount();
        handler();
      }.bind(this)
    );
  }

  // Handler when 'x' button from one of ingredients is clicked. Delete ingredient itself
  addHandlerDeleteIngredient(handler) {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        const btn = e.target.closest('.remove__ingredient');
        if (!btn) return;

        // Getting ingredient that was clicked
        const item = btn.closest('li');

        const listItems = Array.from(this._parentElement.querySelectorAll('li'));

        // Index of clicked ingredient
        const index = listItems.indexOf(item);

        // Removing that ingredient
        item.remove();

        // Update ingredients number
        const length = this._parentElement.querySelectorAll('li').length;
        this._shopCount(length);

        handler(index, length);
      }.bind(this)
    );
  }
}

export default new ShoppingListView();
