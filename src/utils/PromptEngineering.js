
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
  const contextMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
  const context = contextMessages
    .map(msg => `${msg.text}`)
    .join('\n\n');
  return context ? `${context}\n\n${newPrompt}` : newPrompt;
};
