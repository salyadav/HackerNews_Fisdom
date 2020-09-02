export default {
    createCard: function(item) {
        // const date = new Date(item.time);
        // const dateFormat = date.getHours() + ':' + date.getMinutes() 
        //             + ' ' + date.getDate() + '/' + date.getMonth()
        //             + '/' + date.getFullYear();
    
        const el = document.createElement('article');
        el.innerHTML = `
        <a href="${item.url}" target="_blank">
            <h2>${item.title}</h2>
            <p>
                Author: ${item.by}
            </p>
        </a>`;
        el.classList.add('col-4');
        el.classList.add('card');
        return el;
    },

    addPaginationEl: function(start, end) {
        let div;
        const pagination = document.getElementById('pagination');
        pagination.innerHTML="";

        div = document.createElement('div');
        div.classList.add('page');
        div.innerText="<<";
        pagination.appendChild(div);

        for(let i=start; i<=end; i++) {
            div = document.createElement('div');
            div.classList.add('page');
            if (i==start) div.classList.add('highlight-page-number');
            div.innerText=i;
            pagination.appendChild(div);
        }
        
        div = document.createElement('div');
        div.classList.add('page');
        div.innerText=">>";
        pagination.appendChild(div);
    },

    updateNews: function(arr) {
        const news = document.getElementById('news-cards');
        news.innerHTML = "";

        if (!arr.length) {
            news.innerHTML = `<h1>Did we just miss some hot news you were searching for?</h1>`;
            return;
        }
        arr.forEach(val => {
            let el = this.createCard(val);
            news.appendChild(el);
        });
    },

    enableSearch: function() {
        document.getElementById('search').removeAttribute('disabled');
    }
}