require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// In-memory storage for URLs
let urlDb = [];
let idCounter = 1;

// POST route to shorten URL
app.post('/api/shorturl', function(req,res) {
  const originalUrl = req.body.url
  
   // Validate the URL format
   const urlRegex = /^https?:\/\/(www\.)?([\w\-\.]+)(\/.*)?$/;

   const match = originalUrl.match(urlRegex);
   if (!match) {
     return res.json({ error: 'invalid url' });
   }

   // Extract the hostname for DNS validation
  const hostname = match[2];

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Save the URL in the database
    const shortUrl = idCounter++;
    urlDb.push({ originalUrl, shortUrl });

  res.json({ original_url : originalUrl, short_url: shortUrl})
  })
})

// GET route to redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);

  const record = urlDb.find((entry) => entry.shortUrl === shortUrl);
  if (!record) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(record.originalUrl);
})
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
