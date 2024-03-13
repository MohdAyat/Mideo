import { Router } from "express";
import 
{ registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getUser,
  updateUserDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory
} 
from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { jwtVerify } from "../middlewares/auth.middleware.js";

const router = Router()
router.route('/register').post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser)

router.route('/login').post(loginUser)

// secured routes
router.route('/logout').post(jwtVerify,logoutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').patch(jwtVerify,changePassword)
router.route('/get-user').get(jwtVerify,getUser)
router.route('/update-details').patch(jwtVerify,updateUserDetails)
router.route('/update-avatar').patch(jwtVerify,upload.single('avatar'),updateAvatar)
router.route('/update-coverimage').patch(jwtVerify,upload.single('coverImage'),updateCoverImage)
router.route('/c/:username').get(jwtVerify,getUserChannelProfile)
router.route('/history').get(jwtVerify,getWatchHistory)

export default router