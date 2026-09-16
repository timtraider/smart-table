import './fonts/ys-display/fonts.css'
import './style.css'
import {data as sourceData} from "./data/dataset_1.js";
import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";
import {initTable} from "./components/table.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";
import {initPagination} from "./components/pagination.js";


// API, пока что он работает с локальными данными
const api = initData(sourceData);


// собирает состояние полей из формы
function collectState(container) {
    const state = processFormData(new FormData(container));
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;    
    const page = parseInt(state.page) || 1;                   

    return {                                         
        ...state,
        rowsPerPage,
        page
    };
}

// инициализирую компоненты таблицы
const tableComponent = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const {applySearching} = initSearching(tableComponent.search.container);

const sampleTable = tableComponent;

// вроде как инициализация фильтрации
const {applyFiltering, updateIndexes} = initFiltering(sampleTable.filter.elements);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);


const {applyPagination, updatePagination} = initPagination(
    sampleTable.pagination.elements,             
    (el, page, isCurrent) => {                    
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// должна перерисовывать таблицу при любых изменениях
async function render(action) {
    
    let state = collectState(sampleTable.container); 
    // сюда буду собирать параметры для запроса на сервер, пока пустой объект
    let query = {};

    // применяю поиск
    query = applySearching(query, state, action);

    // применяю фильтрацию
    query = applyFiltering(query, state, action);

    // применение сортировки
    // result = applySorting(result, state, action);

    // добавляю к query параметры пагинации — страница и количество строк
    query = applyPagination(query, state, action);

    // жду данные с сервера, передаю собранный query
    const { total, items } = await api.getRecords(query); 

    // обновляю UI пагинатора — номер страницы и строки
    updatePagination(total, query); 
    
    sampleTable.render(items);
}

// загружаю индексы, а потом уже рендерить
async function init() {
    const indexes = await api.getIndexes();

    // заполняю селект продавцами
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

init().then(render);
