import express from "express"
import { commentOnPost, createPost, deletePost, getFollowingPosts, getPosts, getUserPosts, likedPosts, likeUnlikePost } from "../controllers/post.controller.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.post("/create", verifyToken, createPost)
router.get("/all", verifyToken, getPosts)
router.get("/likes/:id", verifyToken, likedPosts)
router.get("/following", verifyToken, getFollowingPosts)
router.get("/user/:username", verifyToken, getUserPosts)
router.delete("/:id", verifyToken, deletePost)
router.post("/comment/:id", verifyToken, commentOnPost)
router.post("/like/:id", verifyToken, likeUnlikePost)



export default router