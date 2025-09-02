export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  modelId: string; // OpenRouter model ID
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt',
    name: 'GPT',
    provider: 'OpenAI',
    description: 'Latest GPT-4 model with improved performance',
    modelId: 'openai/gpt-4o'
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    description: 'Fast and efficient Claude model',
    modelId: 'anthropic/claude-3-5-sonnet-20241022'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    description: 'Google\'s latest multimodal model',
    modelId: 'google/gemini-2.0-flash-001'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    description: 'Advanced reasoning and coding capabilities',
    modelId: 'deepseek/deepseek-r1-0528'
  }
];

export interface ModelResponse {
  modelId: string;
  response: string;
  displayText: string;
  isLoading: boolean;
  isTyping: boolean;
  error?: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  responses: ModelResponse[];
}
