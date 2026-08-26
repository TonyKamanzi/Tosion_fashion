import type { Request, Response } from "express";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// ==========================
// DASHBOARD STATS
// GET /admin/stats
// ==========================

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // this month stats
    const thisMonthOrders = await Order.find({
      createdAt: { $gte: thisMonthStart },
      status: { $ne: "cancelled" },
    });

    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const thisMonthOrderCount = thisMonthOrders.length;

    // last month stats
    const lastMonthOrders = await Order.find({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      status: { $ne: "cancelled" },
    });

    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0);
    const lastMonthOrderCount = lastMonthOrders.length;

    // customer count
    const totalCustomers = await User.countDocuments({ role: "user" });
    const lastMonthCustomers = await User.countDocuments({
      role: "user",
      createdAt: { $lte: lastMonthEnd },
    });
    const thisMonthCustomers = totalCustomers - lastMonthCustomers;

    // deltas
    const revenueDelta = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
      : thisMonthRevenue > 0 ? 100 : 0;

    const orderDelta = lastMonthOrderCount > 0
      ? Math.round(((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 1000) / 10
      : thisMonthOrderCount > 0 ? 100 : 0;

    const customerDelta = lastMonthCustomers > 0
      ? Math.round((thisMonthCustomers / lastMonthCustomers) * 1000) / 10
      : thisMonthCustomers > 0 ? 100 : 0;

    // conversion: orders / customers (rough)
    const conversion = totalCustomers > 0
      ? Math.round((thisMonthOrderCount / totalCustomers) * 1000) / 10
      : 0;
    const lastConversion = lastMonthCustomers > 0
      ? Math.round((lastMonthOrderCount / lastMonthCustomers) * 1000) / 10
      : 0;
    const conversionDelta = Math.round((conversion - lastConversion) * 10) / 10;

    // pending orders count (for sidebar badge)
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    res.status(200).json({
      revenue: { value: thisMonthRevenue, delta: revenueDelta },
      orders: { value: thisMonthOrderCount, delta: orderDelta },
      customers: { value: totalCustomers, delta: customerDelta },
      conversion: { value: conversion, delta: conversionDelta },
      pendingOrders,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error });
  }
};

// ==========================
// REVENUE CHART (last 8 weeks)
// GET /admin/revenue-chart
// ==========================

export const getRevenueChart = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const weeks: { label: string; start: Date; end: Date }[] = [];

    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      weeks.push({
        label: `W${8 - i}`,
        start,
        end,
      });
    }

    const data = await Promise.all(
      weeks.map(async (week) => {
        const orders = await Order.find({
          createdAt: { $gte: week.start, $lte: week.end },
          status: { $ne: "cancelled" },
        });
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        return { label: week.label, revenue, orderCount: orders.length };
      })
    );

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

    const chart = data.map((d) => ({
      label: d.label,
      revenue: d.revenue,
      orderCount: d.orderCount,
      height: Math.round((d.revenue / maxRevenue) * 100),
    }));

    // highlight the most recent week
    const last = chart[chart.length - 1];
    if (last) {
      last.height = Math.max(last.height, 5);
    }

    res.status(200).json({ items: chart });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch revenue chart", error });
  }
};

// ==========================
// TOP PRODUCTS
// GET /admin/top-products
// ==========================

export const getTopProducts = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find({ status: { $ne: "cancelled" } });

    // aggregate by product name
    const productMap = new Map<string, { name: string; slug: string; imageUrl: string; sold: number; revenue: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const key = item.name;
        const existing = productMap.get(key);
        if (existing) {
          existing.sold += item.qty;
          existing.revenue += item.price * item.qty;
        } else {
          productMap.set(key, {
            name: item.name,
            slug: item.slug,
            imageUrl: item.imageUrl,
            sold: item.qty,
            revenue: item.price * item.qty,
          });
        }
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // calculate deltas (simplified — compare to a rough average)
    const avgSold = topProducts.length > 0
      ? topProducts.reduce((s, p) => s + p.sold, 0) / topProducts.length
      : 0;

    const items = topProducts.map((p) => ({
      ...p,
      delta: avgSold > 0 ? Math.round(((p.sold - avgSold) / avgSold) * 100) : 0,
    }));

    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top products", error });
  }
};

// ==========================
// CUSTOMERS LIST
// GET /admin/customers
// ==========================

export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });

    const customers = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({ user: u._id, status: { $ne: "cancelled" } });
        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
        return {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          createdAt: u.createdAt,
          orderCount: orders.length,
          totalSpent,
        };
      })
    );

    res.status(200).json({ items: customers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers", error });
  }
};
