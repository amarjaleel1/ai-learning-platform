const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all routes (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`AI Learning Platform running at http://localhost:${port}`);
  console.log('Press Ctrl+C to quit');
});
