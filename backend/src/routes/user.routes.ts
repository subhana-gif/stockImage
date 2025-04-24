import express from 'express'
import { registerUser, loginUser, resetPassword,forgotPassword } from '../controllers/user.controller'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router
