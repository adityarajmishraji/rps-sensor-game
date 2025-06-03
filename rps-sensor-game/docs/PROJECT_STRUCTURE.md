# Rock Paper Scissors Game with Hand Gestures

## Project Structure

```
rps-gesture-game/
├── client/                     # Frontend code
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Game/         # Game-related components
│   │   │   ├── Auth/         # Authentication components
│   │   │   └── Common/       # Shared components
│   │   ├── services/         # API and service functions
│   │   │   ├── gesture.js    # Hand gesture recognition
│   │   │   ├── gameLogic.js  # Game rules and logic
│   │   │   ├── storage.js    # Local storage handling
│   │   │   └── socket.js     # WebSocket connections
│   │   ├── utils/            # Utility functions
│   │   └── App.js           # Main React component
│   ├── public/              # Static files
│   └── index.html          # Entry HTML file
│
├── server/                  # Backend code
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/        # Data models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── config/            # Configuration files
│   └── index.js          # Server entry point
│
├── shared/                # Shared code between client and server
│   ├── constants.js      # Shared constants
│   └── validation.js     # Shared validation
│
└── deployment/           # Deployment configuration
    ├── netlify.toml     # Netlify configuration
    └── firebase.json    # Firebase configuration
```

## Features

### Single Player Mode
- Hand gesture recognition using TensorFlow.js
- Local storage for score persistence
- Progressive difficulty levels
- Offline support with Service Workers

### Multiplayer Mode
- Real-time gameplay using Socket.IO
- WebRTC for peer-to-peer video
- Room management system
- Authentication using Firebase
- Invitation system with shareable links

## Deployment Strategy

### Frontend (Netlify)
1. Static files hosted on Netlify
2. Automatic deployments from main branch
3. Environment variables for API endpoints
4. Custom domain support

### Backend (Firebase/Heroku)
1. Node.js server deployed to Firebase Functions or Heroku
2. WebSocket support through Socket.IO
3. Authentication using Firebase Auth
4. Database using Firebase Realtime Database

### Development Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables
```env
# Frontend
REACT_APP_API_URL=
REACT_APP_SOCKET_URL=
REACT_APP_FIREBASE_CONFIG=

# Backend
JWT_SECRET=
FIREBASE_ADMIN_CONFIG=
CORS_ORIGIN=
```

## Authentication Flow
1. User signs up/logs in using Firebase Auth
2. JWT token generated for API authentication
3. Socket connections authenticated using JWT
4. Room access controlled by user permissions

## Data Storage
1. Game scores stored in local storage
2. User profiles in Firebase Database
3. Active games in memory with Redis backup
4. Room data in Firebase Realtime Database

## Security Measures
1. CORS protection
2. Rate limiting
3. Input validation
4. WebSocket authentication
5. Room access control
6. Secure video streaming

## Performance Optimization
1. Code splitting
2. Lazy loading
3. Asset optimization
4. Caching strategies
5. WebSocket connection pooling 