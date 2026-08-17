# Nuvix AI

Nuvix AI is a full-stack AI chat application. It provides account authentication, persistent chat history, real-time Gemini responses, and long-term memory retrieval through Pinecone.

## Features

- Secure cookie-based authentication with registration, login, session restoration, and logout
- Persistent chats and messages stored in MongoDB
- Real-time AI responses through Socket.IO
- Gemini-powered answers with Pinecone vector-memory retrieval
- Redux Toolkit state management for users, chats, messages, and request states
- Responsive mobile sidebar and chat interface
- Markdown responses with tables, lists, links, and highlighted copyable code blocks
- Chat search, deletion, message copy, and code copy controls

## Project structure

```text
Nuvix AI/
├── Backend/
│   ├── src/
│   │   ├── controllers/    # Authentication and chat request handlers
│   │   ├── db/             # MongoDB connection
│   │   ├── middlewares/    # JWT authentication middleware
│   │   ├── models/         # User, Chat, and Message schemas
│   │   ├── routes/         # REST API routes
│   │   ├── services/       # Gemini and Pinecone integrations
│   │   └── sockets/        # Socket.IO AI messaging server
│   └── server.js
└── Frontend/
    └── src/
        ├── components/     # Sidebar, chat room, Markdown renderer
        ├── pages/          # Login, signup, and home screens
        ├── redux/          # Store and user/chat slices
        └── services/       # Axios and Socket.IO clients
```

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, Redux Toolkit, Axios, Socket.IO Client |
| Rendering | React Markdown, Remark GFM, PrismJS |
| Backend | Node.js, Express, Socket.IO |
| Data | MongoDB with Mongoose, Pinecone vector database |
| AI | Google Gemini API |
| Authentication | JWT in HTTP-only cookies, bcrypt |

## Prerequisites

- Node.js 18 or newer
- MongoDB instance (local or Atlas)
- Google Gemini API key
- Pinecone API key and an existing `nuvixai` index compatible with the embedding dimension used by the application

## Environment variables

Create `Backend/.env` using placeholders like these:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/NuvixAI
JWT_SECRET=replace-with-a-long-random-secret
GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
FRONTEND_URL=http://localhost:5173
```

Create `Frontend/.env`:

```env
VITE_SERVER_API_BASE=http://localhost:3000
```

Never commit environment files or API keys. If a key has been shared publicly, revoke and replace it in the provider dashboard.

## Run locally

Install dependencies once for each app:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

Start the backend in one terminal:

```bash
cd Backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd Frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## API overview

All protected requests use the JWT HTTP-only cookie sent with `withCredentials: true`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and set the session cookie |
| POST | `/api/auth/login` | Sign in and set the session cookie |
| POST | `/api/auth/logout` | Clear the session cookie |
| GET | `/api/auth/me` | Get the current authenticated user |
| GET | `/api/chat` | Get the user’s chats, newest activity first |
| POST | `/api/chat/create` | Create a chat |
| GET | `/api/chat/:chatId/messages` | Get a chat’s message history |
| DELETE | `/api/chat/:chatId` | Delete a chat and its messages |

## Real-time AI flow

1. The frontend connects to Socket.IO using the authentication cookie.
2. It emits `ai-message` with a chat ID and user message.
3. The backend verifies ownership, stores the message, creates an embedding, and retrieves related Pinecone memory for that user.
4. Gemini receives the recent chat context plus retrieved memory.
5. The response is saved, embedded, and sent back as `ai-response`.

## Frontend checks

```bash
cd Frontend
npm run lint
npm run build
```
