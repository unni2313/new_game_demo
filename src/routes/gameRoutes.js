import { Router } from 'express';
import { startGame, updateScore, getUserGames } from '../controllers/gameController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { startGameRules, updateScoreRules, handleValidationErrors, checkUserTeamMembership } from '../middlewares/gameMiddleware.js';
import { requestHandler } from '../middlewares/responseAndError.js';

const router = Router();

// Protect all routes
router.use(protect);

// GET /api/games/my-games
router.get('/my-games', requestHandler(getUserGames));

// POST /api/games/start
router.post('/start', checkUserTeamMembership, startGameRules, handleValidationErrors, requestHandler(startGame));

// PATCH /api/games/update-score
router.patch('/update-score', updateScoreRules, handleValidationErrors, requestHandler(updateScore));

export default router;
