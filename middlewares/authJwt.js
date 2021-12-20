const { TokenExpiredError } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;
const Role = db.role;
const dotenv = require("dotenv");
dotenv.config();

const catchError = (err, res) => {
  if (err instanceof jwt.TokenExpiredError) {
    return res
      .status(401)
      .send({ message: "Unauthorized! Access token was expired" });
  }
  return res.status(401).send({
    message: "Unauthorized",
  });
};

function verifyToken(req, res, next) {
  console.log(`req.headers`, req.headers)
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token)
    return res.status(403).send({
      message: "No token provided",
    });
    console.log(`token`, token)
  jwt.verify(token, String(process.env.TOKEN_SECRET), (err, decoded) => {
    if (err) {
      catchError(err, res);
    } else {
      req.username = decoded.username;
      next();
    }
  });
}

isAdmin = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};

isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
};

function refreshToken(req, res) {
  const { username, refreshToken } = req.body;
  if (refreshToken in tokenList && tokenList[refreshToken] === username) {
    const { token, refreshToken } = generateTokens(username);
    res.json({ token, refreshToken });
  } else {
    res.status(500).send({
      message: "Failed to refresh the token",
    });
  }
}

const authJwt = {
  verifyToken,
  refreshToken,
  isAdmin,
  isModerator,
};
module.exports = authJwt;
