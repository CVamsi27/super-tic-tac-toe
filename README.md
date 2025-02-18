# Super Tic Tac Toe Backend

## Project Setup

### Prerequisites

- Python 3.8+
- pip
- virtualenv (recommended)

## Project Structure

- `core/`: Contains fundamental models and game logic
- `routers/`: API route definitions
- `services/`: Business logic layer
- `main.py`: FastAPI application entry point

## Features

- Real-time multiplayer Tic Tac Toe
- WebSocket-based game updates
- Game creation and joining
- Move validation
- Win/Draw detection

## API Endpoints

- `POST /games/create`: Create a new game
- `POST /games/{game_id}/join`: Join an existing game
- `GET /games/{game_id}`: Get current game state
- `WS /ws/{game_id}/{player_id}`: WebSocket game updates

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
```

Then, run the development server(python dependencies will be installed automatically here):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).
