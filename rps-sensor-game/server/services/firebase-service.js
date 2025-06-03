const { db } = require('../config/firebase');

class FirebaseService {
    constructor() {
        this.gamesCollection = db.collection('games');
        this.usersCollection = db.collection('users');
        this.statsCollection = db.collection('statistics');
    }

    // User Management
    async createOrUpdateUser(userId, userData) {
        try {
            await this.usersCollection.doc(userId).set(userData, { merge: true });
            return true;
        } catch (error) {
            console.error('Error creating/updating user:', error);
            return false;
        }
    }

    async getUser(userId) {
        try {
            const doc = await this.usersCollection.doc(userId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    // Game History
    async saveGame(gameData) {
        try {
            const gameRef = await this.gamesCollection.add({
                ...gameData,
                timestamp: new Date(),
            });
            return gameRef.id;
        } catch (error) {
            console.error('Error saving game:', error);
            return null;
        }
    }

    async getPlayerGames(userId, limit = 50) {
        try {
            const snapshot = await this.gamesCollection
                .where('players', 'array-contains', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting player games:', error);
            return [];
        }
    }

    // Statistics
    async updatePlayerStats(userId, gameResult) {
        try {
            const statsRef = this.statsCollection.doc(userId);
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(statsRef);
                const currentStats = doc.exists ? doc.data() : {
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    totalGames: 0,
                    winRate: 0
                };

                // Update stats based on game result
                currentStats.totalGames++;
                if (gameResult === 'win') currentStats.wins++;
                else if (gameResult === 'loss') currentStats.losses++;
                else if (gameResult === 'draw') currentStats.draws++;

                // Calculate win rate
                currentStats.winRate = (currentStats.wins / currentStats.totalGames) * 100;

                transaction.set(statsRef, currentStats);
            });
            return true;
        } catch (error) {
            console.error('Error updating player stats:', error);
            return false;
        }
    }

    async getLeaderboard(limit = 10) {
        try {
            const snapshot = await this.statsCollection
                .orderBy('winRate', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                userId: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }

    // Guest Data Management
    async saveGuestData(guestId, data) {
        try {
            await this.usersCollection.doc(`guest_${guestId}`).set({
                ...data,
                type: 'guest',
                lastActive: new Date()
            }, { merge: true });
            return true;
        } catch (error) {
            console.error('Error saving guest data:', error);
            return false;
        }
    }

    async cleanupGuestData(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const snapshot = await this.usersCollection
                .where('type', '==', 'guest')
                .where('lastActive', '<', cutoffDate)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            return snapshot.size; // Return number of deleted records
        } catch (error) {
            console.error('Error cleaning up guest data:', error);
            return 0;
        }
    }
}

module.exports = new FirebaseService(); 