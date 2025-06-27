import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Paper,
} from "@mui/material";
import { Log } from "./logger"; // ✅ Make sure logger.js is inside src/

// Reusable logEvent wrapper for frontend
const logEvent = async (stack, level, pkg, message) => {
  const time = new Date().toLocaleTimeString();
  const entry = `[${time}] ${level.toUpperCase()} - ${pkg}: ${message}`;
  const logArea = document.getElementById("log-area");

  if (logArea) {
    logArea.value += entry + "\n";
  }

  // Send to remote logging server
  await Log(stack, level, pkg, message);
};

function App() {
  const [inputs, setInputs] = useState([{ url: "", validity: "", shortcode: "" }]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (!window.logMessages) window.logMessages = [];
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...inputs];
    updated[index][field] = value;
    setInputs(updated);
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { url: "", validity: "", shortcode: "" }]);
    } else {
      logEvent("frontend", "warn", "App", "Maximum of 5 URLs allowed.");
    }
  };

  const handleSubmit = async () => {
    const newResponses = [];

    for (const input of inputs) {
      const { url, validity, shortcode } = input;

      if (!url || !isValidURL(url)) {
        await logEvent("frontend", "error", "App", `Invalid URL: ${url}`);
        continue;
      }

      if (validity && (!Number.isInteger(Number(validity)) || Number(validity) <= 0)) {
        await logEvent("frontend", "error", "App", `Invalid validity: ${validity}`);
        continue;
      }

      try {
        const res = await fetch("http://localhost:5000/shorturls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            validity: validity ? parseInt(validity) : undefined,
            shortcode: shortcode || undefined,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          newResponses.push(data);
          await logEvent("frontend", "info", "App", `Shortened URL: ${data.shortLink}`);
        } else {
          await logEvent("frontend", "error", "App", `Server Error: ${data.error}`);
        }
      } catch (err) {
        await logEvent("frontend", "error", "App", `Network Error: ${err.message}`);
      }
    }

    setResponses(newResponses);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom align="center">
          URL Shortener
        </Typography>

        {inputs.map((input, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Original URL"
                fullWidth
                value={input.url}
                onChange={(e) => handleChange(index, "url", e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Validity (minutes)"
                type="number"
                fullWidth
                value={input.validity}
                onChange={(e) => handleChange(index, "validity", e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                label="Preferred Shortcode"
                fullWidth
                value={input.shortcode}
                onChange={(e) => handleChange(index, "shortcode", e.target.value)}
              />
            </Grid>
          </Grid>
        ))}

        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <Button variant="outlined" onClick={handleAdd}>
            + Add URL
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Shorten URLs
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Shortened URLs:
        </Typography>
        {responses.length === 0 ? (
          <Typography>No shortened URLs yet.</Typography>
        ) : (
          responses.map((res, i) => (
            <Box key={i} mb={1}>
              🔗{" "}
              <a href={res.shortLink} target="_blank" rel="noreferrer">
                {res.shortLink}
              </a>
              <br />
              <small>Expires at: {res.expiry}</small>
            </Box>
          ))
        )}

        <Typography variant="h6" sx={{ mt: 4 }}>
          Logs:
        </Typography>
        <TextField
          id="log-area"
          multiline
          rows={8}
          fullWidth
          InputProps={{ readOnly: true }}
          sx={{ fontFamily: "monospace", backgroundColor: "#f5f5f5", mt: 1 }}
          value={window.logMessages ? window.logMessages.join('\n') : ''}
        />
      </Paper>
    </Container>
  );
}

export default App;
