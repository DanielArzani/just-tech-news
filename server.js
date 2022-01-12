// Dependencies
const express = require("express");
const routes = require("./routes");
const sequelize = require("./config/connection");

// Variables
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

// Turn on connection to DB and Server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log("Now Listening");
  });
});
