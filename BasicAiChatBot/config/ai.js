const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = 'You are a helpful, friendly, and concise AI assistant. Answer questions clearly and accurately. Keep your responses engaging but brief.';

async function getChatCompletion(messages) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 1024
  });

  return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

module.exports = { getChatCompletion };
