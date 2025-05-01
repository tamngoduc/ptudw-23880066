"use strict";

const express = require("express");
const router = express.Router();
const controller = require("../controller/indexController");

router.get("/createTables", (req, res) => {
  const models = require("../models");
  models.sequelize.sync().then(() => {
    res.send("tables created!");
  });
});

router.get("/", controller.showHomepage);

router.get("/:page", controller.showPage);

module.exports = router;
