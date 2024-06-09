require("dotenv").config();
const express = require("express");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const mongoStore = require("connect-mongo");
const methodOverride = require("method-override");

const connectDB = require("./server/config/db.js");
const session = require("express-session");
const { isActiveRoute } = require("./server/helpers/routeHelpers.js");

const app = express();
const port = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "secret123",
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    // cookie: {
    //   maxAge: new Date(Date.now() + 3600000),
    // },
  })
);

// Templating engine
app.use(express.static("public"));
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

app.locals.isActiveRoute = isActiveRoute;

// Routes
app.use("/", require("./server/routes/main.js"));
app.use("/", require("./server/routes/admin.js"));

app.listen(port, () => console.log(`Server is running on port ${port}`));
