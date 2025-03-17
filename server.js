// server.js
const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config({ path: 'config.env' }); // load from config.env generated in the workflow

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies and serve static files
app.use(bodyParser.json());
app.use(express.static('public')); // serves files from the "public" folder

// Endpoint for processing chat messages
app.post('/api/chat', async (req, res) => {
  const { message, conversation } = req.body;
  try {
    // Call the ChatGPT API using conversation history for context
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: conversation
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const reply = response.data.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error generating response from ChatGPT.' });
  }
});

// Endpoint for summarizing the conversation and sending an email
app.post('/api/summary', async (req, res) => {
  const { conversation } = req.body;
  try {
    // Build a prompt to instruct ChatGPT to summarize the conversation
    const summaryPrompt = [
      { role: 'system', content: 'Summarize the following conversation in a concise manner.' },
      { role: 'user', content: conversation.map(m => `${m.role}: ${m.content}`).join('\n') }
    ];

    // Call the ChatGPT API for summary generation
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: summaryPrompt
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    const summary = response.data.choices[0].message.content.trim();

    // Set up Nodemailer to send the summary email
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, 
      port: process.env.EMAIL_PORT, 
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: 'Chat Summary',
      text: summary
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Summary sent via email.' });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error generating summary or sending email.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
