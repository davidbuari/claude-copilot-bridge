import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/claude", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    if (!userInput) return res.status(400).json({ error: "No input provided" });

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

    if (!response.ok) {
      const text = await response.text();
      console.error("Claude API error:", text);
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    console.log("Full Claude response:", data);

    const replyText = data?.content?.[0]?.text || data?.completion || "No reply from Claude";
    res.json({ reply: replyText });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
