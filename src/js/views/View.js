import icons from 'url:../../img/icons.svg';

export default class View {
  _data;

  /**
   * Render received data to DOM
   * @param {Object | Object[]} data What data should be rendered
   * @param {boolean} render If 'false' return a string
   * @returns {undefined | string} If render=false return string, if not will render to the DOM
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);

    if (!this._parentElement.classList.contains('schedule__list')) return;

    // Adding .draggable__el class to each scheduled meal
    document
      .querySelector('.schedule__list')
      .querySelectorAll('li')
      .forEach(el => el.classList.add('draggable__el'));
  }

  // No need of reloading page. Update view if any data from view are changed.
  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];

      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
        curEl.textContent = newEl.textContent;
      }

      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach(attr => {
          curEl.setAttribute(attr.name, attr.value);
        });
      }
    });

    // Adding .draggable__el class to each scheduled meal
    document
      .querySelector('.schedule__list')
      .querySelectorAll('li')
      .forEach(el => el.classList.add('draggable__el'));
  }

  // Clear view
  _clear() {
    this._parentElement.innerHTML = '';
  }

  // Render load icon
  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Render eror message
  renderError(message = this._errorMessage) {
    const markup = `
        <div class="error">
            <div>
                <svg>
                <use href="${icons}#icon-alert-triangle"></use>
                </svg>
            </div>
        <p>${message}</p>
        </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // Render normal message
  renderMessage(message = this._message) {
    const markup = `
        <div class="message">
            <div>
                <svg>
                <use href="${icons}#icon-smile"></use>
                </svg>
            </div>
        <p>${message}</p>
        </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
