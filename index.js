import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/claude", async (req, res) => {
  const userInput = req.body.userInput;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      messages: [{ role: "user", content: userInput }]
    })
  });

  const data = await response.json();
  res.json({ reply: data.content[0].text });
});

app.listen(process.env.PORT || 3000);
