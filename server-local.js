const app = require("./express/server");

app
  .set("port", process.env.PORT || 8182)

  .listen(app.get("port"), err => {
    if (err) {
      return console.log("Somethig went wrong", err);
    }
    console.log(`Server is listening on http://localhost:${app.get("port")} `);
  });
