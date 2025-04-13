const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const authMiddleware = (role) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (role && req.user.role !== role) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            res.status(400).json({ message: 'Invalid token.' });
        }
    };
};
const socketAuthMiddleware = (socket, next) => {
    const token = socket.handshake.auth?.token; // Safely access the token from handshake
    if (!token) {
        logger.error('Authentication error: Token missing');
        return next(new Error('Authentication error: Token missing'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        socket.request.user = decoded; // Attach user info to the socket
        next();
    } catch (err) {
        logger.error('Authentication error: Invalid token', err);
        next(new Error('Authentication error: Invalid token'));
    }
}
module.exports = { authMiddleware, socketAuthMiddleware };