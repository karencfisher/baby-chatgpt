import { ChatOpenAI } from "@langchain/openai";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { configDotenv } from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
 

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Recreate __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();
const chat = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.8
})

const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a friendly and helpful assistant. Answer all questions to the best of your ability.",
    ],
    new MessagesPlaceholder("chat_history"),
    ["human", "{input}"],
]);

const chain = prompt.pipe(chat);
const demoEphemeralChatMessageHistoryForChain = new ChatMessageHistory();
const chainWithMessageHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: (_sessionId) => demoEphemeralChatMessageHistoryForChain,
  inputMessagesKey: "input",
  historyMessagesKey: "chat_history",
});

const promptFunc = async (prompt) => {
  try {
    const res = await chainWithMessageHistory.invoke(
      {
        input: prompt
      },
      { configurable: { sessionId: "unused" } }
    );
    return res;
  }
  catch (err) {
    console.error(err);
    throw(err);
  }
};

// Endpoint to handle request
app.post('/ask', async (req, res) => {
  try {
    const userQuestion = req.body.question;

    if (!userQuestion) {
      return res.status(400).json({ error: 'Please provide a question in the request body.' });
    }

    const result = await promptFunc(userQuestion);
    res.json({ result });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/set-model', (req, res) => {
  // hope OpenAI doesn't break my hack
  chat.lc_kwargs.model = req.query.model;
  chat.model = req.query.model;
  chat.modelName = req.query.model;
  console.log(`Model is now ${req.query.model}`);

  // Send a response to the client
  res.status(200).send(`Model is now ${req.query.model}`);
});

app.use(express.static(path.join(__dirname, 'html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'login.html'));
})

app.post('/login', (req, res) => {
  if (process.env.USER_TOKEN === req.body.userToken) {
    res.redirect('/chat');
  }
  else {
    res.status(403).send("Forbidden");
  }
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'chatbot.html'));
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
