const mongoCollections = require("../config/mongoCollections");
const blogs = mongoCollections.blogs;
const ObjectId = require("mongodb").ObjectID;

function checkIfArgumentIsPassed(val) {
  if (typeof val === "undefined") {
    throw `Please pass an input.`;
  }
}

function checkIfInputIsString(val) {
  if (typeof val === "string") {
    val = val.trim();
    if (val === "") {
      throw `Empty strings is not a valid argument.`;
    }
    return val.trim();
  } else if (typeof val !== "string") {
    throw `${val} is not a string. Please pass a string`;
  }
}

function convertStringToObject(id) {
  if (typeof id === "string" && ObjectId.isValid(id)) {
    id = id.trim();
    id = new ObjectId(id);
  } else if (typeof id === "object") {
    return id;
  }
  return id;
}

function checkIfInputIsObject(val) {
  if (typeof val !== "object") {
    throw `Value provided is not an object`;
  }
  if (typeof val === "object" && Array.isArray(val)) {
    throw `Value provided is not an object`;
  }
}

const empty = (data) => {
  if (typeof data === "number" || typeof data === "boolean") {
    return false;
  }
  if (typeof data === "undefined" || data === null) {
    return true;
  }
  if (typeof data.length !== "undefined") {
    return data.length === 0;
  }
  for (let i in data) {
    if (data.hasOwnProperty(i)) {
      return false;
    }
  }
  return true;
};

function checkIsProperNumber(val) {
  if (typeof val !== "number") {
    throw `${val} is not a number`;
  }

  if (isNaN(val)) {
    throw `${val} is NaN`;
  }

  if (val < 0) {
    throw `Please enter a positive number`;
  }
}

async function authorizeUserBlog(blogId, userThatPosted) {
  let originalBlog = await getBlogById(blogId);
  if (empty(originalBlog)) {
    throw "Blog not found";
  }
  if (
    Object.entries(originalBlog.userThatPosted).toString() !==
    Object.entries(userThatPosted).toString()
  ) {
    return false;
  } else {
    return true;
  }
}

async function authorizeUserComment(commentId, userThatPostedComment) {
  let comment = await getComment(commentId);
  if (!empty(comment)) {
    if (
      Object.entries(comment.userThatPostedComment).toString() ===
      Object.entries(userThatPostedComment).toString()
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    throw `Comment not found!`;
  }
}

const getBlogs = async (take = 20, skip = 0) => {
  take = parseInt(take);
  skip = parseInt(skip);
  checkIsProperNumber(take);
  checkIsProperNumber(skip);
  if (take > 100) {
    take = 100;
  }

  const blogCollection = await blogs();

  let blogList = await blogCollection.find().limit(take).skip(skip).toArray();
  if (blogList.length == 0) {
    return "No Blog Found";
  }
  blogList.forEach((element) => {
    element._id = ObjectId(element._id).toString();
  });
  return blogList;
};

const getBlogById = async (id) => {
  checkIfArgumentIsPassed(id);
  if (!ObjectId.isValid(id)) throw "You must provide a valid id format";
  id = convertStringToObject(id);
  const blogCollection = await blogs();
  const blog = await blogCollection.findOne({ _id: id });
  if (blog === null) throw "No blog with that id";
  blog._id = ObjectId(blog._id).toString();
  return blog;
};

const createBlog = async (title, body, userThatPosted) => {
  checkIfArgumentIsPassed(title);
  checkIfArgumentIsPassed(body);
  checkIfArgumentIsPassed(userThatPosted);
  checkIfInputIsString(title);
  checkIfInputIsString(body);
  checkIfInputIsObject(userThatPosted);
  let newBlog = {
    title: title,
    body: body,
    userThatPosted: userThatPosted,
    comments: [],
  };
  const blogCollection = await blogs();
  const insertInfo = await blogCollection.insertOne(newBlog);
  if (insertInfo.insertedCount === 0) throw "Could not add blog";

  const newId = insertInfo.insertedId;

  const createdBlog = await getBlogById(newId);
  if (Object.keys(createdBlog).length === 0) {
    return { blogInserted: false };
  } else {
    return { blogInserted: true, createdBlog: createdBlog };
  }
};

const createComment = async (blogId, comment, userThatPostedComment) => {
  checkIfArgumentIsPassed(blogId);
  checkIfArgumentIsPassed(comment);
  checkIfArgumentIsPassed(userThatPostedComment);
  checkIfInputIsString(blogId);
  checkIfInputIsString(comment);
  checkIfInputIsObject(userThatPostedComment);
  if (!ObjectId.isValid(blogId)) throw "You must provide a valid id format";
  blogId = convertStringToObject(blogId);
  const blogForComment = await getBlogById(blogId);
  if (blogForComment === null) throw "No Blog with that id";
  let newComment = {
    _id: ObjectId(),
    comment: comment,
    userThatPostedComment: userThatPostedComment,
  };

  blogForComment.comments.push(newComment);
  const blogCollection = await blogs();
  let commentAdded = await blogCollection.updateOne(
    { _id: blogId },
    {
      $set: {
        comments: blogForComment.comments,
      },
    }
  );
  if (commentAdded.matchedCount !== 1 && commentAdded.modifiedCount !== 1) {
    throw `Error! Comment not added.`;
  } else {
    let updatedBlog = await getBlogById(ObjectId(blogId).toString());
    return { commentInserted: true, createdComment: updatedBlog };
  }
};

const updateBlog = async (id, title, body, userThatPosted) => {
  checkIfArgumentIsPassed(id);
  checkIfArgumentIsPassed(title);
  checkIfArgumentIsPassed(body);
  checkIfArgumentIsPassed(userThatPosted);
  checkIfInputIsString(title);
  checkIfInputIsString(body);
  checkIfInputIsObject(userThatPosted);
  let originalBlog = await getBlogById(id);
  // if (
  //   Object.entries(originalBlog.userThatPosted).toString() !==
  //   Object.entries(userThatPosted).toString()
  // ) {
  //   throw `You are not authorized!!!`;
  // }
  if (await !authorizeUserBlog(id, userThatPosted)) {
    throw `You are not authorized!!!`;
  } else {
    if (originalBlog.title !== title || originalBlog.body !== body) {
      const blogCollection = await blogs();
      id = convertStringToObject(id);
      let updatedBlog = await blogCollection.updateOne(
        { _id: id },
        {
          $set: {
            title: title,
            body: body,
            userThatPosted: userThatPosted,
            comments: originalBlog.comments,
          },
        }
      );
      if (updatedBlog.matchedCount === 1 && updatedBlog.modifiedCount === 0) {
        throw `There is no change in blog with id of ${id}`;
      }
      if (updatedBlog.modifiedCount === 0) {
        throw `Could not update blog with id of ${id}`;
      }
      const finalBlog = await getBlogById(id);
      return { blogUpdated: true, updatedBlog: finalBlog };
    }
  }
};

const updateBlogPartial = async (id, updateData) => {
  checkIfArgumentIsPassed(id);
  const blogCollection = await blogs();
  const updatedBlogData = {};
  if (updateData.title) {
    updatedBlogData.title = updateData.title;
  }
  if (updateData.body) {
    updatedBlogData.body = updateData.body;
  }
  id = convertStringToObject(id);
  let updatedBlogStatus = await blogCollection.updateOne(
    { _id: id },
    { $set: updatedBlogData }
  );
  return await getBlogById(id);
};

const getComment = async (commentId) => {
  checkIfArgumentIsPassed(commentId);
  if (!ObjectId.isValid(commentId)) throw "You must provide a valid id format";
  commentId = convertStringToObject(commentId);
  const blogCollection = await blogs();
  let comment = await blogCollection
    .aggregate([
      { $match: { "comments._id": commentId } },
      { $unwind: "$comments" },
      { $match: { "comments._id": commentId } },
      { $project: { _id: 0, comments: 1 } },
    ])
    .toArray();

  let response = {};

  try {
    response = comment[0].comments;
  } catch (err) {}
  return response;
};

const removeComment = async (blogId, commentId, userThatPostedComment) => {
  checkIfArgumentIsPassed(blogId);
  checkIfArgumentIsPassed(commentId);
  let commentExists = await getComment(commentId);
  if (empty(commentExists)) {
    throw "Comment not found";
  }
  if (!ObjectId.isValid(commentId)) throw "You must provide a valid id format";
  if (!ObjectId.isValid(blogId)) throw "You must provide a valid id format";
  commentId = convertStringToObject(commentId);
  blogId = convertStringToObject(blogId);

  const blogCollection = await blogs();
  if (await authorizeUserComment(commentId, userThatPostedComment)) {
    let remove = await blogCollection.findOneAndUpdate(
      { _id: blogId },
      { $pull: { comments: { _id: commentId }, multi: true } }
    );
    let commentExists = await getComment(commentId);
    if (empty(commentExists)) {
      return { removed: true };
    } else {
      throw `Delete comment failed`;
    }
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  createComment,
  updateBlog,
  updateBlogPartial,
  removeComment,
  checkIfArgumentIsPassed,
  checkIfInputIsObject,
  checkIfInputIsString,
  convertStringToObject,
  checkIsProperNumber,
  authorizeUserBlog,
  authorizeUserComment,
};
