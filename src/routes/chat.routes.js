import express from "express";
import { startNewChat, sendChatMessage, getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/start", startNewChat); // Start new main chat
router.post("/send", sendChatMessage); // Send message in sub-chat
router.get("/:userId/:sessionId", getChatHistory); // Get chat history

export default router;
