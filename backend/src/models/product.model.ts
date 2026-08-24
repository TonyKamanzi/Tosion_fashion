import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    hex: {
      type: String,
      default: "#000000",
      trim: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    // real numeric pricing from here on
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // optional "was" price shown with a strikethrough when set
    compareAtPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    // shown on hover, like the template's alt view swap
    imageAltUrl: {
      type: String,
      default: "",
    },

    imageAlt: {
      type: String,
      default: "",
    },

    // ribbon badge text, e.g. "NEW" (empty = no badge)
    tag: {
      type: String,
      default: "",
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [colorSchema],
      default: [],
    },

    // ties the product to the same categories used by the shop sidebar and
    // the homepage category section
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // required line: powers the navbar Women / Men listings
    department: {
      type: String,
      enum: ["women", "men"],
      required: true,
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
