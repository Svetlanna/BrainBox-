const express = require("express");
const { ObjectId } = require("mongodb");
const { requireAuth, requireAdmin } = require("./middleware/auth.middleware");
const router = express.Router();

router.get("/", async (req, res) => {
  const items = await global.db.collection("knowledge").find().toArray();
  res.json(items);
});

router.get("/search", async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) {
    const items = await global.db.collection("knowledge").find().toArray();
    return res.json(items);
  }
  const regex = new RegExp(q, "i");
  const items = await global.db.collection("knowledge").find({
    $or: [{ title: regex }, { content: regex }, { category: regex }, { tags: regex }],
  }).toArray();
  res.json(items);
});

router.get("/:id", async (req, res) => {
  const item = await global.db.collection("knowledge").findOne({ _id: new ObjectId(req.params.id) });
  if (!item) return res.status(404).json({ error: "Document non trouvé" });
  res.json(item);
});

// Seuls les admins peuvent créer, modifier ou supprimer :
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const knowledge = {
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    tags: req.body.tags,
    createdAt: req.body.createdAt || new Date().toISOString(),
  };
  const result = await global.db.collection("knowledge").insertOne(knowledge);
  res.status(201).json({ _id: result.insertedId, ...knowledge });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const updates = { title: req.body.title, content: req.body.content, category: req.body.category, tags: req.body.tags };
  const result = await global.db.collection("knowledge").findOneAndUpdate(
    { _id: new ObjectId(req.params.id) }, { $set: updates }, { returnDocument: "after" }
  );
  if (!result) return res.status(404).json({ error: "Document non trouvé" });
  res.json(result);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const result = await global.db.collection("knowledge").deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Document non trouvé" });
  res.json({ message: "Knowledge deleted" });
});

module.exports = router;