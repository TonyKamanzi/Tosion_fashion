import type { Request, Response } from "express";
import Cart from "../models/cart.model.js";

// ==========================
// GET CART (auth required)
// ==========================

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!._id;
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [], saved: [], promo: null });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cart", error });
  }
};

// ==========================
// PUT CART (auth required — full replace)
// ==========================

export const putCart = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!._id;
    const { items, saved, promo } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        items: items || [],
        saved: saved || [],
        promo: promo || null,
      },
      { new: true, upsert: true }
    );

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart", error });
  }
};
