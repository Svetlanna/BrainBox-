const express = require("express");
const router = express.Router();

// GET /knowledge
router.get("/", (req, res) => {
  res.json({
    title: "Installer Docker",
    content: "docker compose up",
    category: "Docker",
    tags: ["docker", "compose"],
    createdAt: "2026-07-22",
  });
});

// GET /knowledge/:id
router.get("/:id", (req, res) => {
  res.json({
    title: "Installer Docker",
    content: "docker compose up",
    category: "Docker",
    tags: ["docker", "compose"],
    createdAt: "2026-07-22",
  });
});

// POST /knowledge
router.post("/", (req, res) => {
  const knowledge = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags,
    createdAt: req.body.createdAt,
  };

  res.status(201).json(knowledge);
});

// POST /knowledge
router.post("/assistant", (req, res) => {
  const knowledge = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags,
    createdAt: req.body.createdAt,
  };

  res.status(201).json(knowledge);
});


// PUT /knowledge/:id
router.put("/:id", (req, res) => {
  const knowledge = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags,
    createdAt: req.body.createdAt,
  };

  res.json(knowledge);
});

// DELETE /knowledge/:id
router.delete("/:id", (req, res) => {
  res.json({
    message: "Knowledge deleted",
  });
});

module.exports = router;