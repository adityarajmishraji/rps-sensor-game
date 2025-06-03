import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';

class GestureRecognitionService {
    constructor() {
        this.model = null;
        this.videoElement = null;
        this.isRunning = false;
        this.onGestureCallback = null;
        this.lastGesture = null;
        this.gestureConfidence = 0;
        this.gestureBuffer = [];
        this.GESTURE_BUFFER_SIZE = 10;
    }

    async initialize(videoElement) {
        try {
            // Load the handpose model
            this.model = await handpose.load();
            this.videoElement = videoElement;
            console.log('Hand gesture model loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading hand gesture model:', error);
            return false;
        }
    }

    async startDetection(onGestureCallback) {
        if (!this.model || !this.videoElement) {
            throw new Error('Model or video element not initialized');
        }

        this.isRunning = true;
        this.onGestureCallback = onGestureCallback;
        this.detectFrame();
    }

    stopDetection() {
        this.isRunning = false;
    }

    async detectFrame() {
        if (!this.isRunning) return;

        try {
            const predictions = await this.model.estimateHands(this.videoElement);
            
            if (predictions.length > 0) {
                const gesture = this.recognizeGesture(predictions[0].landmarks);
                this.processGesture(gesture);
            }
        } catch (error) {
            console.error('Error detecting hand:', error);
        }

        // Continue detection loop
        if (this.isRunning) {
            requestAnimationFrame(() => this.detectFrame());
        }
    }

    recognizeGesture(landmarks) {
        // Calculate finger positions and angles
        const fingers = this.getFingerPositions(landmarks);
        
        // Recognize rock, paper, scissors gestures
        if (this.isRock(fingers)) return 'rock';
        if (this.isPaper(fingers)) return 'paper';
        if (this.isScissors(fingers)) return 'scissors';
        
        return 'unknown';
    }

    getFingerPositions(landmarks) {
        // Extract key points for each finger
        return {
            thumb: {
                tip: landmarks[4],
                base: landmarks[2]
            },
            index: {
                tip: landmarks[8],
                middle: landmarks[7],
                base: landmarks[6]
            },
            middle: {
                tip: landmarks[12],
                middle: landmarks[11],
                base: landmarks[10]
            },
            ring: {
                tip: landmarks[16],
                middle: landmarks[15],
                base: landmarks[14]
            },
            pinky: {
                tip: landmarks[20],
                middle: landmarks[19],
                base: landmarks[18]
            }
        };
    }

    isRock(fingers) {
        // All fingers are curled in
        return this.areAllFingersClosed(fingers);
    }

    isPaper(fingers) {
        // All fingers are extended
        return this.areAllFingersOpen(fingers);
    }

    isScissors(fingers) {
        // Index and middle fingers extended, others closed
        return (
            this.isFingerOpen(fingers.index) &&
            this.isFingerOpen(fingers.middle) &&
            !this.isFingerOpen(fingers.ring) &&
            !this.isFingerOpen(fingers.pinky)
        );
    }

    isFingerOpen(finger) {
        const tipY = finger.tip[1];
        const baseY = finger.base[1];
        return (baseY - tipY) > 40; // Threshold for considering finger extended
    }

    areAllFingersClosed(fingers) {
        return (
            !this.isFingerOpen(fingers.index) &&
            !this.isFingerOpen(fingers.middle) &&
            !this.isFingerOpen(fingers.ring) &&
            !this.isFingerOpen(fingers.pinky)
        );
    }

    areAllFingersOpen(fingers) {
        return (
            this.isFingerOpen(fingers.index) &&
            this.isFingerOpen(fingers.middle) &&
            this.isFingerOpen(fingers.ring) &&
            this.isFingerOpen(fingers.pinky)
        );
    }

    processGesture(gesture) {
        // Add gesture to buffer
        this.gestureBuffer.push(gesture);
        if (this.gestureBuffer.length > this.GESTURE_BUFFER_SIZE) {
            this.gestureBuffer.shift();
        }

        // Calculate most common gesture in buffer
        const gestureCount = {};
        let maxCount = 0;
        let dominantGesture = 'unknown';

        this.gestureBuffer.forEach(g => {
            gestureCount[g] = (gestureCount[g] || 0) + 1;
            if (gestureCount[g] > maxCount) {
                maxCount = gestureCount[g];
                dominantGesture = g;
            }
        });

        // Calculate confidence
        const confidence = maxCount / this.GESTURE_BUFFER_SIZE;

        // Only trigger callback if gesture is stable and different from last one
        if (confidence > 0.7 && dominantGesture !== this.lastGesture && dominantGesture !== 'unknown') {
            this.lastGesture = dominantGesture;
            this.onGestureCallback(dominantGesture, confidence);
        }
    }
}

export const gestureService = new GestureRecognitionService(); 