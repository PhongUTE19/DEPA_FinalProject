import { CONST } from '../config/constant.js';

const paginate = async ({ page = 1, fetch, count }) => {
    const currPage = parseInt(page);
    const offset = (currPage - 1) * CONST.PAGE_ITEMS;

    const [items, total] = await Promise.all([
        fetch(CONST.PAGE_ITEMS, offset),
        count()
    ]);

    const nPages = Math.ceil(total.amount / CONST.PAGE_ITEMS);

    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === currPage
        });
    }

    return {
        items,
        pageNumbers,
        prevPage: currPage - 1,
        nextPage: currPage + 1,
        total: total.amount
    };
};

export default paginate;
