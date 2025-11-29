import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


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


// Routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);


export default app;