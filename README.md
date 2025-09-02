# AI Model Comparison Tool

A Next.js web application that allows users to compare responses from multiple AI models simultaneously using OpenRouter's API.

## Features

- **Multi-Model Comparison**: Compare responses from GPT-4o, Claude 4 Sonnet, Gemini 2.0, and DeepSeek simultaneously
- **Real-time Responses**: All selected models respond at the same time for efficient comparison
- **Favorite System**: Mark your preferred responses and see them highlighted
- **Copy Functionality**: Easily copy any AI response to your clipboard
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light mode based on system preferences

## Supported AI Models

- **GPT-5** (OpenAI) - Latest GPT-5 model with improved performance
- **Claude 4 Sonnet** (Anthropic) - Fast and efficient Claude model
- **Gemini 2.5 Pro** (Google) - Google's latest multimodal model
- **DeepSeek R-1** (DeepSeek) - Advanced reasoning and coding capabilities


## How It Works

- The application uses OpenRouter's unified API to access multiple AI models
- When you send a message, it's simultaneously sent to all selected models
- Responses are displayed in a grid layout with one column per model
- The interface automatically adjusts the grid based on the number of selected models
- All API calls are made directly from the client to OpenRouter (no backend required)

## Project Structure

```
aifliesta/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── components/
│   ├── ApiKeyInput.tsx      # API key input modal
│   ├── ChatInterface.tsx    # Main chat interface
│   ├── MessageInput.tsx     # Message input component
│   ├── ModelResponse.tsx    # Individual model response display
│   └── ModelSelector.tsx    # Model selection interface
├── lib/
│   ├── ai-models.ts         # AI model configurations
│   ├── openrouter.ts        # OpenRouter API utilities
│   └── utils.ts             # Utility functions
└── package.json
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **OpenRouter API** - Unified AI model access
- **React Hooks** - State management

## API Configuration

The application is configured to work with OpenRouter's API. The supported models and their OpenRouter IDs are:

- `openai/gpt-4o` - GPT-4o
- `anthropic/claude-3-5-sonnet-20241022` - Claude 4 Sonnet
- `google/gemini-2.0-flash-exp` - Gemini 2.0
- `deepseek/deepseek-coder` - DeepSeek

## Deployment

This application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended): Connect your GitHub repository
- **Netlify**: Build command: `npm run build`, Publish directory: `.next`
- **Railway**: Automatic deployment from GitHub
- **Self-hosted**: Run `npm run build && npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check the [OpenRouter documentation](https://openrouter.ai/docs)
2. Open an issue in this repository
3. Contact the maintainers

## Roadmap

- [ ] Add more AI models
- [ ] Conversation history persistence
- [ ] Export conversations
- [ ] Custom model parameters
- [ ] Response streaming
- [ ] Model performance metrics

## Supabase Setup

1. Create a project at `https://supabase.com` and get your project URL and anon key.
2. Add the following to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
3. Apply database schema (from `supabase/migrations.sql`). In the Supabase SQL editor, paste and run the contents:
   - Creates `public.chats` table
   - Enables RLS with user-isolation policies
4. Start the app and sign up via `/signup`. Then login at `/login`.
5. Use the app; chat sessions will appear on `/history` for the logged-in user.

Data model:
- `public.chats`
  - `user_id` (uuid) → owner
  - `prompt` (text)
  - `models` (text[])
  - `responses` (jsonb) → keyed by model id with `{ text, error }`
  - `created_at` (timestamptz)
