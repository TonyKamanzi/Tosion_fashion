import type { Request, Response } from "express";
import Cart from "../models/cart.model.js";

// map frontend item shape (_id) to server shape (product)
function toServerItem(item: Record<string, unknown>) {
  const { _id, ...rest } = item;
  return { ...rest, product: _id || rest.product };
}

// map server item shape (product) to frontend shape (_id)
function toClientItem(item: Record<string, unknown>) {
  const { product, ...rest } = item;
  return { ...rest, _id: product || item._id };
}

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

    // map server items to client shape
    const cartObj = cart.toObject();
    cartObj.items = cartObj.items.map(toClientItem);
    cartObj.saved = cartObj.saved.map(toClientItem);

    res.status(200).json(cartObj);
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

    const serverItems = (items || []).map(toServerItem);
    const serverSaved = (saved || []).map(toServerItem);

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        items: serverItems,
        saved: serverSaved,
        promo: promo || null,
      },
      { new: true, upsert: true }
    );

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart", error });
  }
};
