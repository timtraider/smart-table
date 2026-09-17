// заполняет поле поиска начальным значением
const updateSearch = (elements, value) => {
    if (elements.search) {
        elements.search.value = value;
    }
}

// применяет поиск — формирует параметр search для запроса на сервер
const applySearching = (query, state, action) => {
    
    if (state.search) {
        query = Object.assign({}, query, { search: state.search });
    }
    return query;
}

export function initSearching(searchField) {
    return {
        updateSearch,
        applySearching
    }
}
