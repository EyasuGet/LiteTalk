import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { getUserProfile, followUnfollowuser, updateUserProfile, getSuggestedUser } from "../controllers/user.controller.js"

const router = express.Router()

router.get('/profile/:username',verifyToken, getUserProfile)
router.get('/suggested',verifyToken, getSuggestedUser)
router.post("/follow/:id",verifyToken, followUnfollowuser)
router.post('/update',verifyToken, updateUserProfile)

export default router