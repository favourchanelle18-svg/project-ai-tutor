import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

app.post("/ask-ai", async (req, res) => {
  try {
    const {question, lesson} = req.body;
    const prompt = `You are a K-12 tutor. Explain lesson "${lesson.title}" and answer: ${question}`;
    const response = await openai.chat.completions.create({
      model:"gpt-4",
      messages:[
        {role:"system", content:"You are a helpful K-12 tutor."},
        {role:"user", content:prompt}
      ]
    });
    res.json({answer: response.choices[0].message.content});
  } catch(err) {
    res.status(500).json({answer:"AI unavailable"});
  }
});

app.listen(5000, ()=>console.log("Server running on port 5000"));
