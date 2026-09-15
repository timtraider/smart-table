import {makeIndex} from "./lib/utils.js";

// Внутренняя функция — преобразование исходных данных
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

// пока работает с локальными данными, в будущем попытаюсь заменить на реальные запросы
export function initData(sourceData) {
    const {sellers, customers, data} = initDataInternal(sourceData);

    // Получение индексов (продавцы, покупатели) для формирования выпадающих списков фильтра
    const getIndexes = async () => {
        return { sellers, customers };
    }

    // Получение записей с пагинацией — в будущем думаю здесь нужен HTTP-запрос на сервер
    const getRecords = async () => {
        return {
            total: data.length,
            items: data
        };
    }

    return {
        getIndexes,
        getRecords
    };
}
