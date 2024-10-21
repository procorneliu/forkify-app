class HeaderView {
  _parentElement = document.querySelector('.header');
  _shopListCount = document.querySelector('.shop__count');

  shopCount(count = 0) {
    this._shopListCount.textContent = count;
  }
}

export default new HeaderView();
