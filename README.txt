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

6. GET /api/teams
   - Description: View all teams in the game.
   - Header: Authorization: Bearer <token>

--- 👑 ADMIN ONLY ENDPOINTS (Admin Role Required) ---

7. POST /api/teams
   - Description: Create a new game team.
   - Header: Authorization: Bearer <token>
   - Body: { teamName, tagLine, scores, wins, draws, losts }
