const blogs = require("./blogs");

const constructorMethod = (app) => {
  app.use("/blog", blogs);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
