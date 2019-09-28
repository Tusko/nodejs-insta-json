const express = require("express");
const serverless = require("serverless-http");
const path = require("path");
const eventHandler = require("./eventHandler");

const app = express();

app

  .set("port", process.env.PORT || 8182)

  .use(express.static("test"))

  .get("/", (req, res) => eventHandler.processing(req, res))

  .get("/render", (req, res) => {
    res.sendFile(path.join(`${__dirname}/test/render.html`));
  })

  .listen(app.get("port"), err => {
    if (err) {
      return console.log("Somethig went wrong", err);
    }
    console.log(`Server is listening on http://localhost:${app.get("port")} `);
    return false;
  });

module.exports = app;
module.exports.handler = serverless(app);
