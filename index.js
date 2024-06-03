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
if (!uri || !process.env.JWT_SECRET || !process.env.EXPIRES_IN) {
  throw new Error("Missing required environment variables");
}
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
      try {
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      try {
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
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Portfolio skills collection
    const allskill = db.collection("skills");

    // Create skills data
    app.post("/api/v1/skills", async (req, res) => {
      try {
        const Supply = req.body;
        const result = await allskill.insertOne(Supply);
        res.send(result);
        console.log(result, "project created successfully");
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Get all skills
    app.get("/api/v1/skills", async (req, res) => {
      try {
        let query = {};
        if (req.query.priority) {
          query.priority = req.query.priority;
        }
        const cursor = allskill.find(query);
        const supply = await cursor.toArray();
        res.send({ status: true, data: supply });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Delete skill
    app.delete("/api/v1/skills/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await allskill.deleteOne({
          _id: new ObjectId(id),
        });
        console.log(result);
        res.send(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Portfolio project collection
    const Projects = db.collection("allProject");

    // Create project data
    app.post("/api/v1/projects", async (req, res) => {
      try {
        const Supply = req.body;
        const result = await Projects.insertOne(Supply);
        res.send(result);
        console.log(result, "project created successfully");
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Get all projects
    app.get("/api/v1/projects", async (req, res) => {
      try {
        let query = {};
        if (req.query.priority) {
          query.priority = req.query.priority;
        }
        const cursor = Projects.find(query);
        const supply = await cursor.toArray();
        res.send({ status: true, data: supply });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Delete project
    app.delete("/api/v1/projects/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await Projects.deleteOne({
          _id: new ObjectId(id),
        });
        console.log(result);
        res.send(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Portfolio blog post collection
    const AllBlogPost = db.collection("allBlogData");

    // Create blog post
    app.post("/api/v1/blogs", async (req, res) => {
      try {
        const Supply = req.body;
        const result = await AllBlogPost.insertOne(Supply);
        res.send(result);
        console.log(result, "blog post created successfully");
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Get all blog posts
    app.get("/api/v1/blogs", async (req, res) => {
      try {
        let query = {};
        if (req.query.priority) {
          query.priority = req.query.priority;
        }
        const cursor = AllBlogPost.find(query);
        const supply = await cursor.toArray();
        res.send({ status: true, data: supply });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Get single blog post
    app.get("/api/v1/blogs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await AllBlogPost.findOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Edit blog post
    app.put("/api/v1/blogs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const supply = req.body;
        const filter = { _id: new ObjectId(id) 
