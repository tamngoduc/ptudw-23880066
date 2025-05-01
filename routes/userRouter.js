"use strict";

const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const controller = require("../controller/userController");

router.get("/checkout", controller.checkout);
router.post(
  "/placeorder",
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").notEmpty().withMessage("Email is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("mobile").notEmpty().withMessage("Mobile number is required"),
  body("address").notEmpty().withMessage("Address is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    const addressId = isNaN(req.body.addressId)
      ? 0
      : parseInt(req.body.addressId);
    if (!addressId && !errors.isEmpty()) {
      const errorArr = errors.array();
      const message = errorArr.reduce(
        (acc, curr) => acc + curr.msg + "<br>",
        ""
      );
      return res.render("error", { message });
    }
    next();
  },
  controller.placeOrder
);

module.exports = router;
