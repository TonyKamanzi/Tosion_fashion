import mongoose from "mongoose";

// first-run content: mirrors what was hardcoded in the storefront Category section
export const DEFAULT_CATEGORIES = [
  {
    label: "Outerwear",
    slug: "outerwear",
    eyebrow: "01 — Layers",
    imageUrl:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Woman wearing a structured coat",
    order: 1,
  },
  {
    label: "Knitwear",
    slug: "knitwear",
    eyebrow: "02 — Softwear",
    imageUrl:
      "https://images.unsplash.com/photo-1687275167528-5aac76c3e782?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Woman wearing a knit sweater",
    order: 2,
  },
  {
    label: "Accessories",
    slug: "accessories",
    eyebrow: "03 — Details",
    imageUrl:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Fashion accessories and jewelry",
    order: 3,
  },
  {
    label: "Tops",
    slug: "tops",
    eyebrow: "04 — Essentials",
    imageUrl:
      "https://images.unsplash.com/photo-1651383740069-6be2f8e74d87?q=80&w=710&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Woman wearing a white blouse",
    order: 4,
  },
  {
    label: "Dresses",
    slug: "dresses",
    eyebrow: "05 — Silhouettes",
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Woman wearing an elegant dress",
    order: 5,
  },
  {
    label: "Bottoms",
    slug: "bottoms",
    eyebrow: "06 — Foundations",
    imageUrl:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Woman wearing wide-leg trousers",
    order: 6,
  },
];

const categorySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    eyebrow: {
      type: String,
      default: "",
    },

    // intro copy shown on the shop listing page head
    description: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    imageAlt: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
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

const Category = mongoose.model("Category", categorySchema);

export default Category;
