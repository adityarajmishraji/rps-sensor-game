const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const csrf = require('csurf');
const bcrypt = require('bcrypt');

// Rate limiting configuration
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later.'
});

// Input validation middleware
const validateUserInput = [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('password').isLength({ min: 8 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// CSRF Protection
const csrfProtection = csrf({ cookie: true });

// Security headers middleware
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "wss:"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// WebSocket security middleware
const wsAuth = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.user = decoded;
        next();
    });
};

// Password hashing utility
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Password verification utility
const verifyPassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

module.exports = {
    loginLimiter,
    validateUserInput,
    csrfProtection,
    securityHeaders,
    wsAuth,
    hashPassword,
    verifyPassword
}; 