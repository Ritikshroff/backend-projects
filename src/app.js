import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";


const uploadPath = "./public/temp";

// Create the folder if it doesn't exist (Railway needs this)
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log("📁 Created folder:", uploadPath);
}


const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://backend-projects-kappa.vercel.app',
    'https://backend-projects-nvtqovuka-ritik-shroffs-projects.vercel.app',
    process.env.CORS_ORIGIN
].filter(Boolean); // Remove undefined/null values

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Railway LB) for secure cookies

app.use(cors({
    origin: function (origin, callback) {
        console.log("🔍 Incoming Origin:", origin);

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (origin.endsWith(".vercel.app")) {
            return callback(null, true);
        }

        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
}));


app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend API is running! 🚀',
        timestamp: new Date().toISOString(),
        endpoints: {
            users: '/api/v1/users',
            posts: '/api/v1/posts'
        }
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        status: 'healthy',
        uptime: process.uptime()
    });
});

// routes import 
import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';

// Error handling middleware imports
import notFoundHandler from './middlewares/notFound.middleware.js';
import errorHandler from './middlewares/errorHandler.middleware.js';


// Routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Global Error Handler - must be last
app.use(errorHandler);


export default app;