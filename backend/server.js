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

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(helmet());
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
app.use((err, req, res) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`); // Optional: Keep console log for local debugging
});