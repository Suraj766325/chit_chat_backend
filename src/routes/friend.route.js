import { Router } from "express";
import { getFriend } from "../controllers/friend.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router=Router()

router.route('/getFriend').get(verifyJWT,getFriend)

export default router