# Walkthrough: Complete Project Flow

This walkthrough guides you through the entire process from user registration to starting a game and updating the score.

## Prerequisites
- Server must be running (usually `npm start` or `npm run dev`)
- Base URL: `http://localhost:5000`

---

## 1. User Registration
**Endpoint:** `POST /api/users/register`  
**Description:** Create a new user account.

**Request Body:**
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "age": 25,
  "password": "password123"
}
```

**Expected Response:**
- `201 Created`
- `message`: "User registered successfully"
- `data.token`: Save this token for subsequent requests.

---

## 2. User Login
**Endpoint:** `POST /api/users/login`  
**Description:** Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Expected Response:**
- `200 OK`
- `data.token`: If you didn't save it during registration, save it now.

---

## 3. Join a Team
**Endpoint:** `PATCH /api/users/join-team`  
**Description:** Users must join a team before they can start a game.

**Headers:**
`Authorization: Bearer <YOUR_TOKEN>`

**Request Body:**
```json
{
  "teamName": "Validated Team"
}
```
*(Note: Use "Validated Team" or any other existing team name)*

**Expected Response:**
- `200 OK`
- `message`: "Successfully joined team: Validated Team"

---

## 4. Start a New Game
**Endpoint:** `POST /api/games/start`  
**Description:** Initialize a match session.

**Headers:**
`Authorization: Bearer <YOUR_TOKEN>`

**Request Body:**
```json
{
  "difficultyLevel": "Easy",
  "no_of_overs": 2,
  "totalRunsNeeded": 20
}
```

**Expected Response:**
- `201 Created`
- `message`: "Game started successfully"
- `data.matchId`: **Save this MATCH ID** (e.g., `MATCH173789...`)

---

## 5. Update Score (Record a Ball)
**Endpoint:** `PATCH /api/games/update-score`  
**Description:** Record the result of a single ball.

**Headers:**
`Authorization: Bearer <YOUR_TOKEN>`

**Request Body:**
```json
{
  "matchId": "<MATCH_ID_FROM_STEP_4>",
  "runs": 4,
  "wicket": false,
  "angle": 45
}
```

**Expected Response:**
- `200 OK`
- `data.currentStats`: Shows updated runs, wickets, and overs.
- `data.status`: "in-progress" (or "completed" if target is met or overs are finished).

---

## 6. Verify Profile
**Endpoint:** `GET /api/users/profile`  
**Description:** Check user details and team membership.

**Headers:**
`Authorization: Bearer <YOUR_TOKEN>`

**Expected Response:**
- `200 OK`
- `data.team`: Should show "Validated Team".

---

## 7. View My Games
**Endpoint:** `GET /api/games/my-games`  
**Description:** Retrieve a history of all games played by you.

**Headers:**
`Authorization: Bearer <YOUR_TOKEN>`

**Expected Response:**
- `200 OK`
- `results`: Number of games found.
- `data.games`: An array of game objects including scores, status, and match IDs.
