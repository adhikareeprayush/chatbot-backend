import axios from "axios";
import { markdownToHtml } from "marksmithjs";  // Import marksmithjs

/**
 * Cleans and formats Markdown response to HTML.
 * @param {string} text - The raw Markdown text response.
 * @returns {string} - Clean and properly formatted HTML.
 */
const formatMarkdownToHtml = (text) => {
  if (!text) return "";

  // Trim leading and trailing spaces
  text = text.trim();

  // Remove unnecessary spaces in the middle of words
  text = text.replace(/\s+/g, " "); // Normalize multiple spaces

  // Convert markdown to HTML using marksmithjs
  try {
    return markdownToHtml(text);  // Convert markdown to HTML
  } catch (err) {
    console.error("Markdown syntax not valid:", err);
    return "";
  }
};

/**
 * Fetch response from the Ollama API.
 * @param {string} model - The model name (e.g., "deepseek-r1").
 * @param {string} prompt - The user prompt.
 * @returns {Promise<string>} - The processed HTML response.
 */
export const fetchOllamaResponse = async (model, prompt) => {
  try {
    const OLLAMA_HOST = process.env.OLLAMA_HOST;

    const response = await axios.post(
      `${OLLAMA_HOST}/api/generate`,
      { model, prompt, stream: true },
      { responseType: "stream" }
    );

    let fullResponse = "";
    let lastChar = "";

    return new Promise((resolve, reject) => {
      response.data.on("data", async (chunk) => {
        try {
          const data = JSON.parse(chunk.toString());

          if (data.response) {
            let text = data.response.trim();

            if (!["<think>", "</think>", ""].includes(text)) {
              if (fullResponse && !lastChar.match(/\s/)) {
                fullResponse += " ";
              }
              fullResponse += text;
              lastChar = text.slice(-1);
            }
          }

          if (data.done) {
            const formattedHtml = formatMarkdownToHtml(fullResponse);  // Convert to HTML
            resolve(formattedHtml);
          }
        } catch (error) {
          console.error("Error parsing response chunk:", error);
        }
      });

      response.data.on("error", (error) => {
        reject("Error in Ollama stream: " + error.message);
      });
    });
  } catch (error) {
    console.error("Ollama API error:", error.message);
    throw new Error("Failed to fetch response from Ollama");
  }
};

/**
 * Generic function to fetch response from any model.
 * @param {string} model - The AI model to use.
 * @param {string} prompt - The user prompt.
 * @returns {Promise<string>} - The processed HTML response.
 */
export const fetchResponse = async (model, prompt) => {
  return fetchOllamaResponse(model, prompt);
};
