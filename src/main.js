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


// API — прототип будущего API, пока работает с локальными данными
const api = initData(sourceData);


/**
 * Сбор и обработка полей из таблицы
 * @param {HTMLElement} container
 * @returns {Object}
 */
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

// Инициализация компонентов
const tableComponent = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const searchComponent = initSearching(tableComponent.search.container);

const sampleTable = tableComponent;

// инициализация фильтрации (требует асинхронной загрузки данных о продавцах)
// const applyFiltering = initFiltering(sampleTable.filter.elements, {
//     searchBySeller: sellers
// });

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);


const applyPagination = initPagination(
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

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(sampleTable.container); 
    let query = {};

    // result = searchComponent(result, state, action);

    // @todo: применение фильтрации
    // result = applyFiltering(result, state, action);

    // @todo: применение сортировки
    // result = applySorting(result, state, action);

    // @todo: применение пагинации
    // result = applyPagination(result, state, action);

    const { total, items } = await api.getRecords(query);

    sampleTable.render(items);
}

async function init() {
    const indexes = await api.getIndexes();
}

init().then(render);
