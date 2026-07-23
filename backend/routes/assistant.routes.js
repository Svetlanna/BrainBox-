const express = require("express");
const router = express.Router();
const { findRelevantKnowledge, buildPrompt } = require("../services/assistant.service");
const { generateResponse } = require("../services/ollama.service");

// POST /assistant  { "question": "..." }
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
      });
    }

const prompt = buildPrompt(question, knowledgeItems);
const t2 = Date.now();
console.log(`[2] Construction du prompt : ${t2 - t1} ms — longueur : ${prompt.length} caractères`);
console.log("--- PROMPT ENVOYÉ À OLLAMA ---\n" + prompt + "\n--- FIN DU PROMPT ---");
    console.log(`[2] Construction du prompt : ${t2 - t1} ms — longueur : ${prompt.length} caractères`);

    const answer = await generateResponse(prompt);
    const t3 = Date.now();
    console.log(`[3] Appel Ollama : ${t3 - t2} ms — longueur réponse : ${answer.length} caractères`);

    console.log(`--- Total : ${t3 - t0} ms`);

    res.json({
      answer,
      sources: knowledgeItems.map((item) => item.title),
    });
  } catch (err) {
    console.error("Erreur dans assistant.routes.js :", err);
    res.status(500).json({ error: "Erreur lors de la génération de la réponse" });
  }
});

module.exports = router;