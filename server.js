// modules
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// environment variables
const secretKey = process.env.TURNSTILE_SECRET;
const port = process.env.PORT || 3000;

// cors headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

// health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// process turnstile verification
app.post("/", async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }
  
  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    
    const { success } = response.data;
    
    if (success) {
      res.status(200).json({
        success: true,
        message: "Turnstile verification successful",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Turnstile verification failed",
      });
    }
  } catch (error) {
    console.error("Error verifying Turnstile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// listen for connection
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
