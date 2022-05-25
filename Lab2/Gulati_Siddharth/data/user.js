const axios = require("axios");
const fs = require("fs");

function checkIsProperNumber(val) {
  if (typeof val === "string") {
    let temp = val;
    val = parseInt(val);
    if (isNaN(val)) {
      throw `${temp} is not a valid input`;
    }
    checkIsProperNumber(val);
  }
  if (typeof val !== "number") {
    throw `${val} is not a number`;
  }

  if (isNaN(val)) {
    throw `${val} is NaN`;
  }
}

function checkIfArgumentIsPassed(val) {
  if (typeof val === "undefined") {
    throw `Please pass an input.`;
  }
}

const getData = async () => {
  const { data } = await axios.get(
    "https://gist.githubusercontent.com/graffixnyc/ed50954f42c3e620f7c294cf9fe772e8/raw/925e36aa8e3d60fef4b3a9d8a16bae503fe7dd82/lab2"
  );
  storeData(data, "data/users.json");
  return;
};

const storeData = (data, path) => {
  try {
    return fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const loadData = (path) => {
  try {
    let bufferData = fs.readFileSync(path);
    return JSON.parse(bufferData);
  } catch (err) {
    console.error(err);
    return false;
  }
};

const getById = async (id) => {
  checkIfArgumentIsPassed(id);
  checkIsProperNumber(id);
  let data = loadData("data/users.json");
  let found = false;
  let foundUserData;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      for (let userIndex = 0; userIndex < data.length; userIndex++) {
        if (data[userIndex].id === parseInt(id)) {
          foundUserData = data[userIndex];
          found = true;
          break;
        }
      }
      found
        ? resolve(foundUserData)
        : reject(new Error("User Not Found"));
    }, 5000);
  });
};

module.exports = {
  getById,
  getData,
};
