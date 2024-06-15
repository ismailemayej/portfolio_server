const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("portfolio");
    const collection = db.collection("users");
    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });
      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;
      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });
      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    //==================================Portfolio skills===============================
    const allskill = db.collection("skills");
    // crate skills data
    app.post("/api/v1/skills", async (req, res) => {
      const Supply = req.body;
      const result = await allskill.insertOne(Supply);
      res.send(result);
      console.log(result, " project create  successfully");
    });
    // Get all skills
    app.get("/api/v1/skills", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const cursor = allskill.find(query);
      const supply = await cursor.toArray();
      res.send({ status: true, data: supply });
    });
    // skills update
    app.put("/api/v1/skills/:id", async (req, res) => {
      const id = req.params.id;
      const supply = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          id: supply.id,
          skilllogo: supply.skilllogo,
          skillname: supply.skillname,
          skillpercentage: supply.skillpercentage,
        },
      };
      const options = { upsert: true };
      const result = await allskill.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // Delete Project
    app.delete("/api/v1/skills/:id", async (req, res) => {
      const id = req.params.id;
      const result = await allskill.deleteOne({
        _id: new ObjectId(id),
      });
      console.log(result);
      res.send(result);
    });

    //==================================Portfolio Project===============================
    const Projects = db.collection("allProject");
    // crate project data
    app.post("/api/v1/projects", async (req, res) => {
      const Supply = req.body;
      const result = await Projects.insertOne(Supply);
      res.send(result);
      console.log(result, " project create  successfully");
    });
    // Get all project
    app.get("/api/v1/projects", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const cursor = Projects.find(query);
      const supply = await cursor.toArray();
      res.send({ status: true, data: supply });
    });
    // project update
    app.put("/api/v1/projects/:id", async (req, res) => {
      const id = req.params.id;
      const supply = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          id: supply.id,
          image: supply.image,
          livelink: supply.livelink,
          githublink: supply.githublink,
        },
      };
      const options = { upsert: true };
      const result = await Projects.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // Delete projects
    app.delete("/api/v1/projects/:id", async (req, res) => {
      const id = req.params.id;
      const result = await Projects.deleteOne({
        _id: new ObjectId(id),
      });
      console.log(result);
      res.send(result);
    });
    // ==============================Portfolio Blog Post================================
    const AllBlogPost = db.collection("allBlogData");
    // crate data
    app.post("/api/v1/blogs", async (req, res) => {
      const Supply = req.body;
      const result = await AllBlogPost.insertOne(Supply);
      res.send(result);
      console.log(result, "blog post  successfully");
    });

    //  Get All Supply Post
    app.get("/api/v1/blogs", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const cursor = AllBlogPost.find(query);
      const supply = await cursor.toArray();
      res.send({ status: true, data: supply });
    });
    // get single data
    app.get("/api/v1/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const result = await AllBlogPost.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    // Edit Supply data
    app.put("/api/v1/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const supply = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          id: supply.id,
          title: supply.title,
          image: supply.image,
          category: supply.category,
          blogs: supply.blogs,
        },
      };
      const options = { upsert: true };
      const result = await AllBlogPost.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    //  Delete Supply data
    app.delete("/api/v1/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const result = await AllBlogPost.deleteOne({
        _id: new ObjectId(id),
      });
      console.log(result);
      res.send(result);
    });
    //  Get Resume
    const Resume = db.collection("resume");
    app.get("/api/v1/resume", async (req, res) => {
      let query = {};
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      const cursor = Resume.find(query);
      const supply = await cursor.toArray();
      res.send({ status: true, data: supply });
    });

    // ==============================================================

    // Start the server
    app.listen(port, () => {
      console.log(`portfolio Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Portfolio server is Running",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
