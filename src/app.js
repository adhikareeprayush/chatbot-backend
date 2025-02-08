import express, {urlencoded} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN, credentials: true}));
app.use(bodyParser.json());
app.use(express.json({limit: '1mb'})); 
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());


// routes
import chatRouter from './routes/chat.routes.js';
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);
app.use("/api/v1/chat", chatRouter);

export default app
