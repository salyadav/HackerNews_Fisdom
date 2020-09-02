// import { createCard, addPaginationEl, updateNews } from './view';
import Constants from './Constants.js';
import View from './view.js';

let max_page_size;
(() => {
    if (!window.indexedDB) {
        window.alert("Your browser doesn't support a stable version of IndexedDB.")
    }
})();

export const getMaxPageSize = () => max_page_size;
export const getStories = function(url, store) {
    fetch(url)
    .then(res => res.json())
    .then(data => {
        max_page_size = Math.floor(data.length/Constants.PER_PAGE);
        View.addPaginationEl(1, Math.min(max_page_size, 5));
        return _getAllNewsItem(data);
    }).then(res => {
        _storeAllToDB(res, store);
    });
}

const _getAllNewsItem = function(list) {
    return new Promise((resolve, reject) => {
        const responseArr = [];
        for(let i=0; i<list.length; i++) {
            fetch(`https://hacker-news.firebaseio.com/v0/item/${list[i]}.json`)
            .then(res => res.json())
            .then(data => {
                responseArr.push(data);

                //render the first page without delay (before even storing in the db)
                if (responseArr.length===20) {
                    View.updateNews(responseArr);
                }

                if(responseArr.length===list.length) {
                    resolve(responseArr);
                }
            }).catch(err => reject(err));
        }
    });
}

const _storeAllToDB = function(list, store) {
    let db, tx, objectStore;
    const request = window.indexedDB.open(Constants.IDB.STORIES_DB, 1); //creating a new db for each type of news
    request.onerror = () => console.log("db request erroe");
    request.onsuccess = event => {
        db = request.result;
        if(db.objectStoreNames.contains(store)) {
            tx = db.transaction([store], "readwrite");
            objectStore = tx.objectStore(store);
            for (let i in list) {
                objectStore.add(list[i]);
            }            
            tx.oncomplete = () => {
                db.close();
            }

            View.enableSearch();
        } else {
            objectStore = db.createObjectStore(store, {keyPath: "id"});
        }
    };
    request.onupgradeneeded = event => {
        db = event.target.result;
        const objectStore = db.createObjectStore(store, {keyPath: "id"});
        for (let i in list) {
            objectStore.add(list[i]);
        }

        objectStore.createIndex("time", "time", {
            unique: false
        });

        objectStore.createIndex("score", "score", {
            unique: false
        });

        objectStore.createIndex("title", "title", {
            unique: false
        });

        tx.oncomplete = () => {
            db.close();
        }
    }
}

export const readAllFromDB = function(store, offset=0, fromIndex=false, index, reverse=false) {
    const request = window.indexedDB.open(Constants.IDB.STORIES_DB, 1);
    let db, objectStore;
    let count = Constants.PER_PAGE;
    request.onsuccess = () => {
        db = request.result;
        if(db.objectStoreNames.contains(store)) {
            const tx = db.transaction([store], "readonly");
            objectStore = tx.objectStore(store);
            if (fromIndex) {
                objectStore = objectStore.index(index); 
            }
    
            objectStore.getAll().onsuccess = event => {
                const arr = event.target.result;
                let start, end;
                if(!reverse) {
                    start = count*offset;
                    end = start+count;
                    View.updateNews(arr.slice(start, end));
                } else {
                    start = arr.length-count*(offset+1);
                    end = start+count;
                    View.updateNews(arr.slice(start, end));
                }
            }
        } else {
            switch (store) {
                case Constants.STORE.BEST_STORIES_STORE:
                    getStories(Constants.URL.BEST_STORIES_URL, store);
                    break;
                case Constants.STORE.NEW_STORIES_STORE:
                    getStories(Constants.URL.NEW_STORIES_URL, store);
                    break;
                case Constants.STORE.TOP_STORIES_STORE:
                    getStories(Constants.URL.TOP_STORIES_URL, store);
            }
        }
    }
    
    const end = Math.min(max_page_size, offset+5);
    const start = Math.max(1, end-4);
    View.addPaginationEl(start, end);
}

export const searchInDB = function(store, searchString) {
    if(!searchString.length) {
        readAllFromDB(store);
        return;
    }
    const request = window.indexedDB.open(Constants.IDB.STORIES_DB, 1);
    const newsArr = [];
    request.onsuccess = event => {
        const db = request.result;
        const cursor = db.transaction([store], "readonly")
        .objectStore(store)
        .openCursor();

        cursor.onsuccess = e => {
            const cursor = e.target.result;
            if(cursor) {
                const val = cursor.value.title.toLowerCase();
                if(val.startsWith(searchString.toLowerCase())) {
                    newsArr.push(cursor.value);
                }
                cursor.continue();
            } else {
                View.updateNews(newsArr);
            }
        };
    }
}