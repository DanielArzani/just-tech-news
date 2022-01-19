// Dependencies
const path = require("path");
const express = require("express");
const { create } = require("express-handlebars");
const routes = require("./controllers");
const sequelize = require("./config/connection");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const helpers = require("./utils/helpers");

// Variables
const app = express();
const hbs = create({ helpers });
const PORT = process.env.PORT || 3001;
const sess = {
  secret: "Super secret secret",
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

// Register hbs engine with express app
// Will automatically look for a views folder when rendering the page, most, if not all templating apps work like this
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sess));
app.use(routes);

// Turn on connection to DB and Server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Now Listening");
  });
});
