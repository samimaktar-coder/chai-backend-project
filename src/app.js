import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "20kb" }));//! By this code, the backend will only take json as input and the max limit of the data can be 20kb
app.use(express.urlencoded({ extended: true, limit: "20kb" }));//! By this code, whenever you send any text(with spaces) in the url, it will convert the text to the url
app.use(express.static("public"));
app.use(cookieParser());


//route import
import userRouter from './routes/user.routes.js';
import commentRouter from './routes/comment.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import subscriptionRouter from './routes/subscripton.routes.js';
import videoRouter from './routes/video.routes.js';
import likeRouter from './routes/like.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import healthCheckRouter from './routes/healthcheck.routes.js';

//routes declaration
app.use('/api/v1', healthCheckRouter);
app.use('/api/v1/users', userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);



export default app;