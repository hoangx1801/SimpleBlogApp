const express = require("express");
const router = express.Router();
const Post = require("../models/Post.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";

const jwtSecret = process.env.JWT_SECRET;

// Check login
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized " });
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized " });
  }
};

// Admin
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJS, Express and MongoDB",
    };

    res.render("admin/index", {
      locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.log(error);
  }
});

// Login
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User created", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
  }
});

// Dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with NodeJS, Express and MongoDB",
    };

    const data = await Post.find();
    res.render("admin/dashboard", { data, locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// Create new post
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add post",
      description: "Simple Blog created with NodeJS, Express and MongoDB",
    };

    const data = await Post.find();
    res.render("admin/add-post", { data, locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// Add new post
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;
    try {
      const newPost = await Post.create({
        title,
        body,
      });

      res.redirect("/dashboard");
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {
    console.log(error);
  }
});

// Edit post
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit post",
      description: "Simple Blog created with NodeJS, Express and MongoDB",
    };
    const id = req.params.id;
    try {
      const data = await Post.findOne({ _id: id });

      res.render("admin/edit-post", { data, locals, layout: adminLayout });
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {
    console.log(error);
  }
});

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    try {
      const updatedPost = await Post.findByIdAndUpdate(id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
      });

      res.redirect(`/edit-post/${id}`);
    } catch (error) {
      console.log(error.message);
    }
  } catch (error) {
    console.log(error);
  }
});

// Delete post
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error.message);
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
