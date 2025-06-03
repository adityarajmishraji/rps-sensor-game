class StorageService {
    constructor() {
        this.STORAGE_KEYS = {
            SCORES: 'rps_scores',
            SETTINGS: 'rps_settings',
            USER_PROFILE: 'rps_user_profile',
            GAME_HISTORY: 'rps_game_history'
        };

        // Initialize storage with default values if empty
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize scores
        if (!this.getItem(this.STORAGE_KEYS.SCORES)) {
            this.setItem(this.STORAGE_KEYS.SCORES, {
                wins: 0,
                losses: 0,
                ties: 0,
                highScore: 0,
                winStreak: 0,
                currentStreak: 0
            });
        }

        // Initialize settings
        if (!this.getItem(this.STORAGE_KEYS.SETTINGS)) {
            this.setItem(this.STORAGE_KEYS.SETTINGS, {
                difficulty: 'normal',
                soundEnabled: true,
                gestureEnabled: true,
                theme: 'light'
            });
        }

        // Initialize user profile
        if (!this.getItem(this.STORAGE_KEYS.USER_PROFILE)) {
            this.setItem(this.STORAGE_KEYS.USER_PROFILE, {
                nickname: 'Player',
                avatar: null,
                lastPlayed: null,
                totalGamesPlayed: 0
            });
        }

        // Initialize game history
        if (!this.getItem(this.STORAGE_KEYS.GAME_HISTORY)) {
            this.setItem(this.STORAGE_KEYS.GAME_HISTORY, []);
        }
    }

    // Generic storage operations
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    // Score management
    updateScores(result) {
        const scores = this.getItem(this.STORAGE_KEYS.SCORES);
        
        switch (result) {
            case 'win':
                scores.wins++;
                scores.currentStreak++;
                scores.highScore = Math.max(scores.highScore, scores.currentStreak);
                break;
            case 'loss':
                scores.losses++;
                scores.currentStreak = 0;
                break;
            case 'tie':
                scores.ties++;
                break;
        }

        this.setItem(this.STORAGE_KEYS.SCORES, scores);
        this.addToGameHistory(result);
        return scores;
    }

    // Game history management
    addToGameHistory(result) {
        const history = this.getItem(this.STORAGE_KEYS.GAME_HISTORY);
        const gameEntry = {
            timestamp: new Date().toISOString(),
            result,
            difficulty: this.getSettings().difficulty
        };

        history.unshift(gameEntry);
        // Keep only last 50 games
        if (history.length > 50) history.pop();
        
        this.setItem(this.STORAGE_KEYS.GAME_HISTORY, history);
        
        // Update user profile
        const profile = this.getItem(this.STORAGE_KEYS.USER_PROFILE);
        profile.lastPlayed = gameEntry.timestamp;
        profile.totalGamesPlayed++;
        this.setItem(this.STORAGE_KEYS.USER_PROFILE, profile);
    }

    // Settings management
    getSettings() {
        return this.getItem(this.STORAGE_KEYS.SETTINGS);
    }

    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...newSettings };
        return this.setItem(this.STORAGE_KEYS.SETTINGS, updatedSettings);
    }

    // User profile management
    getUserProfile() {
        return this.getItem(this.STORAGE_KEYS.USER_PROFILE);
    }

    updateUserProfile(newProfile) {
        const currentProfile = this.getUserProfile();
        const updatedProfile = { ...currentProfile, ...newProfile };
        return this.setItem(this.STORAGE_KEYS.USER_PROFILE, updatedProfile);
    }

    // Statistics and analytics
    getStatistics() {
        const scores = this.getItem(this.STORAGE_KEYS.SCORES);
        const history = this.getItem(this.STORAGE_KEYS.GAME_HISTORY);
        const totalGames = scores.wins + scores.losses + scores.ties;

        return {
            totalGames,
            winRate: totalGames > 0 ? (scores.wins / totalGames * 100).toFixed(1) : 0,
            highScore: scores.highScore,
            currentStreak: scores.currentStreak,
            recentResults: history.slice(0, 10),
            difficultyDistribution: this.calculateDifficultyDistribution(history)
        };
    }

    calculateDifficultyDistribution(history) {
        return history.reduce((acc, game) => {
            acc[game.difficulty] = (acc[game.difficulty] || 0) + 1;
            return acc;
        }, {});
    }

    // Clear all data
    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeStorage();
    }
}

export const storageService = new StorageService(); 