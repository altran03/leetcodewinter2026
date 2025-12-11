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

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone and start all services:**
   ```bash
   # Set your admin token (optional, has default)
   export ADMIN_TOKEN=your-secret-token

   # Start all services
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - MongoDB: localhost:27017

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create .env file)
export MONGODB_URL=mongodb://localhost:27017
export MONGODB_DB_NAME=leetcode_leaderboard
export ADMIN_TOKEN=your-secret-token

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set API URL (optional, uses proxy by default)
export VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

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

