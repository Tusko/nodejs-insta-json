const mcache = require("memory-cache");
const insta = require("./app.js");

exports.send = (err = false, msg = "ok", obj = {}) => ({
  error: err,
  data: obj,
  message: msg
});

exports.processing = (req, res) => {
  if (!req.query.username) {
    res.json(this.send(true, "Username is missing"));
  } else {
    const cacheKey = `__transient__${req.query.username}`;

    if (req.query.nocache !== 1) {
      const cachedBody = mcache.get(cacheKey);

      //  return cached data
      if (cachedBody)
        return res.json(
          this.send(false, `Success ${cachedBody.length}`, cachedBody)
        );
    }

    const instaJSON = insta.fetch(req.query);
    instaJSON
      .then(json => {
        if (req.query.nocache !== 1) mcache.put(cacheKey, json, 3600000);

        if (json.error) {
          res.json(this.send(true, json.error));
        }
        res.json(this.send(false, `Success ${json.length}`, json));
      })
      .catch(err => {
        res.json(this.send(true, `Error: ${err}`));
      });
  }
  return false;
};
