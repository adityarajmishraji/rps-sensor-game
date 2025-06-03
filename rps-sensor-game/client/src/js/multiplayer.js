class MultiplayerManager {
    constructor() {
        // Get the dynamic port from the generated port.js file
        const port = window.SERVER_PORT || 3000;
        this.socket = io(`http://localhost:${port}`);
        this.roomId = null;
        this.playerNumber = null;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSocketListeners();
    }

    initializeElements() {
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.joinRoomBtn = document.getElementById('joinRoomBtn');
        this.roomIdInput = document.getElementById('roomIdInput');
        this.roomInfo = document.getElementById('roomInfo');
        this.currentRoomId = document.getElementById('currentRoomId');
        this.playerCount = document.getElementById('playerCount');
    }

    initializeEventListeners() {
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.joinRoomBtn.addEventListener('click', () => this.joinRoom());
    }

    initializeSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.handleDisconnect();
        });

        this.socket.on('gameUpdate', (data) => {
            this.handleGameUpdate(data);
        });
    }

    async createRoom() {
        this.socket.emit('createRoom', (response) => {
            if (response.success) {
                this.roomId = response.roomId;
                this.playerNumber = response.playerNumber;
                this.showRoomInfo();
            } else {
                alert('Failed to create room: ' + response.message);
            }
        });
    }

    async joinRoom() {
        const roomId = this.roomIdInput.value.trim().toUpperCase();
        if (!roomId) {
            alert('Please enter a room ID');
            return;
        }

        this.socket.emit('joinRoom', roomId, (response) => {
            if (response.success) {
                this.roomId = response.roomId;
                this.playerNumber = response.playerNumber;
                this.showRoomInfo();
            } else {
                alert('Failed to join room: ' + response.message);
            }
        });
    }

    showRoomInfo() {
        this.roomInfo.classList.remove('hidden');
        this.currentRoomId.textContent = this.roomId;
        this.updatePlayerCount();
    }

    updatePlayerCount() {
        // This will be updated through gameUpdate events
    }

    handleGameUpdate(data) {
        if (data.roomId !== this.roomId) return;

        // Update player count
        this.playerCount.textContent = `${data.players.length}/2`;

        // Handle game state updates
        if (data.gameState.status === 'playing') {
            // Game is in progress
        } else if (data.gameState.status === 'finished') {
            // Game has ended
        }
    }

    handleDisconnect() {
        this.roomInfo.classList.add('hidden');
        this.roomId = null;
        this.playerNumber = null;
    }

    makeMove(move) {
        if (!this.roomId) return;

        this.socket.emit('makeMove', move, (response) => {
            if (!response.success) {
                console.error('Failed to make move:', response.message);
            }
        });
    }
} 