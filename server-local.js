const app = require("./express/server");

// process.on("unhandledRejection", (reason, promise) => {
//   console.error("Unhandled Rejection at:", reason.stack || reason);
//   // Recommended: send the information to sentry.io
//   // or whatever crash reporting service you use
// });

app
  .set("port", process.env.PORT || 8182)

  .listen(app.get("port"), err => {
    if (err) {
      return console.log("\x1b[33m%s\x1b[0m", "Somethig went wrong", err);
    }
    console.log(
      "\x1b[33m%s\x1b[0m",
      `Server is listening on http://localhost:${app.get("port")} `
    );
  });
