import mongoose, {Schema} from "mongoose";

const chatSchema = new Schema(
    {
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
)

export const Chat = mongoose.model("Chat", chatSchema);
