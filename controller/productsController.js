"use strict";

const {
  Product,
  Category,
  Brand,
  Tag,
  Image,
  Review,
  User,
} = require("../models");

const { Op } = require("sequelize");

const SORT_OPTIONS = ["price", "newest", "popular"];

const removeParam = (key, sourceURL) => {
  var rtn = sourceURL.split("?")[0],
    param,
    params_arr = [],
    queryString = sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");

    for (var i = params_arr.length - 1; i >= 0; i = -1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
  }
  if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
  return rtn;
};

const getProductOrderOption = (sort) => {
  switch (sort) {
    case "newest":
      return [["createdAt", "DESC"]];
    case "popular":
      return [["stars", "DESC"]];
    default:
      return [["price", "ASC"]];
  }
};

const getProducts = async ({
  categoryId,
  brandId,
  tagId,
  keyword,
  sort,
  page,
  limit,
}) => {
  const sortOption = SORT_OPTIONS.includes(sort) ? sort : "price";
  return Product.findAndCountAll({
    attributes: ["id", "name", "imagePath", "stars", "price", "oldPrice"],
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(keyword.trim() !== "" ? { name: { [Op.like]: `%${keyword}%` } } : {}),
    },
    include: [{ model: Tag, where: { ...(tagId ? { id: tagId } : {}) } }],
    order: getProductOrderOption(sortOption),
    limit,
    offset: (page - 1) * limit,
  });
};

const getProduct = async (id) =>
  Product.findOne({
    attributes: [
      "id",
      "name",
      "stars",
      "oldPrice",
      "price",
      "summary",
      "description",
      "specification",
    ],
    where: { id },
    include: [
      { model: Image, attributes: ["name", "imagePath"] },
      {
        model: Review,
        attributes: ["id", "review", "stars", "createdAt"],
        include: [{ model: User, attributes: ["firstName", "lastName"] }],
      },
      { model: Tag, attributes: ["id"] },
    ],
  });

const getRelatedProducts = async (tagIds) =>
  Product.findAll({
    attributes: ["id", "name", "imagePath", "price", "oldPrice", "stars"],
    include: [
      {
        model: Tag,
        attributes: ["id"],
        where: { id: { [Op.in]: tagIds } },
      },
    ],
    limit: 10,
  });

const getCategories = async () =>
  Category.findAll({ include: [{ model: Product }] });

const getBrands = async () => Brand.findAll({ include: [{ model: Product }] });

const getTags = async () => Tag.findAll();

const getFilterData = async (req, res, next) => {
  const [categories, brands, tags] = await Promise.all([
    getCategories(),
    getBrands(),
    getTags(),
  ]);
  res.locals.categories = categories;
  res.locals.brands = brands;
  res.locals.tags = tags;
  next(); // Proceed to the next middleware or route handler
};

const show = async (req, res) => {
  const categoryId = isNaN(req.query.category)
    ? 0
    : parseInt(req.query.category);
  const brandId = isNaN(req.query.brand) ? 0 : parseInt(req.query.brand);
  const tagId = isNaN(req.query.tag) ? 0 : parseInt(req.query.tag);
  const keyword = req.query.keyword || "";
  const sort = req.query.sort || "price";
  const page = isNaN(req.query.page)
    ? 1
    : Math.max(1, parseInt(req.query.page));
  const limit = 6;
  const { rows: products, count } = await getProducts({
    categoryId,
    brandId,
    tagId,
    keyword,
    sort,
    page,
    limit,
  });
  res.locals.sort = sort;
  res.locals.originalUrl = removeParam("sort", req.originalUrl); // Store the original URL
  if (Object.keys(req.query).length === 0) {
    res.locals.originalUrl = res.locals.originalUrl + "?";
  }
  res.locals.products = products;
  res.locals.pagination = {
    page,
    limit,
    totalRows: count,
    queryParams: { ...req.query },
  };
  res.render("product-list");
};

const showDetails = async (req, res) => {
  const id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
  const product = await getProduct(id);
  const tagIds = product.Tags.map(({ id }) => id);
  const relatedProducts = await getRelatedProducts(tagIds);
  res.locals.relatedProducts = relatedProducts;
  res.locals.product = product;
  res.render("product-detail");
};

module.exports = { getFilterData, show, showDetails };
