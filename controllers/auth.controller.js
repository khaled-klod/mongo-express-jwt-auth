const db = require("../models");
const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;
const dotenv = require("dotenv");
dotenv.config();
var jwt = require("jsonwebtoken");


function generateAccessToken(username) {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
}

async function generateAndSaveRefreshToken(user) {

  // Only create 
  const refreshToken = await RefreshToken.createToken(user)
  return refreshToken;
}

async function generateTokens(user) {
  const refreshToken = await generateAndSaveRefreshToken(user);
  const token = generateAccessToken(user.username);
  return {
    refreshToken,
    token,
  };
}

exports.signup = (req, res) => {
  const { username, password, roles, email } = req.body;
  const newUser = new User({
    username,
    password,
    email,
  });

  newUser.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (roles) {
      Role.find(
        {
          name: {
            $in: roles,
          },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({
              message: err,
            });
          }
          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({
                message: err,
              });
              return;
            }
            res.send({
              message: "User was registered successfully",
            });
            return;
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  const { username, password } = req.body;

  User.findOne({
    username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({
          message: err,
        });
        return;
      }

      if (!user) {
        res.status(404).send({
          message: "User not found",
        });
        return;
      }
      // check if password is matching
      user.comparePassword(password, async (err, isMatch) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        if (isMatch) {
          // sign JWT token
          const { token: accessToken, refreshToken } = await generateTokens(user);
          var authorities = [];
          for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
          }
          res.json({
            username: user.username,
            roles: authorities,
            email: user.email,
            accessToken,
            refreshToken,
            id: user._id,
          });
        } else {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!",
          });
        }
      });
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({
      token: requestToken,
    });
    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }
    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    const user = await User.findOne({ _id: refreshToken.user._id });
    if (!user) {
      res.status(403).json({ message: "User is not in database!" });
      return;
    }

    let newAccessToken = jwt.sign(
      { username: user.username },
      process.env.TOKEN_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
    res.send({
      accessToken: newAccessToken,
      refreshToken: requestToken,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
