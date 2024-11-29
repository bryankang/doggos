import OpenAI from "openai";

export const createOpenAiClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};
