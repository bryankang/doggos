import { createOpenAiClient } from "./create-openai-client.server";

export const openai = () => createOpenAiClient();
