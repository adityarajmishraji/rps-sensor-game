const CONFIG = {
    // Game settings
    roundTime: 3000, // Time for each round in milliseconds
    gestureConfidence: 0.7, // Minimum confidence for gesture detection
    maxScore: 5, // Score needed to win the game
    
    // Server settings
    server: {
        url: window.location.origin,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
    },
    
    // Game modes
    modes: {
        computer: 'computer',
        local: 'local',
        gesture: 'gesture'
    },
    
    // Gesture detection settings
    gesture: {
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        maxNumHands: 1
    },
    
    // Sound effects
    sounds: {
        win: 'assets/sounds/win.mp3',
        lose: 'assets/sounds/lose.mp3',
        draw: 'assets/sounds/draw.mp3',
        countdown: 'assets/sounds/countdown.mp3'
    }
};

// Initialize socket connection
const socket = io(CONFIG.server.url, {
    reconnectionAttempts: CONFIG.server.reconnectionAttempts,
    reconnectionDelay: CONFIG.server.reconnectionDelay
});

// Socket event handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});

// Export configuration
window.GAME_CONFIG = CONFIG;
window.GAME_SOCKET = socket; 