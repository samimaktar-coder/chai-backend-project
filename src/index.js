// require('dotenv').config({ path: './env' });

import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from './app.js';

dotenv.config({
    path: './.env'
});

connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.log('ERR: ', error);
            throw error;
        });

        app.listen(process.env.PORT || 8000), () => {
            console.log(`▧▩ Sever is runnig at port : ${process.env.PORT}`);
        };
    })
    .catch(err => console.log('MONGODB connection fail !!! ', err))











/*
import mongoose from "mongoose";
import { DB_NAME } from './constants';
import express from "express";
const app = express()

    (async () => {
        try {
            mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
            app.on('error', (error) => {
                console.log('ERR: ', error);
                throw error;
            });

            app.listen(process.env.PORT, () => {
                console.log('App is listening on port ', process.env.PORT)
            })
        } catch (err) {
            console.error("Error: ", err);
            throw err;
        }
    })();
*/