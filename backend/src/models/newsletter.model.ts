import mongoose from "mongoose";

// first-run content: mirrors what was hardcoded in the storefront Newsletter
export const DEFAULT_NEWSLETTER_CONTENT = {
  title: "Get first access to new drops.",
  placeholder: "Your email address",
  buttonLabel: "Subscribe →",
  subscribedLabel: "Subscribed ✓",
};

const newsletterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: DEFAULT_NEWSLETTER_CONTENT.title,
    },

    placeholder: {
      type: String,
      default: DEFAULT_NEWSLETTER_CONTENT.placeholder,
    },

    buttonLabel: {
      type: String,
      default: DEFAULT_NEWSLETTER_CONTENT.buttonLabel,
    },

    subscribedLabel: {
      type: String,
      default: DEFAULT_NEWSLETTER_CONTENT.subscribedLabel,
    },
  },
  {
    timestamps: true,
  }
);

const NewsletterContent = mongoose.model("NewsletterContent", newsletterSchema);

export default NewsletterContent;
