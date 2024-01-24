async function registerUser(req, res) {
  res.json("Register");
}

async function login(req, res) {
  res.json("login");
}

async function getUser(req, res) {
  res.json("getuser");
}

async function updateUser(req, res) {
  res.json("update user");
}

module.exports = { registerUser, login, getUser, updateUser };
