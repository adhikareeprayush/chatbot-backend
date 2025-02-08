import { asyncHandler } from '../utils/AsyncHandler.js';
import { Chat } from '../models/chat.model.js';
import { ApiError } from '../utils/ApiError.js';
import { cleanResponse, buildContextPrompt, formatPrompt } from '../utils/PromptEngineering.js';

// Fetch the previous chat messages of the user and build the context prompt
export const fetchResponse = asyncHandler(async (req, res) => {
  const { prompt, userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Retrieve past messages from the database
  const pastMessages = await Chat.find({ userId })
    .sort({ createdAt: -1 })  // Get the latest messages first
    .limit(5);  // Limit to the last 5 messages to avoid excessive context size

  // Build the context prompt
  const contextPrompt = buildContextPrompt(prompt, pastMessages);

  // Format the prompt for better responses
  const engineeredPrompt = formatPrompt(contextPrompt);

  // Fetch response from Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      }),
    }
  );

  if (!response.ok) {
    throw new ApiError(500, "Failed to fetch response");
  }

  const data = await response.json();

  console.log("Response: ",data);

  if (!data.candidates?.[0].content.parts?.[0].text) {
    throw new ApiError(500, "Invalid response format");
  }

  const rawResponse = data.candidates[0].content.parts[0].text.trim();
  const cleanedResponse = cleanResponse(rawResponse);

  // Save chat entry to the database
  const chat = await Chat.create({
    userId,
    prompt,
    response: cleanedResponse,
  });

  if (!chat) {
    throw new ApiError(500, "Failed to create chat entry");
  }

  return res.status(200).json({
    status: 'success',
    data: chat,
  });
});
