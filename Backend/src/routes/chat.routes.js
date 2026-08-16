const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

/* /api/chat */
router.post("/", authMiddleware.authUser, chatController.createChat);

module.exports = router;