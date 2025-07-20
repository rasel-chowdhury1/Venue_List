import Category from './category.model';
import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import { ICategory } from './category.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const createCategory = async (data: ICategory) => {
  // Check if the category already exists
  const existingCategory = await Category.findOne({ name: data.name });
  if (existingCategory) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Category with this name already exists');
  }

  // Create a new category
  const newCategory = new Category(data);
  await newCategory.save();
  return newCategory;
};

const getAllCategories = async (query: any) => {
  // Fetch all categories
  // return await Category.find({isDeleted: false});

    const categoryQuery = new QueryBuilder(Category.find({isDeleted: false}), query)
      .search(['name'])
      .filter()
      .sort('createdAt')
      .paginate()
      .fields();
 
    const result = await categoryQuery.modelQuery;
    const meta = await categoryQuery.countTotal();
    return { meta, result };
};

const getAllDeltedCategories = async (query: any) => {
  // Fetch all categories
  // return await Category.find({isDeleted: true});

    const categoryQuery = new QueryBuilder(Category.find({isDeleted: true}), query)
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();
 
    const result = await categoryQuery.modelQuery;
    const meta = await categoryQuery.countTotal();
    return { meta, result };
};

const getCategoryById = async (id: string) => {
  // Find category by ID
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return category;
};

const updateCategory = async (id: string, data: Partial<ICategory>) => {
  // Find and update category by ID
  const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true });
  if (!updatedCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return updatedCategory;
};

const recoveryCategory = async (id: string,) => {
  // Find and update category by ID
  const updatedCategory = await Category.findByIdAndUpdate(id, {isDeleted: false}, { new: true });
  if (!updatedCategory) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  // Find and delete category by ID
  const category = await Category.findByIdAndUpdate(id, {isDeleted: true}, {new: true});
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return null;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  recoveryCategory,
  deleteCategory,
  getAllDeltedCategories
};
