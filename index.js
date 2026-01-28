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

    // Handle non-200 responses
    if (!response.ok) {
      const text = await response.text();
      console.error("Claude API error:", text);
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    console.log("Full Claude response:", data);

    // SAFE ACCESS: never crash
    let replyText = "No reply from Claude.";
    if (Array.isArray(data?.content) && data.content.length > 0 && data.content[0]?.text) {
      replyText = data.content[0].text;
    } else if (data?.completion) {
      replyText = data.completion;
    }

    console.log("Claude reply:", replyText);
    res.json({ reply: replyText });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
