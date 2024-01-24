const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

// bcrypt salt rounds
const saltRounds = 10;

async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username) return res.send({ error: "Username is required" });
    if (!email) return res.send({ error: "Email is required" });
    if (!password) return res.send({ error: "Password is required" });

    // check username and email already exits
    const usernameExits = await UserModel.exists({ username });
    const emailExits = await UserModel.exists({ email });
    if (emailExits || usernameExits) {
      let erros = [];

      if (usernameExits) erros.push("Username unavaliable");
      if (emailExits) erros.push("Email already in use ");

      return res.status(400).json({ erros });
    }

    // Hash password and Store in db
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err)
        return res.status(500).send({ error: "Unable to hash the password" });
      // create user model with hashed password
      const user = new UserModel({
        username,
        email,
        password: hash,
      });

      // save user to db
      user
        .save()
        .then(() => {
          res.status(201).send({ msg: "User registerd successfully" });
        })
        .catch((err) => res.status(500).send(err));
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username) return res.send({ error: "Username is required" });
    if (!password) return res.send({ error: "Password is required" });

    const user = await UserModel.findOne({ username });
    console.log(user);

    if (!user) return res.status(404).send({ error: "Username not found" });

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) return res.status(500).send({ error: "Internal Server Error" });

      if (!result) return res.status(400).send({ error: "Wrong Password" });

      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username,
        },
        process.env.JWT_SKEY,
        {
          expiresIn: "24h",
        }
      );

      return res.status(200).send({
        msg: "Login Successfull",
        username: user.username,
        token,
      });
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}

async function getUser(req, res) {
  res.json("getuser");
}

async function updateUser(req, res) {
  res.json("update user");
}

module.exports = { registerUser, login, getUser, updateUser };
