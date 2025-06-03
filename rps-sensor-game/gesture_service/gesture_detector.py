import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

class GestureDetector:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        self.mp_draw = mp.solutions.drawing_utils

    def detect_gesture(self, frame):
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        
        if results.multi_hand_landmarks:
            landmarks = results.multi_hand_landmarks[0]  # Get first hand
            # Get finger positions
            thumb_tip = landmarks.landmark[4]
            index_tip = landmarks.landmark[8]
            middle_tip = landmarks.landmark[12]
            
            # Determine gesture based on finger positions
            if thumb_tip.y < middle_tip.y and index_tip.y > middle_tip.y:
                return "rock"
            elif thumb_tip.y > middle_tip.y and index_tip.y < middle_tip.y:
                return "paper"
            elif thumb_tip.y < middle_tip.y and index_tip.y < middle_tip.y:
                return "scissors"
            
            # Draw hand landmarks for debugging
            self.mp_draw.draw_landmarks(
                frame, landmarks, self.mp_hands.HAND_CONNECTIONS)
            
        return "unknown"

detector = GestureDetector()

@app.route('/detect', methods=['POST'])
def detect():
    try:
        # Get image data from request
        image_data = request.json['image']
        # Convert base64 to image
        encoded_data = image_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Detect gesture
        gesture = detector.detect_gesture(frame)
        
        return jsonify({
            'gesture': gesture,
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 