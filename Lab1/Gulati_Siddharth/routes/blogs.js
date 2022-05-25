const express = require("express");
const router = express.Router();
const blogsData = require("../data/blogs");
const usersData = require("../data/users");

router.get("/", async (req, res) => {
  try {
    const blog = await blogsData.getBlogs(req.query.take, req.query.skip);
    res.json(blog);
  } catch (e) {
    res.status(400).json({ message: e });
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.clearCookie("AuthCookie");
  res.send("User Logged Out!!");
});

router.post("/", async (req, res) => {
  try {
    if (req.session.user) {
      try {
        let data = req.body;
        if (!data.title || !data.title || data.title.trim() === "")
          throw `Please Provide Title`;
        if (!data.body || !data.body || data.body.trim() === "")
          throw `Please Provide Body`;
        const { title, body } = data;
        let userThatPosted = {
          _id: req.session.userId,
          username: req.session.user,
        };
        try {
          let createdBlog = await blogsData.createBlog(
            title,
            body,
            userThatPosted
          );
          if (createdBlog.blogInserted === true) {
            res.json(createdBlog.createdBlog);
          } else {
            res.status(500).json({ error: "Internal Server Error" });
          }
        } catch (error) {
          res.status(400).json({ message: error });
        }
      } catch (e) {
        res.status(400).json({ message: e });
      }
    } else {
      throw `User not authorized`;
    }
  } catch (e) {
    res.status(401).json({ error: e });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (req.session.user) {
      try {
        let data = req.body;
        if (!data.title || !data.title || data.title.trim() === "")
          throw `Please Provide Title`;
        if (!data.body || !data.body || data.body.trim() === "")
          throw `Please Provide Body`;
        const { title, body } = data;
        let userThatPosted = {
          _id: req.session.userId,
          username: req.session.user,
        };
        try {
          let updatedBlog = await blogsData.updateBlog(
            req.params.id,
            title,
            body,
            userThatPosted
          );
          if (updatedBlog.blogUpdated === true) {
            res.json(updatedBlog.updatedBlog);
          } else {
            res.status(500).json({ error: "Internal Server Error" });
          }
        } catch (error) {
          res.status(400).json({ message: error });
        }
      } catch (e) {
        res.status(400).json({ message: e });
      }
    } else {
      throw `User not authorized`;
    }
  } catch (e) {
    res.status(401).json({ error: e });
  }
});

router.patch("/:id", async (req, res) => {
  const requestBody = req.body;
  let updateData = {};
  try {
    const originalBlog = await blogsData.getBlogById(req.params.id);
    if (requestBody.title && requestBody.title !== originalBlog.title) {
      updateData.title = requestBody.title;
    }
    if (requestBody.body && requestBody.body !== originalBlog.body) {
      updateData.body = requestBody.body;
    }
    let userThatPosted = {
      _id: req.session.userId,
      username: req.session.user,
    };
    try {
      if (
        Object.entries(originalBlog.userThatPosted).toString() !==
        Object.entries(userThatPosted).toString()
      ) {
        throw `You are not authorized!!!`;
      }
    } catch (error) {
      res.status(403).json({ error: error });
      return;
    }
  } catch (e) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }
  if (Object.keys(updateData).length !== 0) {
    try {
      const updatedBlog = await blogsData.updateBlogPartial(
        req.params.id,
        updateData
      );
      res.json(updatedBlog);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  } else {
    res.status(400).json({
      error:
        "No fields have been changed from their inital values, so no update has occurred",
    });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    if (req.session.user) {
      try {
        let blogId = req.params.id;
        const { comment } = req.body;
        if (!blogId || blogId.trim() === "") throw `Please Provide Blog Id`;
        if (!comment || comment.trim() === "") throw `Please Provide Comment`;
        let userThatPostedComment = {
          _id: req.session.userId,
          username: req.session.user,
        };
        try {
          let createdComment = await blogsData.createComment(
            blogId,
            comment,
            userThatPostedComment
          );
          if (createdComment.commentInserted === true) {
            res.json(createdComment.createdComment);
          } else {
            res.status(500).json({ error: "Internal Server Error" });
          }
        } catch (error) {
          res.status(400).json({ message: error });
        }
      } catch (e) {
        res.status(400).json({ message: e });
      }
    } else {
      throw `User not authorized`;
    }
  } catch (e) {
    res.status(401).json({ error: e });
  }
});

router.post("/signup", async (req, res) => {
  try {
    if (!req.session.user) {
      let data = req.body;
      if (!data || !data.name || data.name.trim() === "")
        throw `Please Provide Name`;
      if (!data || !data.username || data.username.trim() === "")
        throw `Please Provide Username`;
      usersData.userNameValidation(data.username);
      if (!data || !data.password || data.password.trim() === "")
        throw `Please Provide Password`;
      usersData.passwordValidation(data.password);
      const { username, password, name } = data;
      try {
        let users = await usersData.createUser(username, password, name);
        if (users.userInserted === true) {
          res.status(200).json(users.userData);
        } else {
          res.status(500).json({ error: "Internal Server Error" });
        }
      } catch (error) {
        res.status(400).json(error);
      }
    } else {
      res.status(400).json({ message: "User already logged in" });
    }
  } catch (e) {
    res.status(400).json(e);
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!req.session.user) {
      try {
        let data = req.body;
        if (!data || !data.username || data.username.trim() === "")
          throw `Please Provide Username`;
        usersData.userNameValidation(data.username);
        if (!data || !data.password || data.password.trim() === "")
          throw `Please Provide Password`;
        usersData.passwordValidation(data.password);
        const { username, password } = data;
        try {
          let users = await usersData.checkUser(username, password);
          if (users.authenticated === true) {
            req.session.user = users.userData.username;
            req.session.userId = users.userId;
            res.status(200).json(users.userData);
          }
        } catch (error) {
          res.status(401).json(error);
        }
      } catch (e) {
        res.status(400).json(e);
      }
    } else {
      res.json({ message: "User already logged in" });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blogById = await blogsData.getBlogById(req.params.id);
    res.json(blogById);
  } catch (error) {
    if (error === "You must provide a valid id format") {
      res.status(400).json({ message: error });
    }
    if (error === "No blog with that id") {
      res.status(404).json({ message: error });
    }
  }
});

router.delete("/:blogId/:commentId", async (req, res) => {
  try {
    if (req.session.user) {
      if (!req.params.blogId || !req.params.commentId) {
        res.status(400).json({ error: "You must supply id to delete" });
        return;
      }
      try {
        await blogsData.getBlogById(req.params.blogId);
      } catch (e) {
        res.status(404).json({ error: "Blog not found" });
        return;
      }
      try {
        let userThatPostedComment = {
          _id: req.session.userId,
          username: req.session.user,
        };
        let remove = await blogsData.removeComment(
          req.params.blogId,
          req.params.commentId,
          userThatPostedComment
        );
        if (remove.notAuthorized === true) {
          res.status(403).json("You are not authorized!!");
          return;
        }
        if (remove.removed === true) {
          res.status(200).json({ message: "Comment deleted" });
        }
      } catch (e) {
        res.status(500).json({ error: e });
      }
    } else {
      throw `User Not logged in!!`;
    }
  } catch (error) {
    res.status(401).json({ message: error });
  }
});

module.exports = router;
