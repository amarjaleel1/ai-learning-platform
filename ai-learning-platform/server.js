/**
 * AI Learning Platform Server
 * Simple Express server to serve the learning platform
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS for all routes
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"]
        }
    }
})); // Set security headers

// Serve static files
app.use(express.static(__dirname));

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`AI Learning Platform running on http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
});
