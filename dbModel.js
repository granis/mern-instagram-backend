import mongoose from "mongoose";

const schema = mongoose.Schema({
  caption: String,
  user: String,
  image: String,
  comments: [],
});

export default mongoose.model("posts", schema);
