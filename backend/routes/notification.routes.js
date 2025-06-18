import express from 'express'
import { verifyToken } from '../middleware/verifyToken.js'
import { deleteNotification, getNotification } from '../controllers/notification.controller.js'

const router = express.Router()

router.get("/", verifyToken, getNotification)
router.delete("/", verifyToken, deleteNotification)

export default router