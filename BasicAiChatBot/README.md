# AI ChatBot

> Your own personal AI assistant that runs on your machine — connect it to Groq's free API, chat with it, and your conversations are saved so you never lose context.

Think of it like your own ChatGPT, but simpler. You're the user, the AI is your assistant. Ask it anything. Backend is Express + SQLite. Frontend is React + Bootstrap. Everything runs on your machine — no cloud database, no paid API beyond your Groq key (which starts with free credits!).

---

## What You'll Learn

- How to **call an external AI API** from your own backend (the Groq SDK)
- How to **manage conversation history** — storing messages in a database so the AI remembers context
- How to structure a **multi-table database** with foreign keys (`conversations` → `messages`)
- How the **system prompt** controls the AI's personality and behavior
- How to build a **chat UI in React** — sending messages, rendering AI replies, sidebar navigation

---

## Before You Start

- [ ] Node.js v20 or newer? Run `node --version`
- [ ] A Groq API key? [Get one free here](https://console.groq.com/keys) (takes 2 minutes, free credits, no credit card needed at first)
- [ ] Have a terminal and a browser?
- [ ] 5 minutes of patience? First install downloads packages for both backend and frontend.

---

## How Do I Run It?

### 1. Clone or open the folder

```bash
cd BasicAiChatBot
```

### 2. Get your Groq API key (free!)

This project talks to Groq — a company that runs super-fast AI models in the cloud. You need a key so Groq knows it's you making the requests. Getting one is free and takes about two minutes.

**Step-by-step:**

1. Go to **[console.groq.com](https://console.groq.com)** and click **"Sign Up"** (or **"Log In"** if you already have an account). You can sign up with Google, GitHub, or email.

2. Once you're in, look at the left sidebar. Click **"API Keys"**.

3. Click the **"Create API Key"** button. Give it any name you want — maybe "My Chatbot" or "School Project".

4. A long string of letters and numbers will appear. It starts with `gsk_`. **Copy it immediately** — once you close that popup, you can't see the full key again (you'd have to make a new one).

> **This is important:** Your API key is like a password. Anyone with your key can use Groq on your behalf and burn through your free credits. Never post it on GitHub, never share it in a Discord screenshot, never put it in a TikTok comment. The `.gitignore` file in this project already makes sure it won't get committed — but still be careful.

5. Open the `.env` file in this project and paste your key:

```
PORT=3001
GROQ_API_KEY=gsk_your_actual_key_here
```

Replace `gsk_your_actual_key_here` with the key you copied. Save the file.

> **What if I run out of free credits?** Groq gives you a generous free tier. For a personal chatbot, you probably won't hit the limit unless you're chatting with it for hours every day. If you do run out, you'll get an email, and you can either wait for the monthly reset or add a payment method.

> **Can I use a different AI provider?** Yes! The pattern is the same — you just need the provider's SDK and API key. OpenAI, Anthropic (Claude), Cohere, and Mistral all offer free credits to students. The code structure would look almost identical.

### 3. Install everything

```bash
npm install
npm install --prefix client
```

(This grabs Express, SQLite, React, Bootstrap, and the Groq library. Give it a minute.)

### 4. Fire it up

```bash
npm run dev
```

You'll see two things start up:
- **API server** on `http://localhost:3001` (blue text in terminal)
- **Frontend** on `http://localhost:5173` (green text in terminal)

Open your browser to **http://localhost:5173** and start chatting.

### Demo

There's no login or demo accounts. Just open the app, type a message, and the AI replies. Each new conversation gets its own history — the AI remembers what you were talking about within that conversation.

---

## What's in Here?

```
BasicAiChatBot/
├── .env                          # Your Groq API key + port number
├── .gitignore                    # Files we never commit (node_modules, .env, database)
├── package.json                  # Backend dependencies + scripts
├── server.js                     # Starts Express, loads routes
│
├── config/                       # Configuration files
│   ├── db.js                     #   Creates the SQLite database and tables
│   └── ai.js                     #   Connects to Groq, sets up the AI model
│
├── models/                       # Each file talks to one database table
│   ├── Conversation.js           #   Create, list, delete conversations
│   └── Message.js                #   Save and retrieve chat messages
│
├── controllers/                  # The brains — handle requests, do the logic
│   ├── aiController.js           #   The main one: receives your message, calls Groq, returns reply
│   ├── conversationController.js #   List and delete conversations
│   ├── messageController.js      #   Fetch messages for a conversation
│   └── databaseController.js     #   Debug endpoint: peek at all database tables
│
├── routes/
│   └── routes.js                 #   Maps URLs to controllers (like a phonebook for the API)
│
├── database/                     # SQLite database auto-created here on first run
│
└── client/                       # React frontend (its own mini-project)
    ├── index.html                #   The HTML shell
    ├── package.json              #   Frontend dependencies (React, Bootstrap, Vite)
    ├── vite.config.js            #   Tells Vite to proxy /api requests to the backend
    └── src/
        ├── main.jsx              #   React entry point
        ├── App.jsx               #   Renders the Chat page
        ├── App.css               #   All the styling
        ├── api.js                #   Helper functions for calling the backend
        └── pages/
            └── Chat.jsx          #   The chat UI — messages, input, sidebar
```

---

## How Does It Work?

Here's what happens when you type a message and hit send:

```
You type "What's the capital of France?"
         │
         ▼
   Chat.jsx calls api.ai.chat()
         │
         ▼
   POST /api/ai/chat  ──►  aiController.js
         │                       │
         │                 1. Saves your message to SQLite
         │                 2. Loads the whole conversation history
         │                 3. Sends everything to Groq
         │                       │
         │                       ▼
         │              config/ai.js
         │              (sends to Groq with system prompt:
         │               "You are a helpful, friendly assistant...")
         │                       │
         │                       ▼
         │              Groq responds: "Paris!"
         │                       │
         │                 4. Saves the AI reply to SQLite
         │                 5. Returns the reply to the frontend
         │                       │
         ▼                       ▼
   Chat.jsx updates the messages on screen
```

**The database remembers everything.** Close your browser, come back tomorrow — your conversations are still there. Each conversation has its own history, so the AI remembers what you were talking about.

**The system prompt** (in `config/ai.js`) tells Groq how to behave. Right now it says: *"Be helpful, friendly, and concise."* You can change that to anything — make it sassy, make it a pirate, make it interview you for a job. It's your AI.

---

## The Database

Two tables, linked by a foreign key. When you delete a conversation, all its messages go with it (CASCADE delete).

Table: `conversations`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| title | TEXT | Defaults to "New Chat" |
| created_at | TEXT | Auto-filled with current datetime |

Table: `messages`

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Auto-increment |
| conversation_id | INTEGER | Links to `conversations.id` |
| role | TEXT | Either `"user"` or `"assistant"` |
| content | TEXT | The message text |
| created_at | TEXT | Auto-filled with current datetime |

**Relationship:** `conversations` 1 ──── many `messages` (via `conversation_id` foreign key with `ON DELETE CASCADE`)

---

## API Endpoints

All URLs start with `/api`. These are the paths the frontend calls behind the scenes:

| Method | Endpoint | Auth | What it does |
|--------|----------|------|-------------|
| `GET` | `/api/conversations` | No | List all saved conversations |
| `GET` | `/api/conversations/:id` | No | Get one conversation by ID |
| `DELETE` | `/api/conversations/:id` | No | Delete a conversation + its messages |
| `GET` | `/api/messages/conversation/:id` | No | Get all messages for a conversation |
| `POST` | `/api/ai/chat` | No | Send a message, get AI reply |
| `GET` | `/api/database` | No | Debug: see everything in the database |

---

## Try It With curl

You can talk to the AI without even opening the browser. Make sure the server is running (`npm run dev`), then:

**Start a new conversation:**
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me a fun fact about space"}'
```

**Reply in the same conversation** (use the `conversation_id` from the response above):
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": 1, "message": "Now tell me about black holes"}'
```

**See all your conversations:**
```bash
curl http://localhost:3001/api/conversations
```

**Peek at the database:**
```bash
curl http://localhost:3001/api/database | python3 -m json.tool
```

### Error case

```bash
# Missing message field — you'll get a 400 error
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Tech Stack

| Package | What It Does | Why We Use It |
|---------|-------------|---------------|
| express | HTTP server | Simple, widely used, great for learning |
| better-sqlite3 | Talks to SQLite | Synchronous — no async/await needed |
| groq-sdk | Talks to Groq's AI models | Official SDK from Groq, handles auth automatically |
| react | UI library | Builds the chat interface with components |
| bootstrap | CSS framework | Clean UI without writing raw CSS |
| vite | Frontend dev server + build tool | Fast, proxies API calls to the backend |
| nodemon | Auto-restarts server on save | No more Ctrl+C, npm start, repeat |
| concurrently | Runs backend + frontend together | One terminal, two servers, color-coded |

---

## Customization Guide

### Change the AI's personality

1. **Open `config/ai.js`** and find the `SYSTEM_PROMPT` constant
2. Change it to anything you want. Examples:
   - `"You are a grumpy pirate. Every reply must include 'Arrr!'"`
   - `"You are a job interviewer for a tech company. Ask me questions and follow up on my answers."`
   - `"You are a patient programming tutor. Explain everything like I'm 12."`
3. **Save the file.** The next message you send gets the new prompt.

### Use a different Groq model

1. **Open `config/ai.js`** and change the `model` field
2. Available options: `llama-3.3-70b-versatile`, `mixtral-8x7b-32768`, `gemma2-9b-it`, etc.
3. Check [Groq's documentation](https://console.groq.com/docs/models) for the full list.

### Change the color scheme

1. **Open `client/src/App.css`** and look for CSS variables at the top
2. Change `--primary`, `--bg`, or any variable to your preferred colors
3. Vite auto-refreshes the page — you'll see the changes instantly.

### Change the port

1. **Edit `PORT` in `.env`** (frontend + backend)
2. **Edit the proxy target in `client/vite.config.js`** to match the new port

---

## Challenge Yourself

- 🟢 **Easy:** Change the system prompt to make the AI act like your favorite movie character. Does it change the way the AI talks?
- 🟢 **Easy:** Change the default conversation title from "New Chat" to something more creative.
- 🟡 **Medium:** Add a "Rename Conversation" feature — a `PUT /api/conversations/:id` endpoint and a UI to edit the title.
- 🟡 **Medium:** Add a "search messages" feature — search through all your message history for a keyword.
- 🔴 **Hard:** Add support for a second AI provider (like OpenAI). Create a dropdown to choose which provider to use. What parts of `config/ai.js` would need to change?

---

## Troubleshooting

| Error | What It Means | What To Try |
|-------|--------------|-------------|
| `EADDRINUSE: address already in use :::3001` | Another app is using port 3001 | Close it, or change `PORT` in `.env` to `3002` — also update the proxy in `client/vite.config.js` |
| `EADDRINUSE` on port 5173 | Another Vite app is running | Stop the other one, or Vite will auto-offer the next free port |
| `GROQ_API_KEY is not set` or API errors | Your Groq key is missing/wrong | Check `.env` — make sure you replaced the placeholder with your real key from [console.groq.com](https://console.groq.com/keys) |
| AI not responding / messages appear but no reply | The AI call failed silently | Open browser DevTools (F12) → Network tab → look for `/api/ai/chat`. Check the response. Also check the terminal running the server for error messages. |
| AI replies "Sorry, something went wrong" | Groq API returned an error | Check your `.env` key again. Go to [console.groq.com](https://console.groq.com) to check if you still have credits (usage is shown on the dashboard) |
| Frontend won't load (blank page) | Frontend deps not installed or build error | Run `npm install --prefix client`. Check the Vite terminal for errors. |
| `Cannot find module 'groq-sdk'` | Backend deps not installed | Run `npm install` in the project root |
| curl says "Connection refused" | Server isn't running | Run `npm run dev` first. We've all forgotten this step. |

---

## What Should I Do Next?

1. **Read `config/ai.js`** — it's only a few lines but shows exactly how the Groq SDK works.
2. **Read `controllers/aiController.js`** — trace how a message flows: save message → load history → call AI → save reply → return.
3. **Change the system prompt** and see how the AI's behavior changes immediately.
4. **Ready for more?** Move on to **BasicAuth** to learn how user accounts, passwords, and JWT tokens work in a full-stack app.

---

## Production-ish Notes (optional)

- For deployment, you'll need to run `npm run build --prefix client` and serve `client/dist` as static files from Express.
- Never commit your `.env` file — the `.gitignore` already protects it, but double-check before pushing.
- Groq's free tier has rate limits. If you're building for many users, you'll need to add error handling for rate limit responses (HTTP 429).

---

*"Your first time running this and it crashes? That's normal. Every programmer you look up to started exactly where you are now — staring at a terminal, confused, one Google search away from figuring it out."*

Built with Express, better-sqlite3, Groq SDK, React, Bootstrap, and Vite. Zero build steps for the API. One command to run everything. Happy chatting!
