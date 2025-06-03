const crypto = require('crypto');

class GameSecurity {
    constructor() {
        this.moveVerification = new Map();
        this.gameStates = new Map();
    }

    // Prevent move tampering
    generateMoveHash(move, playerId, timestamp) {
        return crypto
            .createHash('sha256')
            .update(`${move}${playerId}${timestamp}${process.env.MOVE_SECRET}`)
            .digest('hex');
    }

    // Verify move authenticity
    verifyMove(move, hash, playerId, timestamp) {
        const calculatedHash = this.generateMoveHash(move, playerId, timestamp);
        return crypto.timingSafeEqual(
            Buffer.from(calculatedHash),
            Buffer.from(hash)
        );
    }

    // Prevent replay attacks
    isReplayAttack(moveId, playerId) {
        const key = `${playerId}:${moveId}`;
        if (this.moveVerification.has(key)) {
            return true;
        }
        this.moveVerification.set(key, true);
        setTimeout(() => this.moveVerification.delete(key), 30000); // Clear after 30s
        return false;
    }

    // Rate limiting for moves
    checkMoveRateLimit(playerId) {
        const now = Date.now();
        const playerMoves = this.gameStates.get(playerId) || [];
        const recentMoves = playerMoves.filter(time => now - time < 1000); // Last second

        if (recentMoves.length >= 3) { // Max 3 moves per second
            return false;
        }

        playerMoves.push(now);
        this.gameStates.set(playerId, playerMoves);
        return true;
    }

    // Validate game room integrity
    validateRoom(roomId, players) {
        // Check if room exists and has valid players
        if (!roomId || !players || players.length > 6) { // Max 6 players per room
            return false;
        }

        // Check for duplicate players
        const uniquePlayers = new Set(players.map(p => p.id));
        if (uniquePlayers.size !== players.length) {
            return false;
        }

        return true;
    }

    // Secure gesture validation
    validateGesture(gestureData) {
        // Validate gesture data structure
        if (!gestureData || !gestureData.landmarks || !Array.isArray(gestureData.landmarks)) {
            return false;
        }

        // Check for impossible hand positions
        for (const landmark of gestureData.landmarks) {
            if (!this.isValidHandPosition(landmark)) {
                return false;
            }
        }

        return true;
    }

    isValidHandPosition(landmark) {
        // Check if coordinates are within possible human hand range
        const { x, y, z } = landmark;
        return (
            x >= -1 && x <= 1 &&
            y >= -1 && y <= 1 &&
            z >= -1 && z <= 1
        );
    }

    // Clean and validate user input
    sanitizeGameInput(input) {
        // Remove any potentially harmful characters
        return input.replace(/[<>{}]/g, '').trim();
    }
}

module.exports = new GameSecurity(); 