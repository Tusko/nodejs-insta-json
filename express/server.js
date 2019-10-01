const express = require("express");
const serverless = require("serverless-http");
const path = require("path");

const eventHandler = require("../eventHandler");

const app = express();

app
  .use(express.static(path.join(__dirname, `/preview`)))

  .engine("html", require("ejs").renderFile)

  .get("/", async (req, res) => {
    await eventHandler.processing(req, res);
  })

  .get("/preview", (req, res) => {
    res.render(path.join(__dirname, `/preview/render.html`));
  });

module.exports = app;
module.exports.handler = serverless(app);
