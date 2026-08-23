import mongoose from "mongoose";

// first-run content: mirrors what was hardcoded in the storefront Category header
export const DEFAULT_CATEGORY_HEADER = {
  title: "Shop by category",
  description:
    "Three edits, one wardrobe. Built around what you'll actually reach for.",
};

const categoryHeaderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: DEFAULT_CATEGORY_HEADER.title,
    },

    description: {
      type: String,
      default: DEFAULT_CATEGORY_HEADER.description,
    },
  },
  {
    timestamps: true,
  }
);

const CategoryHeader = mongoose.model("CategoryHeader", categoryHeaderSchema);

export default CategoryHeader;
