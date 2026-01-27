import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Load env vars at the very beginning
dotenv.config();

import { connectDB, closeDB } from './config/db.js';
import { errorHandler, AppError, responseHandler } from './middlewares/responseAndError.js';
import { mongoSanitize } from './middlewares/sanitizationMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

// ... (other code)
const app = express();
const port = process.env.PORT || 5000;

// 1) GLOBAL MIDDLEWARES
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());
app.use(mongoSanitize);

// User routes
app.use('/api/users', userRoutes);

// Team routes
app.use('/api/teams', teamRoutes);

// Game routes
app.use('/api/games', gameRoutes);

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
