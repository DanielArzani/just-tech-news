// Importing Sequelize Constructor
const Sequelize = require("sequelize");
// Importing .ENV file and calling config to parse it
require("dotenv").config();

// Create connection to database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PW,
  {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
  }
);

module.exports = sequelize;
