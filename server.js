// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' folder

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define Mongoose Schema and Model
const submissionSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Submission = mongoose.model('Submission', submissionSchema);

// Handle form submissions
app.post('/submit', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newSubmission = new Submission({ name, email, message });
    await newSubmission.save();

    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Error submitting the form. Please try again.' });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
