import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import clearTempFile from "../middlewares/clearTempFile.middleware.js";
import {loginUser, logoutUser, refreshUser, registerUser,} from "../controllers/user.contorller.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router=Router()

router.route('/registerUser')
        .post(upload.fields([{name:'avatar',maxCount:1}]),
                clearTempFile,
                registerUser
        )
router.route('/loginUser').post(loginUser)
router.route('/logoutUser').get(logoutUser)
router.route('/refreshUser').get(refreshUser)
export default router