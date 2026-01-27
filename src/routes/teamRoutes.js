import { Router } from 'express';
import { createTeam, getAllTeams, getTeamMembersStats } from '../controllers/teamController.js';
import { protect, protectedForAdmin } from '../middlewares/authMiddleware.js';
import { teamRules, handleValidationErrors } from '../middlewares/teamMiddleware.js';
import { requestHandler } from '../middlewares/responseAndError.js';

const router = Router();

// Protect all routes below
router.use(protect);

// GET /api/teams - Accessible by both users and admins
router.get('/', requestHandler(getAllTeams));

// POST /api/teams/members - Get scores for members of a specific team (teamId in body)
router.post('/members', requestHandler(getTeamMembersStats));

// POST /api/teams - Only Admin can create
router.post('/', protectedForAdmin, teamRules, handleValidationErrors, requestHandler(createTeam));

export default router;
