const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  //get token from http headers
  const token = req.headers?.authorization?.split(" ")[1];

  // check token exits and verify
  if (!token) return res.status(401).send({ error: "Auth Failed" });

  jwt.verify(token, process.env.JWT_SKEY, function (err, decoded) {
    if (err) return res.status(401).send({ error: "Auth Failed" });

    // set decoded value to req for use later
    req.user = decoded;
    next();
  });
}

module.exports = authenticate;
