import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";

//app config
const app = express();
const port = process.env.PORT || 8080;

//middlewares
app.use(express.json());
app.use(cors());

//DB config

//api endpoints
app.get("/", (req, res) => res.status(200).send("hello world"));

//listener
app.listen(port, () => console.log(`listening to port:${port}`));
