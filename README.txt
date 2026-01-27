👤 User Details:
Name: Akshay
Email: akshay@game.com
Role: user
Password: akshaypassword123

👑 Admin Details:
Name: Admin User
Email: admin@game.com
Role: admin
Password: adminpassword

==================================================
🚀 GAME PROJECT API DOCUMENTATION
==================================================

Base URL: http://localhost:5000

--- 🔓 PUBLIC ENDPOINTS ---

1. GET /health
   - Description: Check server health, uptime, and status.
   
2. POST /api/users/register
   - Description: Register a new user. 
   - Body: { name, email, age, password }
   - Safety: Blocked from manually setting 'role'.

3. POST /api/users/login
   - Description: Login and receive a JWT Bearer Token.
   - Body: { email, password }

--- 🔒 PROTECTED ENDPOINTS (Login Required) ---

4. GET /api/users/profile
   - Description: View currently logged-in user details.
   - Header: Authorization: Bearer <token>

5. POST /api/users/logout
   - Description: Confirmation endpoint for logout.
   - Header: Authorization: Bearer <token>

6. PATCH /api/users/join-team
   - Description: Join a team. Updates user profile with team name.
   - Header: Authorization: Bearer <token>
   - Body: { teamName }

7. GET /api/teams
   - Description: View all teams in the game.
   - Header: Authorization: Bearer <token>

8. POST /api/teams/members
   - Description: View all members of a specific team and their total scores played for that team.
   - Header: Authorization: Bearer <token>
   - Body: { teamId }

9. POST /api/games/start
   - Description: Start a new game session. User must be part of a team.
   - Header: Authorization: Bearer <token>
   - Body: { difficultyLevel, no_of_overs, totalRunsNeeded }

10. PATCH /api/games/update-score
   - Description: Record a ball (runs, wicket, angle). Automates overs.
   - Header: Authorization: Bearer <token>
   - Body: { matchId, runs, wicket, angle }

11. GET /api/games/my-games
    - Description: Retrieve all games played by the current user.
    - Header: Authorization: Bearer <token>

--- 👑 ADMIN ONLY ENDPOINTS (Admin Role Required) ---

12. POST /api/teams
   - Description: Create a new game team.
   - Header: Authorization: Bearer <token>
   - Body: { teamName, tagLine, scores, wins, draws, losts }
