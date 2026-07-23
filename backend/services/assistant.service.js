// ignorer lors de la recherche de mots-clés
const STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "est",
  "pour", "comment", "que", "qui", "quoi", "dans", "sur", "avec", "je",
  "tu", "il", "elle", "a", "au", "aux", "ce", "ces", "son", "sa", "ses",
  "mon", "ma", "mes", "faire", "cela", "ca",
]);

// met un texte en minuscules et enlève les accents, pour comparer proprement
function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

// Extrait les mots-clés utiles d'une question
function extractKeywords(question) {
  return normalize(question)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/**cherche les connaissances
 */
async function findRelevantKnowledge(question) {
  if (!global.db) {
    throw new Error("Base de données non initialisée (global.db est indéfini)");
  }

  const keywords = extractKeywords(question);
  if (keywords.length === 0) return [];

  const allDocuments = await global.db.collection("knowledge").find({}).toArray();

  const scored = allDocuments.map((doc) => {
    const searchableText = normalize(
      [doc.title, doc.content, doc.category, ...(doc.tags || [])].join(" ")
    );

    const score = keywords.filter((kw) => searchableText.includes(kw)).length;

    return { doc, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.doc);
}

/**
 * le prompt final : le modèle ne doit répondre qu'avec les
 */
function buildPrompt(question, knowledgeItems) {
  const knowledgeText = knowledgeItems.length
    ? knowledgeItems
        .map((item) => `Titre : ${item.title}\nContenu : ${item.content}`)
        .join("\n\n---\n\n")
    : "Aucune connaissance trouvée.";

  return `Tu es BrainBox.
Tu réponds UNIQUEMENT avec les connaissances ci-dessous, sans utiliser tes connaissances générales.
Si la réponse n'existe pas dans ces connaissances, réponds EXACTEMENT :
"Je ne possède pas suffisamment d'informations pour répondre."

Connaissances :

${knowledgeText}

Question :
${question}

Réponse :`;
}

module.exports = { extractKeywords, findRelevantKnowledge, buildPrompt };