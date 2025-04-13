const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const socketHandler = require('./sockets/socketHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const cors = require('cors');
const { socketAuthMiddleware } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    logger.error('Missing required environment variables: JWT_SECRET or MONGO_URI');
    process.exit(1); // Exit the application if critical variables are missing
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Allow requests from the frontend
        methods: ['GET', 'POST'],
    },
});

// Attach the Socket.IO instance to the app
app.set('io', io);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(
    morgan('combined', {
        skip: (req) => req.originalUrl.startsWith('/api-docs'), // Skip Swagger logs
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        logger.info('MongoDB connected successfully');
    })
    .catch((err) => {
        logger.error('MongoDB connection error:', err);
    });

// Routes
app.use('/auth', authRoutes); // Add auth routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);

// WebSocket Setup
socketHandler(io);

io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
    const user = socket.request.user; // User info should now be available
    if (user && user.role === 'donor') {
        logger.info(`Socket ID: ${socket.id}`);
        logger.info(`User role: ${user.role}`);
        socket.join('donors'); // Add the donor to the 'donors' room
    } else if (user) {
        logger.warn(`Unauthorized role: ${user.role} for Socket ID: ${socket.id}`);
        socket.disconnect(); // Disconnect unauthorized users
    } else {
        logger.warn(`Unauthorized connection attempt by Socket ID: ${socket.id}`);
        socket.disconnect(); // Disconnect if no user info is available
    }
    socket.on('error', (err) => {
        logger.error(`WebSocket error on Socket ID: ${socket.id} - ${err.message}`);
    });
});


// Swagger Setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Smart Donation Platform API',
            version: '1.0.0',
            description: 'API documentation for the Smart Donation Platform',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to your route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`); // Optional: Keep console log for local debugging
});