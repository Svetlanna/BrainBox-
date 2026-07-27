const { generateResponse } = require("./ollama.service");

const STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "est",
  "pour", "comment", "que", "qui", "quoi", "dans", "sur", "avec", "je",
  "tu", "il", "elle", "a", "au", "aux", "ce", "ces", "son", "sa", "ses",
  "mon", "ma", "mes", "faire", "cela", "ca",
]);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

// Racine approximative d'un mot : le français fléchit beaucoup
// (créer / création / créé / créons...), donc on compare des préfixes
// plutôt que les mots exacts. Ça évite de rater un document existant
// juste parce que la question utilise une autre forme du même mot.
function stemWord(word) {
  if (word.length <= 4) return word;
  if (word.length <= 7) return word.slice(0, 4);
  return word.slice(0, 5);
}

function tokenize(text) {
  return normalize(text)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function extractKeywords(question) {
  return tokenize(question);
}

async function findRelevantKnowledge(question) {
  if (!global.db) {
    throw new Error("Base de données non initialisée (global.db est indéfini)");
  }

  const keywords = extractKeywords(question);
  const keywordStems = keywords.map(stemWord);
  console.log("--- Mots-clés extraits :", keywords);

  if (keywords.length === 0) return [];

  const allDocuments = await global.db.collection("knowledge").find({}).toArray();
  console.log(`--- ${allDocuments.length} document(s) au total dans la collection`);

  const scored = allDocuments.map((doc) => {
    const titleStems = new Set(
      [...tokenize(doc.title || ""), ...tokenize((doc.tags || []).join(" "))].map(stemWord)
    );
    const bodyStems = new Set(
      [...tokenize(doc.content || ""), ...tokenize(doc.category || "")].map(stemWord)
    );

    // Un mot-clé qui matche le titre/les tags compte double : c'est un
    // signal plus fort qu'un mot perdu dans le contenu.
    let score = 0;
    let matchedKeywords = 0;
    keywordStems.forEach((stem) => {
      if (titleStems.has(stem)) {
        score += 2;
        matchedKeywords += 1;
      } else if (bodyStems.has(stem)) {
        score += 1;
        matchedKeywords += 1;
      }
    });

    return { doc, score, matchedKeywords };
  });

  scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .forEach((item) => {
      console.log(`    score ${item.score} — "${item.doc.title}"`);
    });

  // Un seul mot-clé en commun sur une question qui en contient plusieurs
  // est souvent du bruit (faux positif) : on exige qu'une part minimale
  // des mots-clés de la question soit retrouvée dans le document.
  const minMatches = keywords.length <= 2 ? 1 : Math.ceil(keywords.length * 0.34);

  return scored
    .filter((item) => item.matchedKeywords >= minMatches)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.doc);
}

const NO_INFO_ANSWER = "Je ne possède pas suffisamment d'informations pour répondre.";

// Le modèle est petit (qwen2.5:0.5b) et ne reproduit pas toujours la phrase
// exacte demandée dans le prompt : on détecte donc aussi les formulations
// proches ("je n'ai pas assez d'informations", "je ne sais pas", etc.)
// pour être sûr de proposer le bouton de génération à l'utilisateur.
function looksLikeNoInfoAnswer(answer) {
  if (!answer) return true;

  const normalized = normalize(answer);

  if (normalized.includes(normalize(NO_INFO_ANSWER))) return true;

  const noInfoPatterns = [
    /ne poss[ea]de pas.{0,30}information/,
    /n existe pas dans ces? connaissance/,
    /pas assez d information/,
    /ne sais pas/,
    /je ne peux pas repondre/,
    /aucune information/,
  ];

  return noInfoPatterns.some((pattern) => pattern.test(normalized));
}

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

function buildFallbackPrompt(question) {
  return `Réponds de façon claire et concise à la question suivante :

Question :
${question}

Réponse :`;
}

async function generateTitle(question) {
  const prompt = `Reformule la question suivante en un titre court (5 à 8 mots), clair et neutre, sans point d'interrogation, à la manière d'un titre de fiche technique.
Réponds UNIQUEMENT avec le titre, sans aucune phrase d'introduction ni guillemets.

Question :
${question}

Titre :`;

  const rawTitle = await generateResponse(prompt);

  return rawTitle
    .trim()
    .split("\n")[0]
    .replace(/^["'«]|["'»]$/g, "")
    .replace(/[?？]+$/, "")
    .trim();
}

async function insertGeneratedKnowledge(title, content) {
  const newKnowledge = {
    title,
    content,
    category: "Généré automatiquement",
    tags: ["auto-généré"],
    createdAt: new Date().toISOString(),
  };

  const result = await global.db.collection("knowledge").insertOne(newKnowledge);
  return { _id: result.insertedId, ...newKnowledge };
}

module.exports = {
  extractKeywords,
  findRelevantKnowledge,
  buildPrompt,
  buildFallbackPrompt,
  generateTitle,
  insertGeneratedKnowledge,
  NO_INFO_ANSWER,
  looksLikeNoInfoAnswer,
};