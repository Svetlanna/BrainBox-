const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();



// GET /knowledge — liste tous les documents
router.get("/", async (req, res) => {
  try {
    const items = await global.db.collection("knowledge").find().toArray();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /knowledge/:id
router.get("/:id", async (req, res) => {
  try {
    const item = await global.db
      .collection("knowledge")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!item) {
      return res.status(404).json({ error: "Document non trouvé" });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "ID invalide" });
  }
});

// POST /knowledge
router.post("/", async (req, res) => {
  try {
    const knowledge = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: req.body.tags,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    const result = await global.db.collection("knowledge").insertOne(knowledge);
    res.status(201).json({ _id: result.insertedId, ...knowledge });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /knowledge/:id
router.put("/:id", async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      tags: req.body.tags,
    };

    const result = await global.db
      .collection("knowledge")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) {
      return res.status(404).json({ error: "Document non trouvé" });
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "ID invalide" });
  }
});

// DELETE /knowledge/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await global.db
      .collection("knowledge")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Document non trouvé" });
    }
    res.json({ message: "Knowledge deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "ID invalide" });
  }
});

module.exports = router;