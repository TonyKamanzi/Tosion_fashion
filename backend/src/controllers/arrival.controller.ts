import type { Request, Response } from "express";
import Arrival, { DEFAULT_ARRIVALS } from "../models/arrival.model.js";
import ArrivalHeader from "../models/arrival-header.model.js";

// text fields the admin is allowed to set via PUT /arrivals/header
const HEADER_EDITABLE_FIELDS = ["title", "description"] as const;

// populate the collection with defaults the first time anything reads it
async function ensureSeeded() {
  const count = await Arrival.countDocuments();
  if (count === 0) {
    await Arrival.insertMany(DEFAULT_ARRIVALS);
  }
}

async function nextOrder(): Promise<number> {
  const last = await Arrival.findOne().sort({ order: -1 });
  return last ? last.order + 1 : 1;
}

// ==========================
// LIST ARRIVALS (public)
// ==========================

export const getArrivals = async (_req: Request, res: Response) => {
  try {
    await ensureSeeded();

    const arrivals = await Arrival.find().sort({ order: 1 });

    res.status(200).json(arrivals);
  } catch (error) {
    console.error("Get arrivals error:", error);

    res.status(500).json({
      message: "Failed to load new arrivals",
    });
  }
};

// ==========================
// GET ARRIVAL HEADER (public)
// ==========================

export const getArrivalHeader = async (_req: Request, res: Response) => {
  try {
    let header = await ArrivalHeader.findOne();

    // first call seeds the singleton so the storefront always has content
    if (!header) {
      header = await ArrivalHeader.create({});
    }

    res.status(200).json(header);
  } catch (error) {
    console.error("Get arrival header error:", error);

    res.status(500).json({
      message: "Failed to load new arrivals header",
    });
  }
};

// ==========================
// UPDATE ARRIVAL HEADER (admin)
// ==========================

export const updateArrivalHeader = async (req: Request, res: Response) => {
  try {
    const updates: Record<string, unknown> = req.body ?? {};

    let header = await ArrivalHeader.findOne();
    if (!header) {
      header = await ArrivalHeader.create({});
    }

    for (const field of HEADER_EDITABLE_FIELDS) {
      const value = updates[field];

      if (typeof value === "string") {
        header.set(field, value.trim());
      }
    }

    await header.save();

    res.status(200).json(header);
  } catch (error) {
    console.error("Update arrival header error:", error);

    res.status(500).json({
      message: "Failed to update new arrivals header",
    });
  }
};

// ==========================
// CREATE ARRIVAL (admin)
// ==========================

export const createArrival = async (req: Request, res: Response) => {
  try {
    const body: Record<string, unknown> = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    const arrival = await Arrival.create({
      name,
      src: typeof body.src === "string" ? body.src.trim() : "",
      alt: typeof body.alt === "string" ? body.alt.trim() : "",
      tag: typeof body.tag === "string" ? body.tag.trim() : "",
      category: typeof body.category === "string" ? body.category.trim() : "",
      price: typeof body.price === "string" ? body.price.trim() : "",
      enabled: body.enabled !== false,
      order: await nextOrder(),
    });

    res.status(201).json(arrival);
  } catch (error) {
    console.error("Create arrival error:", error);

    res.status(500).json({
      message: "Failed to create arrival",
    });
  }
};

// ==========================
// UPDATE ARRIVAL (admin)
// ==========================

export const updateArrival = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Record<string, unknown> = req.body ?? {};

    const arrival = await Arrival.findById(id);
    if (!arrival) {
      return res.status(404).json({
        message: "Arrival not found",
      });
    }

    if (typeof updates.name === "string" && updates.name.trim()) {
      arrival.set("name", updates.name.trim());
    }

    if (typeof updates.src === "string") arrival.set("src", updates.src.trim());
    if (typeof updates.alt === "string") arrival.set("alt", updates.alt.trim());
    if (typeof updates.tag === "string") arrival.set("tag", updates.tag.trim());
    if (typeof updates.category === "string") arrival.set("category", updates.category.trim());
    if (typeof updates.price === "string") arrival.set("price", updates.price.trim());
    if (typeof updates.enabled === "boolean") arrival.set("enabled", updates.enabled);
    if (typeof updates.order === "number" && Number.isFinite(updates.order)) {
      arrival.set("order", updates.order);
    }

    await arrival.save();

    res.status(200).json(arrival);
  } catch (error) {
    console.error("Update arrival error:", error);

    res.status(500).json({
      message: "Failed to update arrival",
    });
  }
};

// ==========================
// DELETE ARRIVAL (admin)
// ==========================

export const deleteArrival = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const arrival = await Arrival.findByIdAndDelete(id);
    if (!arrival) {
      return res.status(404).json({
        message: "Arrival not found",
      });
    }

    res.status(200).json({
      message: "Arrival deleted",
    });
  } catch (error) {
    console.error("Delete arrival error:", error);

    res.status(500).json({
      message: "Failed to delete arrival",
    });
  }
};
