import { Router } from "express";
import {registerUser, loginUser, getMe} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
    registerUser
);

router.route("/login").post(
    loginUser
);

router.route("/me").get(
    getMe
);

export default router;