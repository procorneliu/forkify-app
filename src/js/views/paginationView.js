import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  // When buttons from pagination is clicked, go to prev/next page
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goTo = btn.dataset.goto;
      handler(goTo);
    });
  }

  // Generating pagination view
  _generateMarkup() {
    const curPage = +this._data.page;
    const numPages = Math.ceil(this._data.results.length / this._data.resultsPerPage);

    // page 1, there is other pages
    if (curPage === 1 && numPages > 1) return this._generatePagesCount(curPage, numPages).concat(this._generateMarkupNext(curPage));

    // last page
    if (curPage === numPages && numPages > 1) return this._generateMarkupPrev(curPage).concat(this._generatePagesCount(curPage, numPages));

    // other page
    if (curPage > 1)
      return this._generateMarkupPrev(curPage)
        .concat(this._generatePagesCount(curPage, numPages))
        .concat(this._generateMarkupNext(curPage));

    // no more pages
    return '';
  }

  // HTML  for previous button
  _generateMarkupPrev(curPage) {
    return `
            <button data-goto="${curPage - 1}" class="btn--inline pagination__btn--prev">
                <svg class="search__icon">
                    <use href="${icons}#icon-arrow-left"></use>
                </svg>
                <span>Page ${curPage - 1}</span>
            </button>
        `;
  }

  // HTML for next button
  _generateMarkupNext(curPage) {
    return `
            <button data-goto="${curPage + 1}" class="btn--inline pagination__btn--next">
                <span>Page ${curPage + 1}</span>
                <svg class="search__icon">
                    <use href="${icons}#icon-arrow-right"></use>
                </svg>
            </button>
        `;
  }

  // HTML for pages count
  _generatePagesCount(curPage, totalPages) {
    return `
            <div>
                <h2 class="pages__number">${curPage}/${totalPages}</h2>
            </div> 
    `;
  }
}

export default new PaginationView();
