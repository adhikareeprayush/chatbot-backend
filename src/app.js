import express, {urlencoded} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const app = express();

// Updated CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json({limit: '1mb'})); 
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// routes
import chatRouter from './routes/chat.routes.js';
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chat", chatRouter);

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

export default app;