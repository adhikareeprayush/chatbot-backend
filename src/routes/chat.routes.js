import { Router } from "express";
import {fetchResponse} from "../controllers/chat.controller.js";

const router = Router();

router.post("/generate", fetchResponse);

export default router; 