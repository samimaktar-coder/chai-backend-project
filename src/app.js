import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "20kb" }));//! By this code, the backend will only take json as input the limit of the data is 20kb
app.use(express.urlencoded({ extended: true, limit: "20kb" }));//! By this code, whenever you send any text(with spaces) in the url, it will convert the text to the url
app.use(express.static("public"));
app.use(cookieParser())



export default app;