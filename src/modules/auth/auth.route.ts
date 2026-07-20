import express from 'express';
import { authController } from './auth.controller';
import auth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router()

router.post('/login',authController.loginUser)
router.post('/signup',authController.registerUser)
router.get(
  "/me",
  auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),
  authController.getMe
);

export const authRoutes = router;