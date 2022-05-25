const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const ObjectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
const saltRounds = 16;
const blogMethods = require("./blogs");

function userNameValidation(username) {
  const usernameRegex = /^[a-zA-Z0-9]{4,}$/;
  if (typeof username !== "string") {
    throw `Username is not of type string`;
  }
  if (username.trim() === "") {
    throw `Please enter a username`;
  }
  if (username.length < 4) {
    throw `Username must have 4 characters`;
  }
  if (!usernameRegex.test(username)) {
    throw `Please use valid username format`;
  }
}

function passwordValidation(password) {
  const passwordRegex = /^\S{6,}$/;
  if (!passwordRegex.test(password)) {
    throw `Either the username or password is invalid`;
  }
}

const createUser = async (username, password, name) => {
  blogMethods.checkIfArgumentIsPassed(name);
  blogMethods.checkIfArgumentIsPassed(username);
  blogMethods.checkIfArgumentIsPassed(password);
  blogMethods.checkIfInputIsString(name);
  userNameValidation(username);
  passwordValidation(password);
  let userNameLowerCase = username.toLowerCase();
  const userCollection = await users();
  const user = await userCollection.findOne({ username: userNameLowerCase });
  if (user !== null) {
    throw `User Exists`;
  }
  password = await bcrypt.hash(password, saltRounds);
  let newUser = {
    name: name,
    username: userNameLowerCase,
    password,
  };
  if (user === null) {
    const insertInfo = await userCollection.insertOne(newUser);
    if (insertInfo.insertedCount === 0) throw "Could not create account";
    const newId = insertInfo.insertedId;
    let createdUserData = await getUserById(newId);
    return { userInserted: true, userData: createdUserData };
  }
};

const getUserById = async (id) => {
  blogMethods.checkIfArgumentIsPassed(id);
  if (!ObjectId.isValid(id)) throw "You must provide a valid id format";
  id = blogMethods.convertStringToObject(id);
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: id });
  if (user === null) throw "No blog with that id";
  user._id = ObjectId(user._id).toString();
  return user;
};

const checkUser = async (username, password) => {
  blogMethods.checkIfArgumentIsPassed(username);
  blogMethods.checkIfArgumentIsPassed(password);
  username = username.trim();
  userNameValidation(username);
  passwordValidation(password);
  const userCollection = await users();
  const userNameCheck = await userCollection.findOne({
    username: username.toLowerCase(),
  });
  if (userNameCheck === null) {
    throw `Either the username or password is invalid`;
  } else {
    const passwordCompare = await bcrypt.compare(
      password,
      userNameCheck.password
    );
    if (passwordCompare) {
      idString = userNameCheck._id;
      userNameCheck._id = ObjectId(userNameCheck._id).toString();
      return {
        authenticated: true,
        userData: userNameCheck,
        userId: idString,
      };
    } else {
      throw `Either the username or password is invalid`;
    }
  }
};

module.exports = {
  createUser,
  checkUser,
  userNameValidation,
  passwordValidation,
};
