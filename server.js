const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/security-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  salary: Number,
  postedBy: String,
});

const User = mongoose.model('User', UserSchema);
const Job = mongoose.model('Job', JobSchema);

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();
  res.status(201).json({ message: 'User registered' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
  res.json({ token });
});

app.post('/jobs', async (req, res) => {
  const { title, description, location, salary, postedBy } = req.body;
  const newJob = new Job({ title, description, location, salary, postedBy });
  await newJob.save();
  res.status(201).json({ message: 'Job posted', job: newJob });
});

app.get('/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

const PORT = process.env.PORT || 5000;
app.post('/jobs/:jobId/bids', async (req, res) => {
  try {
      const { amount } = req.body;
      const jobId = req.params.jobId;
      const job = await Job.findById(jobId);

      if (!job) {
          return res.status(404).json({ error: "Job not found" });
      }

      // Add the bid to the job
      if (!job.bids) {
          job.bids = [];
      }
      job.bids.push({ amount });
      await job.save();
      res.status(201).json({ message: "Bid placed successfully" });
  } catch (error) {
      res.status(500).json({ error: "Error placing bid" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Test Route
app.get("/", (req, res) => {
    res.send("Dagger Backend is running! 🚀");
});

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected...");
    } catch (error) {
        console.error("❌ Database Connection Error:", error);
        process.exit(1);
    }
};

connectDB();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

