const router = require("express").Router();
const AuthController = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");

router.get("/me", authUser, AuthController.getCurrentUser);
router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/logout", AuthController.logoutUser);

module.exports = router;
