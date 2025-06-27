This is the backend server for the URL Shortener application, built using Node.js and Express.js.

🚀 Features
Create short URLs with optional custom shortcode and expiry time

Redirect to the original URL using the shortcode
![App Preview](./screenshot.png)


Track and return analytics (click count, timestamps, referrers)

Console and external logging support

📁 Folder Structure
bash
Copy
Edit
Backend/
├── server.js                  # Main Express server
├── loggingmiddleware/
│   └── logger.js              # Logging logic (handles external logging API)
├── package.json               # Project config
└── ...                        # Other middleware/files
🔧 Installation & Usage
1. Install dependencies
bash
Copy
Edit
npm install
2. Start the server
bash
Copy
Edit
npm start
By default, the server will run on:
http://localhost:5000

📡 API Endpoints
POST /shorturls
Create a new short URL.

Body:

json
Copy
Edit
{
  "url": "https://example.com",
  "validity": 30,
  "shortcode": "customCode" // optional
}
