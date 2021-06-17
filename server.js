import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import dbModel from "./dbModel.js";

//app config
const app = express();
const port = process.env.PORT || 8080;

const pusher = new Pusher({
  appId: process.env.PUSHER_APPID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

//middlewares
app.use(express.json());
app.use(cors());

//DB config
const connection_url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v59a2.mongodb.net/instagramDB?retryWrites=true&w=majority`;
mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB connected");

  const changeStream = mongoose.connection.collection("posts").watch();
  changeStream.on("change", (change) => {
    console.log("Pusher: " + change);
    if (change.operationType === "insert") {
      console.log("Triggering Pusher ***img upload***");
      const postDetails = change.fullDocument;

      pusher.trigger("posts", "inserted", {
        user: postDetails.user,
        caption: postDetails.caption,
        image: postDetails.image,
      });
    } else {
      console.log("Another trigger occured: " + change.operationType);
    }
  });
});

//api endpoints
app.get("/", (req, res) => res.status(200).send("hello world"));

app.post("/upload", (req, res) => {
  const body = req.body;
  dbModel.create(body, (error, data) => {
    if (error) {
      res.status(500).send.apply(error);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/sync", (req, res) => {
  dbModel.find((error, data) => {
    if (error) {
      res.status(500).send.apply(error);
    } else {
      res.status(200).send(data);
    }
  });
});

//listener
app.listen(port, () => console.log(`listening to port:${port}`));
