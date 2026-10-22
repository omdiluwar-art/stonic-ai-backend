const express = require("express");
const https = require("https");

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

app.post("/", (req, res) => {
  const userPrompt = req.body.prompt;
  if (!userPrompt) {
    return res.status(400).send("Prompt is required");
  }

  const dataString = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userPrompt }]
  });

  const options = {
    hostname: "api.openai.com",
    path: "/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Length": Buffer.byteLength(dataString)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let responseBody = "";
    apiRes.on("data", (chunk) => {
      responseBody += chunk;
    });

    apiRes.on("end", () => {
      try {
        const parsed = JSON.parse(responseBody);
        if (parsed.choices && parsed.choices.length > 0) {
          const reply = parsed.choices[0].message.content;
          res.send(reply);
        } else if (parsed.error) {
          res.status(500).send("OpenAI Error: " + parsed.error.message);
        } else {
          res.status(500).send("Unknown response: " + responseBody);
        }
      } catch (e) {
        res.status(500).send("Parse Error: " + e.message);
      }
    });
  });

  apiReq.on("error", (error) => {
    res.status(500).send("Request Error: " + error.message);
  });

  apiReq.write(dataString);
  apiReq.end();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Stonic AI server listening on port ${PORT}`);
});
