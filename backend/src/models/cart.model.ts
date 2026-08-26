import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
    imageAltUrl: { type: String, default: "" },
    category: {
      label: { type: String, default: "" },
      slug: { type: String, default: "" },
    },
    selectedColor: {
      name: { type: String, default: "" },
      hex: { type: String, default: "" },
    },
    selectedSize: { type: String, default: "" },
    qty: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    saved: [cartItemSchema],
    promo: {
      code: { type: String, default: "" },
      type: { type: String, default: "" },
      value: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
