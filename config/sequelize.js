const { Sequelize } = require("sequelize");
const config = require("./config.json");

// Extract the development configuration from the config.json file
const { username, password, database, host, dialect } = config.development;

// Create an instance of Sequelize and connect to the database
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
});

module.exports = sequelize;