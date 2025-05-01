"use strict";

const { Address, Order, OrderDetail } = require("../models");

const checkout = async (req, res) => {
  if (!req.session.cart.quantity) {
    return res.redirect("/products");
  }
  const userId = 1;
  res.locals.addresses = await Address.findAll({ where: { userId } });
  res.locals.cart = req.session.cart.getCart();
  res.render("checkout");
};

const paymentMethodStatus = (paymentMethod) => {
  switch (paymentMethod) {
    case "PAYPAL":
      return "PAID";
    case "COD":
      return "UNPAID";
    default:
      throw new Error("Invalid payment method");
  }
};

const saveOrder = async (cart, status) => {
  const userId = 1;
  const { items, ...rest } = cart;
  const order = await Order.create({
    userId,
    ...rest,
    status,
  });
  const orderDetails = items.map((item) => ({
    orderId: order.id,
    productId: item.product.id,
    price: item.product.price,
    quantity: item.quantity,
    total: item.total,
  }));
  return OrderDetail.bulkCreate(orderDetails); // Insert multiple records
};

const placeOrder = async (req, res) => {
  try {
    const userId = 1;
    const addressId = isNaN(req.body.addressId)
      ? 0
      : parseInt(req.body.addressId);
    const [found, created] = await Address.findOrCreate({
      where: { id: addressId },
      defaults: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobile: req.body.mobile,
        address: req.body.address,
        country: req.body.country,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        isDefault: req.body.isDefault || false,
        userId,
      },
    });
    const address = found || created;
    const cart = {
      ...req.session.cart.getCart(),
      paymentMethod: req.body.payment,
      shippingAddress: `${address.firstName} ${address.lastName}, Email: ${address.email}, Mobile: ${address.mobile}, Address: ${address.address}, ${address.city}, ${address.state}, ${address.zipCode}`,
    };
    const paymentStatus = paymentMethodStatus(cart.paymentMethod);
    await saveOrder(cart, paymentStatus);
    req.session.cart.clear();
    return res.render("error", { message: "Thank you for your order!" });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.render("error", { message: "Failed to place order" });
  }
};

module.exports = { checkout, placeOrder };
