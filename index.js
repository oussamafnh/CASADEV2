import express  from "express";
import dotenv from  "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRoutes from  "./routes/auth.route.js";
import cors from 'cors';

const app = express();
dotenv.config();
// app.use(cors());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
const PORT = process.env.PORT ;

app.use("/api/auth", authRoutes) 


app.listen(PORT, () => {
  connectDB();  
  console.log("Server is running on port :",PORT);
});

//dbcshAn7gU3RkSa5

