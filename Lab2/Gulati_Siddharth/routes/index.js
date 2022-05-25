const user = require("./user");

const constructorMethod = (app) => {
  app.use("/api/people", user);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
