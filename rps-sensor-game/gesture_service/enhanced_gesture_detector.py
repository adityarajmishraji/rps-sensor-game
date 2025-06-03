import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
import math

class EnhancedGestureDetector:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        self.mp_draw = mp.solutions.drawing_utils
        self.mp_draw_styles = mp.solutions.drawing_styles
        
        # Initialize ML model
        self.model = self._create_model()
        self.scaler = StandardScaler()
        
    def _create_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(63,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(3, activation='softmax')  # 3 classes: rock, paper, scissors
        ])
        model.compile(optimizer='adam',
                     loss='sparse_categorical_crossentropy',
                     metrics=['accuracy'])
        return model

    def _calculate_finger_angles(self, landmarks):
        angles = []
        # Define finger joint connections
        finger_joints = [
            [0, 1, 2], [1, 2, 3], [2, 3, 4],  # Thumb
            [0, 5, 6], [5, 6, 7], [6, 7, 8],  # Index
            [0, 9, 10], [9, 10, 11], [10, 11, 12],  # Middle
            [0, 13, 14], [13, 14, 15], [14, 15, 16],  # Ring
            [0, 17, 18], [17, 18, 19], [18, 19, 20]  # Pinky
        ]
        
        for joint in finger_joints:
            p1 = np.array([landmarks[joint[0]].x, landmarks[joint[0]].y])
            p2 = np.array([landmarks[joint[1]].x, landmarks[joint[1]].y])
            p3 = np.array([landmarks[joint[2]].x, landmarks[joint[2]].y])
            
            # Calculate angle between joints
            angle = math.degrees(math.atan2(p3[1] - p2[1], p3[0] - p2[0]) - 
                               math.atan2(p1[1] - p2[1], p1[0] - p2[0]))
            angle = abs(angle)
            if angle > 180:
                angle = 360 - angle
            angles.append(angle)
            
        return angles

    def _extract_features(self, landmarks):
        # Extract coordinates and angles
        coords = []
        for lm in landmarks:
            coords.extend([lm.x, lm.y, lm.z])
        
        angles = self._calculate_finger_angles(landmarks)
        features = np.array(coords + angles).reshape(1, -1)
        
        return self.scaler.fit_transform(features)

    def detect_gesture(self, frame):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        
        gesture_info = {
            'gesture': 'unknown',
            'confidence': 0.0,
            'hand_detected': False,
            'landmarks': None
        }
        
        if results.multi_hand_landmarks:
            gesture_info['hand_detected'] = True
            landmarks = results.multi_hand_landmarks[0]
            gesture_info['landmarks'] = landmarks
            
            # Extract features for ML model
            features = self._extract_features(landmarks.landmark)
            
            # Get model predictions
            predictions = self.model.predict(features, verbose=0)
            predicted_class = np.argmax(predictions[0])
            confidence = predictions[0][predicted_class]
            
            # Map class index to gesture
            gestures = ['rock', 'paper', 'scissors']
            gesture_info['gesture'] = gestures[predicted_class]
            gesture_info['confidence'] = float(confidence)
            
            # Draw hand landmarks with custom style
            self.mp_draw.draw_landmarks(
                frame,
                landmarks,
                self.mp_hands.HAND_CONNECTIONS,
                self.mp_draw_styles.get_default_hand_landmarks_style(),
                self.mp_draw_styles.get_default_hand_connections_style()
            )
            
            # Add visual feedback
            self._add_visual_feedback(frame, gesture_info)
        
        return gesture_info

    def _add_visual_feedback(self, frame, gesture_info):
        # Add gesture name and confidence
        text = f"{gesture_info['gesture'].upper()}: {gesture_info['confidence']*100:.1f}%"
        cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 0), 2, cv2.LINE_AA)
        
        # Add gesture hint
        hints = {
            'rock': 'Make a fist',
            'paper': 'Show open palm',
            'scissors': 'Show peace sign'
        }
        if gesture_info['gesture'] in hints:
            cv2.putText(frame, hints[gesture_info['gesture']], (10, 60),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1, cv2.LINE_AA)

    def train_on_sample(self, frame, gesture_label):
        """Train the model on a single sample (for online learning)"""
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        
        if results.multi_hand_landmarks:
            landmarks = results.multi_hand_landmarks[0]
            features = self._extract_features(landmarks.landmark)
            
            # Convert gesture label to class index
            gesture_classes = {'rock': 0, 'paper': 1, 'scissors': 2}
            label = gesture_classes.get(gesture_label, -1)
            
            if label != -1:
                # Update model with single sample
                self.model.train_on_batch(features, np.array([label])) 