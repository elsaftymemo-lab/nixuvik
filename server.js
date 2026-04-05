const express = require('express');
const path = require('path');
const app = express();

// Increase JSON payload limit to handle large PDF base64 strings if needed
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. Serve static files (like index.html, CSS, JS, images) from the current directory.
// This is the CRITICAL line that makes your app load as a normal website on your domain!
app.use(express.static(__dirname));

// 2. Simple in-memory database fallback (for demonstration until MongoDB is connected)
let booksDatabase = [];

// API: Get all books
app.get('/api/books', (req, res) => {
  res.json(booksDatabase);
});

// API: Upload a book
app.post('/api/books', (req, res) => {
  const book = req.body;
  if (!book.id) book.id = Date.now().toString();
  booksDatabase.push(book);
  res.status(201).json({ success: true, book });
});

// API: Delete a book
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  booksDatabase = booksDatabase.filter(b => b.id !== id);
  res.json({ success: true });
});

// 3. Catch-all: Send the index.html for any other URL (useful for Single Page Applications)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server (Railway automatically provides the PORT environment variable)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running! Your site is now live at the root domain on port ${PORT}`);
});
