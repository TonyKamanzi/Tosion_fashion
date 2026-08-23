import mongoose from "mongoose";

export type MarqueeItem = {
  text: string;
  enabled: boolean;
};

// first-run content: mirrors what was hardcoded in the storefront Hero
export const DEFAULT_HERO_CONTENT = {
  imageUrl: "https://picsum.photos/id/1027/1200/1400/",
  imageAlt: "Model wearing new season outerwear",
  badge: "In stock — ships in 48h",
  eyebrow: "Autumn / Winter 2026",
  headlinePre: "Cut for",
  headlineItalic: "quiet",
  headlinePost: "confidence.",
  description:
    "Considered silhouettes in natural fibres, made in small batches. Fewer pieces, worn longer.",
  ctaLabel: "Shop the collection",
  ctaHref: "#collection",
  marqueeItems: [
    { text: "FREE SHIPPING OVER $150", enabled: true },
    { text: "NEW ARRIVALS WEEKLY", enabled: true },
    { text: "MADE TO LAST", enabled: true },
    { text: "EASY 30-DAY RETURNS", enabled: true },
  ] as MarqueeItem[],
};

const marqueeItemSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const heroSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: DEFAULT_HERO_CONTENT.imageUrl,
    },

    imageAlt: {
      type: String,
      default: DEFAULT_HERO_CONTENT.imageAlt,
    },

    badge: {
      type: String,
      default: DEFAULT_HERO_CONTENT.badge,
    },

    eyebrow: {
      type: String,
      default: DEFAULT_HERO_CONTENT.eyebrow,
    },

    headlinePre: {
      type: String,
      default: DEFAULT_HERO_CONTENT.headlinePre,
    },

    headlineItalic: {
      type: String,
      default: DEFAULT_HERO_CONTENT.headlineItalic,
    },

    headlinePost: {
      type: String,
      default: DEFAULT_HERO_CONTENT.headlinePost,
    },

    description: {
      type: String,
      default: DEFAULT_HERO_CONTENT.description,
    },

    ctaLabel: {
      type: String,
      default: DEFAULT_HERO_CONTENT.ctaLabel,
    },

    ctaHref: {
      type: String,
      default: DEFAULT_HERO_CONTENT.ctaHref,
    },

    marqueeItems: {
      type: [marqueeItemSchema],
      default: () => DEFAULT_HERO_CONTENT.marqueeItems.map((item) => ({ ...item })),
    },
  },
  {
    timestamps: true,
  }
);

const HeroContent = mongoose.model("HeroContent", heroSchema);

export default HeroContent;
