import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
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
    selectedColor: {
      name: { type: String, default: "" },
      hex: { type: String, default: "" },
    },
    selectedSize: { type: String, default: "" },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    shipping: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address1: { type: String, required: true },
      address2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postal: { type: String, required: true },
      country: { type: String, required: true },
    },

    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    promoCode: { type: String, default: "" },
    promoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
