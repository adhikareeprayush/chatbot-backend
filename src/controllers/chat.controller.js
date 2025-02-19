import { v4 as uuidv4 } from "uuid"; // Generates unique session IDs
import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { buildContextPrompt, formatPrompt, cleanResponse } from "../utils/PromptEngineering.js";

// Start a new chat session (Main Chat)
export const startNewChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const sessionId = uuidv4(); // Generate a unique session ID

    return res.status(200).json(new ApiResponse(200, { sessionId }, "New chat session started"));
});

// Send a prompt and get AI response (Sub-Chat)
export const sendChatMessage = asyncHandler(async (req, res) => {
    const { userId, sessionId, prompt } = req.body;

    if (!userId || !sessionId || !prompt) {
        throw new ApiError(400, "User ID, Session ID, and Prompt are required");
    }

    // Retrieve past messages from the session
    const pastMessages = await Chat.find({ userId, sessionId })
        .sort({ createdAt: -1 })
        .limit(10); // Limit context messages

    // Build AI context
    const contextPrompt = buildContextPrompt(prompt, pastMessages);
    const engineeredPrompt = formatPrompt(contextPrompt);

    // Fetch AI response from Gemini API
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: engineeredPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                ],
            }),
        }
    );

    if (!response.ok) {
        throw new ApiError(500, "Failed to fetch response from AI");
    }

    const data = await response.json();
    if (!data.candidates?.[0].content.parts?.[0].text) {
        throw new ApiError(500, "Invalid AI response format");
    }

    const rawResponse = data.candidates[0].content.parts[0].text.trim();
    const cleanedResponse = cleanResponse(rawResponse);

    // Save chat message
    const chat = await Chat.create({
        sessionId,
        userId,
        prompt,
        response: cleanedResponse,
    });

    return res.status(200).json(new ApiResponse(200, chat, "Chat response fetched"));
});

// Get chat history under a session (Main Chat + Sub-Chats)
export const getChatHistory = asyncHandler(async (req, res) => {
    const { userId, sessionId } = req.params;

    if (!userId || !sessionId) {
        throw new ApiError(400, "User ID and Session ID are required");
    }

    const chatHistory = await Chat.find({ userId, sessionId }).sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, chatHistory, "Chat history retrieved"));
});
