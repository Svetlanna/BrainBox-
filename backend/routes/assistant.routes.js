const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");
const {
  findRelevantKnowledge,
  buildPrompt,
  buildFallbackPrompt,
  generateTitle,
  insertGeneratedKnowledge,
} = require("../services/assistant.service");
const { generateResponse } = require("../services/ollama.service");

router.use(requireAuth);

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "La question est requise" });
    }

    console.log("--- Nouvelle question :", question);

    const t0 = Date.now();
    const knowledgeItems = await findRelevantKnowledge(question);
    const t1 = Date.now();
    console.log(`[1] Recherche MongoDB : ${t1 - t0} ms — ${knowledgeItems.length} document(s) trouvé(s)`);

    if (knowledgeItems.length === 0) {
      return res.json({
        answer: "Je ne possède pas suffisamment d'informations pour répondre.",
        sources: [],
        canGenerate: true,
      });
    }

    const prompt = buildPrompt(question, knowledgeItems);
    const t2 = Date.now();
    console.log(`[2] Construction du prompt : ${t2 - t1} ms — longueur : ${prompt.length} caractères`);

    const answer = await generateResponse(prompt);
    const t3 = Date.now();
    console.log(`[3] Appel Ollama : ${t3 - t2} ms — longueur réponse : ${answer.length} caractères`);
    console.log(`--- Total : ${t3 - t0} ms`);

    res.json({
      answer,
      sources: knowledgeItems.map((item) => item.title),
      canGenerate: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la génération de la réponse" });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "La question est requise" });
    }

    const fallbackPrompt = buildFallbackPrompt(question);
    const answer = await generateResponse(fallbackPrompt);
    const suggestedTitle = await generateTitle(question);

    res.json({ answer, suggestedTitle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la génération de la réponse" });
  }
});

router.post("/save-generated", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ error: "Titre et contenu requis" });
    }

    const saved = await insertGeneratedKnowledge(title.trim(), content.trim());
    console.log("--- Connaissance enregistrée après modification utilisateur :", saved._id);

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement" });
  }
});

module.exports = router;