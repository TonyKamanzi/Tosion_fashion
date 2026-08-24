import mongoose from "mongoose";

// first-run content: mirrors what was hardcoded in the storefront Editorial
export const DEFAULT_EDITORIAL_CONTENT = {
  imageUrl: "https://picsum.photos/id/1062/1600/1000",
  imageAlt: "Editorial lookbook image",
  eyebrow: "The Journal",
  quote:
    "Dressing well isn't about having more — it's about choosing pieces that earn their place.",
  attribution: "— Studio notes, AW26 lookbook",
};

const editorialSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: DEFAULT_EDITORIAL_CONTENT.imageUrl,
    },

    imageAlt: {
      type: String,
      default: DEFAULT_EDITORIAL_CONTENT.imageAlt,
    },

    eyebrow: {
      type: String,
      default: DEFAULT_EDITORIAL_CONTENT.eyebrow,
    },

    quote: {
      type: String,
      default: DEFAULT_EDITORIAL_CONTENT.quote,
    },

    attribution: {
      type: String,
      default: DEFAULT_EDITORIAL_CONTENT.attribution,
    },
  },
  {
    timestamps: true,
  }
);

const EditorialContent = mongoose.model("EditorialContent", editorialSchema);

export default EditorialContent;
