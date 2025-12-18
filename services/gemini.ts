
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, FileData } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export async function askQuestionAboutDoc(
  question: string,
  doc: FileData,
  history: Message[]
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Format history for the model
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Add the document and the current question to the latest part
  // We include the document context in the query to ensure RAG-like behavior
  const currentTurn = {
    role: 'user',
    parts: [
      {
        inlineData: {
          mimeType: doc.mimeType,
          data: doc.base64
        }
      },
      {
        text: `Based ONLY on the provided document, answer the following question: ${question}`
      }
    ]
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...contents, currentTurn],
      config: {
        systemInstruction: "You are an expert document analyzer. Use the provided PDF context to answer questions accurately and concisely. If the information is not in the document, state that you cannot find it. Use markdown for formatting.",
        temperature: 0.2, // Low temperature for factual accuracy
        topP: 0.8,
        topK: 40,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("API key")) {
        throw new Error("Invalid or missing API Key. Please ensure your environment is configured correctly.");
    }
    throw new Error("Failed to communicate with the document analysis engine.");
  }
}
