const express = require("express");

const app = express();

app.use(express.json());

const routes = require("./routes");
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Backend is running.");
});

module.exports = app;