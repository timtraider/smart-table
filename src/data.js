import {makeIndex} from "./lib/utils.js";

// добавил адрес сервера, чтобы потом делать к нему запросы
const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

function initDataInternal(sourceData) {
    const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
    const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
    const data = sourceData.purchase_records.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));
    return {sellers, customers, data};
}

// теперь initData должна возвращать не данные, а объект с функциями 
export function initData(sourceData) {
    // переменные для кеширования данных
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

    // преобразует записи с сервера в формат, который ждёт таблица
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    // запрашивает продавцов и покупателей, чтобы заполнить фильтры
    const getIndexes = async () => {
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return { sellers, customers };
    }

    // запрашивает записи о продажах с параметрами (пагинация, сортировка и т.д.)
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        // если запрос такой же, как предыдущий — возвращаю кеш
        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}
