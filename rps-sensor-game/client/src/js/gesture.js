class GestureService {
    constructor() {
        this.model = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.detectionInterval = null;
    }

    async initialize() {
        try {
            // Load the handpose model
            this.model = await handpose.load();
            
            // Set up video
            this.videoElement = document.getElementById('videoFeed');
            this.canvasElement = document.getElementById('gestureCanvas');
            
            // Get camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480
                }
            });
            
            this.videoElement.srcObject = stream;
            
            return true;
        } catch (error) {
            console.error('Error initializing gesture service:', error);
            throw error;
        }
    }

    startDetection(callback) {
        if (!this.model || !this.videoElement) {
            throw new Error('Gesture service not initialized');
        }

        this.detectionInterval = setInterval(async () => {
            try {
                const predictions = await this.model.estimateHands(this.videoElement);
                
                if (predictions.length > 0) {
                    const gesture = this.interpretGesture(predictions[0].landmarks);
                    callback(gesture.name, gesture.confidence);
                    this.drawHand(predictions[0].landmarks);
                }
            } catch (error) {
                console.error('Error detecting gesture:', error);
            }
        }, 100); // Detection every 100ms
    }

    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
    }

    interpretGesture(landmarks) {
        // Calculate finger positions and angles
        const fingers = this.getFingerPositions(landmarks);
        
        // Interpret the gesture based on finger positions
        if (this.isRock(fingers)) {
            return { name: 'rock', confidence: 0.9 };
        } else if (this.isPaper(fingers)) {
            return { name: 'paper', confidence: 0.9 };
        } else if (this.isScissors(fingers)) {
            return { name: 'scissors', confidence: 0.9 };
        }
        
        return { name: 'unknown', confidence: 0 };
    }

    getFingerPositions(landmarks) {
        // Convert landmarks to finger positions
        return {
            thumb: {
                tip: landmarks[4],
                base: landmarks[2]
            },
            index: {
                tip: landmarks[8],
                base: landmarks[5]
            },
            middle: {
                tip: landmarks[12],
                base: landmarks[9]
            },
            ring: {
                tip: landmarks[16],
                base: landmarks[13]
            },
            pinky: {
                tip: landmarks[20],
                base: landmarks[17]
            }
        };
    }

    isRock(fingers) {
        // All fingers are curled (tips close to base)
        return Object.values(fingers).every(finger => 
            this.distance(finger.tip, finger.base) < 50
        );
    }

    isPaper(fingers) {
        // All fingers are extended (tips far from base)
        return Object.values(fingers).every(finger => 
            this.distance(finger.tip, finger.base) > 100
        );
    }

    isScissors(fingers) {
        // Index and middle fingers extended, others curled
        return (
            this.distance(fingers.index.tip, fingers.index.base) > 100 &&
            this.distance(fingers.middle.tip, fingers.middle.base) > 100 &&
            this.distance(fingers.ring.tip, fingers.ring.base) < 50 &&
            this.distance(fingers.pinky.tip, fingers.pinky.base) < 50
        );
    }

    distance(point1, point2) {
        return Math.sqrt(
            Math.pow(point1[0] - point2[0], 2) +
            Math.pow(point1[1] - point2[1], 2) +
            Math.pow(point1[2] - point2[2], 2)
        );
    }

    drawHand(landmarks) {
        const ctx = this.canvasElement.getContext('2d');
        ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Draw landmarks
        ctx.fillStyle = '#00FF00';
        landmarks.forEach(point => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw connections
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        this.drawConnections(ctx, landmarks);
    }

    drawConnections(ctx, landmarks) {
        // Define connections between landmarks
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // index
            [5, 9], [9, 10], [10, 11], [11, 12], // middle
            [9, 13], [13, 14], [14, 15], [15, 16], // ring
            [13, 17], [17, 18], [18, 19], [19, 20], // pinky
            [0, 17], [17, 13], [13, 9], [9, 5] // palm
        ];

        connections.forEach(([i, j]) => {
            ctx.beginPath();
            ctx.moveTo(landmarks[i][0], landmarks[i][1]);
            ctx.lineTo(landmarks[j][0], landmarks[j][1]);
            ctx.stroke();
        });
    }

    async calibrate() {
        // Implement camera calibration if needed
        return true;
    }
} 