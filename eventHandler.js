const mcache = require("memory-cache");
const insta = require("./app.js");

exports.rs = (err = false, msg = "ok", obj = {}) => ({
  error: err,
  data: obj,
  message: msg
});

exports.processing = (req, res) => {
  const cacheKey = `__transient__${req.query.username}`;
  const cacheTime = req.query.cache || 3600;
  const cachedBody = mcache.get(cacheKey);

  //  return cached data
  if (cachedBody && cacheTime !== "0")
    return res.send(this.rs(false, `Success ${cachedBody.length}`, cachedBody));

  const instaJSON = insta.fetch(req.query);
  instaJSON
    .then(json => {
      mcache.put(cacheKey, json, cacheTime * 1000);
      res.send(this.rs(false, `Success ${json.length}`, json));
    })
    .catch(err => {
      console.log("\x1b[31m", err);
      res.send(this.rs(true, `${err.name} : ${err.message}`));
    });

  // res.end();
};
