// Dependencies
const path = require("path");
const express = require("express");
const { create } = require("express-handlebars");
const routes = require("./controllers");
const sequelize = require("./config/connection");

// Variables
const app = express();
const hbs = create();
const PORT = process.env.PORT || 3001;

// Register hbs engine with express app
// Will automatically look for a views folder when rendering the page, most, if not all templating apps work like this
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

// Turn on connection to DB and Server
// The "sync" part means that this is Sequelize taking the models and connecting them to associated database tables. If it doesn't find a table, it'll create it for you!
// The other thing to notice is the use of {force: false} in the .sync() method. This doesn't have to be included, but if it were set to true, it would drop and re-create all of the database tables on startup. This is great for when we make changes to the Sequelize models, as the database would need a way to understand that something has changed. We'll have to do that a few times throughout this project, so it's best to keep the {force: false} there for now.

// You can think of it like the SQL command DROP TABLE IF EXISTS
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Now Listening");
  });
});
