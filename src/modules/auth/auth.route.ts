import express from 'express';
import { authController } from './auth.controller';

const router = express.Router()

router.post('/login',authController.loginUser)
router.post('/signup',authController.registerUser)
router.get('/me',authController.getMe)

export const authRoutes = router;