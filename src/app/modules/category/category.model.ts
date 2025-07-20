import { Schema, model } from 'mongoose';
import { ICategory } from './category.interface';

const CategorySchema = new Schema<ICategory>(
  {
    name: {
       type: String,
       required: true,
       unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'dynamic'
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

const Category = model<ICategory>('Category', CategorySchema);

export default Category;
