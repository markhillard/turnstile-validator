const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const secretKey = process.env.TURNSTILE_SECRET;

app.post('/', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const { success } = response.data;

    if (success) {
      res.status(200).json({ success: true, message: 'Turnstile verification successful' });
    } else {
      res.status(400).json({ success: false, message: 'Turnstile verification failed' });
    }
  } catch (error) {
    console.error('Error verifying Turnstile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
