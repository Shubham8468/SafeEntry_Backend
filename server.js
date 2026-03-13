import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connectDB from './config/mongoDb.js'
import authRoouter from './routs/auth.routs.js'
import userRoutes from './routs/user.routs.js'
const app = express();
const port = process.env.PORT || 4000;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is Running on ${port} port`)
    });
}).catch(err => {
    console.log('Failed to connect to MongoDB:', err);
});// here i connect DB 
// Link frontend origins for local + production deployments.
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
].filter(Boolean)
app.use(express.json()); // data are comming on json formet from the server side 
app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
}));

// API End points +++++++++++++++++



app.get('/', (req, resp) => {
    resp.send("API working ")
})

app.use('/api/auth', authRoouter);
app.use('/api/user',userRoutes);






