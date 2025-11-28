const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Backend API",
      version: "1.0.0",
      description: "Node.js + Express + MongoDB backend with Swagger UI",
    },
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;