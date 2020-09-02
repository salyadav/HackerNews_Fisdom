
import './style/style.scss';
import { getStories, readAllFromDB, searchInDB, getMaxPageSize } from './store.js';
import Constants from './Constants.js';

// top
(function() {
    getStories(Constants.URL.TOP_STORIES_URL, Constants.STORE.TOP_STORIES_STORE);
})();
// new
// getStories("https://hacker-news.firebaseio.com/v0/newstories.json", Constants.STORE.NEW_STORIES_STORE);
// best
// getStories("https://hacker-news.firebaseio.com/v0/beststories.json", Constants.STORE.BEST_STORIES_STORE);

const searchInIDB = function() {
    const searchString = document.getElementById('search').value;
    const store = document.querySelector("ul[data-selected]").dataset.selected;
    document.getElementById('pagination').innerHTML = "";
    document.getElementById('news-cards').innerHTML = "";
    searchInDB(store, searchString);
}

//DEBOUCING SEARCH FOR 800ms PAUSE
document.getElementById('search').oninput = (function(callback, limit) {
    let timer = null;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(()=> callback(), limit);
    }
})(searchInIDB, 800);

const pageChange = function(e) {
    let page = e.target.innerText;
    const pageList = document.getElementsByClassName('page');
    if(page==="<<") {
        if(+pageList[1]===1) return;
        page = +pageList[1].innerText-5;
        if(page<1) 
            page = 1;
    } else if(page===">>") {
        if(+pageList[pageList.length-2]===getMaxPageSize()) return;
        page = +pageList[pageList.length-2].innerText+1;
        if (page>getMaxPageSize()) 
            page = getMaxPageSize();
    } else if(isNaN(+page)) {
        return;
    }

    const store = document.querySelector("ul[data-selected]").dataset.selected;
    const order = document.getElementById('sort-direction').dataset.order === "asc" ? false : true;
    const sortBy = document.getElementById('sortlist').value;
    readAllFromDB(store, +page-1, true, sortBy, order);
}

document.getElementById('pagination').onclick = pageChange;

const onSortOrderChange = function(e) {
    const target = e.target;
    const dataTarget = document.getElementById('sort-direction');
    const order = dataTarget.dataset.order;
    const sortBy = document.getElementById('sortlist').value;

    if(order === 'asc') {
        target.classList.remove('fa-arrow-up');
        target.classList.add('fa-arrow-down');
        dataTarget.setAttribute('data-order', 'desc');
    } else {
        target.classList.remove('fa-arrow-down');
        target.classList.add('fa-arrow-up');
        dataTarget.setAttribute('data-order', 'asc');
    }
    _sortList(sortBy, dataTarget.dataset.order);
}

document.getElementById('sort-direction').onclick = onSortOrderChange;

const onSortByChange = function(e) {
    const sortBy = e.target.value;
    const order = document.getElementById('sort-direction').dataset.order;
    _sortList(sortBy, order);
}

document.getElementById('sortlist').onchange = onSortByChange;

const _sortList = function(sortBy, order) {
    const store = document.querySelector("ul[data-selected]").dataset.selected;
    const page = document.querySelector(".highlight-page-number").innerText;
    const reverse = order === "asc" ? false : true;
    readAllFromDB(store, +page-1, true, sortBy, reverse);
}