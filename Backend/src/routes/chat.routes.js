const router = require("express").Router();
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

/* /api/chat */
router.get("/", authMiddleware.authUser, chatController.getChats)
router.post("/create", authMiddleware.authUser, chatController.createChat);
router.get("/:chatId/messages", authMiddleware.authUser, chatController.getMessages);
router.patch("/:chatId", authMiddleware.authUser, chatController.renameChat);
router.delete("/:chatId", authMiddleware.authUser, chatController.deleteChat);

module.exports = router;
