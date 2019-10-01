const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const path = require("path");

const eventHandler = require("../eventHandler");

const app = express();
const router = express.Router();

app.use(express.static(path.join(__dirname, `/preview`)));
app.engine("html", require("ejs").renderFile);

router.get("/", (req, res, next) => {
  eventHandler.processing(req, res);
  next();
});

router.get("/preview", (req, res, next) => {
  res.render(path.join(__dirname, `/preview/render.html`));
  next();
});

app.use(bodyParser.json());

module.exports = app;
module.exports.handler = serverless(app);
