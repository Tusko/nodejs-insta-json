const mcache = require("memory-cache");
const insta = require("./app.js");

exports.send = (err = false, msg = "ok", obj = {}) => ({
  error: err,
  data: obj,
  message: msg
});

exports.processing = async (req, res) => {
  if (!req.query.username) {
    res.json(this.send(true, "Username is missing"));
  } else {
    const cacheKey = `__transient__${req.query.username}`;
    const cacheTime = req.query.cache || 3600;
    const cachedBody = mcache.get(cacheKey);

    //  return cached data
    if (cachedBody && cacheTime !== "0")
      return res.json(
        this.send(false, `Success ${cachedBody.length}`, cachedBody)
      );

    const instaJSON = await insta.fetch(req.query);
    instaJSON.then(json => {
      if (json.error) {
        res.json(this.send(true, json.error));
        res.end();
      }
      mcache.put(cacheKey, json, cacheTime * 1000);
      res.json(this.send(false, `Success ${json.length}`, json));
      res.end();
    });

    instaJSON.catch(err => {
      res.json(this.send(true, err));
      res.end();
    });
  }
  return false;
};
