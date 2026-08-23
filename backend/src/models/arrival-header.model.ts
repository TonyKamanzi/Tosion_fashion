import mongoose from "mongoose";

// first-run content: mirrors what was hardcoded in the storefront NewArrivals header
export const DEFAULT_ARRIVAL_HEADER = {
  title: "New arrivals",
  description:
    "This week's edit — restocked staples and a few limited runs.",
};

const arrivalHeaderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: DEFAULT_ARRIVAL_HEADER.title,
    },

    description: {
      type: String,
      default: DEFAULT_ARRIVAL_HEADER.description,
    },
  },
  {
    timestamps: true,
  }
);

const ArrivalHeader = mongoose.model("ArrivalHeader", arrivalHeaderSchema);

export default ArrivalHeader;
