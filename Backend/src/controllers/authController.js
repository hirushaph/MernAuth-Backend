const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const UserModel = require("../models/userModel");

const otpGenerator = require("otp-generator");
const OtpModel = require("../models/passwordOtpModel");
const CustomError = require("../utils/customError");
const { createToken, createRefreshToken } = require("../utils/helpers");
const sendEmail = require("../utils/emai");

// bcrypt salt rounds
const saltRounds = 10;

// REGISTER USER
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

          const refreshToken = createRefreshToken({
            userId: user._id,
            username: user.username,
          });

          res
            .status(201)
            .send({ msg: "User registerd successfully", token, refreshToken });
        })
        .catch((err) => res.status(500).send(err));
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}

// LOGIN
async function login(req, res) {
  const { username, password } = req.body;

  try {
    if (!username) return res.send({ error: "Username is required" });
    if (!password) return res.send({ error: "Password is required" });

    const user = await UserModel.findOne({ username });

    if (!user) return res.status(404).send({ error: "Username not found" });

    bcrypt.compare(password, user.password, function (err, result) {
      if (err) return res.status(500).send({ error: "Internal Server Error" });

      if (!result) return res.status(400).send({ error: "Wrong Password" });

      const token = createToken({
        userId: user._id,
        username: user.username,
      });

      const refreshToken = createRefreshToken({
        userId: user._id,
        username: user.username,
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).send({
        msg: "Login Successfull",
        username: user.username,
        token,
        refreshToken,
      });
    });
  } catch (error) {
    return res.status(500).send(error);
  }
}

// GET USER
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

// UPDATE USER
async function updateUser(req, res) {
  const { userId } = req.user;
  try {
    if (!userId) throw new Error("User not found");

    const body = req.body;

    // check if body is empty
    if (Object.keys(body).length === 0)
      throw new Error("Update body cannot be empty");

    // update the user
    const updateUser = await UserModel.findOneAndUpdate({ _id: userId }, body);

    if (!updateUser) throw new Error("User Update Failed");

    res.status(201).send({ msg: "User updated successfully" });
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

// REFRESH TOKEN
async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  // const { jwt } = req.cookie;

  try {
    if (!refreshToken) throw new Error("Token not found");
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      function (err, decoded) {
        if (err) throw new Error("Auth Failed");

        const token = createToken({
          userId: decoded._id,
          username: decoded.username,
        });

        res.status(200).send({ token });
      }
    );
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
}

// GENERATE OTP
async function generateOtp(req, res, next) {
  try {
    const { username } = req?.query;
    if (!username) throw new Error("Username is required");

    const user = await UserModel.findOne({ username });

    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    bcrypt.hash(otp, 10, function (err, hash) {
      if (err) throw new Error("Failed generate otp");

      const newOtp = new OtpModel({
        userId: user._id.toString(),
        otp: hash,
        expiredAt: Date.now() + 60 * 60 * 1000,
      });

      newOtp
        .save()
        .then(() => {
          const message = `Your password reset otp is ${otp} , this otp valid for only 1hour`;

          res.send({ msg: "Otp send successfully", otp });
        })
        .catch((err) => next(err));
    });

    console.log(otp);
  } catch (error) {
    next(error);
  }
}

// OTP VERICATTION
async function verifyOtp(req, res, next) {
  try {
    const { otp, username } = req.body;
    if (!otp) throw new CustomError("Otp is required", 400);
    if (!username) throw new CustomError("Username is required", 400);

    const user = await UserModel.findOne({ username });
    if (!user) throw new CustomError("Username not Found", 400);
    const userId = user._id.toString();

    const hashedOtp = await OtpModel.findOne({ userId });

    if (!hashedOtp) throw new CustomError("OTP is not valid", 400);

    bcrypt.compare(otp, hashedOtp.otp, function (err, result) {
      if (err) next(err);

      if (!result) throw new CustomError("Otp is not valid", 400);

      OtpModel.deleteMany({ userId }).then(() => {
        req.app.locals.resetSession = true;
        res.send({ msg: "Otp Verified" });
      });
    });
  } catch (error) {
    next(error);
  }
}

// RESET PASSWORD
async function resetPassword(req, res, next) {
  try {
    const { resetSession } = req.app.locals;
    const { username, password, confirmpassword } = req.body;
    if (!resetSession || !username || !password || !confirmpassword)
      throw new CustomError("All fields are required", 400);

    const user = UserModel.findOne({ username });
    if (!user) throw new CustomError("User not found", 400);

    if (!password === confirmpassword)
      throw new CustomError("Password does not match");

    if (!validator.isStrongPassword(password))
      throw new CustomError("Password is not strong");

    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) throw new CustomError("Internal Server Error", 500);
      user.password = hash;

      user
        .save()
        .then(() => {
          res.status(200).send({ msg: "User updated successfully" });
        })
        .catch((err) => next(err));
    });
  } catch (error) {
    next(error);
  }
}

// LOGOUT
async function logout(req, res) {
  const { jwt } = req.cookies;
  if (!cookies?.jwt) return res.status(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: false });

  res.json({ message: "Cookie Cleared" });
}

module.exports = {
  registerUser,
  login,
  getUser,
  updateUser,
  refreshToken,
  generateOtp,
  verifyOtp,
  resetPassword,
  logout,
};
