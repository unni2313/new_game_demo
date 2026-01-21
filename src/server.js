import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Load env vars at the very beginning
dotenv.config();

import { connectDB, closeDB } from './config/db.js';
import { errorHandler, AppError } from './middlewares/errorMiddleware.js';
import { mongoSanitize } from './middlewares/sanitizationMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = express();
const port = process.env.PORT || 5000;

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV?.trim() === 'development') {
    app.use(morgan('dev'));
    console.log('Morgan logger initialized... 👀');
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize);

// Implement CORS
app.use(cors());

// 2) ROUTES
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// User routes
app.use('/api/users', userRoutes);

// Team routes
app.use('/api/teams', teamRoutes);

// Handle unhandled routes
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(errorHandler);

// 3) START SERVER
const startServer = async () => {
    await connectDB();

    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}...`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
        console.log('UNHANDLED REJECTION! 💥 Shutting down...');
        console.log(err.name, err.message);
        server.close(async () => {
            await closeDB();
            process.exit(1);
        });
    });

    // Graceful shutdown on SIGTERM
    process.on('SIGTERM', async () => {
        console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
        server.close(async () => {
            await closeDB();
            console.log('💥 Process terminated!');
        });
    });
};

startServer();
