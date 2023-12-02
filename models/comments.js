import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
  username: String,
  content: String,
  avt: String,
  date: Date,
});

// Tạo một Model từ Schema
const Comment = mongoose.model("comments", commentsSchema);

export default Comment;
