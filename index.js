"use strict";
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const expressHandlebars = require("express-handlebars");
const { createPagination } = require("express-handlebars-paginate");
const { createStarList } = require("./controller/handlebarsHelper");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");
const Cart = require("./controller/cart");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect().catch(console.error);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

app.engine(
  "hbs",
  expressHandlebars.engine({
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    extname: "hbs",
    defaultLayout: "layout",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true, // access value inside dataValues object
    },
    helpers: {
      createStarList,
      createPagination,
    },
  })
);
app.set("view engine", "hbs");

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: new RedisStore({ client: redisClient }),
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // prevent client-side JS from accessing the cookie
      maxAge: 20 * 60 * 1000, // 20 minutes
    },
  })
);

// Body data parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize cart middleware
app.use((req, res, next) => {
  req.session.cart = new Cart(req.session.cart || {});
  res.locals.quantity = req.session.cart.quantity || 0;
  next();
});

// App routes
app.use("/", require("./routes/indexRouter"));
app.use("/products", require("./routes/productsRouter"));
app.use("/user", require("./routes/userRouter"));

// Error handlers
app.use((req, res, next) => {
  res.status(404).render("error", { message: "File not Found!" });
});
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render("error", { message: "Internal Server Error!" });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
