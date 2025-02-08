import { Router } from "express";
import {generateResponse} from "../controllers/chat.controller.js";

const router = Router();

router.post("/generate", generateResponse);

export default router; 