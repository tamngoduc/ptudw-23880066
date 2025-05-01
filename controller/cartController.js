"use strict";

const { Cart, Product } = require("../models");

// add product to cart API - receive product id and quantity from client
// store cart
const add = async (req, res) => {
  const id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);
  const quantity = isNaN(req.body.quantity) ? 0 : parseInt(req.body.quantity);
  const product = await Product.findByPk(id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  const cart = req.session.cart;
  cart.add(product, quantity);
  return res.json({ quantity: cart.quantity });
};

const show = async (req, res) => {
  res.locals.cart = req.session.cart.getCart();
  return res.render("cart");
};

const update = async (req, res) => {
  const id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);
  const quantity = isNaN(req.body.quantity) ? 0 : parseInt(req.body.quantity);
  if (!quantity) return res.sendStatus(204).end();
  const cart = req.session.cart;
  const updatedItem = cart.update(id, quantity);
  return res.json({
    item: updatedItem,
    quantity: cart.quantity,
    subtotal: cart.subtotal,
    total: cart.total,
  });
};

const remove = async (req, res) => {
  const id = isNaN(req.body.id) ? 0 : parseInt(req.body.id);
  const cart = req.session.cart;
  cart.remove(id);
  return res.json({
    quantity: cart.quantity,
    subtotal: cart.subtotal,
    total: cart.total,
  });
};

const clear = async (req, res) => {
  const cart = req.session.cart;
  cart.clear();
  return res.sendStatus(200).end();
};

module.exports = { add, show, update, remove, clear };
