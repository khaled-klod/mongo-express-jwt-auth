const { verifyToken, isAdmin } = require("../middlewares/authJwt");
const {adminBoard, moderatorBoard, userBoard, allAccess} = require("../controllers/user.controller")
const db = require('../models')
const User = db.user;
const roles = db.ROLES;

module.exports = function (app) {
  
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", allAccess);

  app.get("/api/test/user", [verifyToken], userBoard);

  app.get(
    "/api/test/mod",
    [verifyToken, isModerator],
    moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [verifyToken, isAdmin],
    adminBoard
  );
};
