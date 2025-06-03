import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
from enhanced_gesture_detector import EnhancedGestureDetector
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gesture_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# Initialize detector
detector = EnhancedGestureDetector()

def init_gesture_service():
    """Initialize the gesture service and verify dependencies."""
    try:
        # Test camera access
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            logger.error("Failed to access camera")
            return False
        cap.release()
        
        logger.info("Gesture service initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize gesture service: {str(e)}")
        return False

def process_frame(frame):
    """Process a single frame and detect hand gesture."""
    try:
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame and detect hands
        results = hands.process(rgb_frame)
        
        if not results.multi_hand_landmarks:
            return None, "No hand detected"
            
        # Get hand landmarks
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # Determine gesture based on landmark positions
        gesture, confidence = determine_gesture(hand_landmarks)
        
        return gesture, confidence
    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        return None, str(e)

def determine_gesture(landmarks):
    """Determine the RPS gesture from hand landmarks with improved accuracy."""
    try:
        # Calculate key angles and distances
        finger_states = calculate_finger_states(landmarks)
        hand_orientation = calculate_hand_orientation(landmarks)
        confidence_score = 0.0

        # Rock detection (closed fist)
        if sum(finger_states) <= 1:
            confidence_score = calculate_rock_confidence(finger_states, hand_orientation)
            if confidence_score > 0.7:
                return "rock", confidence_score

        # Scissors detection (two fingers extended)
        if (finger_states[1] and finger_states[2] and 
            not any(finger_states[3:]) and 
            check_scissors_angle(landmarks)):
            confidence_score = calculate_scissors_confidence(landmarks)
            if confidence_score > 0.7:
                return "scissors", confidence_score

        # Paper detection (all fingers extended)
        if all(finger_states[1:]):
            confidence_score = calculate_paper_confidence(landmarks, hand_orientation)
            if confidence_score > 0.7:
                return "paper", confidence_score

        return None, 0.0

    except Exception as e:
        logger.error(f"Error determining gesture: {str(e)}")
        raise

def calculate_finger_states(landmarks):
    """Calculate extended state of each finger with improved accuracy."""
    finger_states = []
    
    # Thumb calculation (special case)
    thumb_angle = calculate_angle(
        landmarks.landmark[mp_hands.HandLandmark.THUMB_CMC],
        landmarks.landmark[mp_hands.HandLandmark.THUMB_MCP],
        landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
    )
    finger_states.append(thumb_angle > 150)

    # Other fingers
    finger_landmarks = [
        (mp_hands.HandLandmark.INDEX_FINGER_MCP, mp_hands.HandLandmark.INDEX_FINGER_PIP, mp_hands.HandLandmark.INDEX_FINGER_TIP),
        (mp_hands.HandLandmark.MIDDLE_FINGER_MCP, mp_hands.HandLandmark.MIDDLE_FINGER_PIP, mp_hands.HandLandmark.MIDDLE_FINGER_TIP),
        (mp_hands.HandLandmark.RING_FINGER_MCP, mp_hands.HandLandmark.RING_FINGER_PIP, mp_hands.HandLandmark.RING_FINGER_TIP),
        (mp_hands.HandLandmark.PINKY_MCP, mp_hands.HandLandmark.PINKY_PIP, mp_hands.HandLandmark.PINKY_TIP)
    ]

    for mcp, pip, tip in finger_landmarks:
        angle = calculate_angle(
            landmarks.landmark[mcp],
            landmarks.landmark[pip],
            landmarks.landmark[tip]
        )
        finger_states.append(angle > 160)

    return finger_states

def calculate_angle(p1, p2, p3):
    """Calculate angle between three points in 3D space."""
    v1 = np.array([p1.x - p2.x, p1.y - p2.y, p1.z - p2.z])
    v2 = np.array([p3.x - p2.x, p3.y - p2.y, p3.z - p2.z])
    
    cosine = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
    angle = np.arccos(np.clip(cosine, -1.0, 1.0))
    return np.degrees(angle)

def calculate_hand_orientation(landmarks):
    """Calculate hand orientation relative to camera."""
    wrist = landmarks.landmark[mp_hands.HandLandmark.WRIST]
    middle_mcp = landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_MCP]
    
    # Calculate normal vector to palm
    palm_normal = np.cross(
        [middle_mcp.x - wrist.x, middle_mcp.y - wrist.y, middle_mcp.z - wrist.z],
        [landmarks.landmark[mp_hands.HandLandmark.PINKY_MCP].x - wrist.x,
         landmarks.landmark[mp_hands.HandLandmark.PINKY_MCP].y - wrist.y,
         landmarks.landmark[mp_hands.HandLandmark.PINKY_MCP].z - wrist.z]
    )
    return palm_normal

def check_scissors_angle(landmarks):
    """Check if index and middle fingers form correct scissors angle."""
    index_dir = np.array([
        landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].x - 
        landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_PIP].x,
        landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP].y -
        landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_PIP].y
    ])
    
    middle_dir = np.array([
        landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].x -
        landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_PIP].x,
        landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP].y -
        landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_PIP].y
    ])
    
    angle = np.degrees(np.arccos(np.clip(
        np.dot(index_dir, middle_dir) / 
        (np.linalg.norm(index_dir) * np.linalg.norm(middle_dir)),
        -1.0, 1.0
    )))
    
    return 10 < angle < 40

def calculate_rock_confidence(finger_states, hand_orientation):
    """Calculate confidence score for rock gesture."""
    closed_finger_score = (5 - sum(finger_states)) / 5
    orientation_score = abs(hand_orientation[1]) > 0.7
    return (closed_finger_score * 0.7 + float(orientation_score) * 0.3)

def calculate_scissors_confidence(landmarks):
    """Calculate confidence score for scissors gesture."""
    # Check finger separation and orientation
    index_tip = landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
    middle_tip = landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
    
    separation = np.sqrt(
        (index_tip.x - middle_tip.x)**2 +
        (index_tip.y - middle_tip.y)**2
    )
    
    separation_score = min(1.0, separation * 5)
    angle_score = float(check_scissors_angle(landmarks))
    
    return (separation_score * 0.6 + angle_score * 0.4)

def calculate_paper_confidence(landmarks, hand_orientation):
    """Calculate confidence score for paper gesture."""
    # Check finger separation and palm orientation
    finger_tips = [
        landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP],
        landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP],
        landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_TIP],
        landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]
    ]
    
    # Calculate average finger separation
    separations = []
    for i in range(len(finger_tips)-1):
        separation = np.sqrt(
            (finger_tips[i].x - finger_tips[i+1].x)**2 +
            (finger_tips[i].y - finger_tips[i+1].y)**2
        )
        separations.append(separation)
    
    avg_separation = np.mean(separations)
    separation_score = min(1.0, avg_separation * 8)
    orientation_score = abs(hand_orientation[2]) > 0.7
    
    return (separation_score * 0.6 + float(orientation_score) * 0.4)

def calculate_distance(point1, point2):
    """Calculate 3D distance between two points."""
    return ((point1.x - point2.x) ** 2 + 
            (point1.y - point2.y) ** 2 + 
            (point1.z - point2.z) ** 2) ** 0.5

@app.route('/detect', methods=['POST'])
def detect_gesture():
    """Endpoint to detect gesture from image data."""
    try:
        # Get image data from request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
            
        image_file = request.files['image']
        image_array = np.frombuffer(image_file.read(), np.uint8)
        frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
            
        # Process the frame
        gesture, confidence = process_frame(frame)
        
        if confidence == 0.0:
            return jsonify({'error': 'Gesture not recognized'}), 400
            
        return jsonify({
            'gesture': gesture,
            'confidence': confidence,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint to check service health."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

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
    if init_gesture_service():
        app.run(host='0.0.0.0', port=5000)
    else:
        logger.error("Failed to initialize gesture service. Exiting.")
        exit(1) 