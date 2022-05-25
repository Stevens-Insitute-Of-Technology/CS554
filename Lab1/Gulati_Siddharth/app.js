const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const configRoutes = require("./routes");
const session = require("express-session");
const { authorizeUserBlog, authorizeUserComment } = require("./data/blogs");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "AuthCookie",
    secret: "This is SHER-LOCKED",
    saveUninitialized: true,
    resave: false,
  })
);

app.post("/blog/:id/comments", (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ message: "User Not Logged In!!!" });
  } else {
    next();
  }
});

app.post("/blog", (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ message: "User Not Logged In!!!" });
  } else {
    next();
  }
});

app.put("/blog/:id", async (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ message: "User Not Logged In!!!" });
  } else {
    let userThatPosted = {
      _id: req.session.userId,
      username: req.session.user,
    };
    try {
      let auth = await authorizeUserBlog(req.params.id, userThatPosted);
      if (auth) {
        next();
      } else {
        return res.status(403).json({ message: "User Not Authorized!!!" });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
});

app.patch("/blog/:id", async (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ message: "User Not Logged In!!!" });
  } else {
    let userThatPosted = {
      _id: req.session.userId,
      username: req.session.user,
    };
    try {
      let auth = await authorizeUserBlog(req.params.id, userThatPosted);
      if (auth) {
        next();
      } else {
        return res.status(403).json({ message: "User Not Authorized!!!" });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
});

app.delete("/blog/:blogId/:commentId", async (req, res, next) => {
  if (!req.session.user) {
    return res.status(403).json({ message: "User Not Logged In!!!" });
  } else {
    let userThatPostedComment = {
      _id: req.session.userId,
      username: req.session.user,
    };
    try {
      let auth = await authorizeUserComment(
        req.params.commentId,
        userThatPostedComment
      );
      if (auth) {
        next();
      } else {
        return res.status(403).json({ message: "User Not Authorized!!!" });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
