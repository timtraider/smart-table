// заполняет выпадающие списки опциями из индексов
const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
        elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
            const el = document.createElement('option');
            el.textContent = name;
            el.value = name;
            return el;
        }))
    })
}

// применяет фильтрацию 
const applyFiltering = (query, state, action) => {
    
    if (action && action.name === 'clear') {
        const field = action.dataset.field;
        const parent = action.parentElement;
        const input = parent.querySelector('input');
        if (input) {
            input.value = '';
            // отредактировал фильтрацию согласно замечанию
            state[input.name] = '';
        }
    }

    // собираю параметры фильтра — поля формы называются просто seller, customer и т.д.
    const filterFields = ['seller', 'customer', 'date', 'totalFrom', 'totalTo'];
    const filter = {};
    filterFields.forEach(key => {
        if (state[key]) {
           
            filter[`filter[${key}]`] = state[key];
        }
    })

    // если фильтр не пустой — добавляю к query
    return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
}

export function initFiltering(elements) {
    return {
        updateIndexes,
        applyFiltering
    }
}
