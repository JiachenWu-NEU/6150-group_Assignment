const path = require("path");
const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
app.use(express.json());

// expose images folder as static
app.use(
  "/images",
  express.static(path.join(__dirname, "..", "images"))
);

// Swagger API docs
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const routes = require("./routes");
app.use(routes);

module.exports = app;