/* Menu page — category tabs + live search */
(function () {
  'use strict';

  const sections = Array.from(document.querySelectorAll('.menu-section'));
  const items = Array.from(document.querySelectorAll('.menu-row'));
  const tabs = Array.from(document.querySelectorAll('.menu-tab'));
  const search = document.getElementById('menu-search-input');
  const count = document.getElementById('menu-count');
  const empty = document.getElementById('menu-empty');

  const itemsIn = (section) => Array.from(section.querySelectorAll('.menu-row'));

  let activeCat = 'all';
  let query = '';

  const render = () => {
    let visible = 0;
    sections.forEach((section) => {
      const showSection = activeCat === 'all' || section.dataset.category === activeCat;
      let sectionCount = 0;
      itemsIn(section).forEach((item) => {
        const matches = showSection && (!query || item.textContent.toLowerCase().includes(query));
        item.hidden = !matches;
        if (matches) sectionCount++;
      });
      section.hidden = !showSection || sectionCount === 0;
      visible += sectionCount;
    });
    count.textContent = `Showing ${visible} of ${items.length} dishes`;
    empty.hidden = visible > 0;
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      activeCat = tab.dataset.filter;
      render();
    });
  });

  search.addEventListener('input', () => {
    query = search.value.trim().toLowerCase();
    render();
  });

  render();
})();
