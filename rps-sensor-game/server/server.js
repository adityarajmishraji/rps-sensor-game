// server.js - Multiplayer Backend
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const { config, findAvailablePort } = require('./config');
const portManager = require('./port-manager');
const userManager = require('./user-manager');

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Serve static files from the client/src directory
app.use(express.static(path.join(__dirname, '../client/src')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/src/index.html'));
});

const server = http.createServer(app);
const io = socketIO(server, {
    cors: config.cors,
    pingTimeout: config.socket.pingTimeout,
    pingInterval: config.socket.pingInterval
});

// Middleware
app.use(express.static('public'));

// Authentication routes
app.post('/auth/signup', async (req, res) => {
    try {
        const { username, password, location } = req.body;
        const user = await userManager.signup(username, password, location);
        res.json(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userManager.login(username, password);
        res.json(user);
    } catch (error) {
        res.status(401).send(error.message);
    }
});

// Game routes
app.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await userManager.getLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Game state management
class GameRoom {
    constructor(id) {
        this.id = id;
        this.players = new Map();
        this.gameState = {
            status: 'waiting', // waiting, playing, finished
            round: 1,
            choices: new Map(),
            scores: { player1: 0, player2: 0, ties: 0 },
            winner: null
        };
        this.maxPlayers = 2;
        this.createdAt = new Date();
    }

    addPlayer(playerId, socket) {
        if (this.players.size >= this.maxPlayers) {
            return { success: false, message: 'Room is full' };
        }

        const playerNumber = this.players.size + 1;
        this.players.set(playerId, {
            id: playerId,
            socket: socket,
            number: playerNumber,
            ready: false
        });

        return { success: true, playerNumber: playerNumber };
    }

    removePlayer(playerId) {
        this.players.delete(playerId);
        if (this.players.size === 0) {
            // Room is empty, can be cleaned up
            return true;
        }
        return false;
    }

    makeChoice(playerId, choice) {
        if (this.gameState.status !== 'playing') {
            return { success: false, message: 'Game not in progress' };
        }

        this.gameState.choices.set(playerId, choice);
        
        // Check if both players have made choices
        if (this.gameState.choices.size === 2) {
            this.evaluateRound();
        }

        return { success: true };
    }

    evaluateRound() {
        const choices = Array.from(this.gameState.choices.values());
        const players = Array.from(this.players.keys());
        
        const [choice1, choice2] = choices;
        const [player1Id, player2Id] = players;

        let result = this.determineWinner(choice1, choice2);
        
        if (result === 'tie') {
            this.gameState.scores.ties++;
        } else if (result === 'player1') {
            this.gameState.scores.player1++;
        } else {
            this.gameState.scores.player2++;
        }

        // Broadcast results to all players in room
        this.broadcastGameState();
        
        // Reset for next round
        setTimeout(() => {
            this.gameState.choices.clear();
            this.gameState.round++;
            this.broadcastGameState();
        }, 3000);
    }

    determineWinner(choice1, choice2) {
        if (choice1 === choice2) return 'tie';
        
        const winConditions = {
            rock: 'scissors',
            paper: 'rock',
            scissors: 'paper'
        };

        return winConditions[choice1] === choice2 ? 'player1' : 'player2';
    }

    broadcastGameState() {
        const gameData = {
            roomId: this.id,
            gameState: this.gameState,
            players: Array.from(this.players.values()).map(p => ({
                id: p.id,
                number: p.number,
                ready: p.ready
            }))
        };

        this.players.forEach(player => {
            player.socket.emit('gameUpdate', gameData);
        });
    }

    startGame() {
        if (this.players.size !== 2) {
            return { success: false, message: 'Need 2 players to start' };
        }

        this.gameState.status = 'playing';
        this.broadcastGameState();
        return { success: true };
    }
}

// Room management
const rooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('game_result', async (data) => {
        if (data.username) {
            const stats = await userManager.updateScore(data.username, data.result);
            socket.emit('stats_updated', stats);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Create room
    socket.on('createRoom', (callback) => {
        const roomId = generateRoomId();
        const room = new GameRoom(roomId);
        
        const result = room.addPlayer(socket.id, socket);
        if (result.success) {
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.currentRoom = roomId;
            
            callback({
                success: true,
                roomId: roomId,
                playerNumber: result.playerNumber
            });
        } else {
            callback({ success: false, message: result.message });
        }
    });

    // Join room
    socket.on('joinRoom', (roomId, callback) => {
        const room = rooms.get(roomId);
        
        if (!room) {
            callback({ success: false, message: 'Room not found' });
            return;
        }

        const result = room.addPlayer(socket.id, socket);
        if (result.success) {
            socket.join(roomId);
            socket.currentRoom = roomId;
            
            // If room is full, start the game
            if (room.players.size === 2) {
                room.startGame();
            }
            
            callback({
                success: true,
                roomId: roomId,
                playerNumber: result.playerNumber
            });
        } else {
            callback({ success: false, message: result.message });
        }
    });

    // Make choice
    socket.on('makeChoice', (choice, callback) => {
        const roomId = socket.currentRoom;
        const room = rooms.get(roomId);
        
        if (!room) {
            callback({ success: false, message: 'Not in a room' });
            return;
        }

        const result = room.makeChoice(socket.id, choice);
        callback(result);
    });

    // Player ready
    socket.on('playerReady', (callback) => {
        const roomId = socket.currentRoom;
        const room = rooms.get(roomId);
        
        if (room && room.players.has(socket.id)) {
            room.players.get(socket.id).ready = true;
            room.broadcastGameState();
            callback({ success: true });
        } else {
            callback({ success: false, message: 'Not in a room' });
        }
    });
});

// Utility functions
function generateRoomId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Cleanup empty rooms periodically
setInterval(() => {
    const now = new Date();
    rooms.forEach((room, roomId) => {
        const timeDiff = now - room.createdAt;
        if (timeDiff > 1000 * 60 * 60) { // 1 hour
            if (room.players.size === 0) {
                rooms.delete(roomId);
                console.log(`Cleaned up empty room: ${roomId}`);
            }
        }
    });
}, 1000 * 60 * 15); // Check every 15 minutes

// API endpoints
app.get('/api/rooms', (req, res) => {
    const activeRooms = Array.from(rooms.entries()).map(([id, room]) => ({
        id,
        players: room.players.size,
        status: room.gameState.status,
        createdAt: room.createdAt
    }));
    
    res.json({ rooms: activeRooms });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        rooms: rooms.size,
        uptime: process.uptime()
    });
});

// Serve auth page
app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'auth.html'));
});

// Start server
const startServer = () => {
    const port = config.port;
    
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`
ERROR: Port ${port} is already in use!
Please try one of the following:
1. Kill any existing processes using port ${port}
2. Set a different port using the PORT environment variable:
   - Windows: set PORT=3001 && npm run dev
   - Unix/Mac: PORT=3001 npm run dev
`);
            process.exit(1);
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

startServer();

module.exports = { app, server };