# LeetCode Leaderboard

A full-stack public LeetCode leaderboard application that tracks and compares LeetCode progress across users.

## Tech Stack

- **Frontend**: React + TypeScript (TSX), Vite, TailwindCSS
- **Backend**: Python FastAPI
- **Database**: MongoDB
- **Containerization**: Docker + Docker Compose

## Features

- 🏆 Public leaderboard sorted by score
- 📊 Track Easy, Medium, and Hard problem counts
- 🔢 Score calculation: `Easy×1 + Medium×2 + Hard×3`
- 🔄 Auto-fetch stats from LeetCode's public GraphQL API
- 🛡️ Simple admin token authentication for management
- 🐳 Docker support for local development and deployment

## Project Structure

```
leetcodewinter2026/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── users.py          # User & leaderboard endpoints
│   │   │   └── update.py         # Stats update endpoints
│   │   ├── core/
│   │   │   ├── config.py         # App configuration
│   │   │   └── db.py             # MongoDB connection
│   │   ├── models/
│   │   │   └── user.py           # User model
│   │   ├── schemas/
│   │   │   └── user.py           # Pydantic schemas
│   │   ├── services/
│   │   │   ├── leetcode_scraper.py  # LeetCode API client
│   │   │   └── score_calculator.py  # Score logic
│   │   └── main.py               # FastAPI app entry
│   ├── api/
│   │   └── index.py              # Vercel serverless entry point
│   ├── tests/
│   ├── requirements.txt
│   ├── vercel.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeaderboardTable.tsx
│   │   │   └── UserCard.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── Admin.tsx
│   │   ├── hooks/
│   │   │   └── useLeaderboard.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── leaderboard.ts
│   │   ├── styles/
│   │   │   └── global.css
│   │   └── utils/
│   │       └── formatScore.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🚀 Local Development

### Prerequisites
- **Docker & Docker Compose** (for easiest setup), OR
- **Python 3.12+** and **Node.js 20+** (for manual setup)
- **MongoDB** (included in Docker, or install locally)

### Option 1: Docker Compose (Easiest - Recommended)

**One command to start everything:**

```bash
# From the project root directory
docker-compose up --build
```

**That's it!** Wait for all services to start, then access:
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs
- 🗄️ **MongoDB**: localhost:27017

**To stop:**
```bash
docker-compose down
```

**To stop and remove data:**
```bash
docker-compose down -v
```

### Option 2: Manual Setup (No Docker)

#### Step 1: Start MongoDB

**Option A: Install MongoDB locally**
- macOS: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`
- Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

Then start it:
```bash
# macOS/Linux
mongod

# Or use a service manager
brew services start mongodb-community  # macOS
sudo systemctl start mongod           # Linux
```

**Option B: Use MongoDB Atlas (Free Cloud)**
- Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Create a free cluster
- Get connection string (we'll use it below)

#### Step 2: Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGODB_URL=mongodb://localhost:27017  # Or your Atlas URL
export MONGODB_DB_NAME=leetcode_leaderboard
export ADMIN_TOKEN=my-secret-token-123

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be at: http://localhost:8000

#### Step 3: Start Frontend

**Open a new terminal:**

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be at: http://localhost:5173

**That's it!** The frontend automatically proxies API calls to the backend.

---

## 🚀 Deployment (Vercel + MongoDB Atlas)

### Step 1: Set Up MongoDB Atlas (Free Database)

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0 - 512MB)
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (allow all for cloud deployment)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/leetcode_leaderboard`

### Step 2: Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com) → Login with GitHub

2. Click **"Add New..."** → **"Project"**

3. Select your repository

4. **Configure for Backend:**
   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `backend` |
   | **Framework Preset** | `Other` |

5. **Add Environment Variables:**
   | Name | Value |
   |------|-------|
   | `MONGODB_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/leetcode_leaderboard` |
   | `ADMIN_TOKEN` | `your-secret-token` |
   | `CORS_ORIGINS` | `["*"]` |

6. Click **"Deploy"**

7. **Copy your backend URL** (e.g., `https://leetcode-backend.vercel.app`)

### Step 3: Deploy Frontend to Vercel

1. Go back to Vercel dashboard

2. Click **"Add New..."** → **"Project"**

3. Select your repository **again** (same repo, different deployment)

4. **Configure for Frontend:**
   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | `Vite` |

5. **Add Environment Variable:**
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://your-backend-url.vercel.app` |

6. Click **"Deploy"**

### Your URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.vercel.app`
- **API Docs**: `https://your-backend.vercel.app/docs`

### Note: Auto-Updates

Since Vercel uses serverless functions, the auto-scheduler is disabled. To enable automatic hourly updates:

1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create a new cron job:
   - **URL**: `https://your-backend.vercel.app/admin/update_all`
   - **Method**: `POST`
   - **Header**: `X-Admin-Token: your-admin-token`
   - **Schedule**: Every hour

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/leaderboard` | Get leaderboard (sorted by score) |
| GET | `/user/{user_id}` | Get specific user |

### Admin Endpoints (Require `X-Admin-Token` header)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/user/add` | Add new user |
| DELETE | `/admin/user/{user_id}` | Remove user |
| POST | `/admin/update_all` | Update all users' stats (sync) |
| POST | `/admin/update_all/async` | Update all users' stats (background) |
| POST | `/admin/update_user/{user_id}` | Update single user's stats |

### Example API Calls

```bash
# Get leaderboard
curl http://localhost:8000/leaderboard

# Add user (admin)
curl -X POST http://localhost:8000/admin/user/add \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: your-secret-token" \
  -d '{"username": "John Doe", "leetcode_username": "johndoe123"}'

# Update all stats (admin)
curl -X POST http://localhost:8000/admin/update_all \
  -H "X-Admin-Token: your-secret-token"

# Remove user (admin)
curl -X DELETE http://localhost:8000/admin/user/{user_id} \
  -H "X-Admin-Token: your-secret-token"
```

## Configuration

### Environment Variables

#### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URL` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DB_NAME` | `leetcode_leaderboard` | Database name |
| `ADMIN_TOKEN` | `super-secret-admin-token-change-me` | Admin authentication token |
| `CORS_ORIGINS` | `["http://localhost:5173"]` | Allowed CORS origins |
| `RATE_LIMIT_DELAY` | `1.0` | Delay between LeetCode API calls (seconds) |

#### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` (uses proxy) | Backend API URL |

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend (if tests added)
cd frontend
npm test
```

### Hot Reload

Both frontend and backend support hot reload in development:
- Backend: Uses `--reload` flag with uvicorn
- Frontend: Vite dev server with HMR
- Docker volumes mount source code for live updates

## Best Practices

1. **Security**: Always change the default `ADMIN_TOKEN` in production
2. **Rate Limiting**: The LeetCode scraper includes 1-second delays between requests
3. **Error Handling**: All API errors return consistent JSON responses
4. **Database Indexes**: Indexes are created on `leetcode_username` (unique) and `score`
5. **CORS**: Configure `CORS_ORIGINS` for your production domains

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `docker-compose ps`
- Check connection string format
- Verify network connectivity between services

### LeetCode API Issues
- Some usernames may not exist or be private
- Rate limiting is applied to prevent blocks
- Check `failed_count` in update responses

### CORS Errors
- Verify `CORS_ORIGINS` includes your frontend domain
- Check for trailing slashes in URLs

## License

MIT License - feel free to use this for your own leaderboards!
