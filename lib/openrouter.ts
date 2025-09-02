import { AIModel } from './ai-models';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenRouter(
  model: AIModel,
  message: string,
  apiKey?: string
): Promise<string> {
  // Use environment variable if no API key is provided
  const key = apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!key) {
    throw new Error('OpenRouter API key is required. Please set NEXT_PUBLIC_OPENROUTER_API_KEY in your .env.local file.');
  }

  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  const requestBody: OpenRouterRequest = {
    model: model.modelId,
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      'X-Title': 'AI Model Comparison Tool',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.error?.message) {
        errorMessage = `OpenRouter API error: ${errorData.error.message}`;
      }
    } catch {
      // If we can't parse the error response, use the default message
    }
    
    throw new Error(errorMessage);
  }

  const data: OpenRouterResponse = await response.json();
  return data.choices[0]?.message?.content || 'No response received';
}
