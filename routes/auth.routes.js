const {
  signup,
  signin,
  refreshToken,
} = require("../controllers/auth.controller");
const {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
} = require("../middlewares/verifySignUp");


module.exports = function (app) {
  app.post(
    "/api/auth/signup",
    [checkDuplicateUsernameOrEmail, checkRolesExisted],
    signup
  );

  app.post("/api/auth/signin", signin);

  app.post("/api/auth/refreshtoken", refreshToken);
};
