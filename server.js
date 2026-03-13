import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connectDB from './config/mongoDb.js'
import authRoouter from './routs/auth.routs.js'
import userRoutes from './routs/user.routs.js'
const app = express();
const port = process.env.PORT || 4000;

const configuredOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS || '').split(','),
]
    .map((origin) => origin?.trim())
    .filter(Boolean)

const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://safe-entry-frontend.vercel.app',
    ...configuredOrigins,
])

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true)
        }

        return callback(new Error(`Not allowed by CORS: ${origin}`))
    },
    credentials: true,
}

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is Running on ${port} port`)
    });
}).catch(err => {
    console.log('Failed to connect to MongoDB:', err);
});// here i connect DB 
app.use(express.json()); // data are comming on json formet from the server side 
app.use(cookieParser());

app.use(cors(corsOptions));

// API End points +++++++++++++++++



app.get('/', (req, resp) => {
    resp.send("API working ")
})

app.use('/api/auth', authRoouter);
app.use('/api/user',userRoutes);






