const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
// We increase JSON limits to support up to 50MB PDFs Base64 strings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB. Railway automatically injects process.env.MONGO_URL when you add the DB
const mongooseUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/nixuvik';
mongoose.connect(mongooseUrl)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const BookSchema = new mongoose.Schema({
  id: String,
  title: String,
  size: Number,
  type: String,
  cover: String, // PDF Thumbnail in Base64
  data: String,  // Entire file encoded in Base64
  uploadDate: String
});
const Book = mongoose.model('Book', BookSchema);

// GET /api/books (Fetches the grid list WITHOUT downloading the massive 50MB files)
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find({}, '-data'); // Exclude the file data
    res.json(books);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/books (Uploads the book)
app.post('/api/books', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/books/:id (Downloads a specific file to view)
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ id: req.params.id });
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json(book);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/books/:id
app.delete('/api/books/:id', async (req, res) => {
  try {
    await Book.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/', (req, res) => {
  res.send('NIXUVIK API is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
