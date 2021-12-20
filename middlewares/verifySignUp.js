const db = require("../models");
const User = db.user;
const ROLES = db.ROLES;

const checkDuplicateUsernameOrEmail = (req, res, next) => {
  const { username, email } = req.body;
  User.findOne(
    {
      username,
    },
    (err, user) => {
      if (err) {
        res.status(500).json({ message: err });
        return;
      }
      if (user) {
        return res.status(500).json({ message: "Username already used" });
      }
      User.findOne(
        {
          email,
        },
        (err, user) => {
          if (err) {
            res.status(500).json({ message: err });
          }

          if (user) {
            res.status(500).json({
              message: "Email already in use",
            });
          }
        }
      );
      next();
    }
  );

};

const checkRolesExisted = (req, res, next) => {
  const { roles } = req.body;
  if (!roles) {
    res.status(500).json({
      message: `Roles must be specified`,
    });
  } else {
    roles.map((role) => {
      if (ROLES.indexOf(role) === -1) {
        res.status(500).json({
          message: `Role: ${role} does not exist`,
        });
        return;
      }
    });
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
};

module.exports = verifySignUp;
