const express = require("express");
const router = express.Router();
const redis = require("redis");
const bluebird = require("bluebird");
const userData = require("../data/user");
const flat = require("flat");
const unflatten = flat.unflatten;
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

router.get("/:id(\\d+)/", async (req, res) => {
  try {
    const isIdPresentInCache = await client.existsAsync(req.params.id);
    if (isIdPresentInCache === 1) {
      let cacheData = await client.hgetallAsync(req.params.id);
      cacheData.id = parseInt(cacheData.id);
      let unflatCacheData = unflatten(cacheData);
      await client.lpushAsync("visited", JSON.stringify(unflatCacheData));
      res.json(unflatCacheData);
    } else {
      let user = await userData.getById(req.params.id);
      await client.lpushAsync("visited", JSON.stringify(user));
      let flatCacheData = flat(user);
      let hmSetAsyncUser = await client.hmsetAsync(
        flatCacheData.id,
        flatCacheData
      );
      res.json(user);
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get("/history", async (req, res) => {
  try {
    let userDatalist = await client
      .lrangeAsync("visited", 0, 19)
      .map(JSON.parse)
      .filter((value) => Object.keys(value).length !== 0);
    userDatalist.forEach((x) => (x.id = parseInt(x.id)));
    res.json(userDatalist);
  } catch (error) {
    res.json({ error: error });
  }
});

module.exports = router;
