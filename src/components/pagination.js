import {getPages} from "../lib/utils.js";

export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    // не уверен, что правильно, но вроде нужна переменная, чтобы хранить pageCount между вызовами
    let pageCount;

    // эта функция должна формировать параметры для запроса на сервер
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        // тут вроде обрабатываем нажатия кнопок пагинатора
        if (action) switch(action.name) {
            case 'prev': page = Math.max(1, page - 1); break;
            case 'next': page = Math.min(pageCount, page + 1); break;
            case 'first': page = 1; break;
            case 'last': page = pageCount; break;
        }

        // возвращаю новый объект с параметрами limit и page, чтобы не мутировать query
        return Object.assign({}, query, {
            limit,
            page
        });
    }

    // а эта функция должна обновлять UI после того, как данные пришли с сервера
    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);

        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        fromRow.textContent = (page - 1) * limit + 1;
        toRow.textContent = Math.min(page * limit, total);
        totalRows.textContent = total;
    }

    // вроде должны вернуть оба метода
    return {
        updatePagination,
        applyPagination
    };
}
