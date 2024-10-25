class SearchView {
  _parentElement = document.querySelector('.search');

  // Getting value from search input field
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    this._clearInput();
    return query;
  }

  // Clear input value
  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }

  // Handler for submiting search input
  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }
}

export default new SearchView();
