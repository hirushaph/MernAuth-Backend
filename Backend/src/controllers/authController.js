const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const UserModel = require("../models/userModel");

// bcrypt salt rounds
const saltRounds = 10;

function createToken(data) {
  const token = jwt.sign(data, process.env.JWT_SKEY, {
    expiresIn: "24h",
  });
  return token;
}

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  try {
    if (!username)
      return res.status(400).send({ error: "Username is required" });
    if (!email) return res.status(400).send({ error: "Email is required" });
    if (!password)
      return res.status(400).send({ error: "Password is required" });

    if (!validator.isEmail(email))
      return res.status(400).send({ error: "Email is not valid" });

    if (!validator.isStrongPassword(password))
      return res.status(400).send({ error: "Password must be strong" });

    // check username and email already exits
    const usernameExits = await UserModel.exists({ username });
    const emailExits = await UserModel.exists({ email });
    if (emailExits || usernameExits) {
      let erros = [];

      if (usernameExits) erros.push("Username unavaliable");
      if (emailExits) erros.push("Email already in use");

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
        .then((user) => {
          // generate token

          const token = createToken({
            userId: user._id,
            username: user.username,
          });

          res.status(201).send({ msg: "User registerd successfully", token });
        })
        .catch((err) => res.status(500).send(err));
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    if (!username) return res.send({ error: "Username is required" });
    if (!password) return res.send({ error: "Password is required" });

    const user = await UserModel.findOne({ username });
    console.log(user);

    if (!user) return res.status(404).send({ error: "Username not found" });

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) return res.status(500).send({ error: "Internal Server Error" });

      if (!result) return res.status(400).send({ error: "Wrong Password" });

      const token = createToken({
        userId: user._id,
        username: user.username,
      });

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
  const { username } = req.params;
  if (username != req.user.username)
    return res.status(400).send({ error: "Auth Failed" });

  if (!username) return res.send(400).send({ error: "Username is required" });

  const user = await UserModel.findOne({ username });

  if (!user) return res.status(500).send({ error: "User not found" });

  const { password, ...rest } = user.toJSON();
  res.send(rest);
}

async function updateUser(req, res) {
  const { userId } = req.user;
  try {
    if (!userId) throw new Error("User not found");

    const body = req.body;

    // check if body is empty
    if (Object.keys(body).length === 0)
      throw new Error("Update body cannot be empty");

    // update the user
    const updateUser = UserModel.updateOne({ _id: userId }, body);

    if (!updateUser) throw new Error("User Update Failed");

    res.status(201).send({ msg: "User updated successfully" });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

module.exports = { registerUser, login, getUser, updateUser };
