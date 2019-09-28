const express = require("express");
const serverless = require("serverless-http");
const bodyParser = require("body-parser");
const path = require("path");

const eventHandler = require("../eventHandler");

const isDev = process.env.NODE_ENV === "development";

const app = express();
const router = express.Router();

app.use(express.static(path.join(__dirname, `/preview`)));
app.engine("html", require("ejs").renderFile);

router.get("/", (req, res) => {
  eventHandler.processing(req, res);
  res.end();
});

router.get("/preview", (req, res) => {
  res.render(path.join(__dirname, `/preview/render.html`));
  res.end();
});

app.use(bodyParser.json());

// path must route to lambda
app.use(isDev ? "/" : "/.netlify/functions/server", router);

module.exports = app;
module.exports.handler = serverless(app);
