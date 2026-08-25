import mongoose from "mongoose";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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

    slug: {
      type: String,
      unique: true,
      lowercase: true,
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

productSchema.pre("save", async function () {
  if (!this.isModified("name") && this.get("slug")) return;

  let candidate = slugify(this.get("name") as string);
  if (!candidate) return;

  const Product = mongoose.model("Product", productSchema);
  let collision = await Product.findOne({ slug: candidate, _id: { $ne: this._id } });
  let suffix = 2;
  while (collision) {
    collision = await Product.findOne({ slug: `${candidate}-${suffix}`, _id: { $ne: this._id } });
    if (collision) suffix++;
    else { candidate = `${candidate}-${suffix}`; break; }
  }
  this.set("slug", candidate);
});

const Product = mongoose.model("Product", productSchema);

export default Product;
