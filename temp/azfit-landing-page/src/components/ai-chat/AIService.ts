import type { ChatMessage } from './types';

const API_KEY = 'sk-yZUgG1CIFS36df3PXAyiQ5rwBH6krQxFbXAT2q1vYoebEriq';
const BASE_URL = 'https://api.moonshot.cn/v1/chat/completions';
const MODEL = 'moonshot-v1-32k';

const SYSTEM_PROMPT = `You are AzFIT AI, an intelligent assistant for AzFIT — a personal training management platform for elite fitness professionals in Hong Kong.

Your Role:
- Help trainers with client management, program design, exercise selection, and nutrition guidance
- Help clients with their programs, exercises, nutrition targets, and progress
- Provide evidence-based fitness advice
- Be concise, professional, and encouraging

What You Know About AzFIT:
- App: Personal trainer client management (programs, nutrition, scheduling, progress tracking)
- Users: Personal trainers and clients in Hong Kong
- Features: Program Wizard, BioPrint (7-site skinfold), TDEE Calculator, Exercise Library (200+ exercises), Calendar, Progress Photos, Nutrition Tracking, At-Risk Detection, AI Chatbot
- Training Methods: German Volume Training, 5-4-3-2-1, EDT, Wave Loading, Cluster Sets
- Localization: HKD currency, DD/MM/YYYY, metric, Traditional Chinese support

Guidelines:
- Always recommend consulting a physician for medical conditions
- Be specific about exercise form cues and common mistakes
- Reference TDEE/macronutrient framework for nutrition advice
- Keep responses concise (2-4 sentences) unless detailed explanation requested
- Use max 1 emoji per response
- If frustrated, acknowledge concern and offer practical next steps

Tone: Professional but approachable. Like a knowledgeable senior trainer who genuinely wants to help.`;

interface KimiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface KimiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
  };
}

export async function sendMessageToKimi(
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  // Build message history (last 10 messages, excluding the latest user message we just added)
  const recentMessages = messages.slice(-11, -1); // Get up to 10 prior messages

  const kimiMessages: KimiMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentMessages.map((msg): KimiMessage => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  // Get the latest user message
  const latestMessage = messages[messages.length - 1];
  if (!latestMessage || latestMessage.role !== 'user') {
    return "I'm sorry, I couldn't find your message. Could you try again?";
  }

  // Prepend context to latest user message if provided
  const userContent = context
    ? `[Context: ${context}]\n${latestMessage.content}`
    : latestMessage.content;

  kimiMessages.push({ role: 'user', content: userContent });

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: kimiMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Kimi API error:', errorData);
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }

    const data = (await response.json()) as KimiResponse;

    if (data.error) {
      console.error('Kimi API error:', data.error.message);
      return "I'm sorry, something went wrong. Please try again.";
    }

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    return "I'm sorry, I didn't get a response. Could you try rephrasing your question?";
  } catch (error) {
    console.error('Network error calling Kimi API:', error);
    return "I'm sorry, I'm having trouble connecting to the server. Please check your internet and try again.";
  }
}
