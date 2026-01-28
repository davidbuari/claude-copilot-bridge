import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/claude", async (req, res) => {
  try {
    const userInput = req.body.userInput;
    if (!userInput) {
      return res.status(400).json({ error: "No input provided" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 800,
        messages: [
          { role: "user", content: userInput }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", errorText);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    console.log("Full Claude response:", JSON.stringify(data, null, 2));

    let reply = "No reply from Claude";

    if (Array.isArray(data.content)) {
      reply = data.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("\n");
    }

    res.json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
