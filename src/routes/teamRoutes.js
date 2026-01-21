import { Router } from 'express';
import { createTeam, getAllTeams } from '../controllers/teamController.js';
import { protect, protectedForAdmin } from '../middlewares/authMiddleware.js';
import { teamRules, handleValidationErrors } from '../middlewares/teamMiddleware.js';

const router = Router();

// Protect all routes below
router.use(protect);

// GET /api/teams - Accessible by both users and admins
router.get('/', getAllTeams);

// POST /api/teams - Only Admin can create
router.post('/', protectedForAdmin, teamRules, handleValidationErrors, createTeam);

export default router;
