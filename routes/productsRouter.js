"use strict";

const express = require("express");
const router = express.Router();
const controller = require("../controller/productsController");
const cartController = require("../controller/cartController");

router.get("/", controller.getFilterData, controller.show);
router.get("/cart", cartController.show); // place cart route here to avoid conflict with product route
router.get("/:id", controller.getFilterData, controller.showDetails);
router.post("/cart", cartController.add);
router.put("/cart", cartController.update);
router.delete("/cart", cartController.remove);
router.delete("/cart/all", cartController.clear);
module.exports = router;
