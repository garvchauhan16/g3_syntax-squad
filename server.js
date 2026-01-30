const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

app.get('/', (req, res) => res.json({ ok: true, info: 'Eco Assistant Proxy' }));

app.post('/api/chat', async (req, res) => {
  if(!OPENAI_KEY) return res.status(500).json({ error: true, message: 'OPENAI_API_KEY not set on server.' });
  const { messages } = req.body;
  if(!messages || !Array.isArray(messages)) return res.status(400).json({ error: true, message: 'Invalid messages array.' });

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({ model: MODEL, messages })
    });

    const data = await resp.json();
    if(!resp.ok) return res.status(500).json({ error: true, message: 'OpenAI API error', detail: data });
    return res.json(data);
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).json({ error: true, message: 'Proxy server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Eco assistant proxy listening on ${PORT}`));