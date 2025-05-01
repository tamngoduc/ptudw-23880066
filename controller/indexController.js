"use strict";

const { Product, Category, Brand } = require("../models");

const getCategories = async () => Category.findAll();

const getBrands = async () => Brand.findAll();

const getFeaturedProducts = async () =>
  Product.findAll({
    attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"],
    order: [["stars", "DESC"]],
    limit: 10,
  });

const getRecentProducts = async () =>
  Product.findAll({
    attributes: [
      "id",
      "name",
      "imagePath",
      "stars",
      "price",
      "oldPrice",
      "createdAt",
    ],
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

const getCategoryArray = (categories) => {
  const categoryArray = {
    categories: categories.slice(0, 1),
    secondArray: categories.slice(2, 4),
    thirdArray: categories.slice(1, 2),
  };
  return categoryArray;
};

const showHomepage = async (req, res) => {
  const [categories, featuredProducts, brands, recentProducts] =
    await Promise.all([
      getCategories(),
      getFeaturedProducts(),
      getBrands(),
      getRecentProducts(),
    ]);
  const categoryArray = getCategoryArray(categories);
  res.locals.categoryArray = categoryArray;
  res.locals.recentProducts = recentProducts;
  res.locals.featuredProducts = featuredProducts;
  res.render("index", { brands });
};

const showPage = (req, res, next) => {
  const pages = [
    "cart",
    "checkout",
    "contact",
    "login",
    "my-account",
    "product-detail",
    "product-list",
    "wishlist",
  ];
  if (pages.includes(req.params.page)) return res.render(req.params.page);
  next(); // pass to next middleware (Error Handlers)
};

module.exports = { showHomepage, showPage };
