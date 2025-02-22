import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
    {
        sessionId: {
            type: String, // Unique session identifier
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
        },
        prompt: {
            type: String,
            required: true,
            trim: true,
        },
        response: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Chat = mongoose.model("Chat", chatSchema);
