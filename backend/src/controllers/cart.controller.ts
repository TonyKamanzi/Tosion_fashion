import type { Request, Response } from "express";
import Cart from "../models/cart.model.js";

// ==========================
// Types
// ==========================

type ClientCartItem = {
  _id: unknown;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  imageAltUrl: string;
  category?: {
    label: string;
    slug: string;
  } | null;
  selectedColor?: {
    name: string;
    hex: string;
  } | null;
  selectedSize: string;
  qty: number;
};

type ServerCartItem = {
  product: unknown;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  imageAltUrl: string;
  category?: {
    label: string;
    slug: string;
  } | null;
  selectedColor?: {
    name: string;
    hex: string;
  } | null;
  selectedSize: string;
  qty: number;
};

// ==========================
// Convert frontend item -> server item
// Frontend uses _id
// Server uses product
// ==========================

function toServerItem(item: ClientCartItem): ServerCartItem {
  return {
    product: item._id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    imageUrl: item.imageUrl || "",
    imageAltUrl: item.imageAltUrl || "",
    category: item.category || null,
    selectedColor: item.selectedColor || null,
    selectedSize: item.selectedSize || "",
    qty: item.qty || 1,
  };
}

// ==========================
// Convert server item -> frontend item
// Server uses product
// Frontend uses _id
// ==========================

function toClientItem(item: {
  product: unknown;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  imageAltUrl: string;
  category?: {
    label: string;
    slug: string;
  } | null;
  selectedColor?: {
    name: string;
    hex: string;
  } | null;
  selectedSize: string;
  qty: number;
}): ClientCartItem {
  return {
    _id: item.product,
    name: item.name,
    slug: item.slug,
    price: item.price,
    imageUrl: item.imageUrl,
    imageAltUrl: item.imageAltUrl,
    category: item.category,
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
    qty: item.qty,
  };
}

// ==========================
// GET CART
// ==========================

export const getCart = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.session.user!._id;

    let cart = await Cart.findOne({
      user: userId,
    });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        saved: [],
        promo: null,
      });
    }

    const cartObj = cart.toObject();

    const items = cartObj.items.map((item) =>
      toClientItem(item)
    );

    const saved = cartObj.saved.map((item) =>
      toClientItem(item)
    );

    res.status(200).json({
      ...cartObj,
      items,
      saved,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      message: "Failed to fetch cart",
      error,
    });
  }
};

// ==========================
// PUT CART
// Full replace
// ==========================

export const putCart = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.session.user!._id;

    const {
      items = [],
      saved = [],
      promo,
    } = req.body;

    const serverItems: ServerCartItem[] =
      items.map((item: ClientCartItem) =>
        toServerItem(item)
      );

    const serverSaved: ServerCartItem[] =
      saved.map((item: ClientCartItem) =>
        toServerItem(item)
      );

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        items: serverItems,
        saved: serverSaved,
        promo: promo || null,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json(cart);
  } catch (error) {
    console.error("Put cart error:", error);

    res.status(500).json({
      message: "Failed to update cart",
      error,
    });
  }
};