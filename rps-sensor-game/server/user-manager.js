const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');
const GUEST_SCORES_FILE = path.join(__dirname, 'data', 'guest_scores.json');

// Ensure data directory and files exist
async function initializeDataFiles() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.mkdir(dataDir, { recursive: true });
        
        // Initialize all data files if they don't exist
        const files = [USERS_FILE, SCORES_FILE, GUEST_SCORES_FILE];
        for (const file of files) {
            try {
                await fs.access(file);
            } catch {
                await fs.writeFile(file, JSON.stringify({}));
            }
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

class UserManager {
    constructor() {
        this.initializeDataFiles();
        this.guestPrefix = 'guest_';
        this.guestData = new Map();
        this.onlineUsers = new Map();
        // Clean up old guest data periodically
        setInterval(() => this.cleanupGuestData(), 24 * 60 * 60 * 1000); // Run daily
    }

    async initializeDataFiles() {
        await initializeDataFiles();
    }

    async loadUsers() {
        try {
            const data = await fs.readFile(USERS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading users:', error);
            return {};
        }
    }

    async saveUsers(users) {
        try {
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    async loadScores(isGuest = false) {
        const file = isGuest ? GUEST_SCORES_FILE : SCORES_FILE;
        try {
            const data = await fs.readFile(file, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading scores:', error);
            return {};
        }
    }

    async saveScores(scores, isGuest = false) {
        const file = isGuest ? GUEST_SCORES_FILE : SCORES_FILE;
        try {
            await fs.writeFile(file, JSON.stringify(scores, null, 2));
        } catch (error) {
            console.error('Error saving scores:', error);
        }
    }

    generateGuestId() {
        return this.guestPrefix + Math.random().toString(36).substring(2, 15);
    }

    async handleGuestUser(guestId, nickname) {
        // Generate fun anime-style nickname if not provided
        if (!nickname) {
            nickname = this.generateAnimeName();
        }

        const guestData = {
            id: guestId,
            username: nickname,
            isGuest: true,
            stats: {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                winRate: 0
            },
            lastActive: new Date()
        };

        this.guestData.set(guestId, guestData);
        return guestData;
    }

    generateAnimeName() {
        const prefixes = [
            'naruto', 'sasuke', 'goku', 'luffy', 'hinata',
            'pikachu', 'saitama', 'eren', 'mikasa', 'light',
            'deku', 'vegeta', 'zoro', 'levi', 'kakashi'
        ];
        const suffixes = [
            'noob', 'looser', 'wannabe', 'derp', 'potato',
            'sleepy', 'clumsy', 'grumpy', 'dizzy', 'silly',
            'fail', 'rookie', 'newbie', 'goofy', 'wobbly'
        ];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix}_${suffix}`;
    }

    updateGuestStats(guestId, gameResult) {
        const guest = this.guestData.get(guestId);
        if (!guest) return null;

        guest.stats.totalGames++;
        if (gameResult === 'win') guest.stats.wins++;
        else if (gameResult === 'loss') guest.stats.losses++;
        else if (gameResult === 'draw') guest.stats.draws++;

        guest.stats.winRate = (guest.stats.wins / guest.stats.totalGames * 100).toFixed(1);
        guest.lastActive = new Date();

        return guest;
    }

    getTopPlayers(limit = 10) {
        const allPlayers = [...this.guestData.values()];
        return allPlayers
            .sort((a, b) => b.stats.winRate - a.stats.winRate)
            .slice(0, limit);
    }

    cleanupInactiveGuests(maxInactiveTime = 24 * 60 * 60 * 1000) { // 24 hours
        const now = new Date();
        for (const [guestId, data] of this.guestData.entries()) {
            if (now - data.lastActive > maxInactiveTime) {
                this.guestData.delete(guestId);
            }
        }
    }

    async cleanupGuestData() {
        const scores = await this.loadScores(true);
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Remove guest data older than 30 days
        for (const [guestId, data] of Object.entries(scores)) {
            const lastPlayed = new Date(data.lastPlayed);
            if (lastPlayed < thirtyDaysAgo) {
                delete scores[guestId];
            }
        }

        await this.saveScores(scores, true);
    }

    async handleSocialLogin(profile) {
        const users = await this.loadUsers();
        const socialId = `${profile.provider}_${profile.id}`;
        
        if (!users[socialId]) {
            // Create new user from social profile
            users[socialId] = {
                username: profile.displayName || profile.username,
                socialId: profile.id,
                provider: profile.provider,
                email: profile.email,
                location: profile.location,
                createdAt: new Date().toISOString()
            };
            await this.saveUsers(users);

            // Initialize scores
            const scores = await this.loadScores();
            scores[socialId] = {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                lastPlayed: null
            };
            await this.saveScores(scores);
        }

        return {
            username: users[socialId].username,
            location: users[socialId].location,
            stats: await this.getStats(socialId)
        };
    }

    async updateScore(userId, result, isGuest = false) {
        const scores = await this.loadScores(isGuest);
        if (!scores[userId]) {
            scores[userId] = {
                wins: 0,
                losses: 0,
                draws: 0,
                totalGames: 0,
                lastPlayed: null
            };
        }

        scores[userId].totalGames++;
        scores[userId][result]++;
        scores[userId].lastPlayed = new Date().toISOString();

        await this.saveScores(scores, isGuest);
        return scores[userId];
    }

    async getLeaderboard() {
        const [regularScores, guestScores] = await Promise.all([
            this.loadScores(false),
            this.loadScores(true)
        ]);
        const users = await this.loadUsers();

        // Combine and format all scores
        const allScores = [
            ...Object.entries(regularScores).map(([id, stats]) => ({
                username: users[id]?.username || id,
                location: users[id]?.location || 'Unknown',
                isGuest: false,
                ...stats
            })),
            ...Object.entries(guestScores).map(([id, stats]) => ({
                username: stats.nickname || id,
                location: 'Guest',
                isGuest: true,
                ...stats
            }))
        ];

        // Sort by win rate and return top 10
        return allScores
            .map(stats => ({
                ...stats,
                winRate: stats.totalGames > 0 
                    ? ((stats.wins / stats.totalGames) * 100).toFixed(1) 
                    : '0.0'
            }))
            .sort((a, b) => b.winRate - a.winRate)
            .slice(0, 10);
    }

    async signup(username, password, location) {
        const users = await this.loadUsers();
        
        if (users[username]) {
            throw new Error('Username already exists');
        }

        const hashedPassword = hashPassword(password);
        users[username] = {
            password: hashedPassword,
            location,
            createdAt: new Date().toISOString()
        };

        await this.saveUsers(users);

        // Initialize user scores
        const scores = await this.loadScores();
        scores[username] = {
            wins: 0,
            losses: 0,
            draws: 0,
            totalGames: 0,
            lastPlayed: null
        };
        await this.saveScores(scores);

        return { username, location };
    }

    async login(username, password) {
        const users = await this.loadUsers();
        const user = users[username];

        if (!user || user.password !== hashPassword(password)) {
            throw new Error('Invalid username or password');
        }

        const scores = await this.loadScores();
        return {
            username,
            location: user.location,
            stats: scores[username]
        };
    }
}

module.exports = new UserManager(); 