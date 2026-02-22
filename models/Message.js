import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  content: {
    type: String, // Text content
  },
  attachments: [
    {
      type: String, // URLs to files
    },
  ],
  type: {
    type: String,
    enum: ["text", "file", "voice"],
    default: "text",
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
