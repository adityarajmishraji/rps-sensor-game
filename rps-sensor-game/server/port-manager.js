const fs = require('fs');
const path = require('path');
const lockfile = require('proper-lockfile');

class PortManager {
    constructor() {
        this.lockFilePath = path.join(__dirname, '.port-lock');
        this.portInUsePath = path.join(__dirname, '.port-in-use');
    }

    async acquirePort(startPort) {
        try {
            // Create lock file if it doesn't exist
            if (!fs.existsSync(this.lockFilePath)) {
                fs.writeFileSync(this.lockFilePath, '');
            }

            // Acquire lock
            await lockfile.lock(this.lockFilePath, { retries: 5 });

            // Read current port in use
            let currentPort = startPort;
            if (fs.existsSync(this.portInUsePath)) {
                currentPort = parseInt(fs.readFileSync(this.portInUsePath, 'utf8'));
            }

            // Write the port we're going to use
            fs.writeFileSync(this.portInUsePath, currentPort.toString());

            return currentPort;
        } catch (error) {
            console.error('Error acquiring port:', error);
            return startPort + 1; // Fallback to next port
        }
    }

    async releasePort() {
        try {
            if (fs.existsSync(this.lockFilePath)) {
                await lockfile.unlock(this.lockFilePath);
            }
        } catch (error) {
            console.error('Error releasing port lock:', error);
        }
    }
}

module.exports = new PortManager(); 