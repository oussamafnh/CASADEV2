import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import PostRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js"
import saveRoutes from "./routes/save.route.js"
import SearchRoutes from "./routes/search.route.js"
import followRoutes from "./routes/follow.route.js"
import reportRoutes from './routes/report.route.js';
import cors from 'cors';
import axios from 'axios';

const app = express();
dotenv.config();
app.set("trust proxy", 1);

// app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(cors({ origin: 'https://casadev-cmog.vercel.app', credentials: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
const PORT = process.env.PORT;
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome !' });
});
app.use("/api/auth", authRoutes)
app.use("/api/post", PostRoutes)
app.use("/api/search", SearchRoutes)
app.use("/api/comment", commentRoutes)
app.use("/api/save", saveRoutes)
app.use("/api/follow", followRoutes)
app.use('/api/reports', reportRoutes);

const keepAlive = () => {
  setInterval(async () => {
    try {
      const response = await axios.get('https://casadev2-4aiv.onrender.com');
    } catch (error) {
      console.error('❌ Error during keep-alive ping:', error.message);
    }
  }, 14 * 60 * 1000); // 14 minutes in milliseconds
};
app.listen(PORT, () => {
  connectDB();
  keepAlive();
  console.log("Server is running on port :", PORT);
});

//dbcshAn7gU3RkSa5