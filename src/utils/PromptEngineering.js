
import { MAX_CONTEXT_MESSAGES } from "../constants.js";
const formatInstructions = {
  default: 'Provide a natural response without any prefixes.',
  bullet: 'Format your response as a bulleted list where appropriate.',
  paragraph: 'Format your response in clear, well-structured paragraphs.',
  stepByStep: 'Format your response as numbered steps.',
};

const personalityInstructions = {
  default: 'Respond directly without any prefixes like "BOT:" or "ASSISTANT:".',
  professional: 'Maintain a professional tone without any prefixes.',
  friendly: 'Keep a conversational tone without any prefixes.',
  concise: 'Be brief and direct without any prefixes.',
};

export const formatPrompt = (prompt, settings) => {
  // const formatInstruction = formatInstructions[settings.responseFormat];
  // const personalityInstruction = personalityInstructions[settings.aiPersonality];
  
  return `
Important: Respond directly without using any prefixes like "BOT:", "ASSISTANT:", or similar markers.

${formatInstructions.default}
${personalityInstructions.default}

Query: ${prompt}
`;
};

export const cleanResponse = (response) => {
  // Remove common prefixes
  return response
    .replace(/^(BOT|ASSISTANT|AI|SYSTEM):\s*/i, '')
    .replace(/^["']|["']$/g, '') // Remove quotes
    .trim();
};


export const buildContextPrompt = (newPrompt, messages) => {
  // Ensure messages is an array
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  // Slice the last MAX_CONTEXT_MESSAGES messages
  const contextMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

  // Build the context by combining prompts and responses
  const context = contextMessages
    .map((msg) => `User: ${msg.prompt}\nAI: ${msg.response}`)
    .join('\n\n');

  // Append the new prompt to the context
  return context ? `${context}\n\nUser: ${newPrompt}` : `User: ${newPrompt}`;
};