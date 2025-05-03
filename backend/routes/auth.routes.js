import express from "express";
import { getme, login, logout, signup } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router()

router.get('/me', verifyToken, getme)
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout',logout)

export default router
