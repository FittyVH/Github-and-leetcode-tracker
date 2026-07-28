# Git & Leet Tracker

Git & Leet Tracker is a full-stack, production-deployed web application built for peer developer groups, competitive programmers, and coding study circles. It enables users to log in securely with GitHub, link their LeetCode profiles, form groups, and compete on daily and overall problem-solving leaderboards in real time.

---

## Architecture & Deployment Highlights

The project is architected to run seamlessly in modern cloud deployment environments (such as Render, Vercel, Netlify, or AWS):

- Cross-Origin Auth & Security: Configured with CORS credential handling, JWT auth in standard Authorization headers, and security policies (COOP/Permissions Policy) compliant with modern browser rules like Chrome's Bounce Tracking Mitigation.
- Backend Cold-Start Resilience: Integrated client-side exponential retries and status feedback to automatically handle free-tier cloud backend wake-ups (e.g., Render web service spin-up).
- Production Database: Powered by MongoDB Atlas cloud cluster with Mongoose ORM models.

---

## Core Features

- GitHub OAuth 2.0 Authentication: Single sign-on powered by GitHub OAuth 2.0 with JWT token-based session verification.
- LeetCode Profile Integration: Flexible URL or username linking with automatic profile parsing and validation.
- Group Creation & Membership:
  - Create custom tracking groups and receive unique shareable Group IDs.
  - Join active groups using invite IDs.
  - View member rosters and track group creators.
- Live Leaderboards & Analytics:
  - Daily Mode: Ranks members based on LeetCode questions solved within the last 24 hours.
  - Overall Mode: Compares total questions solved categorized by Easy, Medium, and Hard difficulties.
- Daily Solved Questions Dropdown: Expandable list of specific LeetCode problems completed today by group members with direct links to problem statements.

---

## Tech Stack

### Frontend
- Framework: React 19 + Vite 6
- Styling: styled-components (CSS-in-JS design system)
- Deployment Target: Vercel / Netlify / Static Hosting

### Backend
- Runtime: Node.js
- Framework: Express.js (v5)
- Database: MongoDB Atlas via Mongoose
- Auth: GitHub OAuth 2.0 + JWT (jsonwebtoken)
- Deployment Target: Render / Railway / Heroku

---

## Project Structure

```text
Github-and-leetcode-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (GitHub OAuth, LeetCode, Groups)
│   │   ├── db/               # MongoDB Atlas connection
│   │   ├── middlewares/      # JWT auth verification middleware
│   │   ├── models/           # User & Group Mongoose schemas
│   │   ├── routes/           # API endpoints (/api/auth, /api/group)
│   │   └── services/         # OAuth & external helper services
│   ├── app.js                # Express app configuration & middleware
│   ├── server.js             # HTTP server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Homepage, GroupDetails, Modals, etc.)
│   │   ├── App.jsx           # Main App component & auth session loader
│   │   ├── config.js         # API Base URL & authenticated fetch helper
│   │   └── main.jsx          # React DOM root
│   ├── index.html
│   └── package.json
└── README.md                 # Production Documentation
```

---

### Backend Environment Variables (`backend/.env`)

When deploying the backend (e.g., on Render), configure the following environment variables in your deployment platform dashboard:

| Variable | Description | Example |
| :--- | :--- | :--- |
| PORT | Port number for the server | 3000 |
| MONGO_DB_CLUSTER / MONGO_URI | MongoDB Atlas Connection String | mongodb+srv://user:pass@cluster.mongodb.net/dbname |
| JWT_SECRET | Secret key used for signing JWT tokens | your_jwt_secret_key |
| GITHUB_CLIENT_ID | Client ID from GitHub OAuth App | Ov23li... |
| GITHUB_CLIENT_SECRET | Client Secret from GitHub OAuth App | ccf7c7... |
| FRONTEND_URL | Deployed Frontend Origin URL | https://your-app.vercel.app |
| BACKEND_URL | Deployed Backend Origin URL | https://your-backend.onrender.com |

### Frontend Environment Variables (`frontend/.env`)

When deploying the frontend (e.g., on Vercel or Netlify), set:

| Variable | Description | Example |
| :--- | :--- | :--- |
| VITE_API_BASE_URL | URL of your deployed backend service | https://your-backend.onrender.com |

---

## Local Development Setup

If you want to run the project locally for development:

1. Clone the Repository
   ```bash
   git clone https://github.com/FittyVH/Github-and-leetcode-tracker.git
   cd Github-and-leetcode-tracker
   ```

2. Start Backend
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Start Frontend
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

   Open your browser at `http://localhost:5173`.

---

## API Reference

### Auth Routes (`/api/auth`)
- `GET /api/auth/github` - Initiates GitHub OAuth authentication flow.
- `GET /api/auth/github/callback` - Handles OAuth callback and returns JWT token.
- `GET /api/auth/github/me` - Fetches current authenticated user details.
- `PUT /api/auth/leetcode` - Updates or links the user's LeetCode username/profile URL.

### Group Routes (`/api/group`)
- `POST /api/group/create-group` - Creates a new group.
- `POST /api/group/join-group/:groupId` - Joins a group by Group ID.
- `POST /api/group/leave-group/:groupId` - Leaves a group.
- `GET /api/group/user-groups` - Retrieves all groups joined by the current user.
- `GET /api/group/:groupId/leaderboard` - Fetches real-time leaderboard stats for a group.

---

## License

Distributed under the ISC License.
