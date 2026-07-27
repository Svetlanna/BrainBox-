# BrainBox

BrainBox est une base de connaissances (extraits de code, commandes, procédures, notes de cours...) interrogeable en langage naturel grâce à une IA exécutée localement via Ollama. L'API construit chaque réponse uniquement à partir des connaissances enregistrées, jamais à partir des connaissances générales du modèle.

## Prérequis

- Docker et Docker Compose
- Node.js — utile pour développer en local hors Docker
- Un compte MongoDB Atlas
- Environ 6 Go d'espace disque libre pour les modèles Ollama

## Installation

### 1. Cloner le projet et installer les dépendances

```bash
git clone https://github.com/Svetlanna/BrainBox-
cd BrainBox
```

**Backend :**
```bash
cd backend
npm init -y
npm install express mongodb cors dotenv jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

**Frontend (Angular) :**
```bash
cd ../frontend
npm install
```

Les composants Angular du projet ont été générés avec :
```bash
ng generate component components/knowledge-list
ng generate component components/knowledge-detail
ng generate component components/knowledge-form
ng generate component components/assistant
ng generate component components/login
```

### 2. Configurer les variables d'environnement

Créer un fichier `backend/.env` :
```
PORT=3000
MONGO_URI=<ton-uri-de-connexion-atlas>
DB_NAME=BrainBox
JWT_SECRET=<une-longue-chaine-secrete-aleatoire>
```

## Configuration de MongoDB Atlas

1. Créer un compte sur MongoDB Atlas
2. Créer un cluster (le tier gratuit M0 suffit largement)
3. Créer une base de données nommée `BrainBox`, avec deux collections : `knowledge` et `users`
4. Autoriser l'accès réseau (IP whitelist) pour ta machine, ou `0.0.0.0/0` en développement
5. Récupérer l'URI de connexion (bouton Connect puis Drivers) et le coller dans `MONGO_URI` (fichier `.env`)
6. MongoDB Compass permet de visualiser et éditer les documents graphiquement (utile pour importer des connaissances ou des utilisateurs de test via un fichier CSV)

## Lancement de l'application

Tout le projet (backend, frontend, Ollama) tourne via Docker Compose :

```bash
docker compose up --build
```

- Frontend : http://localhost:4200
- Backend : http://localhost:3000
- Ollama : http://localhost:11434

## Lancement d'Ollama

Ollama tourne dans son propre conteneur (`brainbox-ollama`). Il faut télécharger un modèle avant la première utilisation :

```bash
docker exec -it brainbox-ollama ollama pull qwen2.5:0.5b
```

Vérifier que le modèle est bien disponible :
```bash
curl http://localhost:11434/api/tags
```

Vérifier la connectivité réseau du conteneur si besoin :
```bash
docker run --rm alpine nslookup registry.ollama.ai
```

Tester directement l'assistant une fois le backend démarré :
```bash
curl http://localhost:3000/assistant -X POST -H "Content-Type: application/json" -d "{\"question\": \"Comment creer une route GET Express ?\"}"
```

## Routes disponibles

### Authentification

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Connexion, renvoie un token JWT et le rôle de l'utilisateur |

### Connaissances

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/knowledge` | Tous (connectés) | Liste toutes les connaissances |
| GET | `/knowledge/search?q=...` | Tous (connectés) | Recherche par mot-clé (titre, contenu, catégorie, tags) |
| GET | `/knowledge/:id` | Tous (connectés) | Détail d'une connaissance |
| POST | `/knowledge` | Admin uniquement | Créer une connaissance |
| PUT | `/knowledge/:id` | Admin uniquement | Modifier une connaissance |
| DELETE | `/knowledge/:id` | Admin uniquement | Supprimer une connaissance |

### Assistant IA

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/assistant` | Tous (connectés) | Pose une question ; recherche dans MongoDB, construit le prompt, interroge Ollama, renvoie la réponse et les sources utilisées |
| POST | `/assistant/generate` | Tous (connectés) | Génère une réponse de secours (sans contexte de la base) quand aucune connaissance ne permet de répondre, ainsi qu'un titre suggéré |
| POST | `/assistant/save-generated` | Tous (connectés) | Enregistre dans MongoDB la réponse générée, éventuellement corrigée par l'utilisateur, comme nouvelle connaissance |

Toutes les routes protégées attendent un en-tête `Authorization: Bearer <token>`.

### Génération de réponse de secours et enregistrement dans la base

Quand la recherche par mots-clés ne trouve aucune connaissance pertinente — ou que les connaissances trouvées ne suffisent pas à répondre à la question — l'API ne se contente pas de répondre "je ne sais pas" : elle propose à l'utilisateur de générer une réponse et de l'ajouter à la base, pour que la même question trouve une réponse la prochaine fois.

Le déroulement est le suivant :

1. **Détection du manque d'information.** Sur `POST /assistant`, si aucun document ne matche la question, l'API répond directement `canGenerate: true`. Si des documents ont été trouvés mais que la réponse générée par Ollama ressemble malgré tout à un refus ("je ne possède pas suffisamment d'informations", "je ne sais pas", etc.), `canGenerate` passe aussi à `true` — le modèle étant petit (`qwen2.5:0.5b`), il ne reformule pas toujours la phrase de refus à l'identique, d'où une détection par expressions régulières plutôt qu'une simple égalité de texte.
2. **Génération de la proposition.** Quand l'utilisateur clique sur "Générer une proposition", le frontend appelle `POST /assistant/generate`. Contrairement à `/assistant`, ce prompt ne contient aucune connaissance de la base : Ollama répond avec ses connaissances générales. En parallèle, un second appel au modèle reformule la question en un titre court et neutre (`generateTitle`), utilisé comme titre par défaut de la nouvelle fiche.
3. **Relecture et correction.** La réponse générée et le titre suggéré sont affichés dans un formulaire éditable côté frontend. L'utilisateur peut corriger le contenu avant de l'enregistrer — rien n'est écrit en base tant que l'utilisateur n'a pas validé.
4. **Enregistrement.** À la validation, le frontend envoie le titre et le contenu (éventuellement modifiés) à `POST /assistant/save-generated`. La route insère un nouveau document dans la collection `knowledge`, avec la catégorie `Généré automatiquement` et le tag `auto-généré`, ce qui permet de repérer facilement, plus tard, les connaissances ajoutées par ce mécanisme plutôt que saisies manuellement.

Ce circuit permet à la base de connaissances de s'enrichir progressivement à partir des questions posées à l'assistant, sans jamais insérer automatiquement une réponse non validée par un utilisateur.

## Modèle utilisé

`qwen2.5:0.5b` (0,5 milliard de paramètres) est le modèle retenu en production.

Plusieurs modèles ont été testés pour trouver le meilleur compromis vitesse et qualité sur une machine sans GPU (inférence CPU uniquement) :

| Modèle | Résultat |
|---|---|
| `llama3.2` | Testé, temps de réponse très long (plusieurs minutes) |
| `mistral` | Fonctionnel mais lent (environ 20 à 30 secondes par réponse) |
| `gemma4:e2b` | Plus rapide, mais toujours lourd sur CPU |
| `qwen2.5:0.5b` | Retenu, nettement plus rapide, suffisant pour ce cas d'usage |

La réponse est aussi limitée à `num_predict: 200` tokens côté API pour éviter les générations trop longues, et donc trop lentes, sur une machine sans accélération matérielle. La température est fixée à `0.1` pour limiter la variation des réponses d'une requête à l'autre et renforcer la fidélité au contexte fourni.

Étant un très petit modèle, `qwen2.5:0.5b` suit parfois imparfaitement les consignes strictes du prompt (il peut répondre qu'il ne sait pas même quand l'information existe). Le prompt inclut une instruction stricte demandant de ne répondre qu'à partir des connaissances fournies, et l'API court-circuite complètement l'appel au modèle si aucune connaissance pertinente n'est trouvée en base.