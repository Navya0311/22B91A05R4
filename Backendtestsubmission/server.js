import express from 'express';
import cors from 'cors';
import { Log } from '../loggingmiddleware/logger.js'; // ✅ Correct path

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

const urls = {};
const clicks = {};

app.use((req, res, next) => {
  Log("backend", "info", "middleware", `${req.method} ${req.url}`);
  next();
});

function makeShortcode() {
  return Math.random().toString(36).substring(2, 8);
}

app.post('/shorturls', (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url) {
    Log("backend", "error", "shorturls", "URL is required but missing");
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    new URL(url);
  } catch {
    Log("backend", "error", "shorturls", "Invalid URL format");
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  if (shortcode && urls[shortcode]) {
    Log("backend", "error", "shorturls", `Shortcode conflict: ${shortcode}`);
    return res.status(409).json({ error: 'Shortcode already in use' });
  }

  let code = shortcode;
  if (!code || urls[code]) {
    code = makeShortcode();
    while (urls[code]) code = makeShortcode();
  }

  const expiry = new Date(Date.now() + validity * 60000);

  urls[code] = {
    url,
    expiry: expiry.toISOString(),
    created: new Date().toISOString()
  };
  clicks[code] = [];

  Log("backend", "info", "shorturls", `Shortened URL created: ${code}`);
  res.status(201).json({
    shortLink: `http://localhost:5000/${code}`,
    expiry: expiry.toISOString()
  });
});

app.get('/:code', (req, res) => {
  const code = req.params.code;
  const data = urls[code];

  if (!data) {
    Log("backend", "error", "redirect", `Shortcode ${code} not found`);
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  if (new Date() > new Date(data.expiry)) {
    Log("backend", "error", "redirect", `Shortcode ${code} has expired`);
    return res.status(410).json({ error: 'Shortlink has expired' });
  }

  clicks[code].push({
    time: new Date().toISOString(),
    referrer: req.get('Referer') || 'Direct'
  });

  Log("backend", "info", "redirect", `Redirected to ${data.url}`);
  res.redirect(data.url);
});

app.get('/shorturls/:code', (req, res) => {
  const code = req.params.code;
  const data = urls[code];

  if (!data) {
    Log("backend", "error", "analytics", `Analytics request failed. Code not found: ${code}`);
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  Log("backend", "info", "analytics", `Returned analytics for code ${code}`);
  res.json({
    originalUrl: data.url,
    createdAt: data.created,
    expiryDate: data.expiry,
    totalClicks: clicks[code].length,
    clickDetails: clicks[code]
  });
});

app.listen(5000, () => {
  Log("backend", "info", "server", "Server started at http://localhost:5000");
});
