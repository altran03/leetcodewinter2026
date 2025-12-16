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
│   ├── tests/
│   ├── requirements.txt
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

## 🆓 Free Deployment Options

All platforms below offer **free tiers** perfect for this project:

### Recommended: Railway (Easiest Free Option)

**Why Railway?**
- ✅ $5/month free credit (enough for small apps)
- ✅ Deploys from GitHub automatically
- ✅ Built-in MongoDB option
- ✅ Simple setup

**Steps:**

1. **Sign up**: [railway.app](https://railway.app) (GitHub login)

2. **Deploy Backend:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repo → Choose `backend` folder
   - Add environment variables:
     ```
     MONGODB_URL=mongodb://mongo:27017  # If using Railway MongoDB
     # OR
     MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/leetcode_leaderboard
     ADMIN_TOKEN=your-secret-token-here
     CORS_ORIGINS=["https://your-frontend.vercel.app"]
     ```
   - Railway auto-detects Python and runs it

3. **Add MongoDB (if needed):**
   - In Railway dashboard → "New" → "Database" → "MongoDB"
   - Copy connection string to `MONGODB_URL`

4. **Deploy Frontend:**
   - **Option A: Vercel (Free)**
     - Push code to GitHub
     - Go to [vercel.com](https://vercel.com) → Import project
     - Set root directory: `frontend`
     - Add environment variable: `VITE_API_URL=https://your-backend.railway.app`
     - Deploy!
   
   - **Option B: Railway (Same Platform)**
     - New service → Deploy from GitHub → `frontend` folder
     - Set build command: `npm install && npm run build`
     - Set start command: `npx serve -s dist -l 3000`
     - Add env: `VITE_API_URL=https://your-backend.railway.app`

**Your URLs:**
- Frontend: `https://your-app.vercel.app` or `https://your-frontend.up.railway.app`
- Backend: `https://your-backend.up.railway.app`

### Alternative: Render (100% Free Tier)

**Steps:**

1. **Sign up**: [render.com](https://render.com) (GitHub login)

2. **Deploy Backend:**
   - "New" → "Web Service" → Connect GitHub repo
   - Settings:
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables (same as Railway)
   - Deploy!

3. **Add MongoDB:**
   - "New" → "MongoDB" (free tier available)
   - Copy connection string

4. **Deploy Frontend:**
   - Use Vercel (same as above) or Render Static Site

**Note:** Render free tier spins down after 15min inactivity (takes ~30s to wake up)

### Alternative: Fly.io (Free Tier)

**Steps:**

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy backend
cd backend
fly launch
# Follow prompts, then:
fly secrets set MONGODB_URL=your-mongodb-url
fly secrets set ADMIN_TOKEN=your-token
fly secrets set CORS_ORIGINS='["https://your-frontend.vercel.app"]'
fly deploy

# Deploy frontend to Vercel (same as above)
```

### MongoDB Atlas (Free Database)

**If you need a free cloud database:**

1. Sign up: [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster (M0 - 512MB)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all for cloud deployment)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/leetcode_leaderboard`

**Use this connection string in your backend environment variables!**

---

## 📝 Quick Deployment Checklist

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Railway/Render/Fly.io
3. ✅ Set backend environment variables (MongoDB URL, admin token, CORS)
4. ✅ Deploy frontend to Vercel
5. ✅ Set frontend `VITE_API_URL` to your backend URL
6. ✅ Test the app!

**Total cost: $0/month** 🎉

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

## Deployment

### Backend Deployment (Railway/Render/Fly.io)

#### Railway

1. Create a new project on [Railway](https://railway.app)
2. Add a MongoDB database service
3. Deploy from GitHub or Docker image:
   ```bash
   # Build and push Docker image
   cd backend
   docker build -t your-registry/leetcode-backend .
   docker push your-registry/leetcode-backend
   ```
4. Set environment variables:
   - `MONGODB_URL`: Your MongoDB connection string
   - `ADMIN_TOKEN`: Your secret admin token
   - `CORS_ORIGINS`: `["https://your-frontend-domain.vercel.app"]`

#### Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as Railway)
6. Add a MongoDB database (Render or MongoDB Atlas)

#### Fly.io

```bash
cd backend

# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login and launch
fly auth login
fly launch

# Set secrets
fly secrets set MONGODB_URL=your-mongodb-url
fly secrets set ADMIN_TOKEN=your-secret-token
fly secrets set CORS_ORIGINS='["https://your-frontend.vercel.app"]'

# Deploy
fly deploy
```

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Set environment variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://leetcode-api.railway.app`)
5. Deploy!

**Or via CLI:**

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set production environment variable
vercel env add VITE_API_URL production
# Enter: https://your-backend-url.railway.app
```

### MongoDB Atlas Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist IPs (or allow all with `0.0.0.0/0` for cloud deployment)
4. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/leetcode_leaderboard`

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

