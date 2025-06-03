from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from enhanced_gesture_detector import EnhancedGestureDetector

app = Flask(__name__)
CORS(app)

# Initialize detector
detector = EnhancedGestureDetector()

@app.route('/detect', methods=['POST'])
def detect():
    try:
        # Get image data from request
        image_data = request.json['image']
        # Convert base64 to image
        encoded_data = image_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Get gesture detection results
        gesture_info = detector.detect_gesture(frame)
        
        # Convert frame with annotations back to base64
        _, buffer = cv2.imencode('.jpg', frame)
        annotated_image = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'gesture': gesture_info['gesture'],
            'confidence': gesture_info['confidence'],
            'hand_detected': gesture_info['hand_detected'],
            'annotated_image': f'data:image/jpeg;base64,{annotated_image}',
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/train', methods=['POST'])
def train():
    try:
        data = request.json
        image_data = data['image']
        gesture_label = data['gesture']
        
        # Convert base64 to image
        encoded_data = image_data.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Train the model on this sample
        detector.train_on_sample(frame, gesture_label)
        
        return jsonify({
            'message': f'Successfully trained on {gesture_label} gesture',
            'success': True
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 