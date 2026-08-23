import mongoose from "mongoose";

// first-run content: mirrors what was hardcoded in the storefront NewArrivals section
export const DEFAULT_ARRIVALS = [
  {
    src: "https://images.unsplash.com/photo-1669575903350-9a349b411810?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Model wearing a structured wool coat",
    tag: "NEW",
    name: "Wool Overcoat",
    category: "Outerwear",
    price: "$328",
    order: 1,
  },
  {
    src: "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Model wearing a textured knit sweater",
    tag: "",
    name: "Ribbed Knit Sweater",
    category: "Knitwear",
    price: "$148",
    order: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1624378441864-6eda7eac51cb?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Model wearing tailored trousers",
    tag: "−20%",
    name: "Tailored Trousers",
    category: "Bottoms",
    price: "$168",
    order: 3,
  },
  {
    src: "https://images.unsplash.com/photo-1575403538007-acb790100421?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Elegant fashion accessories and jewelry",
    tag: "",
    name: "Leather Crossbody",
    category: "Accessories",
    price: "$212",
    order: 4,
  },
];

const arrivalSchema = new mongoose.Schema(
  {
    // image
    src: {
      type: String,
      default: "",
    },

    alt: {
      type: String,
      default: "",
    },

    // badge shown on the image corner, e.g. "NEW" or "−20%" (empty = no badge)
    tag: {
      type: String,
      default: "",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "",
    },

    // display string, e.g. "$328"
    price: {
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

const Arrival = mongoose.model("Arrival", arrivalSchema);

export default Arrival;
