const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const path = require("path");
const eventHandler = require("../eventHandler");

const app = express();
const router = express.Router();

router
  .get("/", (req, res) => eventHandler.processing(req, res))
  .get("/render", (req, res) => {
    res.sendFile(path.join(`${__dirname}/test/render.html`));
  });

app
  .set("port", process.env.PORT || 8182)
  .use(express.static("test"))
  .use("/.netlify/functions/server", router)
  .use(bodyParser.json());

module.exports = app;
module.exports.handler = serverless(app);
