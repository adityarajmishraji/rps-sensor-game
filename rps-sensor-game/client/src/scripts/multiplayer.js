class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.socket = io();
        this.roomId = null;
        this.playerNumber = null;
        this.isSpectator = false;
        this.chatMessages = [];
        this.playerStats = new Map();
        this.setupSocketEvents();
        this.setupChatUI();
    }

    setupSocketEvents() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('gameUpdate', (data) => {
            this.handleGameUpdate(data);
        });

        this.socket.on('playerLeft', ({ playerId }) => {
            if (this.game.currentMode === 'online') {
                alert('Opponent left the game!');
                this.leaveRoom();
            }
        });

        this.socket.on('error', ({ message }) => {
            alert(`Error: ${message}`);
        });

        this.socket.on('chatMessage', (data) => {
            this.addChatMessage(data);
        });

        this.socket.on('playerStats', (stats) => {
            this.updatePlayerStats(stats);
        });

        this.socket.on('spectatorJoined', (data) => {
            this.updateSpectatorCount(data.count);
        });

        this.socket.on('gameState', (state) => {
            this.updateGameState(state);
        });
    }

    setupChatUI() {
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.innerHTML = `
            <div class="chat-messages"></div>
            <div class="chat-input">
                <input type="text" placeholder="Type a message...">
                <button>Send</button>
            </div>
        `;

        document.querySelector('.game-container').appendChild(chatContainer);

        const input = chatContainer.querySelector('input');
        const button = chatContainer.querySelector('button');

        button.addEventListener('click', () => this.sendChatMessage(input.value));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage(input.value);
        });
    }

    sendChatMessage(message) {
        if (!message.trim()) return;
        
        this.socket.emit('chatMessage', {
            roomId: this.roomId,
            message: message.trim(),
            playerNumber: this.playerNumber,
            isSpectator: this.isSpectator
        });

        const input = document.querySelector('.chat-input input');
        input.value = '';
    }

    addChatMessage(data) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const sender = data.isSpectator ? 'Spectator' : `Player ${data.playerNumber}`;
        messageElement.innerHTML = `
            <span class="sender">${sender}:</span>
            <span class="message">${data.message}</span>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.chatMessages.push(data);
        if (this.chatMessages.length > 50) this.chatMessages.shift();
    }

    updatePlayerStats(stats) {
        this.playerStats = new Map(stats);
        this.renderPlayerStats();
    }

    renderPlayerStats() {
        const statsContainer = document.querySelector('.player-stats') || 
            this.createStatsContainer();

        statsContainer.innerHTML = '';
        this.playerStats.forEach((stats, playerId) => {
            const playerStats = document.createElement('div');
            playerStats.className = 'player-stat-card';
            playerStats.innerHTML = `
                <div class="player-name">${stats.name || `Player ${stats.playerNumber}`}</div>
                <div class="stats">
                    <div>Wins: ${stats.wins}</div>
                    <div>Losses: ${stats.losses}</div>
                    <div>Draws: ${stats.draws}</div>
                    <div>Win Rate: ${((stats.wins / (stats.wins + stats.losses || 1)) * 100).toFixed(1)}%</div>
                </div>
            `;
            statsContainer.appendChild(playerStats);
        });
    }

    createStatsContainer() {
        const container = document.createElement('div');
        container.className = 'player-stats';
        document.querySelector('.game-container').appendChild(container);
        return container;
    }

    updateSpectatorCount(count) {
        const spectatorInfo = document.querySelector('.spectator-count') || 
            this.createSpectatorInfo();
        spectatorInfo.textContent = `Spectators: ${count}`;
    }

    createSpectatorInfo() {
        const info = document.createElement('div');
        info.className = 'spectator-count';
        document.querySelector('.game-status').appendChild(info);
        return info;
    }

    createRoom() {
        return new Promise((resolve, reject) => {
            this.socket.emit('createRoom', (response) => {
                if (response.success) {
                    this.roomId = response.roomId;
                    this.playerNumber = response.playerNumber;
                    this.game.changeMode('online');
                    resolve(response);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    async joinRoom(roomId, asSpectator = false) {
        return new Promise((resolve, reject) => {
            this.socket.emit('joinRoom', { roomId, asSpectator }, (response) => {
                if (response.success) {
                    this.roomId = response.roomId;
                    this.playerNumber = response.playerNumber;
                    this.isSpectator = asSpectator;
                    this.game.changeMode('online');
                    
                    if (asSpectator) {
                        this.game.disableControls();
                    }
                    
                    resolve(response);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    makeMove(choice) {
        return new Promise((resolve, reject) => {
            if (!this.roomId) {
                reject(new Error('Not in a room'));
                return;
            }

            this.socket.emit('makeChoice', choice, (response) => {
                if (response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    handleGameUpdate(data) {
        const { gameState, players } = data;

        // Update game state
        if (gameState.status === 'playing') {
            this.game.updateGameState(gameState);
        }

        // Update player information
        this.game.updatePlayers(players);

        // Handle round results
        if (gameState.choices.size === 2) {
            this.game.showRoundResult(gameState.scores);
        }
    }

    leaveRoom() {
        if (this.roomId) {
            this.socket.emit('leaveRoom', this.roomId);
            this.roomId = null;
            this.playerNumber = null;
            this.game.resetGame();
            this.game.changeMode('computer');
        }
    }

    isInRoom() {
        return !!this.roomId;
    }

    getRoomId() {
        return this.roomId;
    }

    getPlayerNumber() {
        return this.playerNumber;
    }

    updateGameState(state) {
        if (this.isSpectator) {
            this.game.updateSpectatorView(state);
        } else {
            this.game.updateGameState(state);
        }
    }
}

// Export for use in main game
export default MultiplayerManager; 