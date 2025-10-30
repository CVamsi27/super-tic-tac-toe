# Super Tic Tac Toe

A real-time multiplayer Super Tic Tac Toe game with user authentication, leaderboards, and game tracking.

## ✨ Features

### Game Features
- 🎮 Real-time multiplayer Tic Tac Toe
- 📡 WebSocket-based live updates
- 👥 Multiplayer game creation and joining
- 👀 Spectator/watcher system
- ✅ Move validation and game logic
- 🏆 Win/Lose/Draw detection
- 🔄 Game reset for all players simultaneously

### User Features
- 🔐 Google OAuth 2.0 authentication
- 👤 User profiles with statistics
- 📊 Game history tracking with detailed stats
- ⭐ Points system (Win: +10, Draw: +1, Loss: -5)
- 🏅 Global leaderboard rankings
- 📈 Personal statistics (wins, losses, draws, win rate)

### Technical Features
- 🚀 Next.js 15 frontend with React 19
- ⚡ FastAPI backend with async/await
- 🔗 WebSocket real-time communication
- 🗄️ PostgreSQL database with SQLAlchemy ORM
- 🎨 Tailwind CSS with custom animations and gradients
- 📱 Fully responsive mobile design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.9+
- PostgreSQL
- Google OAuth credentials

### Setup (15 minutes)

1. **Get Google OAuth credentials** - See [QUICK_START.md](./QUICK_START.md)

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Google Client ID and database URL
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   npm install @react-oauth/google --legacy-peer-deps
   ```

4. **Setup database:**
   ```bash
   python -m alembic upgrade head
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   uvicorn api.main:app --reload --port 8000
   
   # Terminal 2: Frontend
   pnpm dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 15-minute setup guide
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Detailed authentication and leaderboard setup
- **[AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)** - System architecture and data flows
- **[AUTHENTICATION_SUMMARY.md](./AUTHENTICATION_SUMMARY.md)** - Complete feature overview

## 🎮 How to Play

1. **Start a Game**
   - Click "Play" on home page
   - Choose game mode (1v1 or with friends)
   - Share URL for multiplayer

2. **During Game**
   - Click cells to make moves
   - Watch real-time updates
   - Spectators can watch live

3. **After Game**
   - View results
   - If logged in: Points awarded automatically
   - Check leaderboard to see your rank

## 🔑 Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Game mode selection |
| Login | `/login` | Google OAuth login |
| Profile | `/profile` | User stats and history |
| Leaderboard | `/leaderboard` | Global rankings |
| Game | `/game/[gameId]` | Active game board |
| Rules | `/rules` | Game rules |

## 📊 Points System

| Result | Points | Notes |
|--------|--------|-------|
| Win | +10 | Victory bonus |
| Draw | +1 | Fair play |
| Loss | -5 | Penalty (min 0) |

## 🏗️ Project Structure

```
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── login/                   # Login page
│   ├── profile/                 # User profile page
│   ├── leaderboard/             # Leaderboard page
│   └── game/                    # Game pages
├── components/                   # React components
│   ├── Game/                    # Game components
│   ├── Navbar/                  # Navigation
│   └── ui/                      # UI components
├── context/                      # React context
│   └── AuthContext.tsx          # Authentication context
├── hooks/                        # Custom React hooks
│   └── useGameWebSocket.ts      # WebSocket hook
├── api/                          # FastAPI backend
│   ├── main.py                  # Main app
│   ├── routers/                 # API routes
│   │   ├── game_router.py       # Game endpoints
│   │   └── auth_router.py       # Auth endpoints
│   ├── services/                # Business logic
│   │   ├── game_service.py      # Game logic
│   │   └── auth_service.py      # Auth logic
│   ├── db/                      # Database
│   │   ├── database.py          # DB config
│   │   ├── models.py            # Game models
│   │   └── user_models.py       # User models
│   ├── models/                  # Pydantic schemas
│   │   ├── game.py              # Game schemas
│   │   └── auth.py              # Auth schemas
│   └── utils/                   # Utilities
│       └── game_logic.py        # Game logic
└── alembic/                      # Database migrations
```

## 🔌 API Endpoints

### Authentication
- `POST /api/py/auth/google-login` - Login with Google
- `GET /api/py/auth/me` - Get current user
- `GET /api/py/auth/history` - Get game history
- `POST /api/py/auth/save-game` - Save game result

### Game
- `WS /api/py/game/ws/{gameId}/{playerId}` - WebSocket connection
- Game updates via WebSocket messages

### Leaderboard
- `GET /api/py/leaderboard` - Get all players
- `GET /api/py/leaderboard/top` - Get top 10 players

## 🔐 Security

- ✅ Google OAuth 2.0 verification
- ✅ JWT token authentication (30-day expiration)
- ✅ Protected endpoints with token validation
- ✅ Password-less login
- ⚠️ For production: Use HTTPS, change SECRET_KEY, enable CORS restrictions

## 📱 Responsive Design

- Mobile-first approach
- Works on all screen sizes
- Touch-friendly controls
- Optimized animations

## 🛠️ Tech Stack

### Frontend
- Next.js 15.0.3
- React 19.0.0
- TypeScript 5.6.2
- Tailwind CSS 3.4.12
- Zustand (state management)
- Lucide React (icons)

### Backend
- FastAPI 0.109.0
- Uvicorn 0.24.0
- SQLAlchemy 2.0.44
- PostgreSQL
- Python-Jose 3.3.0
- google-auth 2.25.2
- PyJWT 2.8.1

## 🧪 Testing

Run tests with:
```bash
pytest
# or with coverage
pytest --cov=api
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Any Python host)
```bash
pip install -r requirements.txt
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

Update environment variables for production URLs.

## 📝 License

See LICENSE file

## 🤝 Contributing

Pull requests are welcome!

## 📞 Support

See documentation files:
- Questions about setup → [QUICK_START.md](./QUICK_START.md)
- Architecture questions → [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)
- Feature details → [AUTH_SETUP.md](./AUTH_SETUP.md)

---

**Built with ❤️ using Next.js + FastAPI + PostgreSQL**

```

Key Improvements in this Version:
1. Modular architecture
2. Separation of concerns
3. Dependency injection
4. Improved error handling
5. Scalable design

Next steps could include:
- Adding authentication
- Implementing more advanced game rules
- Adding logging
- Creating comprehensive error handling

Would you like me to elaborate on any part of the implementation?
```

## Getting Started

First, create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Then, install the dependencies:

```bash
pnpm install
pnpm pyi
```

Then, run the development server(python dependencies will be installed automatically here):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).
