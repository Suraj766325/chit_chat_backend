import {Router} from 'express'
import { createDbImage, getDbMessage } from '../controllers/message.controller.js'
import verifyJWT from '../middlewares/auth.middleware.js'
import upload from '../middlewares/multer.middleware.js'
import clearTempFile from '../middlewares/clearTempFile.middleware.js'

const router=Router()

router.use(verifyJWT)
router.route('/getDbMessage').post(getDbMessage)
router.route('/createDbImage')
        .post(
            upload.fields([{name:'image',maxCount:1}]),
            clearTempFile,
            createDbImage
        )

export default router