const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "Stonic AI",
    status: "online",
    message: "Stonic AI backend is running"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
      return res.status(400).send("Prompt is required");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const reply = data.choices[0].message.content;
      res.send(reply);
    } else {
      res.status(500).send("Error from OpenAI");
    }
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Stonic AI server listening on port ${PORT}`);
});
