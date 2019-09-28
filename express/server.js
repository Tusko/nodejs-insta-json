const express = require("express");
const serverless = require("serverless-http");
const path = require("path");
const eventHandler = require("../eventHandler");
const app = express();

app
  .use(express.static("test"))
  .set("port", process.env.PORT || 8182)
  .get("/", (req, res, next) => {
    eventHandler.processing(req, res);
  })
  .use(express.static("test"))
  .get("/render", (req, res, next) => {
    res.sendFile(path.join(__dirname, `../test/render.html`));
  });

// app.use("/.netlify/functions/server");

module.exports = app;
module.exports.handler = serverless(app);
