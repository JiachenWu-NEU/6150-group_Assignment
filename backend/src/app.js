const express = require("express");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

app.use(express.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const routes = require("./routes");
app.use(routes);

module.exports = app;