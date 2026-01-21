import { Router } from 'express';
import { registerUser, loginUser, getProfile, logoutUser } from '../controllers/userController.js';
import { registrationRules, loginRules, handleValidationErrors, checkDuplicateEmail, hashPassword, findUser, restrictRoleParameter } from '../middlewares/userMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/users/register
router.post('/register', restrictRoleParameter, registrationRules, handleValidationErrors, checkDuplicateEmail, hashPassword, registerUser);

// POST /api/users/login
router.post('/login', loginRules, handleValidationErrors, findUser, loginUser);

// POST /api/users/logout
router.post('/logout', protect, logoutUser);

// GET /api/users/profile (Protected)
router.get('/profile', protect, getProfile);

export default router;
