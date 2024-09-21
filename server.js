const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const MongoClient = require('mongodb').MongoClient; // MongoDB native driver

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' folder

// Log the MongoDB URI to verify it's loaded correctly
console.log('MongoDB URI:', process.env.MONGO_URI);

// Connect to MongoDB using Mongoose without deprecated options
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB with Mongoose'))
  .catch(err => {
    console.error('Error connecting to MongoDB with Mongoose:', err.message);
    process.exit(1);
  });

// Define Mongoose Schema and Model
const submissionSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Submission = mongoose.model('Submission', submissionSchema);

// Handle form submissions with validation
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

// Connect to MongoDB using the native driver
MongoClient.connect(process.env.MONGO_URI, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB with native driver:', err);
    return;
  }
  console.log('Connected to MongoDB with native driver');
  const db = client.db("test"); // Replace "test" with your database name if needed
  const collection = db.collection("devices"); // Replace "devices" with your collection name if needed

  // Perform actions on the collection object, e.g., find, insert, update
  // Example: Fetching all documents from the "devices" collection
  collection.find({}).toArray((err, items) => {
    if (err) {
      console.error('Error fetching documents from collection:', err);
    } else {
      console.log('Fetched documents from collection:', items);
    }
    client.close(); // Close the connection after performing actions
  });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


