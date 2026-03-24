import categoryModel from '../models/category.model.js';
import courseModel from '../models/course.model.js';
import paginate from '../helpers/pagination.js';
import { CONST } from '../config/constant.js';

const queryList = async ({ categoryId = 0, page = 1 }) => {
    const isAll = categoryId == 0;

    const result = await paginate({
        page,
        fetch: (limit, offset) =>
            isAll
                ? courseModel.findPage(limit, offset)
                : courseModel.findPageByCategory(categoryId, limit, offset),
        count: () =>
            isAll
                ? courseModel.count()
                : courseModel.countByCategory(categoryId)
    });

    let filterName = 'Tất cả khóa học';
    if (!isAll) {
        const category = await categoryModel.findById(categoryId);
        if (category)
            filterName = `Lọc theo lĩnh vực: ${category.name}`;
    }

    return {
        courses: result.items,
        filter: {
            name: filterName,
            categoryId,
            totalText: `Kết quả tìm được: ${result.total}`
        },
        pagination: {
            pageNumbers: result.pageNumbers,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            query: `categoryId=${categoryId}`
        }
    };

};

const queryDetail = async (courseId) => {
    if (!courseId) return null;

    const course = await courseModel.findById(courseId);
    if (!course) return null;

    const courses = await courseModel.findPageByCategory(course.category_id, CONST.PAGE_ITEMS, 0);

    return {
        course,
        courses
    };
};

const querySearch = async (q = '', page = 1) => {
    if (!q) return { q, empty: true };

    const keywords = q.replace(/ /g, ' & ');

    const result = await paginate({
        page,
        fetch: (limit, offset) =>
            courseModel.search(keywords).limit(limit).offset(offset),
        count: () =>
            courseModel.countBySearch(keywords)
    });

    return {
        courses: result.items,
        filter: {
            name: `Lọc theo tìm kiếm: ${q}`,
            totalText: `Kết quả tìm được: ${result.total}`
        },
        pagination: {
            pageNumbers: result.pageNumbers,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            query: `q=${encodeURIComponent(q)}`
        }
    };

};


const findAll = async () => {
    return courseModel.findAll();
};

const findById = async (id) => {
    return courseModel.findById(id);
};

const add = async (data) => {
    const course = {
        name: data.name,
        category_id: data.categoryId,
        short_des: data.shortDes,
        long_des: data.longDes,
    };
    return courseModel.add(course);
};

const edit = async (id, data) => {
    const course = {
        name: data.name,
        category_id: data.categoryId,
        short_des: data.shortDes,
        long_des: data.longDes,
        updated_at: new Date(),
    };
    return courseModel.edit(id, course);
};

const del = async (id) => {
    return courseModel.del(id);
};

export default {
    queryList,
    queryDetail,
    querySearch,
    findAll,
    findById,
    add,
    edit,
    del,
};
